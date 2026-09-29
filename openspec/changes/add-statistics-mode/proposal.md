# Proposal

## Why

The calculator can only operate on one number at a time. Users who need to summarize a sequence of numbers — sum, average, standard deviation — must currently do it by hand or leave the app. Statistics mode is a well-established calculator feature (Windows Calculator has offered a Statistics view since Windows 7) that lets users enter a running list of values and get these aggregate results directly.

## What Changes

- Add a **STAT** mode toggle that switches the calculator into Statistics mode, separate from the existing Decimal/Hex/Octal/Binary base toggle (Programmer mode).
- In Statistics mode, the user types a number using the existing digit and decimal-point keys, then presses **Add** to append it to the current data set. This repeats to build up a sequence of entered values.
- The display indicates how many values have been entered so far (`n`).
- Three new keys compute over the entered data set and show the result on the display: **SUM** (sum of all entered values), **AVG** (arithmetic mean), and **STD** (standard deviation).
- Standard deviation is computed as the **population** standard deviation of the entered values (divides by `n`, not `n - 1`) — this is well-defined for any non-empty data set, including a single entry, whereas sample standard deviation (`n - 1`) is undefined for `n = 1`.
- Pressing SUM, AVG, or STD with no values entered (`n = 0`) shows an error (`No data entered`) and blocks further input until Clear is pressed, matching the existing divide-by-zero error pattern.
- Clear (`C`) in Statistics mode clears both the current entry and the entered data set.
- Leaving Statistics mode (switching back to Standard/Programmer) clears the data set; re-entering Statistics mode always starts from an empty data set.
- While Statistics mode is active, the arithmetic operators (`+`, `-`, `×`, `÷`), equals, and the Decimal/Hex/Octal/Binary base toggle are disabled — Statistics mode is decimal-only and does not chain arithmetic operations, since the request scopes this change to sequence entry plus sum/average/standard deviation.
- **Non-goals (explicitly out of scope for this change)**: sample standard deviation, variance, median, mode, min/max, viewing or editing individual entries in the data set, removing a single entry, and combining Statistics mode with Programmer mode's non-decimal bases. These can be follow-up changes if needed.

## Capabilities

### New Capabilities
- `statistics-mode`: Entering a sequence of decimal numbers into a running data set and computing their sum, arithmetic mean, and population standard deviation.

### Modified Capabilities
- None. Statistics mode is additive; it does not change the existing decimal four-function behavior or the `programmer-mode` capability's requirements. (Statistics mode disables the base toggle and operator keys while active, but this is Statistics mode's own behavior, not a change to what Programmer mode does when it is active.)

## Impact

- **Code**: `calculator-logic.js` (engine gains a data-set array, `Add`/`Sum`/`Avg`/`Std` methods, and population standard deviation math), `calculator.js` (DOM wiring for the STAT toggle, Add/Sum/Avg/Std keys, entry-count indicator, and disabling operator/base keys while Statistics mode is active), `index.html` (STAT toggle, Add/Sum/Avg/Std keys, entry-count display element), `style.css` (styling for the new controls, consistent with the existing flat/boxy aesthetic), `test/logic.test.js` or a new `test/statistics-mode.test.js` (tests for data-set entry and the three computations).
- **No new dependencies or build step** — stays plain HTML/CSS/JS, consistent with the existing project.
- **No breaking changes** to existing decimal four-function or Programmer-mode behavior.
