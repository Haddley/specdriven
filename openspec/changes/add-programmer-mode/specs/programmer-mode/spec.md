# Spec Delta

## Purpose

Lets users switch the calculator's active base between Decimal, Hexadecimal, Octal, and Binary, and perform the calculator's existing operations directly in whichever base is active.

## ADDED Requirements

### Requirement: Base mode selection
The system SHALL provide a control to switch the active calculation base among Decimal, Hexadecimal, Octal, and Binary, and SHALL indicate which base is currently active. The active base SHALL default to Decimal.

#### Scenario: User switches to Hexadecimal
- **WHEN** the user selects Hexadecimal mode
- **THEN** the active base becomes Hexadecimal and the mode indicator reflects Hexadecimal

#### Scenario: Default base on startup
- **WHEN** the calculator loads
- **THEN** the active base SHALL be Decimal

### Requirement: Digit entry restricted to active base
The system SHALL restrict digit entry to the digits valid in the active base: `0`-`1` for Binary, `0`-`7` for Octal, `0`-`9` for Decimal, `0`-`9` and `A`-`F` for Hexadecimal. Keys for digits not valid in the active base SHALL be disabled and SHALL NOT affect the display when pressed.

#### Scenario: Binary mode disables non-binary digits
- **WHEN** Binary mode is active
- **THEN** digit keys `2`-`9` and `A`-`F` SHALL be disabled

#### Scenario: Octal mode disables non-octal digits
- **WHEN** Octal mode is active
- **THEN** digit keys `8`, `9`, and `A`-`F` SHALL be disabled

#### Scenario: Hexadecimal mode enables all digits
- **WHEN** Hexadecimal mode is active
- **THEN** digit keys `0`-`9` and `A`-`F` SHALL all be enabled

#### Scenario: Enabled digit appends to display
- **WHEN** the user presses a digit key that is enabled in the active base
- **THEN** the digit SHALL be appended to the display, following the same entry rules as Decimal mode

### Requirement: Decimal point disabled outside Decimal mode
The system SHALL disable the decimal-point key whenever the active base is Hexadecimal, Octal, or Binary, since Programmer mode is integer-only.

#### Scenario: Decimal point disabled in non-decimal bases
- **WHEN** the active base is Binary, Octal, or Hexadecimal
- **THEN** the decimal-point key SHALL be disabled

#### Scenario: Decimal point still enabled in Decimal mode
- **WHEN** the active base is Decimal
- **THEN** the decimal-point key SHALL be enabled

### Requirement: Switching base reformats the current value
Switching the active base SHALL reformat the currently displayed value into the newly selected base's representation of the same underlying integer value. It SHALL NOT reset the value or reinterpret the on-screen digits as if freshly typed in the new base.

#### Scenario: Decimal to Hexadecimal
- **WHEN** the display shows `255` in Decimal mode and the user switches to Hexadecimal mode
- **THEN** the display SHALL show `FF`

#### Scenario: Hexadecimal to Binary
- **WHEN** the display shows `FF` in Hexadecimal mode and the user switches to Binary mode
- **THEN** the display SHALL show `11111111`

#### Scenario: Leaving Decimal truncates a fractional value
- **WHEN** the display shows `10.75` in Decimal mode and the user switches to Hexadecimal mode
- **THEN** the fractional part SHALL be truncated toward zero before conversion, and the display SHALL show `A`

### Requirement: Calculating in the active base
The existing add, subtract, multiply, and divide operations SHALL operate on the true integer value represented by the current display and SHALL produce a result displayed in the active base, for every base.

#### Scenario: Addition in Binary
- **WHEN** Binary mode is active and the user computes `101 + 11`
- **THEN** the display SHALL show `1000`

#### Scenario: Multiplication in Hexadecimal
- **WHEN** Hexadecimal mode is active and the user computes `A × 2`
- **THEN** the display SHALL show `14`

#### Scenario: Divide by zero in a non-decimal base
- **WHEN** the user divides by zero while the active base is Binary, Octal, or Hexadecimal
- **THEN** the display SHALL show `Cannot divide by zero` and further input SHALL be blocked until Clear is pressed, matching existing Decimal-mode behavior

### Requirement: Fixed 32-bit two's-complement integer domain
Values in Hexadecimal, Octal, and Binary modes SHALL be represented as signed 32-bit two's-complement integers. Arithmetic results that exceed this range SHALL wrap using standard 32-bit two's-complement overflow rather than erroring or growing unbounded.

#### Scenario: Negative value displays as two's-complement bit pattern
- **WHEN** the active base is not Decimal and the true value is `-1`
- **THEN** the display SHALL show the 32-bit two's-complement representation of `-1` (32 consecutive `1` digits in Binary, `FFFFFFFF` in Hexadecimal)

#### Scenario: Arithmetic overflow wraps rather than errors
- **WHEN** the active base is Hexadecimal, the true value is the maximum signed 32-bit value (`7FFFFFFF`), and the user adds `1`
- **THEN** the result SHALL wrap to the minimum signed 32-bit value and the display SHALL show `80000000`, not an error

### Requirement: Hexadecimal display formatting
Hexadecimal values SHALL display using uppercase letters `A`-`F` and no radix prefix.

#### Scenario: Uppercase, unprefixed hex digits
- **WHEN** the active base is Hexadecimal and the true value is `10`
- **THEN** the display SHALL show `A`, not `a` or `0xA`
