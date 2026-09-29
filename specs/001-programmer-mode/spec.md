# Feature Specification: Programmer Mode

**Feature Branch**: `001-programmer-mode`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "Add a Programmer Mode, like calculators have had since Windows 7 — support switching to binary, octal, and hexadecimal, and calculating in those bases."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enter and view numbers in another base (Priority: P1)

A user switches the calculator into Programmer Mode and selects Binary, Octal,
or Hexadecimal. They enter a number using only the digits valid for that
base and see it displayed correctly.

**Why this priority**: This is the foundation of the feature — without base
selection and base-restricted entry, nothing else in Programmer Mode is
possible. It is independently valuable even before any calculation happens,
since users often just need to view a number in another base.

**Independent Test**: Can be fully tested by switching to Programmer Mode,
selecting Binary, and entering "1011" — the display shows "1011" and pressing
a digit invalid in Binary (e.g. "9") has no effect.

**Acceptance Scenarios**:

1. **Given** the calculator is in Standard Mode, **When** the user switches to
   Programmer Mode, **Then** a base selector offering Decimal, Hexadecimal,
   Octal, and Binary becomes available.
2. **Given** Programmer Mode with Hexadecimal selected, **When** the user
   presses digit keys "2", "A", "F", **Then** the display shows "2AF".
3. **Given** Programmer Mode with Binary selected, **When** the user presses
   the "9" key, **Then** the display is unchanged, since "9" is not a valid
   Binary digit.
4. **Given** Programmer Mode with Octal selected, **When** the user presses
   the "8" key, **Then** the display is unchanged, since "8" is not a valid
   Octal digit.

---

### User Story 2 - Calculate in the selected base (Priority: P2)

A user performs addition, subtraction, multiplication, or division on
numbers entered in Binary, Octal, or Hexadecimal, and sees a correctly
computed result displayed in that same base.

**Why this priority**: Calculating — not just viewing — is the core reason to
add numbers in a non-decimal base. This delivers the primary value of
Programmer Mode once base entry (User Story 1) exists.

**Independent Test**: Can be fully tested by switching to Programmer Mode,
selecting Binary, entering "101" (5), pressing "+", entering "11" (3), and
pressing "=" — the display shows "1000" (8 in binary).

**Acceptance Scenarios**:

1. **Given** Programmer Mode with Hexadecimal selected, **When** the user
   computes "F" + "1", **Then** the display shows "10".
2. **Given** Programmer Mode with Octal selected, **When** the user computes
   "7" + "1", **Then** the display shows "10".
3. **Given** Programmer Mode with Binary selected, **When** the user
   computes "11" × "10", **Then** the display shows "110" (3 × 2 = 6).
4. **Given** Programmer Mode with any base selected, **When** the user
   attempts to divide by zero, **Then** the display shows the same
   "Cannot divide by zero" message used in Standard Mode, and further input
   is blocked until Clear is pressed.
5. **Given** Programmer Mode, **When** a calculation produces a negative
   result (e.g. "3" − "5" in Decimal), **Then** the result is shown with a
   leading minus sign followed by the magnitude in the selected base.

---

### User Story 3 - Switch bases mid-session without losing the value (Priority: P3)

A user changes the selected base while a value is on the display, and the
same numeric value is immediately redisplayed converted into the newly
selected base.

**Why this priority**: This is a convenience refinement — useful for
comparing the same value across bases — but the feature is already usable
without it, since a user could clear and re-enter the value manually.

**Independent Test**: Can be fully tested by entering "255" in Decimal, then
switching the base to Hexadecimal — the display updates to "FF" without
further input.

**Acceptance Scenarios**:

1. **Given** Programmer Mode with Decimal selected and "255" on the display,
   **When** the user switches the base to Hexadecimal, **Then** the display
   shows "FF".
2. **Given** Programmer Mode with Binary selected and "1010" on the display,
   **When** the user switches the base to Octal, **Then** the display shows
   "12".
3. **Given** Programmer Mode mid-calculation (an operator already pressed,
   awaiting the next operand), **When** the user switches base, **Then** the
   already-entered operand is converted and redisplayed in the new base, and
   the pending operator is preserved.

---

### Edge Cases

- Pressing a digit key not valid in the currently selected base (e.g. "9" in
  Binary, "8" in Octal, any letter in Decimal) has no effect on the display.
- Switching from Programmer Mode back to Standard Mode clears the current
  entry and any in-progress calculation, returning to a plain Decimal state.
- The decimal-point key has no effect in Programmer Mode, in any base —
  Programmer Mode is integer-only, matching the reference behavior.
- Dividing by zero in any base shows the existing "Cannot divide by zero"
  error and blocks further input until Clear is pressed, identical to
  Standard Mode.
- A negative result is displayed with a leading "-" followed by the
  magnitude in the selected base (e.g. "-101" in Binary for −5), not a
  two's-complement bit pattern.
- Switching bases while an error state ("Cannot divide by zero") is
  displayed has no effect until Clear is pressed.
- Chaining multiple operators (e.g. "5" + "3" × "2") in a non-decimal base
  follows the same left-to-right evaluation order as Standard Mode, not
  operator precedence.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a way to switch the calculator between
  Standard Mode (the existing decimal four-function calculator) and
  Programmer Mode.
- **FR-002**: In Programmer Mode, System MUST let the user select one of four
  bases: Decimal, Hexadecimal, Octal, or Binary.
- **FR-003**: In Programmer Mode, System MUST restrict digit entry to only
  the digits valid for the currently selected base (0-9 for Decimal; 0-9 and
  A-F for Hexadecimal; 0-7 for Octal; 0-1 for Binary); presses of invalid
  digits MUST have no effect.
- **FR-004**: System MUST support addition, subtraction, multiplication, and
  division of values entered in Programmer Mode, using the same
  left-to-right chaining behavior (not operator precedence) as Standard
  Mode.
- **FR-005**: System MUST display calculation results in the currently
  selected base.
- **FR-006**: When the user changes the selected base while a value is
  displayed, System MUST convert and redisplay the current value (including
  a value already entered as one operand of a pending calculation) in the
  newly selected base, without requiring re-entry.
- **FR-007**: Programmer Mode MUST operate on integers only; the
  decimal-point key MUST have no effect while Programmer Mode is active,
  regardless of the selected base.
- **FR-008**: Switching from Programmer Mode to Standard Mode MUST clear the
  current entry and any in-progress calculation.
- **FR-009**: Dividing by zero in Programmer Mode MUST produce the same
  "Cannot divide by zero" error behavior as Standard Mode (display the
  message and block further input until Clear is pressed).
- **FR-010**: System MUST display negative results as a leading minus sign
  followed by the magnitude in the selected base.
- **FR-011**: The Clear key MUST reset the current entry and any in-progress
  calculation the same way it does in Standard Mode, regardless of the
  selected base.
- **FR-012**: Standard Mode's existing behavior (left-to-right chaining,
  divide-by-zero error and input lock, decimal-point entry) MUST remain
  unchanged by the addition of Programmer Mode.

### Key Entities

- **Calculator Mode**: Whether the calculator is currently in Standard Mode
  (decimal only, as it exists today) or Programmer Mode (base-selectable).
- **Number Base**: One of Decimal, Hexadecimal, Octal, or Binary; active only
  in Programmer Mode. Determines which digit keys are valid and how the
  current value and results are displayed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch into Programmer Mode and select Binary,
  Octal, or Hexadecimal in a single interaction, with no page reload.
- **SC-002**: Addition, subtraction, multiplication, and division performed
  in Binary, Octal, or Hexadecimal produce results that match the equivalent
  Decimal calculation converted to the target base, 100% of the time across
  representative test cases.
- **SC-003**: Attempting to enter a digit invalid for the currently selected
  base never changes the displayed value.
- **SC-004**: Switching the selected base while a value is displayed always
  redisplays that exact numeric value converted correctly into the new base,
  with no loss of precision, verified across all base pairs.
- **SC-005**: All Standard Mode behavior present before this feature (the
  four operations, left-to-right chaining, divide-by-zero handling) continues
  to work exactly as before, with zero regressions.

## Assumptions

- Programmer Mode is integer-only: fractional/decimal-point entry is
  disabled in Programmer Mode regardless of base, matching the reference
  behavior of Windows Calculator's Programmer Mode.
- Negative values are shown as a leading minus sign plus the magnitude in
  the selected base (sign-magnitude), not as two's-complement bit patterns.
  Bit width / word size (byte, word, dword, qword) selection is out of
  scope for this feature.
- Bitwise operations (AND, OR, XOR, NOT) and bit-shift operations, which
  Windows Calculator's Programmer Mode also offers, are out of scope — the
  request asks specifically for base switching and calculating with the
  existing four operations (+, −, ×, ÷) in those bases.
- Switching from Programmer Mode back to Standard Mode clears the current
  entry/calculation rather than attempting to carry over an in-progress,
  possibly base-converted value.
- Numeric range and precision follow the same underlying number handling as
  Standard Mode today; no additional overflow handling beyond what Standard
  Mode already has is introduced.
