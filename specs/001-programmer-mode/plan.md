# Implementation Plan: Programmer Mode

**Branch**: `001-programmer-mode` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-programmer-mode/spec.md`

## Summary

Add a Programmer Mode to the existing four-function calculator: a mode toggle
plus a base selector (Decimal, Hexadecimal, Octal, Binary) that restricts
digit entry to valid digits for the selected base, performs the same four
operations (+, −, ×, ÷) with the same left-to-right chaining and
divide-by-zero behavior as Standard Mode, and converts/redisplays the current
value whenever the base changes. The technical approach extends the existing
`CalculatorEngine` class in `calculator-logic.js` with `mode`/`base` state and
base-aware digit validation, parsing, and formatting — reusing JavaScript's
native `Number.prototype.toString(radix)` (which already produces
sign-magnitude output for negatives, e.g. `(-5).toString(2) === "-101"`) and
`parseInt(str, radix)` rather than hand-rolling base conversion. No new files,
dependencies, or build tooling are introduced.

## Technical Context

**Language/Version**: JavaScript (ES modules, per `package.json`
`"type": "module"`), run directly in-browser with no transpilation; Node.js
(current LTS) for the test runner.

**Primary Dependencies**: None — vanilla HTML/CSS/JS, no frameworks or
libraries, matching the existing app.

**Storage**: N/A — all state is in-memory in `CalculatorEngine`, same as
today.

**Testing**: Node's built-in test runner (`node --test`, exposed as
`npm test`), extending `test/logic.test.js`.

**Target Platform**: Web browser, served as static files (or opened directly
as `index.html`) — no server-side component.

**Project Type**: Single flat static web app (existing repo root layout:
`index.html`, `calculator.js`, `calculator-logic.js`, `style.css`, `test/`) —
not a multi-package or frontend/backend split.

**Performance Goals**: N/A — synchronous, in-memory arithmetic on
button-press events; no measurable performance constraints beyond normal UI
responsiveness.

**Constraints**: No build step (Constitution III); pure logic must stay
DOM-free in `calculator-logic.js` (Constitution I); Programmer Mode is
integer-only (FR-007); Standard Mode's existing behavior must remain
byte-for-byte unchanged (FR-012, Constitution IV); no bitwise/shift
operations or word-size selection (spec Assumptions, Constitution V).

**Scale/Scope**: One feature addition to a 3-file, ~150-line app: extend
`CalculatorEngine` with mode/base state and ~4 new methods, add a mode toggle
+ base selector + hex digit keys (A–F) to `index.html`/`calculator.js`, and
add corresponding cases to `test/logic.test.js`. No new modules.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Separation of Concerns | Base/mode state, digit validation, parsing, and formatting all live in `CalculatorEngine` (`calculator-logic.js`); `calculator.js` only wires new buttons (mode toggle, base radios, A–F keys) to engine calls and re-renders | PASS |
| II. Test-First for Calculation Logic | `test/logic.test.js` gets new cases for base entry validation, per-base arithmetic, base-switch conversion, and negative-result formatting, added alongside the engine changes, run via `npm test` | PASS |
| III. No Build Step | No new dependency, bundler, or transpiler; native `parseInt`/`toString(radix)` used instead of a conversion library | PASS |
| IV. Baseline Fidelity | Left-to-right chaining and the "Cannot divide by zero" + input-lock behavior are reused unchanged via the existing `_compute`/`equals`/`setOperator` flow (FR-004, FR-009, FR-012); nothing about Standard Mode's decimal behavior changes | PASS |
| V. Simplicity & Minimalism | No bitwise/shift ops, no word-size (byte/word/dword/qword) selector, no scientific features — only base switching and the existing four operations, per spec Assumptions | PASS |

No violations. Complexity Tracking section is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-programmer-mode/
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
index.html              # Add mode toggle, base selector, hex digit keys (A–F)
calculator.js           # Wire new controls to CalculatorEngine; re-render on mode/base change
calculator-logic.js     # Extend CalculatorEngine: mode/base state, base-aware
                         #   digit validation, parsing (parseInt), and
                         #   formatting (toString(radix))
style.css               # Minimal additions for the new controls, matching the
                         #   existing flat/monochrome look
test/
└── logic.test.js        # New cases: base digit validation, per-base
                          #   arithmetic, base-switch conversion, negative
                          #   result formatting, mode-switch reset
```

**Structure Decision**: This repo is a single flat static app with no
sub-packages (per Constitution III/V) — there is no `src/`, `frontend/`, or
`backend/` split to choose between. The feature extends the four existing
top-level files in place and adds test cases to the existing test file; no
new files are created.

## Complexity Tracking

> No entries — Constitution Check reported no violations.
