# Contract: `CalculatorEngine` public API (post-Statistics-Mode)

This project has no network/CLI-facing interface. The one boundary the
Constitution requires to stay clean (Principle I: Separation of Concerns) is
between `calculator-logic.js` (pure logic) and `calculator.js` (DOM wiring).
That boundary is `CalculatorEngine`'s public API, and it is what
`test/logic.test.js` exercises directly. This document is the contract for
that API after this feature, extending
[001-programmer-mode's contract](../../001-programmer-mode/contracts/calculator-engine.md) —
both `calculator.js` and the test suite code against it.

## State (read-only from the caller's perspective, except via methods below)

| Field | Type | Description |
|---|---|---|
| `display` | `string` | Current display text: digits being entered, a computed result, an error message, or (**new**) `"No data"` / `"Undefined"`. |
| `previousValue` | `number \| null` | Pending first operand for arithmetic chaining, or `null`. Unused in Statistics Mode. |
| `operator` | `"+" \| "-" \| "×" \| "÷" \| null` | Pending operator, or `null`. Unused in Statistics Mode. |
| `waitingForOperand` | `boolean` | True when the next digit press should start a new entry. |
| `error` | `boolean` | True after a divide-by-zero; blocks input until `clear()`. Never set by Statistics Mode. |
| `mode` | `"standard" \| "programmer" \| "statistics"` | **Extended.** Current calculator mode. |
| `base` | `10 \| 16 \| 8 \| 2` | Current number base (meaningful only when `mode === "programmer"`). |
| `dataSet` | `number[]` | **New.** Ordered Statistics Data Set; meaningful only when `mode === "statistics"`. |
| `dataEntryStarted` | `boolean` | **New.** True once a digit/decimal has been entered since the last add/clear/mode-entry; gates `addDataPoint()`. |

## Methods

### `reset()` / `clear()` — unchanged signature and behavior

Resets `display`/`previousValue`/`operator`/`waitingForOperand`/`error` as
before. Does **not** touch `mode`, `base`, `dataSet`, or `dataEntryStarted` —
mode/data-set changes are driven by `setMode`, not by `clear()`.

### `inputDigit(digit: string)` — extended behavior

- Unchanged guards (`error`, Programmer Mode digit validity).
- **New**: after a successful digit entry while `mode === "statistics"`, sets
  `dataEntryStarted = true`.

### `inputDecimal()` — extended behavior

- Unchanged guards (`error`; no-op in Programmer Mode).
- **New**: after a successful decimal-point entry while
  `mode === "statistics"`, sets `dataEntryStarted = true`. (Statistics Mode
  is decimal-capable, unlike Programmer Mode — FR-002, spec Assumptions.)

### `toggleSign()` — new method

- No-op if `error` is true.
- No-op if `mode !== "statistics"`.
- No-op if `display === "0"` (nothing entered yet to negate).
- Otherwise: prepends `-` to `display` if not already negative, or strips a
  leading `-` if already negative.
- Does **not** set `dataEntryStarted` by itself — toggling the sign of the
  untouched `"0"` display is already a no-op, and toggling the sign of a
  value the user already typed digits for doesn't need to (it's already
  `true`).
- Satisfies FR-002's negative-number entry requirement.

### `addDataPoint()` — new method

- No-op if `error` is true.
- No-op if `mode !== "statistics"`.
- No-op if `dataEntryStarted` is `false` — satisfies the edge case "pressing
  Add without having entered any digits since the last add... has no
  effect."
- Otherwise: parses `display` with `parseFloat` and appends the result to
  `dataSet`; resets `display` to `"0"`, sets `waitingForOperand = true`, and
  sets `dataEntryStarted = false` — satisfies FR-003.

### `removeDataPoint(index: number)` — new method

- No-op if `mode !== "statistics"`.
- No-op if `index < 0` or `index >= dataSet.length` — satisfies the edge
  case "removing a data point that no longer exists... has no effect and
  does not error."
- Otherwise: removes the element at `index` from `dataSet` — satisfies
  FR-010. Identifies one specific occurrence, so removing one of several
  equal-valued points leaves the others (FR-012).

### `clearDataSet()` — new method

- No-op if `mode !== "statistics"`.
- Otherwise: sets `dataSet = []` — satisfies FR-011. No-op when already
  empty produces no error (edge case), since clearing an empty array is
  itself a no-op.

### `requestSum()` / `requestAverage()` / `requestStdDev()` — new methods

- No-op if `mode !== "statistics"`.
- If `dataSet.length === 0`: sets `display = "No data"` — satisfies FR-008.
- `requestStdDev()` additionally: if `dataSet.length === 1`, sets
  `display = "Undefined"` — satisfies FR-009 (Sum/Average remain computable
  for a single point and are not given this special case).
- Otherwise, computes and sets `display` to the `formatNumber`-formatted
  result:
  - `requestSum()`: `dataSet.reduce((a, b) => a + b, 0)` — FR-005.
  - `requestAverage()`: sum ÷ `dataSet.length` — FR-006.
  - `requestStdDev()`: sample standard deviation — `sqrt(Σ(x - mean)² / (n - 1))`
    — FR-007. **See [research.md](../research.md) for a flagged
    inconsistency between this formula and User Story 3's worked example.**
- All three set `waitingForOperand = true` and `dataEntryStarted = false`
  afterward, so the next digit press starts a fresh entry (same pattern as
  `equals()` in Standard Mode) rather than appending to the shown result.

### `setOperator(nextOperator: string)` / `equals()` — extended behavior

- **New guard**: no-op if `mode === "statistics"` (added alongside the
  existing `error` guard) — Statistics Mode has no arithmetic-chaining use
  for these, per research.md.
- Otherwise unchanged from 001-programmer-mode's contract.

### `setMode(newMode: "standard" | "programmer" | "statistics")` — extended behavior

- No-op if `newMode === this.mode` (unchanged).
- Otherwise: sets `this.mode = newMode`; sets `this.base = 10`; **new:**
  sets `this.dataSet = []` and `this.dataEntryStarted = false`; calls
  `reset()` — satisfies FR-013, extended symmetrically to every mode
  transition per research.md.

## Consumers of this contract

- `calculator.js`: calls `toggleSign`/`addDataPoint`/`removeDataPoint`/
  `clearDataSet`/`requestSum`/`requestAverage`/`requestStdDev` from the new
  Statistics control panel, renders `dataSet` as a list (with a per-item
  remove control bound to that item's array index) and `dataSet.length` as
  the count, and shows/hides the panel based on `engine.mode` — no change to
  its existing render-after-call pattern.
- `test/logic.test.js`: exercises every method above directly, with no DOM,
  per Constitution II.
