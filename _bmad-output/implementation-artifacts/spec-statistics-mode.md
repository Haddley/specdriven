---
title: 'Statistics Mode (Sum, Average, Standard Deviation)'
type: 'feature'
created: '2026-09-30'
status: 'draft'
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
- [ ] `calculator-logic.js` -- add `statisticsMode`/`data` state and `setStatisticsMode`/`addData`/`sum`/`average`/`standardDeviation`/`clearData` -- centralizes stats logic in the tested engine, keeps DOM code dumb
- [ ] `calculator.js` -- wire the Statistics Mode toggle and Add/Sum/Avg/Std Dev/Clear Data buttons, render the data list, enforce mutual exclusivity with Programmer Mode -- connects UI to the engine
- [ ] `index.html` -- add Statistics Mode toggle, stats panel, data-list display -- UI surface for the feature
- [ ] `style.css` -- style new panel and data list -- keep the flat monochrome look
- [ ] `test/logic.test.js` -- cover data entry, sum/average/std-dev, empty/insufficient-data errors, Clear Data, mode exclusivity -- locks in engine behavior

**Acceptance Criteria:**
- Given Standard mode, when the user activates Statistics Mode, then the stats panel appears (Add/Sum/Avg/Std Dev/Clear Data) and Programmer Mode, if active, turns off.
- Given Statistics Mode with several values added, when the user computes Sum, Average, or Std Dev repeatedly, then each press recomputes over the unchanged data list, and digit entry afterward starts a fresh number rather than appending.
- Given Statistics Mode, when the user deactivates it, then Standard mode's existing decimal behavior is unaffected and the data list is retained if Statistics Mode is reactivated later.
- Given an error state from Average or Std Dev on insufficient data, when the user presses Clear, then the engine returns to a usable state with the data list intact.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Standard deviation is computed the standard sample way: mean = sum/n, variance = Σ(x − mean)² / (n − 1), result = √variance. Display via the existing `formatNumber(value, 10)`, which already rounds away floating-point noise.

## Verification

**Commands:**
- `npm test` -- expected: all existing tests plus new Statistics Mode tests pass.

**Manual checks (if no CLI):**
- In a browser: activate Statistics Mode, add a few values, confirm Sum/Avg/Std Dev display correctly, confirm Clear Data empties the list, and confirm activating Programmer Mode turns Statistics Mode off (and vice versa).
