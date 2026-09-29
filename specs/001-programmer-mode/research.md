# Phase 0 Research: Programmer Mode

The feature spec's Assumptions section already resolved the open product
questions (integer-only, sign-magnitude negatives, no bitwise ops, mode
switch clears state, no extra overflow handling). What remains is technical:
how to implement base-aware entry, arithmetic, and formatting inside the
existing `CalculatorEngine` without breaking Constitution I (logic/DOM split)
or IV (baseline fidelity). No NEEDS CLARIFICATION items remain in the
Technical Context.

## Decision: Extend `CalculatorEngine`, don't create a parallel engine

**Decision**: Add `mode` and `base` fields to the existing `CalculatorEngine`
class and branch its existing methods (`inputDigit`, `inputDecimal`,
`setOperator`, `equals`) on `mode`, rather than writing a second
"ProgrammerEngine" class or a wrapper.

**Rationale**: Standard Mode must remain byte-for-byte unchanged (FR-012),
and the two modes share all control flow — left-to-right chaining, the
`waitingForOperand` dance, and the divide-by-zero error/lock behavior
(FR-004, FR-009). A single engine with base-aware parsing/formatting reuses
that flow for free and keeps `_compute` (the divide-by-zero and chaining
logic) untouched. A second class would duplicate all of that control flow
for no behavioral benefit, violating Constitution V (YAGNI).

**Alternatives considered**:
- Separate `ProgrammerEngine` class — rejected: duplicates chaining/error
  logic that must stay identical to Standard Mode (Constitution IV), and
  would need its own tests for behavior already covered.
- Wrapping/decorating the existing engine — rejected: adds an indirection
  layer with no problem it solves here; the branching is a handful of
  `if (this.mode === "programmer")` checks, not enough complexity to justify
  a wrapper.

## Decision: Use native `parseInt(str, radix)` / `Number.prototype.toString(radix)`

**Decision**: Parse the display string into a number with
`parseInt(this.display, this.base)` and format results with
`value.toString(this.base).toUpperCase()`, instead of writing custom
base-conversion routines.

**Rationale**: JavaScript's built-ins already do exactly what the spec
requires: `parseInt` accepts a radix (2–36) and a leading `-` sign;
`toString(radix)` on a negative number already returns sign-magnitude form
(e.g. `(-5).toString(2) === "-101"`, `(-5).toString(16) === "-5"`), which is
precisely FR-010's required format ("leading minus sign followed by the
magnitude in the selected base") with zero extra code. `.toUpperCase()`
covers hex letters (spec examples use uppercase: "2AF", "FF").

**Alternatives considered**:
- Hand-rolled base conversion (repeated division/remainder) — rejected: pure
  reinvention of what `toString(radix)`/`parseInt` already do correctly,
  adding surface area for bugs with no benefit (Constitution V).
- Storing values as BigInt for exactness — rejected: the spec's Assumptions
  explicitly scope out word-size/overflow handling beyond what Standard Mode
  already has; Standard Mode uses plain `Number`, so Programmer Mode does
  too. No test scenario in the spec exceeds `Number.MAX_SAFE_INTEGER`.

## Decision: Digit validity is a small per-base lookup, not a parser-level check

**Decision**: Add an `isValidDigit(digit, base)` check (or equivalent inline
switch) used by `inputDigit`, keyed on `base`: `0-1` for Binary, `0-7` for
Octal, `0-9` for Decimal, `0-9A-F` (case-insensitive) for Hexadecimal.
Invalid presses return early with no state change (FR-003).

**Rationale**: This directly matches how Standard Mode already gates input
(`if (this.error) return;` early-return style already used throughout
`CalculatorEngine`), so the addition is idiomatically consistent with the
existing code rather than introducing a new pattern.

**Alternatives considered**:
- Validating at the UI layer (disabling/hiding invalid buttons) — rejected
  as the *only* guard: FR-003 requires that invalid presses "have no effect,"
  which the logic layer must guarantee independent of what the UI renders
  (Constitution II — the logic must be testable and correct on its own). UI
  affordances (e.g., visually graying out invalid keys) are an optional,
  separate nicety not required by any functional requirement or acceptance
  scenario, so it is left out per Constitution V (YAGNI) — pressing an
  invalid key already visibly does nothing, which satisfies SC-003.

## Decision: Mode switch always resets; base switch converts in place

**Decision**: `setMode(newMode)` always calls the existing `reset()` when the
mode actually changes (covers FR-008 for Programmer→Standard, and avoids
carrying a fractional Standard-Mode value into integer-only Programmer Mode
for Standard→Programmer). `setBase(newBase)` never resets — it re-parses
`this.display` with the *current* `this.base`, then re-formats it with
`newBase`, per US3/FR-006.

**Rationale**: The spec only mandates clearing on Programmer→Standard
(FR-008) but entering Programmer Mode with a leftover decimal fraction (e.g.
"1.5") on the display has no valid integer interpretation, so resetting
symmetrically is the simplest correct behavior and avoids inventing
truncation/rounding rules the spec never specifies. Base switching, in
contrast, is required to *preserve* the value (US3), so it must not reset.

**Alternatives considered**:
- Preserve value across Standard→Programmer by truncating — rejected: no
  acceptance scenario or requirement calls for it, and it would invent
  rounding behavior out of scope (Constitution V).
