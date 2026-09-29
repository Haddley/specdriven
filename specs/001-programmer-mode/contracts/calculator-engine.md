# Contract: `CalculatorEngine` public API (post-Programmer-Mode)

This project has no network/CLI-facing interface. The one boundary the
Constitution requires to stay clean (Principle I: Separation of Concerns) is
between `calculator-logic.js` (pure logic) and `calculator.js` (DOM wiring).
That boundary is `CalculatorEngine`'s public API, and it is what
`test/logic.test.js` exercises directly. This document is the contract for
that API after this feature — both `calculator.js` and the test suite code
against it.

## State (read-only from the caller's perspective, except via methods below)

| Field | Type | Description |
|---|---|---|
| `display` | `string` | Current display text: digits in the active base, or an error message. |
| `previousValue` | `number \| null` | Pending first operand, or `null`. |
| `operator` | `"+" \| "-" \| "×" \| "÷" \| null` | Pending operator, or `null`. |
| `waitingForOperand` | `boolean` | True when the next digit press should start a new entry. |
| `error` | `boolean` | True after a divide-by-zero; blocks input until `clear()`. |
| `mode` | `"standard" \| "programmer"` | **New.** Current calculator mode. |
| `base` | `10 \| 16 \| 8 \| 2` | **New.** Current number base (meaningful when `mode === "programmer"`). |

## Methods

### `reset()` / `clear()` — unchanged signature and behavior

Resets `display` to `"0"`, `previousValue`/`operator` to `null`,
`waitingForOperand`/`error` to `false`. Does **not** reset `mode`/`base` on
its own (mode/base changes are driven by `setMode`/`setBase`, not by
`clear()` — pressing Clear mid-Programmer-Mode must not kick the user back
to Standard Mode per FR-011).

### `inputDigit(digit: string)` — extended behavior

- No-op if `error` is true (unchanged).
- **New**: no-op if `digit` is not valid for the current `mode`/`base` (see
  [data-model.md](../data-model.md) validity table) — satisfies FR-003.
- Otherwise appends/replaces as today; hex letters are normalized to
  uppercase in `display`.

### `inputDecimal()` — extended behavior

- No-op if `error` is true (unchanged).
- **New**: no-op unconditionally when `mode === "programmer"` — satisfies
  FR-007 (integer-only, regardless of base).
- Unchanged behavior in `"standard"` mode.

### `setOperator(nextOperator: string)` — extended behavior

- Unchanged control flow (chaining, `waitingForOperand` handling).
- **New**: parses the current `display` with `parseInt(display, base)` when
  `mode === "programmer"` instead of `parseFloat` — satisfies FR-004 (same
  chaining, base-aware read).
- Formats any computed intermediate result via the base-aware formatter (see
  below) instead of `formatNumber` when in Programmer Mode.

### `equals()` — extended behavior

Same change as `setOperator`: base-aware parse of `display`, base-aware
format of the result. Divide-by-zero handling (`_compute`) is untouched —
same `"Cannot divide by zero"` message and `error = true` lock, satisfying
FR-009.

### `setMode(newMode: "standard" | "programmer")` — new method

- No-op if `newMode === this.mode`.
- Otherwise: sets `this.mode = newMode`, sets `this.base = 10` when entering
  `"standard"` (base is meaningless there) or when first entering
  `"programmer"` (defaults to Decimal), and calls `reset()` — satisfies
  FR-008 and the research.md decision to reset symmetrically.

### `setBase(newBase: 10 | 16 | 8 | 2)` — new method

- No-op if `error` is true (edge case: base switch during an error display
  has no effect until Clear).
- No-op if `newBase === this.base`.
- Otherwise: parses `this.display` with the *current* `this.base`, reassigns
  `this.base = newBase`, and reformats `this.display` in the new base —
  satisfies FR-006/US3. Does not touch `previousValue`, `operator`, or
  `waitingForOperand`.

## Formatting contract

A base-aware formatter (e.g. `formatInBase(value, base)`) replaces
`formatNumber` for Programmer Mode results:

```js
function formatInBase(value, base) {
  return value.toString(base).toUpperCase();
}
```

Negative values are handled for free: `(-5).toString(2).toUpperCase()` →
`"-101"`, matching FR-010 without any special-casing.

## Consumers of this contract

- `calculator.js`: calls `setMode`/`setBase` from new UI controls (mode
  toggle, base radio buttons), calls `inputDigit` from the existing digit
  buttons plus new A–F buttons, and re-renders `engine.display` after every
  call — no change to its existing render-after-call pattern.
- `test/logic.test.js`: exercises every method above directly, with no DOM,
  per Constitution II.
