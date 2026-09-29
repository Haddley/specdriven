# Implementation Plan: Statistics Mode

**Branch**: `002-statistics-mode` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-statistics-mode/spec.md`

## Summary

Add a Statistics Mode to the existing four-function calculator: a third mode
alongside Standard and Programmer that accumulates entered numbers (including
negatives and decimals) into an in-memory data set, and computes Sum,
Average, and sample Standard Deviation on request, with explicit "no data"
and "undefined" indicators for empty/single-point data sets rather than
misleading numeric results. Individual data points can be removed and the
whole data set cleared. The technical approach extends the existing
`CalculatorEngine` class in `calculator-logic.js` with a `dataSet` array and a
`dataEntryStarted` flag, adding methods for accumulation
(`addDataPoint`/`removeDataPoint`/`clearDataSet`), sign entry (`toggleSign`,
since Standard Mode has no existing negative-entry key), and computation
(`requestSum`/`requestAverage`/`requestStdDev`), following the same
extend-the-existing-engine pattern used for Programmer Mode (001) rather than
a parallel engine. No new files, dependencies, or build tooling are
introduced.

**⚠ Spec consistency issue found during planning**: User Story 3's Acceptance
Scenario 1 gives the worked example `{2, 4, 4, 4, 5, 5, 7, 9}` and expects the
Standard Deviation display to show `"2"`. That value is the *population*
standard deviation of that set; FR-007 and the Assumptions section both
explicitly require the *sample* standard deviation (dividing by n−1), whose
correct value for this set is ≈2.138, not 2. This plan implements FR-007 as
written (sample stddev, n−1) since it is the more specific, doubly-stated
requirement — see [research.md](./research.md) for detail. **The spec's
worked example should be corrected before `/speckit-tasks` turns it into a
test**, or the generated test will assert a mathematically wrong value.

## Technical Context

**Language/Version**: JavaScript (ES modules, per `package.json`
`"type": "module"`), run directly in-browser with no transpilation; Node.js
(current LTS) for the test runner.

**Primary Dependencies**: None — vanilla HTML/CSS/JS, no frameworks or
libraries, matching the existing app.

**Storage**: N/A — all state, including the Statistics Data Set, is
in-memory in `CalculatorEngine`, same as today.

**Testing**: Node's built-in test runner (`node --test`, exposed as
`npm test`), extending `test/logic.test.js`.

**Target Platform**: Web browser, served as static files (or opened directly
as `index.html`) — no server-side component.

**Project Type**: Single flat static web app (existing repo root layout:
`index.html`, `calculator.js`, `calculator-logic.js`, `style.css`, `test/`) —
not a multi-package or frontend/backend split.

**Performance Goals**: N/A — synchronous, in-memory arithmetic (sum, mean,
variance over an array built one digit-sequence at a time) on button-press
events; no measurable performance constraints beyond normal UI
responsiveness.

**Constraints**: No build step (Constitution III); pure logic must stay
DOM-free in `calculator-logic.js` (Constitution I); Standard Mode's existing
behavior must remain byte-for-byte unchanged (FR-014, Constitution IV);
Statistics Mode is decimal- and negative-capable per FR-002 (unlike
integer-only Programmer Mode); Standard Deviation MUST use the sample formula
(n−1) per FR-007 (see the spec consistency issue flagged above and detailed
in research.md).

**Scale/Scope**: One feature addition to a 3-file, ~160-line app: extend
`CalculatorEngine` with `dataSet`/`dataEntryStarted` state and 7 new methods
(`addDataPoint`, `removeDataPoint`, `clearDataSet`, `requestSum`,
`requestAverage`, `requestStdDev`, `toggleSign`), add a third mode button plus
a Statistics control panel (sign toggle, add/sum/average/stddev/clear-data
buttons, a rendered data-point list with per-item remove) to
`index.html`/`calculator.js`, and add corresponding cases to
`test/logic.test.js`. No new modules.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Separation of Concerns | Data-set storage, sign toggling, add/remove/clear, and sum/average/stddev computation all live in `CalculatorEngine` (`calculator-logic.js`); `calculator.js` only wires new buttons (mode toggle, ±, add/sum/average/stddev/clear-data, per-item remove) to engine calls and re-renders (including the data-point list and count) | PASS |
| II. Test-First for Calculation Logic | `test/logic.test.js` gets new cases for data-set accumulation, sum/average/stddev correctness, empty/single-point indicators, remove/clear, sign toggle, and mode-switch reset, added alongside the engine changes, run via `npm test` | PASS |
| III. No Build Step | No new dependency, bundler, or transpiler; sum/mean/variance computed with plain array `reduce`/arithmetic, no statistics library | PASS |
| IV. Baseline Fidelity | `setOperator`/`equals` gain a `mode === "statistics"` no-op guard so Standard Mode's chaining and divide-by-zero flow (`_compute`) are untouched; nothing about Standard Mode's decimal behavior changes | PASS |
| V. Simplicity & Minimalism | No statistics beyond sum/average/stddev (no variance, min/max, median, population stddev — per spec Assumptions); reuses `formatNumber` and the existing early-return guard style, and reuses the "mode switch always resets" precedent from 001-programmer-mode rather than inventing a new pattern | PASS |

No violations. Complexity Tracking section is not needed. (The spec
consistency issue above is a content defect in spec.md, not a constitutional
violation — it is called out separately so it isn't lost before `/speckit-tasks`.)

## Project Structure

### Documentation (this feature)

```text
specs/002-statistics-mode/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── calculator-engine.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html              # Add third mode button (Statistics); add a
                         #   stats-panel (± toggle, add/sum/average/stddev/
                         #   clear-data buttons, data-point list container),
                         #   hidden outside Statistics Mode, alongside the
                         #   existing base-selector/hex-keys pattern
calculator.js           # Wire new stats-panel controls to CalculatorEngine;
                         #   render dataSet as a list with per-item remove
                         #   buttons and a count line; re-render on every call
calculator-logic.js     # Extend CalculatorEngine: dataSet/dataEntryStarted
                         #   state; addDataPoint/removeDataPoint/clearDataSet;
                         #   toggleSign; requestSum/requestAverage/
                         #   requestStdDev; mode === "statistics" no-op guards
                         #   on setOperator/equals; dataSet reset in setMode
style.css                # Minimal additions for the stats panel and
                         #   data-point list, matching the existing
                         #   flat/monochrome look
test/
└── logic.test.js        # New cases: data-set accumulation, sign toggle,
                          #   sum/average/stddev correctness, empty/single-
                          #   point indicators, remove/clear, mode-switch
                          #   reset, Standard Mode regression
```

**Structure Decision**: This repo is a single flat static app with no
sub-packages (per Constitution III/V) — there is no `src/`, `frontend/`, or
`backend/` split to choose between. The feature extends the four existing
top-level files in place and adds test cases to the existing test file; no
new files are created, matching the precedent set by 001-programmer-mode.

## Complexity Tracking

> No entries — Constitution Check reported no violations.
