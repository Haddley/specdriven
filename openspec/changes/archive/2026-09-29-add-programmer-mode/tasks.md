# Tasks

## 1. Engine: base state and conversion

- [x] 1.1 Add `base` state (`"DEC"` | `"HEX"` | `"OCT"` | `"BIN"`, default `"DEC"`) and a `setBase(base)` method to `CalculatorEngine` in `calculator-logic.js`; verify with a unit test that a new engine starts in `"DEC"` and `setBase("HEX")` updates `calc.base`.
- [x] 1.2 Implement the internal true-integer-value representation and a `toRadixString(base)` formatter that renders it per design.md's rules (uppercase hex digits, no radix prefix, 32-bit two's-complement bit pattern for negatives); verify with unit tests covering positive values in each base (e.g., 255 → `FF`, 8 → `1000` binary) and a negative value (-1 → `FFFFFFFF` hex, 32 ones in binary).
- [x] 1.3 Implement `setBase` reformatting the current display into the new base from the true value, including truncate-toward-zero when leaving Decimal with a fractional value; verify with unit tests for Decimal→Hex (`255`→`FF`), Hex→Binary (`FF`→`11111111`), and Decimal→Hex truncation (`10.75`→`A`).
- [x] 1.4 Implement 32-bit two's-complement wraparound for arithmetic results in non-decimal bases (equivalent to `value | 0` after each `_compute`); verify with a unit test that adding `1` to `7FFFFFFF` in Hex mode wraps to `80000000`.

## 2. Engine: base-aware digit entry

- [x] 2.1 Add a per-base valid-digit set (Binary: `0`-`1`, Octal: `0`-`7`, Decimal: `0`-`9`, Hex: `0`-`9`,`A`-`F`) and make `inputDigit` reject digits invalid for the active base (no-op, matching existing error-state no-op pattern); verify with unit tests that `inputDigit("5")` is a no-op in Binary mode and `inputDigit("A")` appends in Hex mode but is a no-op in Decimal mode.
- [x] 2.2 Make `inputDecimal` a no-op whenever `base` is not `"DEC"`; verify with a unit test that `inputDecimal()` does not modify the display in Binary, Octal, or Hex mode.
- [x] 2.3 Confirm `setOperator` and `equals` operate on the true integer value and produce a result formatted in the active base for all four operations; verify with unit tests: `101 + 11` in Binary → `1000`, `A × 2` in Hex → `14`, and divide-by-zero in Binary/Hex still sets `error` and shows `Cannot divide by zero` (reusing the existing divide-by-zero scenario pattern from `test/logic.test.js`).

## 3. UI: mode toggle and base-restricted keypad

- [x] 3.1 Add a DEC/HEX/OCT/BIN mode-toggle control to `index.html`, styled consistently with the existing flat/boxy `.key` buttons in `style.css`; verify by loading `index.html` in a browser and confirming all four mode buttons render and one is visually indicated as active.
- [x] 3.2 Add hex digit keys (`A`-`F`) to `index.html`, positioned with the existing digit grid; verify by loading in a browser and confirming the new keys are present alongside `0`-`9`.
- [x] 3.3 Wire mode-toggle buttons in `calculator.js` to call `engine.setBase(...)` and re-render, and update the display's rendered text and mode indicator after every render call; verify manually in a browser that clicking each mode button updates both the indicator and (if a value is present) the displayed value's base.
- [x] 3.4 In `calculator.js`, disable/enable digit and decimal-point buttons to match the active base's valid-digit set (per design.md) on every render; verify manually in a browser that switching to Binary mode visibly disables keys `2`-`9`, `A`-`F`, and the decimal point, and switching to Hex mode re-enables all digit keys.

## 4. Tests and documentation

- [x] 4.1 Add `test/programmer-mode.test.js` covering the spec's scenarios not already exercised in Tasks 1-2 (default base is Decimal, `setBase` scenarios, digit-restriction scenarios, calculation scenarios, overflow/negative-value scenarios, hex formatting); verify with `npm test` passing.
- [x] 4.2 Update `README.md`'s Structure/Design-decisions sections to mention Programmer Mode (base switching, integer-only non-decimal bases, fixed 32-bit two's-complement domain); verify by reading the updated section for accuracy against design.md.
