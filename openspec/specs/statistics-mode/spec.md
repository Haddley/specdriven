# statistics-mode Specification

## Purpose

Lets users build up a sequence of decimal numbers as a data set and compute the sum, arithmetic mean, and population standard deviation of the values entered so far.

## Requirements

### Requirement: Statistics mode selection
The system SHALL provide a control to switch the calculator into Statistics mode and back to Standard mode, and SHALL indicate when Statistics mode is active. Statistics mode SHALL be inactive by default.

#### Scenario: User switches to Statistics mode
- **WHEN** the user activates Statistics mode
- **THEN** Statistics mode becomes active and the mode indicator reflects that Statistics mode is active

#### Scenario: Statistics mode inactive on startup
- **WHEN** the calculator loads
- **THEN** Statistics mode SHALL be inactive

#### Scenario: Entering Statistics mode starts with an empty data set
- **WHEN** the user activates Statistics mode
- **THEN** the entered-count indicator SHALL show `0` and no values SHALL be present in the data set

### Requirement: Adding values to the data set
While Statistics mode is active, the system SHALL let the user type a decimal number using the existing digit and decimal-point keys and append it to the current data set via an Add action. The entered-count indicator SHALL reflect the number of values currently in the data set.

#### Scenario: Adding a value increases the count
- **WHEN** Statistics mode is active, the display shows `5`, and the user presses Add
- **THEN** `5` SHALL be appended to the data set, the entered-count indicator SHALL show `1`, and the display SHALL reset to `0` for the next entry

#### Scenario: Adding several values accumulates them
- **WHEN** Statistics mode is active and the user enters `2`, presses Add, enters `4`, presses Add, enters `6`, and presses Add
- **THEN** the data set SHALL contain `2`, `4`, and `6` in that order, and the entered-count indicator SHALL show `3`

#### Scenario: Add is disabled outside Statistics mode
- **WHEN** Statistics mode is not active
- **THEN** the Add action SHALL NOT be available

### Requirement: Computing sum, average, and standard deviation
While Statistics mode is active and the data set contains at least one value, the system SHALL compute and display, on request: the sum of all values in the data set, the arithmetic mean of all values, and the population standard deviation of all values (dividing by the count of values, not count minus one).

#### Scenario: Sum of entered values
- **WHEN** the data set contains `2`, `4`, and `6`, and the user requests Sum
- **THEN** the display SHALL show `12`

#### Scenario: Average of entered values
- **WHEN** the data set contains `2`, `4`, and `6`, and the user requests Average
- **THEN** the display SHALL show `4`

#### Scenario: Population standard deviation of entered values
- **WHEN** the data set contains `2`, `4`, and `6`, and the user requests Standard Deviation
- **THEN** the display SHALL show the population standard deviation of `2`, `4`, `6`, which is approximately `1.632993`

#### Scenario: Standard deviation of a single value is zero
- **WHEN** the data set contains only `7`, and the user requests Standard Deviation
- **THEN** the display SHALL show `0`

#### Scenario: Computing a result does not modify the data set
- **WHEN** the data set contains `2`, `4`, and `6`, and the user requests Sum, then Average, then Standard Deviation
- **THEN** the data set SHALL still contain `2`, `4`, and `6` and the entered-count indicator SHALL still show `3` after each request

### Requirement: Empty data set blocks computation
While Statistics mode is active, requesting Sum, Average, or Standard Deviation with an empty data set SHALL show an error (`No data entered`) and SHALL block further input until Clear is pressed, matching the existing divide-by-zero error pattern.

#### Scenario: Sum requested with no data entered
- **WHEN** Statistics mode is active, no values have been added, and the user requests Sum
- **THEN** the display SHALL show `No data entered` and further input SHALL be blocked until Clear is pressed

#### Scenario: Average requested with no data entered
- **WHEN** Statistics mode is active, no values have been added, and the user requests Average
- **THEN** the display SHALL show `No data entered` and further input SHALL be blocked until Clear is pressed

#### Scenario: Standard Deviation requested with no data entered
- **WHEN** Statistics mode is active, no values have been added, and the user requests Standard Deviation
- **THEN** the display SHALL show `No data entered` and further input SHALL be blocked until Clear is pressed

### Requirement: Clearing in Statistics mode
While Statistics mode is active, pressing Clear SHALL reset the current entry to `0` and SHALL empty the data set, resetting the entered-count indicator to `0`.

#### Scenario: Clear empties the data set
- **WHEN** Statistics mode is active, the data set contains `2` and `4`, and the user presses Clear
- **THEN** the display SHALL show `0`, the data set SHALL be empty, and the entered-count indicator SHALL show `0`

### Requirement: Leaving Statistics mode clears the data set
Switching the calculator out of Statistics mode SHALL clear the current data set. Re-entering Statistics mode SHALL always start from an empty data set.

#### Scenario: Switching to Standard mode clears the data set
- **WHEN** Statistics mode is active with `2` and `4` in the data set, and the user switches to Standard mode
- **THEN** the data set SHALL be cleared

#### Scenario: Re-entering Statistics mode starts empty
- **WHEN** the user leaves Statistics mode with values previously entered, then re-activates Statistics mode
- **THEN** the entered-count indicator SHALL show `0` and no values SHALL be present in the data set

### Requirement: Arithmetic operators and base toggle disabled in Statistics mode
While Statistics mode is active, the arithmetic operator keys (`+`, `-`, `×`, `÷`), the equals key, and the Decimal/Hexadecimal/Octal/Binary base toggle SHALL be disabled, since Statistics mode operates only on decimal values entered into the data set.

#### Scenario: Operator keys disabled while Statistics mode is active
- **WHEN** Statistics mode is active
- **THEN** the `+`, `-`, `×`, `÷`, and equals keys SHALL be disabled

#### Scenario: Base toggle disabled while Statistics mode is active
- **WHEN** Statistics mode is active
- **THEN** the Decimal/Hexadecimal/Octal/Binary base toggle keys SHALL be disabled

#### Scenario: Operator keys re-enabled after leaving Statistics mode
- **WHEN** the user switches from Statistics mode back to Standard mode
- **THEN** the `+`, `-`, `×`, `÷`, and equals keys SHALL be enabled
