# Proposal

## Why

The calculator only operates in decimal. Developers and hobbyists commonly need to view and compute values in binary, octal, and hexadecimal — a capability mainstream calculators (Windows Calculator's Programmer mode, since Windows 7) have offered for years. Adding a Programmer Mode lets users switch bases and calculate directly in them, without leaving the app to convert manually.

## What Changes

- Add a mode toggle that switches the calculator between **Decimal**, **Hexadecimal**, **Octal**, and **Binary** bases (the same four bases Windows Calculator's Programmer mode offers).
- In non-decimal bases, restrict digit entry to that base's valid digits (e.g., binary only accepts `0`/`1`; hex additionally enables `A`–`F`) and disable the decimal-point key, since Programmer mode is integer-only.
- Switching bases mid-entry reformats the current display value into the newly selected base (matching Windows Calculator behavior) rather than resetting it.
- The existing four operations (`+`, `-`, `×`, `÷`) continue to work in whichever base is active; results display in that base.
- Negative results and values are represented using two's complement over a fixed 32-bit word, matching common Programmer-mode calculator behavior (see design.md for rationale).
- **Non-goals (explicitly out of scope for this change)**: bitwise operators (AND, OR, XOR, NOT, shifts), word-size selection (BYTE/WORD/DWORD/QWORD), and other advanced Programmer-mode operations (MOD, RoL/RoR, etc.). The request scopes this change to base switching and calculating in those bases; the fuller Programmer-mode operator set can be a follow-up change.

## Capabilities

### New Capabilities
- `programmer-mode`: Base-switching (Decimal/Hex/Octal/Binary) and base-aware calculation for the four existing operations, including digit-entry restrictions and display reformatting on mode switch.

### Modified Capabilities
- None. No existing capability specs exist yet in this project (baseline calculator behavior was never spec'd); this change only adds the new `programmer-mode` capability. The existing decimal calculation engine's observable behavior in Decimal mode is unchanged.

## Impact

- **Code**: `calculator-logic.js` (engine gains base-awareness and integer/two's-complement handling), `calculator.js` (DOM wiring for mode toggle and base-restricted keypad), `index.html` (mode toggle UI, hex digit keys A–F), `style.css` (styling for new controls), `test/logic.test.js` (new tests for base conversion and calculation).
- **No new dependencies or build step** — stays plain HTML/CSS/JS, consistent with the existing project.
- **No breaking changes** to existing decimal four-function behavior.
