---

description: "Task list template for feature implementation"
---

# Tasks: Programmer Mode

**Input**: Design documents from `/specs/001-programmer-mode/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/calculator-engine.md, quickstart.md

**Tests**: Included — Constitution Principle II ("Test-First for Calculation Logic") requires `test/logic.test.js` cases alongside every `CalculatorEngine` change in this feature.

**Organization**: Tasks are grouped by user story (spec.md priorities P1/P2/P3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
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

- [ ] T001 Run `npm test` and confirm the existing Standard Mode suite in test/logic.test.js passes, establishing the pre-change baseline for FR-012/SC-005

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Engine state and helpers every user story depends on — mode/base fields, base-aware validation/formatting primitives, and the mode toggle (without which Programmer Mode cannot be entered at all)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Add `mode` (`"standard"` \| `"programmer"`, default `"standard"`) and `base` (`10` \| `16` \| `8` \| `2`, default `10`) fields to `CalculatorEngine`, initialized in the constructor in calculator-logic.js; not reset by `reset()` (per data-model.md)
- [ ] T003 Add an `isValidDigit(digit, base)` helper function in calculator-logic.js implementing the per-base validity table from data-model.md: Binary (2) → `0-1`; Octal (8) → `0-7`; Decimal (10) → `0-9`; Hexadecimal (16) → `0-9` and `A-F` (case-insensitive on input)
- [ ] T004 Add a `formatInBase(value, base)` helper function in calculator-logic.js: `return value.toString(base).toUpperCase();` (per contracts/calculator-engine.md Formatting contract)
- [ ] T005 Implement `setMode(newMode)` on `CalculatorEngine` in calculator-logic.js: no-op if `newMode === this.mode`; otherwise set `this.mode = newMode`, set `this.base = 10`, and call `this.reset()` (satisfies FR-008; depends on T002)
- [ ] T006 Add tests in test/logic.test.js for `setMode`: switching Programmer → Standard clears the current entry and any in-progress calculation (FR-008); setting mode to its current value is a no-op and does not reset (depends on T005)
- [ ] T007 [P] Add a mode toggle control (Standard/Programmer) to index.html
- [ ] T008 Wire the mode toggle in calculator.js to call `engine.setMode(...)` on change and re-render `engine.display` (depends on T005, T007)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Enter and view numbers in another base (Priority: P1) 🎯 MVP

**Goal**: Switch into Programmer Mode, select a base, and enter only digits valid for that base

**Independent Test**: Switch to Programmer Mode, select Binary, enter "1011" — the display shows "1011"; pressing "9" (invalid in Binary) has no effect

### Implementation for User Story 1

- [ ] T009 [P] [US1] Add a base selector control (Decimal, Hexadecimal, Octal, Binary) to index.html, shown only in Programmer Mode
- [ ] T010 [P] [US1] Add hexadecimal digit keys A–F to index.html, shown only when Hexadecimal is selected
- [ ] T011 [US1] Implement `setBase(newBase)` on `CalculatorEngine` in calculator-logic.js: no-op if `error` is true, no-op if `newBase === this.base`; otherwise set `this.base = newBase` (base selection only — value conversion is added in User Story 3); depends on T002
- [ ] T012 [US1] Extend `inputDigit(digit)` in calculator-logic.js: no-op if `this.mode === "programmer"` and `digit` fails `isValidDigit(digit, this.base)` (FR-003); when valid in Hexadecimal, normalize the digit to uppercase before appending/replacing in `display`; depends on T003
- [ ] T013 [US1] Extend `inputDecimal()` in calculator-logic.js: no-op unconditionally when `this.mode === "programmer"`, regardless of base (FR-007); unchanged in Standard Mode
- [ ] T014 [US1] Wire the base selector and A–F digit buttons in calculator.js to `engine.setBase(...)` / `engine.inputDigit(...)` respectively, re-rendering after each call the same way existing digit buttons do; depends on T009, T010, T011, T012
- [ ] T015 [US1] Add tests in test/logic.test.js: valid digit entry displays correctly in each base (Binary "1011", Hexadecimal "2AF" via "2","A","F"); invalid digit presses leave the display unchanged ("9" in Binary, "8" in Octal, a letter in Decimal) (FR-003/SC-003); the decimal-point key is a no-op in Programmer Mode in every base (FR-007); depends on T011, T012, T013

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Calculate in the selected base (Priority: P2)

**Goal**: Perform +, −, ×, ÷ on values entered in a non-decimal base and see the result in that same base

**Independent Test**: Programmer Mode, Binary, enter "101" (5), press "+", enter "11" (3), press "=" — the display shows "1000" (8 in binary)

### Implementation for User Story 2

- [ ] T016 [US2] Extend `setOperator(nextOperator)` in calculator-logic.js: when `this.mode === "programmer"`, parse `this.display` with `parseInt(this.display, this.base)` instead of `parseFloat`, and format any computed intermediate result with `formatInBase(result, this.base)` instead of `formatNumber` (FR-004/FR-005); depends on T004
- [ ] T017 [US2] Extend `equals()` in calculator-logic.js with the same base-aware parse (`parseInt`) and format (`formatInBase`) change as T016, leaving `_compute`'s divide-by-zero handling (`"Cannot divide by zero"` message, `error = true` lock) untouched (FR-009); depends on T004
- [ ] T018 [US2] Add tests in test/logic.test.js: Hexadecimal "F" + "1" = "10"; Octal "7" + "1" = "10"; Binary "11" × "10" = "110" (FR-004/FR-005/SC-002); divide-by-zero in Programmer Mode shows "Cannot divide by zero" and blocks further digit input until `clear()`, identical to Standard Mode (FR-009); a negative result (e.g. "3" − "5" in Decimal Programmer Mode) displays as a leading "-" followed by the magnitude in the selected base (FR-010); depends on T016, T017

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Switch bases mid-session without losing the value (Priority: P3)

**Goal**: Changing the selected base converts and redisplays the current value in the new base without re-entry

**Independent Test**: Enter "255" in Decimal, switch the base to Hexadecimal — the display updates to "FF" without further input

### Implementation for User Story 3

- [ ] T019 [US3] Extend `setBase(newBase)` in calculator-logic.js (built in T011) to convert the current value: parse `this.display` with the *current* `this.base` via `parseInt`, reassign `this.base = newBase`, then reformat `this.display` with `formatInBase` in the new base — without touching `previousValue`, `operator`, or `waitingForOperand` (FR-006); depends on T011, T004
- [ ] T020 [US3] Add tests in test/logic.test.js: Decimal "255" → switch to Hexadecimal → display "FF"; Binary "1010" → switch to Octal → display "12" (FR-006/SC-004); with an operand entered and an operator pending, switching base converts the already-entered operand and redisplays it in the new base while the pending operator is preserved (US3 Acceptance Scenario 3); switching base while `error === true` is a no-op until `clear()` is pressed (edge case); depends on T019

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual finish and final regression/manual validation across all stories

- [ ] T021 [P] Add minimal styling for the mode toggle, base selector, and A–F keys in style.css, matching the existing flat/monochrome look
- [ ] T022 Run the full `npm test` suite and confirm all pre-existing Standard Mode tests in test/logic.test.js still pass unchanged, alongside all new Programmer Mode tests (FR-012/SC-005)
- [ ] T023 Manually walk through quickstart.md sections 1–4 in a browser (US1, US2, US3, and the Standard Mode regression check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion; builds on the `base`/`mode` fields and `formatInBase` from Foundational — independently testable without US1's UI, but shares `calculator-logic.js` edits with it
- **User Story 3 (Phase 5)**: Depends on Foundational completion and on `setBase` existing from T011 (User Story 1) — extends it rather than duplicating it
- **Polish (Phase 6)**: Depends on all three user stories being complete

### Within Each Phase

- Tasks touching the same file (calculator-logic.js in particular) are sequential — no [P] marker
- Tests for a phase follow the implementation they exercise, matching Constitution Principle II (write and run alongside the engine change, confirm they pass before moving on)
- Implementation before its corresponding test task within the same phase

### Parallel Opportunities

- T007 (mode toggle markup in index.html) can run in parallel with T002–T006 (all in calculator-logic.js)
- T009 and T010 (base selector and A–F keys, both in index.html) can run in parallel with each other and with T011–T013 (calculator-logic.js)
- T021 (style.css) can run in parallel with T022/T023

---

## Parallel Example: Foundational + User Story 1

```bash
# During Foundational, markup and engine work can proceed together:
Task: "Add a mode toggle control (Standard/Programmer) to index.html"          # T007
Task: "Add mode/base fields to CalculatorEngine in calculator-logic.js"        # T002

# During User Story 1, the two new index.html controls are independent of each other:
Task: "Add a base selector control to index.html"                             # T009
Task: "Add hexadecimal digit keys A–F to index.html"                          # T010
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (mode/base state, helpers, mode toggle) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (base selection + restricted entry)
4. **STOP and VALIDATE**: Run test/logic.test.js and manually check quickstart.md section 1
5. Demo if ready — viewing numbers in another base is already useful on its own

### Incremental Delivery

1. Setup + Foundational → mode toggle works, Programmer Mode can be entered
2. Add User Story 1 → base selection and restricted digit entry → validate → demo
3. Add User Story 2 → arithmetic in the selected base → validate → demo
4. Add User Story 3 → base switching preserves the value → validate → demo
5. Polish → styling, full regression run, full quickstart walkthrough

### Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- `setBase` is introduced in T011 (US1, base-selection only) and extended in T019 (US3, value conversion) rather than duplicated — US1 does not require conversion since the display is always "0" at that point, but the same method is reused and made complete by US3
- Verify tests pass after each implementation task before moving to the next
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
