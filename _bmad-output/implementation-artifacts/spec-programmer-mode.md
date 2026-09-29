---
title: 'Programmer Mode (Binary/Octal/Hex)'
type: 'feature'
created: '2026-09-29'
status: 'draft'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The calculator only operates in decimal; users who need quick binary/octal/hex conversions or arithmetic — a feature calculators have offered since Windows 7's Programmer mode — have no way to switch bases.

**Approach:** Add a Programmer Mode toggle that reveals a base selector (DEC/HEX/OCT/BIN). The engine tracks the active base and performs digit entry, display formatting, and the four existing operations (+ − × ÷) in that base; switching bases re-renders the current value in the new base without disturbing a pending operator.

## Boundaries & Constraints

**Always:**
- Programmer Mode is integer-only: the decimal-point key is disabled while active (matches Windows Calculator).
- Only digits valid for the active base are enterable; other digit buttons are disabled, mirroring real calculators.
- Switching bases converts and redisplays the current value; it does not clear a pending operator.
- Divide-by-zero behavior (error message + input blocked until Clear) is preserved in every base.
- Engine changes stay inside `calculator-logic.js` (no DOM access); DOM wiring stays in `calculator.js`, per repo convention.

**Never:**
- No bitwise operators (AND/OR/XOR/NOT/shifts) or word-size (QWORD/DWORD/WORD/BYTE) selection — decision: keep to the existing four-function operators only, in each base.
- No fixed-width two's-complement representation — decision: negative results use sign + magnitude (e.g. "-101" for -5 in binary), consistent with how Standard mode already displays negative decimals.
- Do not change Standard mode's existing decimal behavior or its current test coverage.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Hex digit entry | Programmer Mode, base=HEX, press A then 5 | display "A5" | N/A |
| Binary arithmetic | base=BIN, `101` + `11` `=` | display "1000" (5+3=8) | N/A |
| Base switch preserves value | base=DEC, display "255", switch to HEX | display "FF" | N/A |
| Base switch with pending operator | base=DEC, `10` `+`, switch to HEX | display "A", operator still "+", previousValue preserved | N/A |
| Decimal point ignored | Programmer Mode active, press "." | display unchanged | N/A |
| Divide by zero, non-decimal base | base=OCT, `5` `÷` `0` `=` | "Cannot divide by zero", error state, input blocked until Clear | same as Standard mode |
| Negative result, non-decimal base | base=BIN, `3` `-` `5` `=` | display "-10" (3-5=-2, magnitude 2 = binary "10") | N/A |

</frozen-after-approval>

## Code Map

- `calculator-logic.js` -- `CalculatorEngine`: add `base` state (default 10) and `setBase`; make `inputDigit` and display formatting base-aware; keep `_compute` doing its math in decimal internally and reuse existing operator-chaining/divide-by-zero handling unchanged.
- `calculator.js` -- DOM wiring: add handlers for the mode toggle and base-selector buttons and for hex digit buttons (`data-digit="A"`..`"F"`); enable/disable digit buttons based on the active base.
- `index.html` -- add a Programmer Mode toggle, a base selector (DEC/HEX/OCT/BIN), and hex digit buttons A–F.
- `style.css` -- style the new controls to match the flat monochrome Windows 1.0 look, plus a disabled-button state.
- `test/logic.test.js` -- add coverage for base switching, per-base digit entry and arithmetic, and divide-by-zero in a non-decimal base.

## Tasks & Acceptance

**Execution:**
- [ ] `calculator-logic.js` -- add `base`/`setBase`, base-aware `inputDigit` and display formatting, leave `_compute` computing in decimal -- centralizes base logic in the tested engine, keeps DOM code dumb
- [ ] `calculator.js` -- wire base-selector buttons, hex digit buttons, Programmer Mode toggle, and per-base digit-button enable/disable -- connects UI to the engine
- [ ] `index.html` -- add Programmer Mode toggle, base selector, hex digit buttons -- UI surface for the feature
- [ ] `style.css` -- style new controls and disabled digit state -- keep the flat monochrome look
- [ ] `test/logic.test.js` -- cover base switching, per-base digit entry/arithmetic, divide-by-zero in a non-decimal base -- locks in engine behavior

**Acceptance Criteria:**
- Given Standard mode, when the user activates Programmer Mode, then a base selector (DEC/HEX/OCT/BIN) appears with DEC selected and the current value preserved.
- Given Programmer Mode with base X active, when the user enters digits valid for X, presses an operator, enters more digits, and presses equals, then the result is computed correctly and displayed in base X.
- Given Programmer Mode with a non-decimal base active, when the user presses the decimal-point key, then the display is unchanged.
- Given Programmer Mode with a value entered, when the user switches to a different base, then the display re-renders the same numeric value in the new base without clearing a pending operator.
- Given Programmer Mode, when the user deactivates it back to Standard mode, then decimal input and the full digit set are available again.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Per-base valid digit sets: DEC 0-9 (decimal point enabled, Standard mode only), HEX 0-9/A-F, OCT 0-7, BIN 0-1.

Conversion approach: keep the engine's internal value as a JS number computed via the existing `_compute` (unchanged, always decimal arithmetic). Parse entry strings with `parseInt(str, base)` when an operator or equals is pressed, and format results for display by truncating to an integer, then formatting the magnitude with `Math.abs(value).toString(base).toUpperCase()` (uppercase so hex reads `FF` not `ff`) and prefixing `-` when the value is negative.

## Verification

**Commands:**
- `npm test` -- expected: all existing tests still pass, plus new Programmer Mode tests green

**Manual checks (if no CLI):**
- Open `index.html` in a browser: toggle Programmer Mode, cycle through DEC/HEX/OCT/BIN, confirm digit buttons enable/disable correctly per base, perform arithmetic in each base, and confirm divide-by-zero still shows the error and blocks input until Clear.
