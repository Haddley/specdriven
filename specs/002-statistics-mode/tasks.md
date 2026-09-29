---

description: "Task list template for feature implementation"
---

# Tasks: Statistics Mode

**Input**: Design documents from `/specs/002-statistics-mode/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/calculator-engine.md, quickstart.md

**Tests**: Included — Constitution Principle II ("Test-First for Calculation Logic") requires `test/logic.test.js` cases alongside every `CalculatorEngine` change in this feature.

**Organization**: Tasks are grouped by user story (spec.md priorities P1/P1/P2/P3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths are exact and relative to the repository root

## Path Conventions

Single flat static app at the repository root (no `src/`, no sub-packages, per plan.md Structure Decision):

- `calculator-logic.js` — pure `CalculatorEngine` logic (DOM-free, Constitution I)
- `calculator.js` — DOM wiring only
- `index.html` — markup/controls
- `style.css` — styling
- `test/logic.test.js` — engine tests (Node's built-in test runner, `npm test`)

---

## Phase 1: Setup

**Purpose**: Establish a known-good baseline before touching the engine

- [x] T001 Run `npm test` and confirm the existing Standard Mode and Programmer Mode suite in test/logic.test.js passes, establishing the pre-change baseline for FR-014/SC-006

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Engine state and helpers every user story depends on — the `dataSet`/`dataEntryStarted` fields, mode-change reset, entry tracking, arithmetic no-op guards, and the Statistics mode toggle (without which Statistics Mode cannot be entered at all)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add `dataSet` (`number[]`, defaults to `[]`) and `dataEntryStarted` (`boolean`, defaults to `false`) fields to `CalculatorEngine`, initialized in the constructor in calculator-logic.js (per data-model.md); not reset by `reset()`/`clear()` — mode/data-set changes are driven by `setMode`, not `clear()` (per contracts/calculator-engine.md)
- [X] T003 Extend `setMode(newMode)` in calculator-logic.js: on an actual mode change (unchanged no-op guard when `newMode === this.mode`), additionally set `this.dataSet = []` and `this.dataEntryStarted = false` alongside the existing `this.base = 10` and `reset()` call — applied symmetrically to every mode transition (Standard↔Programmer↔Statistics, in any direction), satisfying FR-013 (Statistics→Standard) per data-model.md/research.md; depends on T002
- [X] T004 Extend `inputDigit(digit)` in calculator-logic.js: after a successful digit entry while `this.mode === "statistics"`, set `this.dataEntryStarted = true`, alongside the unchanged `error` and Programmer Mode digit-validity guards (per contracts/calculator-engine.md); depends on T002
- [X] T005 Extend `inputDecimal()` in calculator-logic.js: after a successful decimal-point entry while `this.mode === "statistics"`, set `this.dataEntryStarted = true`; unchanged `error` guard and no-op-in-Programmer-Mode behavior otherwise (Statistics Mode is decimal-capable per FR-002) (per contracts/calculator-engine.md); depends on T002
- [X] T006 Extend `setOperator(nextOperator)` and `equals()` in calculator-logic.js: add `if (this.mode === "statistics") return;` as a new guard on each, alongside the existing `error` guard — Statistics Mode has no arithmetic-chaining use for these (per contracts/calculator-engine.md, research.md)
- [X] T007 [P] Add a "Statistics" mode button to the `.mode-toggle` group in index.html, alongside the existing Standard/Programmer buttons
- [X] T008 [P] Add a hidden `stats-panel` container to index.html: a ± sign-toggle button, Add/Sum/Average/StdDev/"Clear data" buttons, a data-point list container, and a count line — matching the existing hidden `base-selector`/`hex-keys` pattern
- [X] T009 Wire the Statistics mode button and stats-panel visibility in calculator.js: call `engine.setMode("statistics")` on click; extend `render()` to show/hide `stats-panel` based on `engine.mode === "statistics"`, matching the existing `base-selector`/`hex-keys` hidden-toggle pattern; depends on T007, T008
- [X] T010 Add tests in test/logic.test.js for the foundational mode/state wiring: switching into Statistics Mode from Standard or from Programmer resets `dataSet` to `[]` and `dataEntryStarted` to `false`; switching from Statistics Mode back to Standard clears the data set and any in-progress entry (FR-013); `setOperator`/`equals` are no-ops while `mode === "statistics"`; setting mode to its current value (`"statistics"` → `"statistics"`) remains a no-op and does not reset; depends on T003, T006

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Build a data set of numbers (Priority: P1) 🎯 MVP

**Goal**: Switch into Statistics Mode, enter numbers (including negatives and decimals), add each to a running data set, and see the count of collected data points

**Independent Test**: Switch to Statistics Mode, enter "10", add it, enter "20", add it, enter "30", add it — the data set shows 3 collected data points

### Implementation for User Story 1

- [X] T011 [US1] Implement `toggleSign()` on `CalculatorEngine` in calculator-logic.js: no-op if `error` is true; no-op if `mode !== "statistics"`; no-op if `display === "0"` (nothing entered yet to negate); otherwise prepend `-` to `display` if not already negative, or strip a leading `-` if already negative; does not set `dataEntryStarted` itself (per contracts/calculator-engine.md, satisfies FR-002's negative-entry requirement); depends on T002
- [X] T012 [US1] Implement `addDataPoint()` on `CalculatorEngine` in calculator-logic.js: no-op if `error` is true; no-op if `mode !== "statistics"`; no-op if `dataEntryStarted` is `false` (satisfies the edge case "pressing Add to data set without having entered any digits since the last add... has no effect — it does not silently add a '0' data point"); otherwise parse `display` with `parseFloat` and append the result to `dataSet`, reset `display` to `"0"`, set `waitingForOperand = true`, and set `dataEntryStarted = false` (FR-003); depends on T002, T004, T005
- [X] T013 [US1] Wire the ± and "Add" buttons in calculator.js to `engine.toggleSign()`/`engine.addDataPoint()`, and render the current data-point count (`dataSet.length`, FR-004) in the stats-panel count line, re-rendering after each call; depends on T008, T009, T011, T012
- [X] T014 [US1] Add tests in test/logic.test.js: switching to Statistics Mode offers number entry (data set starts empty, count 0); entering "10" and adding it yields a data set of one point with count 1 (US1 AC2); adding "20" then "30" grows the count to 2 then 3 (US1 AC3); a negative number (via `toggleSign`) and a number with a decimal point are both accepted into the data set the same as a positive whole number (US1 AC4/FR-002); pressing Add with no digits entered since the last add is a no-op and does not add a "0" data point (edge case); adding the same numeric value twice (e.g. "5" twice) yields a data set of size 2, not 1 — duplicates are tracked as separate data points (FR-012); depends on T011, T012

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Compute Sum and Average (Priority: P1)

**Goal**: Request the Sum and the Average of the current data set and see each result displayed

**Independent Test**: Add "10", "20", "30" to the data set, request Sum — the display shows "60" — and request Average — the display shows "20"

### Implementation for User Story 2

- [X] T015 [US2] Implement `requestSum()` on `CalculatorEngine` in calculator-logic.js: no-op if `mode !== "statistics"`; if `dataSet.length === 0`, set `display = "No data"` (FR-008); otherwise set `display` to the `formatNumber`-formatted result of `dataSet.reduce((a, b) => a + b, 0)` (FR-005); set `waitingForOperand = true` and `dataEntryStarted = false` afterward so the next digit press starts a fresh entry; depends on T002
- [X] T016 [US2] Implement `requestAverage()` on `CalculatorEngine` in calculator-logic.js: no-op if `mode !== "statistics"`; if `dataSet.length === 0`, set `display = "No data"` (FR-008); otherwise set `display` to the `formatNumber`-formatted result of the sum divided by `dataSet.length` (FR-006); set `waitingForOperand = true` and `dataEntryStarted = false` afterward; depends on T002
- [X] T017 [US2] Wire the Sum and Average buttons in calculator.js to `engine.requestSum()`/`engine.requestAverage()`, re-rendering after each call; depends on T008, T009, T015, T016
- [X] T018 [US2] Add tests in test/logic.test.js: a data set of 10, 20, 30 → Sum shows "60" (US2 AC1), Average shows "20" (US2 AC2); a single-point data set of 7 → Sum shows "7" and Average shows "7" (US2 AC3); an empty data set → both Sum and Average show "No data", not a misleading "0" (US2 AC4/FR-008); depends on T015, T016

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Compute Standard Deviation (Priority: P2)

**Goal**: Request the Standard Deviation of the current data set and see the result displayed, with explicit indicators when it is undefined or there is no data

**Independent Test**: Add "2", "4", "4", "4", "5", "5", "7", "9" to the data set and request Standard Deviation — the display shows the sample standard deviation of that set (approximately 2.138090)

### Implementation for User Story 3

- [X] T019 [US3] Implement `requestStdDev()` on `CalculatorEngine` in calculator-logic.js: no-op if `mode !== "statistics"`; if `dataSet.length === 0`, set `display = "No data"` (FR-008); if `dataSet.length === 1`, set `display = "Undefined"` (FR-009 — Sum/Average remain computable for a single point, this special case applies only to Standard Deviation); otherwise set `display` to the `formatNumber`-formatted sample standard deviation `sqrt(Σ(x - mean)² / (n - 1))`, i.e. dividing by the count of data points minus one (FR-007, per the Assumptions section's explicit choice of sample over population standard deviation); set `waitingForOperand = true` and `dataEntryStarted = false` afterward; depends on T002
- [X] T020 [US3] Wire the Standard Deviation button in calculator.js to `engine.requestStdDev()`, re-rendering after the call; depends on T008, T009, T019
- [X] T021 [US3] Add tests in test/logic.test.js: a data set of 2, 4, 4, 4, 5, 5, 7, 9 → Standard Deviation shows the sample-stddev value "2.1380899353" (US3 AC1's corrected expected value; NOT the population value "2" — see research.md's flagged-and-resolved spec inconsistency); a single-point data set → Standard Deviation shows "Undefined", not "0" or an arbitrary number (US3 AC2/FR-009); an empty data set → Standard Deviation shows "No data" (US3 AC3/FR-008); depends on T019

**Checkpoint**: User Stories 1, 2, AND 3 all work independently

---

## Phase 6: User Story 4 - Manage the data set (Priority: P3)

**Goal**: Remove an individual data point entered by mistake, or clear the entire data set to start over

**Independent Test**: Add "10", "20", "30" to the data set, remove the "20" data point, and request the Sum — the display shows "40" (10 + 30)

### Implementation for User Story 4

- [X] T022 [US4] Implement `removeDataPoint(index)` on `CalculatorEngine` in calculator-logic.js: no-op if `mode !== "statistics"`; no-op if `index < 0` or `index >= dataSet.length` (satisfies the edge case "removing a data point that no longer exists... has no effect and does not error"); otherwise remove the element at `index` from `dataSet` — identifies one specific occurrence, so removing one of several equal-valued points leaves the others (FR-010, FR-012); depends on T002
- [X] T023 [US4] Implement `clearDataSet()` on `CalculatorEngine` in calculator-logic.js: no-op if `mode !== "statistics"`; otherwise set `dataSet = []` (FR-011); clearing an already-empty data set is itself a no-op and produces no error (edge case); depends on T002
- [X] T024 [US4] Render `dataSet` as a list in calculator.js with a per-item remove button bound to that item's array index, calling `engine.removeDataPoint(index)` on click; wire a "Clear data" button to `engine.clearDataSet()`; re-render (including the updated list and count) after each call; depends on T008, T009, T022, T023
- [X] T025 [US4] Add tests in test/logic.test.js: a data set of 10, 20, 30, removing the data point at the "20" index leaves {10, 30} with count 2, and a subsequent Sum request shows "40" (US4 AC1); clearing a data set containing several points empties it to count 0 with no data points remaining (US4 AC2); clearing an already-empty data set is a no-op — nothing changes, no error occurs (US4 AC3); removing an out-of-range index (e.g. a point already removed) is a no-op and does not error (edge case); depends on T022, T023

**Checkpoint**: All user stories are independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Visual finish and final regression/manual validation across all stories

- [X] T026 [P] Add minimal styling for the stats-panel (± toggle, add/sum/average/stddev/clear-data buttons, data-point list, count line) in style.css, matching the existing flat/monochrome look
- [x] T027 Run the full `npm test` suite and confirm all pre-existing Standard Mode and Programmer Mode tests in test/logic.test.js still pass unchanged, alongside all new Statistics Mode tests (FR-014/SC-006)
- [x] T028 Manually walk through quickstart.md sections 1–5 in a browser (US1 data-set building, US2 Sum/Average, US3 Standard Deviation, US4 remove/clear, and the mode-switch/Standard Mode/Programmer Mode regression checks)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion — independently testable without US1's UI, but shares `calculator-logic.js` edits with it and reuses the `dataSet` field from Foundational
- **User Story 3 (Phase 5)**: Depends on Foundational completion — independent of US1/US2's methods, but reuses `dataSet`
- **User Story 4 (Phase 6)**: Depends on Foundational completion — independent of US2/US3's computation methods, but its Independent Test presumes data can be added (US1) and Sum requested (US2) to observe the effect
- **Polish (Phase 7)**: Depends on all four user stories being complete

### Within Each Phase

- Tasks touching the same file (calculator-logic.js in particular) are sequential — no [P] marker
- Tests for a phase follow the implementation they exercise, matching Constitution Principle II (write and run alongside the engine change, confirm they pass before moving on)
- Implementation before its corresponding test task within the same phase

### Parallel Opportunities

- T007 and T008 (mode button and stats-panel markup, both in index.html) can run in parallel with each other and with T002–T006 (all in calculator-logic.js)
- T026 (style.css) can run in parallel with T027/T028

---

## Parallel Example: Foundational

```bash
# During Foundational, markup and engine work can proceed together:
Task: "Add a Statistics mode button to index.html"                              # T007
Task: "Add a hidden stats-panel container to index.html"                        # T008
Task: "Add dataSet/dataEntryStarted fields to CalculatorEngine in calculator-logic.js"  # T002
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (dataSet/dataEntryStarted state, mode-change reset, entry tracking, Statistics mode toggle) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (sign entry + add-to-data-set + count)
4. **STOP and VALIDATE**: Run test/logic.test.js and manually check quickstart.md section 1
5. Demo if ready — building a data set is already visible and useful on its own, even before any statistic is computed

### Incremental Delivery

1. Setup + Foundational → Statistics Mode can be entered, dataSet state exists
2. Add User Story 1 → sign toggle + data entry + count → validate → demo (MVP)
3. Add User Story 2 → Sum/Average → validate → demo
4. Add User Story 3 → Standard Deviation → validate → demo
5. Add User Story 4 → remove/clear → validate → demo
6. Polish → styling, full regression run, full quickstart walkthrough

### Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- `requestSum`/`requestAverage`/`requestStdDev` are three separate methods (T015, T016, T019) rather than one parameterized method, matching contracts/calculator-engine.md's contract and keeping each statistic's empty/undefined handling explicit rather than branchy
- Verify tests pass after each implementation task before moving to the next
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
