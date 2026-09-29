---
title: 'Statistics Mode (Sum, Average, Standard Deviation)'
type: 'feature'
created: '2026-09-30'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'b84a9702fe46f6ed38d99ff050b17a58149ced78'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The calculator has no way to analyze a sequence of numbers — computing their sum, average, or spread requires manual entry and mental math, a feature calculators have offered since Windows 7's Statistics box.

**Approach:** Add a Statistics Mode toggle that reveals a data panel: an Add button pushes the current display value onto a running data list, and Sum/Average/Std Dev buttons compute and display the corresponding statistic over that list; a Clear Data button empties the list independently of the existing Clear (C) button.

## Boundaries & Constraints

**Always:**
- Activating Statistics Mode preserves the current display value and shows the data panel (Add, Sum, Avg, Std Dev, Clear Data) plus a running list of entered values.
- Add appends the current display's numeric value to the data list, then resets the display to "0" for the next entry (waitingForOperand-style), mirroring how `equals()` starts fresh entry.
- Sum, Average, and Std Dev compute over the full data list and show the result in the display, leaving the data list unchanged (repeatable, like `equals()`).
- The data list persists across Clear (C) and across toggling Statistics Mode off and on; only Clear Data empties it.
- Statistics Mode and Programmer Mode are mutually exclusive: activating one turns the other off (reverting Programmer Mode to DEC) — keeps data entry and base logic from having to interact.
- Std Dev uses the **sample** formula (divide by n−1), matching the classic Windows Calculator's default "s" statistics button and Excel's `STDEV` — decision: simplest single default, consistent with the "since Windows 7" framing of this feature. Requires at least 2 data points; fewer than 2 is an error.
- Engine changes (data list, add/sum/average/stddev) stay inside `calculator-logic.js` (no DOM access); DOM wiring stays in `calculator.js`, per repo convention.

**Never:**
- No retrieve/load-into-display, no remove-single-entry, no factorial — decision: keep to Add, Clear Data, Sum, Average, Std Dev only, matching what was asked for.
- No visible list editing (can't delete or edit one already-entered value) — out of scope.
- Do not change Standard or Programmer Mode's existing behavior or test coverage.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Build a data set | Statistics Mode active, enter 4, Add, enter 8, Add, enter 6, Add | data list `[4, 8, 6]`; display resets to "0" after each Add | N/A |
| Sum | data list `[4, 8, 6]`, press Sum | display "18" | N/A |
| Average | data list `[4, 8, 6]`, press Avg | display "6" | N/A |
| Std Dev | data list `[4, 8, 6]`, press Std Dev | display shows the computed standard deviation | N/A |
| Sum with no data | Statistics Mode active, empty list, press Sum | display "0" | N/A |
| Average with no data | empty list, press Avg | error state, input blocked until Clear | "No data entered" |
| Std Dev with fewer than 2 points | list has 1 entry, press Std Dev | error state, input blocked until Clear | "Not enough data" |
| Clear Data | data list `[4, 8, 6]`, press Clear Data | data list becomes empty; display unaffected | N/A |
| Mode switch | Programmer Mode active, activate Statistics Mode | Programmer Mode turns off, base reverts to DEC | N/A |

</frozen-after-approval>

## Code Map

- `calculator-logic.js` -- `CalculatorEngine`: add `statisticsMode` boolean and `data` array (both set up in the constructor outside `reset()`, so `clear()` never disturbs them, mirroring `base`/`programmerMode`); add `setStatisticsMode(active)`, `addData()`, `sum()`, `average()`, `standardDeviation()`, `clearData()`. Reuse `formatNumber(value, 10)` for display (Statistics Mode is decimal-only) and the existing error-state pattern (`this.error`, blocked input, cleared by `clear()`) for the empty/insufficient-data cases.
- `calculator.js` -- DOM wiring: add handlers for the Statistics Mode toggle and the Add/Sum/Avg/Std Dev/Clear Data buttons; `render()` shows/hides the stats panel and renders the data list; toggling Statistics Mode on unchecks/deactivates the Programmer Mode toggle (and vice versa).
- `index.html` -- add a Statistics Mode toggle, a stats panel (Add/Sum/Avg/Std Dev/Clear Data buttons), and a data-list display area, hidden by default like the existing Programmer Mode controls.
- `style.css` -- style the new panel and data list to match the flat monochrome Windows 1.0 look, reusing patterns from `.base-selector`/`.hex-keys`.
- `test/logic.test.js` -- cover data add + display reset, sum/average/std-dev computation, empty-data and fewer-than-2-point error cases, Clear Data, and mutual exclusivity with Programmer Mode.

## Tasks & Acceptance

**Execution:**
- [x] `calculator-logic.js` -- add `statisticsMode`/`data` state and `setStatisticsMode`/`addData`/`sum`/`average`/`standardDeviation`/`clearData` -- centralizes stats logic in the tested engine, keeps DOM code dumb
- [x] `calculator.js` -- wire the Statistics Mode toggle and Add/Sum/Avg/Std Dev/Clear Data buttons, render the data list, enforce mutual exclusivity with Programmer Mode -- connects UI to the engine
- [x] `index.html` -- add Statistics Mode toggle, stats panel, data-list display -- UI surface for the feature
- [x] `style.css` -- style new panel and data list -- keep the flat monochrome look
- [x] `test/logic.test.js` -- cover data entry, sum/average/std-dev, empty/insufficient-data errors, Clear Data, mode exclusivity -- locks in engine behavior

**Acceptance Criteria:**
- Given Standard mode, when the user activates Statistics Mode, then the stats panel appears (Add/Sum/Avg/Std Dev/Clear Data) and Programmer Mode, if active, turns off.
- Given Statistics Mode with several values added, when the user computes Sum, Average, or Std Dev repeatedly, then each press recomputes over the unchanged data list, and digit entry afterward starts a fresh number rather than appending.
- Given Statistics Mode, when the user deactivates it, then Standard mode's existing decimal behavior is unaffected and the data list is retained if Statistics Mode is reactivated later.
- Given an error state from Average or Std Dev on insufficient data, when the user presses Clear, then the engine returns to a usable state with the data list intact.

## Implementation Notes

- `calculator-logic.js`: `CalculatorEngine` gained `statisticsMode` (boolean) and `data` (array), both initialized in the constructor outside `reset()` — mirroring `base`/`programmerMode` — so `clear()` never empties the data list. Added `setStatisticsMode(active)`, `addData()`, `sum()`, `average()`, `standardDeviation()`, and `clearData()`. Mutual exclusivity is implemented symmetrically: `setStatisticsMode(true)` calls the existing `setProgrammerMode(false)` when Programmer Mode is active (reusing its base-reversion-to-DEC logic unchanged), and `setProgrammerMode(true)` now also sets `statisticsMode = false`. `addData()` pushes the parsed display value, resets the display to `"0"`, and sets `waitingForOperand = true` so the next digit press replaces rather than appends (mirrors `equals()`). `sum()`/`average()`/`standardDeviation()` all set `waitingForOperand = true` after computing — required for the acceptance criterion that "digit entry afterward starts a fresh number"; this was not spelled out procedurally in the Code Map and was added by inference from the `equals()`-repeatability analogy stated in the frozen Intent/Boundaries. All new methods respect the existing `if (this.error) return;` blocked-input pattern. `sum`/`average`/`standardDeviation` explicitly format with `formatNumber(value, 10)` (not `this.base`) since Statistics Mode is decimal-only. `average()`/`standardDeviation()` set `this.error = true` with the exact matrix error strings ("No data entered" / "Not enough data") on insufficient data; `sum()` on an empty list returns `"0"` via `reduce` with a `0` initial value, no error branch needed.
- `calculator.js`: added lookups for the Statistics Mode toggle checkbox, `stats-panel` container, and `data-list` element; `render()` now also toggles the panel's `hidden` state, syncs the toggle's `checked` state, and renders `engine.data.join(", ")` into the data-list element. New listeners call `engine.setStatisticsMode`, `engine.addData`, `engine.sum`, `engine.average`, `engine.standardDeviation`, and `engine.clearData`. Mutual exclusivity needed no extra DOM code: because the engine flips the other mode's boolean internally, the existing `render()` calls for `programmerToggle.checked`/`baseSelector.hidden`/`hexKeys.hidden` and the new `statisticsToggle.checked`/`statsPanel.hidden` already pick up the change on the next render.
- `index.html`: added a `Statistics Mode` checkbox toggle (after the Programmer Mode toggle) and a `stats-panel` block — a 5-button row (Add/Sum/Avg/Std Dev/Clear Data) plus a `data-list` div — both `hidden` by default, following the same pattern as `base-selector`/`hex-keys`.
- `style.css`: added `.stats-panel`, `.stats-buttons` (3-column grid, smaller key height/font to fit 5 labels), and `.data-list` (bordered box matching `.display`'s flat monochrome look, with scroll for long lists). No existing rules changed.
- `test/logic.test.js`: appended 12 new tests under a "Statistics Mode" section covering: Add appending + display reset (single and repeated), Sum/Average/Std Dev computation (verified against the spec's `[4, 8, 6]` example, plus a hand-computed Std Dev = 2), Sum repeatability, Sum with no data (displays "0"), Average with no data (errors, blocks input, clears with data intact), Std Dev with 1 point (errors, blocks input, clears with data intact), Clear Data (empties list, leaves display untouched), data persistence across Clear (C) and mode toggle off/on, mutual exclusivity in both directions (Statistics→off Programmer/DEC, and Programmer→off Statistics with data retained), and fresh-digit-entry after a statistic is computed. All 24 pre-existing tests were left untouched.

**Verification note:** the implementing session's sandbox blocked all `node`/`npm` execution, so initial verification was a manual line-by-line trace rather than an executed run. `npm test` was subsequently run outside the sandbox and confirmed **36/36 passing** (24 pre-existing + 12 new).

**Post-review patches:** applied the five `patch`-routed findings from the Review Triage Log below — `addData()` now no-ops when `waitingForOperand` is true (guards against re-adding a just-computed statistic as a new data point), the three duplicated sum-of-values `reduce` calls were consolidated into a private `_total()` helper, `.stats-buttons` changed from an uneven 3-column to an evenly-filled 5-column grid, the data-list render now maps each entry through `formatNumber(value, 10)` before joining instead of using raw `toString()`, and `.data-list:empty::before` adds a "No data yet" placeholder. One regression test was added for the `addData()` no-op guard. `npm test` re-run after patching: **37/37 passing** (24 pre-existing + 13 Statistics Mode).

## Spec Change Log

## Review Triage Log

Three review layers ran in parallel against the diff since `baseline_commit` (Blind Hunter, Edge Case Hunter, Verification Gap). 11 findings total; two verified real and fixed as patches, two deferred as pre-existing/systemic, one rejected (fix edits this spec), the rest false.

| Verdict | Finding | Evidence |
|---|---|---|
| medium — patch | Blind Hunter + Edge Case Hunter (same root cause): `addData()` has no guard against being called again with no fresh digit entry, so pressing Add right after Sum/Average/Std Dev (while the computed statistic is still showing and `waitingForOperand` is true) silently re-adds that computed value as a new data point, skewing subsequent statistics | Verified: `sum()`/`average()`/`standardDeviation()` set `waitingForOperand = true` but leave `this.display` showing the computed result rather than resetting to "0"; `addData()` reads `this.display` unconditionally. A user pressing Add again out of habit silently corrupts their own data set with no indication. Reachable via the shipped UI, plausible in normal use. Fixed: guard `addData()` to no-op when `waitingForOperand` is true. |
| low — patch | Blind Hunter: the sum-of-values `reduce` is duplicated verbatim across `sum()`, `average()`, and `standardDeviation()`'s mean calculation | Verified: three identical `this.data.reduce((acc, value) => acc + value, 0)` call sites in `calculator-logic.js`. A future change to summation could update one call site and miss the others. Fixed: extracted a private `_total()` helper. |
| low — patch | Blind Hunter: `.stats-buttons` uses a 3-column grid for 5 buttons, leaving an uneven 2-button last row, unlike the evenly-filled `.keys`/`.base-selector`/`.hex-keys` grids elsewhere | Verified by reading `style.css`: `grid-template-columns: repeat(3, 1fr)` with 5 `.key` children. Every Statistics Mode user sees this immediately. Fixed: changed to a single evenly-filled row. |
| low — patch | Blind Hunter: `#data-list`'s `textContent = engine.data.join(", ")` bypasses `formatNumber`, the display-formatting function the Code Map calls out reusing, so list entries render via plain `Number.prototype.toString()` instead of the app's one formatting path | Verified: `render()` builds the list text directly from `engine.data` without `formatNumber`. Low practical impact today (values entered via Add are already re-parsed from an already-formatted display string), but a real inconsistency with the single sanctioned formatting path. Fixed: format each entry with `formatNumber(value, 10)` before joining. |
| low — patch | Blind Hunter: the data-list panel shows a blank bordered box with no placeholder when `engine.data` is empty, giving no cue that Statistics Mode is active but no data has been entered yet | Verified by reading `index.html`/`style.css`: `.data-list` has no empty-state styling. Every user activating Statistics Mode before their first Add sees this. Fixed: added a CSS `:empty` placeholder. |
| defer | Blind Hunter + Verification Gap (same root cause): no automated test touches `calculator.js`'s DOM/render logic, so the new Statistics Mode toggle, five buttons, panel visibility, and data-list rendering have zero test coverage | Confirmed: repo has no DOM test harness (no jsdom/puppeteer/playwright dependency; `test/logic.test.js` imports only `calculator-logic.js`). Identical, already-logged gap from the Programmer Mode review (`deferred-work.md`), extended to new code via the same pre-existing pattern, not a new regression. Logged a Statistics-Mode-specific entry to `deferred-work.md`; performed a manual browser check to compensate (see Verification section). |
| defer | Edge Case Hunter: `sum()`/`average()`/`standardDeviation()` show `formatNumber`'s `"Error"` text on a non-finite (overflow) result but never set `this.error = true`, so the engine stays unblocked and a corrupted follow-on computation is possible | Verified the specific claim, but this is pre-existing to the whole engine, not introduced by this diff: `equals()`/`setOperator()` have the identical gap today (only divide-by-zero sets `this.error`; overflow was never specially handled). Fixing only the three new stats methods while leaving the pre-existing arithmetic path unfixed would be inconsistent. Logged to `deferred-work.md` as a systemic issue. |
| rejected (fix edits this spec) | Blind Hunter: this spec's own Implementation Notes miscounts the tests added (said "13 new tests" and "25 pre-existing"; the diff actually adds 12 new tests on top of 24 pre-existing, 24+12=36) | Per the "reject any finding whose fix is to edit this build's spec" rule — out of scope for triage. Corrected anyway as housekeeping now that the actual `npm test` run (36/36) is confirmed. |
| false | Blind Hunter + Verification Gap "Other findings": `npm test` was never actually executed against this diff | True when both review layers ran (their sandbox blocks `node`/`npm` execution), but superseded: `npm test` was run outside the sandbox after implementation and confirmed 36/36 passing (24 pre-existing + 12 new). Verification section updated to record the actual result. |
| false | Blind Hunter: `clearData()` is blocked while `this.error` is true, with no test explicitly covering pressing Clear Data during an error state | Not a defect: matches the spec's own explicit requirement that an error state blocks all input until Clear (C) — the same pattern already used for divide-by-zero. Behavior is correct and spec-consistent; the note is a test-coverage suggestion, not a bad outcome. |
| false | Blind Hunter + Edge Case Hunter (same root cause): a pending Standard-mode operator/previousValue is untouched by `setStatisticsMode`/`addData`/`sum`/`average`/`standardDeviation`, so a stale pending operator from before Statistics Mode was engaged can later resolve on `=` and overwrite the display with a Standard-mode result | Verified reachable, but not a defect: this is the calculator's existing, tested, left-to-right chaining behavior, and Programmer Mode already established the precedent of preserving a pending operator across mode/base changes rather than clearing it. Matches genuine calculator "Statistics box" UX (compute an expression, then capture its result as a data point via Add) — operator/equals staying live during Statistics Mode is a feature, not a bug. No incorrect arithmetic occurs; `=` only ever completes the calculation that was actually pending. |

## Design Notes

Standard deviation is computed the standard sample way: mean = sum/n, variance = Σ(x − mean)² / (n − 1), result = √variance. Display via the existing `formatNumber(value, 10)`, which already rounds away floating-point noise.

## Verification

**Commands:**
- `npm test` -- run after implementation: **36/36 passing** (24 pre-existing + 12 new Statistics Mode tests), then again after the review-triage patches below with 1 more test added for the fixed `addData()` guard -- **37/37 passing**.

**Manual checks (if no CLI):**
- Performed by the human in a browser: confirmed Std Dev of {4, 8, 6} displays "2" exactly (sample formula), empty-list Sum displays "0" while empty-list Average displays "No data entered" (the spec'd asymmetric handling), Standard-mode arithmetic operators stay live and usable during Statistics Mode (matches the Review Triage Log's "feature, not bug" verdict), and hex digit keys A-F correctly grey out under the DEC base.
