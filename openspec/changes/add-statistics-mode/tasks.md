# Tasks

## 1. Engine: Statistics mode state and data-set entry

- [ ] 1.1 Add `statisticsMode` (boolean, default `false`) and `dataSet` (array, default `[]`) state to `CalculatorEngine` in `calculator-logic.js`, plus a `setStatisticsMode(active)` method that sets `statisticsMode`, clears `dataSet`, and calls `reset()`; verify with a unit test that a new engine starts with `statisticsMode` `false` and `dataSet` empty, and that `setStatisticsMode(true)` then `setStatisticsMode(false)` both leave `dataSet` empty.
- [ ] 1.2 Implement `addToDataSet()`: while `statisticsMode` is true and not in an error state, parses the current display as a float, pushes it onto `dataSet`, and resets `display` to `"0"` (following the existing `waitingForOperand`-style fresh-entry pattern); verify with unit tests that entering `5` and calling `addToDataSet()` results in `dataSet` containing `[5]` and `display` reset to `"0"`, and that entering `2`, adding, entering `4`, adding, entering `6`, adding results in `dataSet` equal to `[2, 4, 6]`.
- [ ] 1.3 Make `addToDataSet()` a no-op when `statisticsMode` is `false`; verify with a unit test that calling it outside Statistics mode does not modify `dataSet`.

## 2. Engine: Sum, Average, and Standard Deviation

- [ ] 2.1 Implement `computeSum()`: writes the sum of `dataSet` to `display` without modifying `dataSet`; if `dataSet` is empty, sets `error = true` and `display = "No data entered"` (reusing the existing error-state pattern from divide-by-zero); verify with unit tests that `dataSet = [2, 4, 6]` produces `display === "12"` and `dataSet` is unchanged, and that an empty `dataSet` produces the `No data entered` error with `error === true`.
- [ ] 2.2 Implement `computeAverage()` with the same empty-data-set error handling as 2.1; verify with a unit test that `dataSet = [2, 4, 6]` produces `display === "4"`, and an empty `dataSet` produces the `No data entered` error.
- [ ] 2.3 Implement `computeStdDev()` as the population standard deviation (divide by `n`) with the same empty-data-set error handling; verify with unit tests that `dataSet = [2, 4, 6]` produces a display value matching `1.632993` to 6 decimal places, and that `dataSet = [7]` produces `display === "0"`.
- [ ] 2.4 Verify with a unit test that calling `computeSum()`, then `computeAverage()`, then `computeStdDev()` on the same non-empty `dataSet` leaves `dataSet` unchanged after each call (spec.md - "Computing a result does not modify the data set").

## 3. Engine: Clear behavior and error blocking in Statistics mode

- [ ] 3.1 Update `clear()` to empty `dataSet` (in addition to its existing `reset()` behavior) whenever `statisticsMode` is `true`; verify with a unit test that clearing with `dataSet = [2, 4]` results in `dataSet` empty and `display === "0"`.
- [ ] 3.2 Verify with unit tests that after `computeSum()`/`computeAverage()`/`computeStdDev()` sets the `No data entered` error, `addToDataSet()` and digit entry are both blocked (no-op) until `clear()` is called, matching the existing divide-by-zero blocked-input test pattern in `test/logic.test.js`.

## 4. UI: Statistics mode toggle and keys

- [ ] 4.1 Add a STAT mode-toggle button to `index.html` (styled with the existing `.key` class, in its own row similar to `.mode-toggle`), and Add/Sum/Avg/Std buttons plus an entered-count indicator element; verify by loading `index.html` in a browser and confirming all new controls render.
- [ ] 4.2 Wire the STAT toggle in `calculator.js` to call `engine.setStatisticsMode(...)` and re-render, updating the mode indicator; verify manually in a browser that clicking STAT switches the indicator and clicking it again switches back.
- [ ] 4.3 Wire the Add/Sum/Avg/Std buttons in `calculator.js` to call `engine.addToDataSet()`/`computeSum()`/`computeAverage()`/`computeStdDev()` respectively and re-render; update the entered-count indicator to show `dataSet.length` on every render; verify manually in a browser that entering values and pressing Add increments the shown count, and that Sum/Avg/Std display the expected results.
- [ ] 4.4 In `calculator.js`'s render function, disable the arithmetic operator keys (`+`, `-`, `×`, `÷`), the equals key, and the DEC/HEX/OCT/BIN base-toggle keys whenever `engine.statisticsMode` is `true`, and re-enable them when it is `false`; verify manually in a browser that switching into Statistics mode visibly disables those keys and switching back to Standard mode re-enables them.
- [ ] 4.5 Style the new STAT row, Add/Sum/Avg/Std keys, and entered-count indicator in `style.css` consistent with the existing flat/boxy `.key` aesthetic; verify visually in a browser that the new controls match the existing button styling (borders, active/disabled states).

## 5. Tests and documentation

- [ ] 5.1 Add `test/statistics-mode.test.js` covering the spec's scenarios not already exercised in Tasks 1-3 (default Statistics mode is inactive, entering Statistics mode starts empty, leaving Statistics mode clears the data set, re-entering starts empty again); verify with `npm test` passing.
- [ ] 5.2 Update `README.md`'s Structure and Design-decisions sections to mention Statistics Mode (sequence entry via Add, Sum/Average/population Standard Deviation, decimal-only, arithmetic and base toggle disabled while active); verify by reading the updated section for accuracy against design.md.
