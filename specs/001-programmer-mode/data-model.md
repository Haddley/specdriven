# Phase 1 Data Model: Programmer Mode

This feature has no persistent storage or records — all state lives in the
single in-memory `CalculatorEngine` instance, same as today. This document
describes the two new conceptual entities from the spec's Key Entities
section and how they map onto engine fields.

## Calculator Mode

Whether the calculator is in Standard Mode (decimal only, existing behavior)
or Programmer Mode (base-selectable).

| Field | Type | Values | Notes |
|---|---|---|---|
| `mode` | string | `"standard"` \| `"programmer"` | Defaults to `"standard"`. Set via `setMode(newMode)`. |

**Transitions**:
- `standard → programmer`: resets entry/calculation state (`reset()`); `base`
  defaults to `"decimal"` (10) on entry.
- `programmer → standard`: resets entry/calculation state (`reset()`);
  `base` is irrelevant in Standard Mode (FR-008).
- Same-mode "transition" (setting the mode to its current value): no-op, no
  reset — avoids clearing an in-progress calculation on a redundant toggle.

## Number Base

One of Decimal, Hexadecimal, Octal, or Binary; active only in Programmer
Mode. Determines which digit keys are valid and how the current value and
results are displayed.

| Field | Type | Values | Notes |
|---|---|---|---|
| `base` | number | `10` (Decimal) \| `16` (Hexadecimal) \| `8` (Octal) \| `2` (Binary) | Only meaningful when `mode === "programmer"`. Represented as the numeric radix directly, since that is what `parseInt`/`toString` consume (see [research.md](./research.md)). |

**Validation rule** (FR-003), keyed on `base`:

| Base | Valid digits |
|---|---|
| Decimal (10) | `0-9` |
| Hexadecimal (16) | `0-9`, `A-F` (case-insensitive on input, displayed uppercase) |
| Octal (8) | `0-7` |
| Binary (2) | `0-1` |

**Transitions**:
- Changing `base` while `mode === "programmer"` (FR-006, US3): re-parses the
  current `display` string using the *previous* `base` into a number, then
  reassigns `base` and reformats `display` in the new base. Does not touch
  `previousValue`, `operator`, or `waitingForOperand` — the pending
  calculation (if any) survives the base change (US3 AC3).
  `previousValue` is stored as a plain JS number and is therefore already
  base-independent — no conversion needed there.
- Changing `base` while `mode === "standard"`: has no visible effect (base
  selector is only shown/used in Programmer Mode per FR-002), but the field
  may still be stored for when the user next enters Programmer Mode.
- No effect while `error === true` (edge case: base switch during "Cannot
  divide by zero" is ignored until Clear).

## Existing engine fields (unchanged shape, now base-aware in meaning)

These fields already exist on `CalculatorEngine` and are reused, not
replaced:

| Field | Type | Programmer Mode meaning |
|---|---|---|
| `display` | string | The currently shown value, as digits valid for `base` (uppercase for hex letters), or the literal error message string. |
| `previousValue` | number \| null | The first operand of a pending calculation, as a plain number (base-independent). |
| `operator` | string \| null | `"+"`, `"-"`, `"×"`, or `"÷"` — unchanged meaning from Standard Mode. |
| `waitingForOperand` | boolean | Unchanged meaning: true right after an operator or `=`, before the next digit starts a new entry. |
| `error` | boolean | Unchanged meaning: true after divide-by-zero, blocks further input until `clear()`. |

No new entities beyond `mode` and `base` are needed — the calculation
control flow (chaining, divide-by-zero, clear) is identical in both modes
per FR-004/FR-009/FR-011, only the digit-set, parsing, and formatting change.
