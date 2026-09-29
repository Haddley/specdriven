---
title: 'Programmer Mode (Binary/Octal/Hex)'
type: 'feature'
created: '2026-09-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: '9598bb946830ff48ee55b200e4bd7ab2d512414c'
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
- [x] `calculator-logic.js` -- add `base`/`setBase`, base-aware `inputDigit` and display formatting, leave `_compute` computing in decimal -- centralizes base logic in the tested engine, keeps DOM code dumb
- [x] `calculator.js` -- wire base-selector buttons, hex digit buttons, Programmer Mode toggle, and per-base digit-button enable/disable -- connects UI to the engine
- [x] `index.html` -- add Programmer Mode toggle, base selector, hex digit buttons -- UI surface for the feature
- [x] `style.css` -- style new controls and disabled digit state -- keep the flat monochrome look
- [x] `test/logic.test.js` -- cover base switching, per-base digit entry/arithmetic, divide-by-zero in a non-decimal base -- locks in engine behavior

**Acceptance Criteria:**
- Given Standard mode, when the user activates Programmer Mode, then a base selector (DEC/HEX/OCT/BIN) appears with DEC selected and the current value preserved.
- Given Programmer Mode with base X active, when the user enters digits valid for X, presses an operator, enters more digits, and presses equals, then the result is computed correctly and displayed in base X.
- Given Programmer Mode with a non-decimal base active, when the user presses the decimal-point key, then the display is unchanged.
- Given Programmer Mode with a value entered, when the user switches to a different base, then the display re-renders the same numeric value in the new base without clearing a pending operator.
- Given Programmer Mode, when the user deactivates it back to Standard mode, then decimal input and the full digit set are available again.

## Implementation Notes

- `calculator-logic.js`: `CalculatorEngine` gained `base` (default 10) and a separate `programmerMode` boolean, plus `setBase(nextBase)` and `setProgrammerMode(active)`. Both are set up in the constructor outside `reset()` so `clear()` never disturbs the active mode/base. `inputDigit` now rejects characters invalid for the active base via a new exported `isValidDigitForBase(digit, base)` helper (backed by a `BASE_DIGITS` table for 2/8/10/16), shared with `calculator.js` so DOM enable/disable logic and engine validation can't drift apart. `inputDecimal` is a no-op whenever `programmerMode` is true, in every base — this covers the case the Code Map's `base`-only description didn't: Programmer Mode's DEC base must still block the decimal point (Always-bullet requirement), which a check on `base !== 10` alone can't express. `setOperator`/`equals` now parse the display via a new `_parseValue` (parseInt with the active radix for non-decimal bases, unchanged `parseFloat` for base 10) and format results via `formatNumber(result, this.base)`. `_compute` is untouched — arithmetic still happens in decimal regardless of base. `formatNumber(value, base = 10)` keeps its exact original behavior for base 10 (default param preserves old call sites/tests) and adds a truncate-to-integer + magnitude-in-base + uppercase + sign-prefix path for other bases, matching the spec's negative-result convention (sign + magnitude, not two's complement).
- `calculator.js`: added lookups for the toggle checkbox, base-selector buttons, and the hex-key/base-selector containers; `render()` now also toggles their `hidden` state, disables digit buttons per `isValidDigitForBase`, disables the decimal button while `programmerMode` is true, and highlights the active base button. New listeners call `engine.setProgrammerMode` and `engine.setBase`. The existing generic `button[data-digit]` wiring needed no changes to pick up the new hex buttons.
- `index.html`: added a `Programmer Mode` checkbox toggle, a `base-selector` block (DEC/HEX/OCT/BIN, `data-base="10|16|8|2"`), and a `hex-keys` block (A-F), both `hidden` by default so Standard mode's markup and behavior are unaffected.
- `style.css`: added `.key:disabled` (grey background/text, `cursor: not-allowed`, overriding the `:active` invert), `.mode-toggle`, `.base-selector`, `.key-base.active` (inverted colors, consistent with the existing `.key:active` look), and `.hex-keys`. No existing rules were changed.
- `test/logic.test.js`: appended 10 new tests under a "Programmer Mode" section covering hex entry, per-base digit rejection, binary arithmetic, base-switch value conversion, base-switch preserving a pending operator, decimal-point suppression, divide-by-zero in a non-decimal base, sign+magnitude negative results, activation preserving the current value/defaulting to DEC, and deactivation restoring decimal input. All 11 pre-existing tests were left untouched.

## Spec Change Log

## Review Triage Log

Three review layers ran in parallel against the diff since `baseline_commit` (Blind Hunter, Edge Case Hunter, Verification Gap). 11 findings total; two verified real and fixed as patches, one deferred, the rest rejected on verification.

| Verdict | Finding | Evidence |
|---|---|---|
| medium — patch | Blind Hunter: activating Programmer Mode didn't truncate an existing fractional display, so fractional arithmetic stayed possible in the (nominally integer-only) DEC base | Verified in `setProgrammerMode`: only converted base on deactivation, never truncated on activation, and `_parseValue` used `parseFloat` at base 10 — e.g. "3.14" survived and stayed arithmetically live. Fixed: truncate to an integer on activation. Test added. |
| medium — patch | Edge Case Hunter: `isValidDigitForBase` used substring `.includes()`, so multi-character strings could falsely validate (e.g. `"AB"` matches inside hex's `"...9ABCDEF"`) and `""` always validated | Verified: `"0123456789ABCDEF".includes("AB")` and `.includes("")` are both `true` in JS. Not reachable via the shipped UI (every `data-digit` button value is a fixed single character), but a real correctness bug in an exported, directly-callable engine function. Fixed: exact single-character check. Test added. |
| low — patch | Blind Hunter: dead `.key:disabled:active` CSS rule | Real but purely cosmetic no-op (disabled buttons never receive `:active` styling in any browser). Fix was a trivial deletion, so not rejected by the low-severity filter. Removed. |
| defer | Blind Hunter + Verification Gap (same root cause): no test coverage for `calculator.js`'s new DOM/render logic (mode/base visibility, digit enable/disable, active-base highlight) | Confirmed: the repo has no DOM test harness at all (`test/logic.test.js` imports only `calculator-logic.js`; no jsdom/playwright/puppeteer dependency exists anywhere). Pre-existing to the whole file, not introduced by this diff, and already disclosed in this spec's own Manual checks. Verification-gap layer filed this pre-verified with disposition `defer`; logged to `deferred-work.md`. |
| false | Edge Case Hunter: `setBase()` has no invariant tying it to `programmerMode`, claimed to leave Standard-mode digit buttons "silently disabled with no UI path back" | The specific claimed consequence is wrong: `setProgrammerMode(false)` unconditionally forces `base` back to `BASES.DEC` whenever it isn't already DEC, so toggling Programmer Mode off self-heals any desync — there is a UI path back. Also unreachable via the shipped UI: base-selector buttons are hidden and unclickable whenever `programmerMode` is false. |
| false | Blind Hunter: no fixed-width/word-size handling for large magnitudes | The frozen Boundaries "Never" section explicitly excludes fixed-width/two's-complement representation and word-size selection — this is the human-approved scope (Open Question 2's "keep it simple" answer), not a gap. Also pre-existing to plain-JS-number arithmetic, not introduced by this diff. |
| false | Blind Hunter: `## Spec Change Log` left empty | Per the spec template, that section is populated only during a `bad_spec` loopback. This is the first review pass and no loopback occurred, so an empty section is correct. |
| rejected (fix edits this spec) | Blind Hunter: Verification section understated testing (said `npm test` wasn't run, yet status moved to `in-review`) | Smallest fix is purely editing this spec's own Verification prose — out of scope for triage per the "reject any finding whose fix is to edit this build's spec" rule. Updated anyway as housekeeping now that real `npm test` results exist. |
| low, rejected | Blind Hunter: hex keys placed in their own row instead of integrated into the main keypad | No functional harm named — a layout preference, not a defect; follows the existing flat-monochrome grid convention. |
| low, rejected | Blind Hunter: no ARIA affordances (`aria-pressed`/`aria-label`/`aria-live`) on the new controls | Real gap for screen-reader users, but the fix adds new state-tracking complexity beyond a direct correction, and this small demo calculator has no accessibility work anywhere else in the codebase to be consistent with. |

## Design Notes

Per-base valid digit sets: DEC 0-9 (decimal point enabled, Standard mode only), HEX 0-9/A-F, OCT 0-7, BIN 0-1.

Conversion approach: keep the engine's internal value as a JS number computed via the existing `_compute` (unchanged, always decimal arithmetic). Parse entry strings with `parseInt(str, base)` when an operator or equals is pressed, and format results for display by truncating to an integer, then formatting the magnitude with `Math.abs(value).toString(base).toUpperCase()` (uppercase so hex reads `FF` not `ff`) and prefixing `-` when the value is negative.

## Verification

**Commands:**
- `npm test` -- run after implementation: **22/22 passing** (12 pre-existing + 10 Programmer Mode tests), then again after the review-triage patches below with 2 more tests added for the fixed bugs — see Review Triage Log.

**Manual checks (if no CLI):**
- Performed by the human in a browser: confirmed DEC 255 -> HEX "FF" on base switch, OCT `3 - 5` -> "-2" as sign + magnitude, and digits 8/9/A-F plus the decimal point correctly greyed out per active base.
