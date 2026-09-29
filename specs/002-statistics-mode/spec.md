# Feature Specification: Statistics Mode

**Feature Branch**: `002-statistics-mode`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "Add a Statistics Mode, like calculators have had since Windows 7 — enter a sequence of numbers and compute sum, average, and standard deviation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a data set of numbers (Priority: P1)

A user switches the calculator into Statistics Mode, enters a number, and
adds it to a running data set. They repeat this for several numbers and can
see how many data points have been collected so far.

**Why this priority**: This is the foundation of the feature — without a way
to enter numbers and accumulate them into a data set, no statistic can be
computed. It is independently valuable even before any statistic is
calculated, since it establishes the data-entry workflow.

**Independent Test**: Can be fully tested by switching to Statistics Mode,
entering "10", adding it to the data set, entering "20", adding it, and
entering "30", adding it — the data set shows 3 collected data points.

**Acceptance Scenarios**:

1. **Given** the calculator is in Standard Mode, **When** the user switches
   to Statistics Mode, **Then** the interface offers a way to enter a number
   and add it to a data set.
2. **Given** Statistics Mode with an empty data set, **When** the user enters
   "10" and adds it to the data set, **Then** the data set contains one data
   point and the count shown is 1.
3. **Given** Statistics Mode with one data point already in the data set,
   **When** the user enters "20" and adds it, **Then** the data set contains
   two data points and the count shown is 2.
4. **Given** Statistics Mode, **When** the user enters a negative number or a
   number with a decimal point and adds it, **Then** it is accepted into the
   data set the same as a positive whole number.

---

### User Story 2 - Compute Sum and Average (Priority: P1)

A user who has entered a sequence of numbers into Statistics Mode requests
the Sum and the Average (arithmetic mean) of the data set and sees each
result displayed.

**Why this priority**: Sum and Average are the most basic aggregate
statistics and, together with data entry, deliver the core value the user
asked for. A user can get meaningful value from this alone even before
standard deviation is available.

**Independent Test**: Can be fully tested by adding "10", "20", "30" to the
data set, requesting Sum — the display shows "60" — and requesting Average —
the display shows "20".

**Acceptance Scenarios**:

1. **Given** a data set containing 10, 20, and 30, **When** the user requests
   the Sum, **Then** the display shows "60".
2. **Given** a data set containing 10, 20, and 30, **When** the user requests
   the Average, **Then** the display shows "20".
3. **Given** a data set containing a single data point, 7, **When** the user
   requests the Sum, **Then** the display shows "7", and **when** the user
   requests the Average, **Then** the display shows "7".
4. **Given** an empty data set, **When** the user requests the Sum or the
   Average, **Then** the calculator indicates there is no data to compute
   rather than showing a misleading number such as "0".

---

### User Story 3 - Compute Standard Deviation (Priority: P2)

A user who has entered a sequence of numbers into Statistics Mode requests
the Standard Deviation of the data set and sees the result displayed.

**Why this priority**: Standard deviation is the statistic the user
specifically called out alongside sum and average, but it is more complex
and depends on the data set already existing (User Story 1) — it is ordered
after the simpler aggregate statistics (User Story 2) because it builds on
the same data and is more involved to get right (e.g., behavior with fewer
than two data points).

**Independent Test**: Can be fully tested by adding "2", "4", "4", "4", "5",
"5", "7", "9" to the data set and requesting Standard Deviation — the display
shows the sample standard deviation of that set (2).

**Acceptance Scenarios**:

1. **Given** a data set containing 2, 4, 4, 4, 5, 5, 7, and 9, **When** the
   user requests the Standard Deviation, **Then** the display shows "2".
2. **Given** a data set containing exactly one data point, **When** the user
   requests the Standard Deviation, **Then** the calculator indicates
   standard deviation is undefined for a single data point, rather than
   showing "0" or an arbitrary number.
3. **Given** an empty data set, **When** the user requests the Standard
   Deviation, **Then** the calculator indicates there is no data to compute.

---

### User Story 4 - Manage the data set (Priority: P3)

A user who has entered numbers into Statistics Mode removes an individual
data point they entered by mistake, or clears the entire data set to start
over.

**Why this priority**: This is a convenience refinement — useful for
correcting mistakes without restarting the calculator — but the feature is
already usable without it, since a user could otherwise plan entries
carefully or work around a mistaken entry.

**Independent Test**: Can be fully tested by adding "10", "20", "30" to the
data set, removing the "20" data point, and requesting the Sum — the display
shows "40" (10 + 30).

**Acceptance Scenarios**:

1. **Given** a data set containing 10, 20, and 30, **When** the user removes
   the data point "20", **Then** the data set contains only 10 and 30, and
   the count shown is 2.
2. **Given** a data set containing several data points, **When** the user
   clears the entire data set, **Then** the count shown is 0 and no data
   points remain.
3. **Given** an empty data set, **When** the user clears the data set,
   **Then** nothing changes and no error occurs.

---

### Edge Cases

- Requesting Sum or Average on an empty data set shows an indication that no
  data exists rather than "0".
- Requesting Standard Deviation on an empty data set, or a data set with
  exactly one data point, shows an indication that the statistic is
  undefined rather than "0" or an arbitrary number.
- Adding the same numeric value more than once is allowed — duplicates are
  counted as separate data points (e.g., adding "5" twice yields a data set
  of size 2, not 1).
- Pressing "Add to data set" without having entered any digits since the
  last add (or since the data set was last cleared) has no effect — it does
  not silently add a "0" data point.
- Switching from Statistics Mode back to Standard Mode clears the current
  data set and any in-progress entry, returning to a plain Standard Mode
  state.
- Negative numbers and numbers with a decimal point are valid data points
  and are included in Sum, Average, and Standard Deviation calculations.
- Removing a data point that no longer exists in the data set (e.g., already
  removed) has no effect and does not error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a way to switch the calculator between
  Standard Mode (the existing decimal four-function calculator) and
  Statistics Mode.
- **FR-002**: In Statistics Mode, System MUST let the user enter a number
  using the same digit and decimal-point entry used in Standard Mode,
  including negative numbers.
- **FR-003**: System MUST let the user add the currently entered number to a
  running data set as a discrete data point.
- **FR-004**: System MUST display the current number of data points in the
  data set.
- **FR-005**: System MUST compute and display the Sum of all data points in
  the data set on request.
- **FR-006**: System MUST compute and display the Average (arithmetic mean)
  of all data points in the data set on request.
- **FR-007**: System MUST compute and display the Standard Deviation of all
  data points in the data set on request, using the sample standard
  deviation (dividing by the count of data points minus one).
- **FR-008**: When the data set is empty, System MUST indicate that Sum,
  Average, and Standard Deviation cannot be computed, rather than displaying
  a numeric result.
- **FR-009**: When the data set contains exactly one data point, System MUST
  indicate that Standard Deviation is undefined, rather than displaying a
  numeric result; Sum and Average remain computable and equal that single
  value.
- **FR-010**: System MUST let the user remove an individual data point from
  the data set.
- **FR-011**: System MUST let the user clear the entire data set in a single
  action.
- **FR-012**: Duplicate numeric values MUST be tracked as separate data
  points; the data set is a sequence (multiset), not a set of unique values.
- **FR-013**: Switching from Statistics Mode to Standard Mode MUST clear the
  current data set and any in-progress entry.
- **FR-014**: Standard Mode's existing behavior (the four operations,
  left-to-right chaining, divide-by-zero error and input lock, decimal-point
  entry) MUST remain unchanged by the addition of Statistics Mode.

### Key Entities

- **Statistics Data Set**: The ordered collection of numeric data points the
  user has added while in Statistics Mode. Supports adding a data point,
  removing an individual data point, and clearing entirely.
- **Data Point**: A single numeric value (integer or decimal, positive or
  negative) added to the Statistics Data Set.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch into Statistics Mode and add a number to the
  data set in a single interaction, with no page reload.
- **SC-002**: Sum and Average computed from a data set of any size always
  match the mathematically correct value for the numbers currently in the
  data set, 100% of the time across representative test cases.
- **SC-003**: Standard Deviation computed from a data set of two or more
  values always matches the mathematically correct sample standard
  deviation for the numbers currently in the data set, 100% of the time
  across representative test cases.
- **SC-004**: Attempting to compute any statistic on an empty data set, or
  Standard Deviation on a single-value data set, never shows a misleading
  numeric result.
- **SC-005**: Removing a data point or clearing the data set always updates
  subsequently computed statistics to reflect only the remaining data
  points, with no stale results shown.
- **SC-006**: All Standard Mode behavior present before this feature (the
  four operations, left-to-right chaining, divide-by-zero handling)
  continues to work exactly as before, with zero regressions.

## Assumptions

- Standard deviation uses the sample standard deviation formula (dividing
  by n−1), matching the "s" statistic in the classic Windows Calculator
  Statistics Box, rather than the population standard deviation (dividing
  by n).
- Statistics Mode is integer- and decimal-capable (unlike Programmer Mode):
  the decimal-point key works normally, since statistical data sets
  commonly include non-integer values.
- The Statistics Data Set is scoped to a single Statistics Mode session and
  is cleared when switching back to Standard Mode, matching the precedent
  set by Programmer Mode's mode-switch behavior.
- Bitwise/programmer-specific concerns are out of scope; this feature is
  independent of Programmer Mode (001).
- Additional statistics offered by some calculators (e.g., population
  standard deviation, variance, min/max/median) are out of scope — the
  request asks specifically for sum, average, and standard deviation.
- Numeric range and precision follow the same underlying number handling as
  Standard Mode today; no additional overflow handling beyond what Standard
  Mode already has is introduced.
