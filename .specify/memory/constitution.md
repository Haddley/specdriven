<!--
Sync Impact Report
==================
Version change: none (template placeholder) → 1.0.0
Modified principles: n/a (initial ratification)
Added sections:
  - Core Principles: I. Separation of Concerns (Logic/DOM Split)
  - Core Principles: II. Test-First for Calculation Logic
  - Core Principles: III. No Build Step
  - Core Principles: IV. Baseline Fidelity for Cross-Tool Comparison
  - Core Principles: V. Simplicity & Minimalism (YAGNI)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md — ⚠ pending manual check (not modified by this command)
  - .specify/templates/spec-template.md — ⚠ pending manual check (not modified by this command)
  - .specify/templates/tasks-template.md — ⚠ pending manual check (not modified by this command)
Follow-up TODOs: none
-->

# specdriven Constitution

## Core Principles

### I. Separation of Concerns (Logic/DOM Split)
Pure calculation logic MUST live in `calculator-logic.js` with no DOM access.
`calculator.js` MUST be limited to DOM wiring — reading button clicks, calling
into the logic module, and re-rendering the display. Rationale: this is what
lets the calculation engine be unit-tested directly, without a browser or DOM
shims, and keeps behavior changes isolated from presentation changes.

### II. Test-First for Calculation Logic
Any change to calculation behavior MUST be covered by tests in
`test/logic.test.js`, written or updated before/alongside the implementation
change, and MUST pass via `npm test` (Node's built-in test runner) before the
change is considered complete. Rationale: the calculation engine is the part
of the app most likely to have subtle bugs (chaining, edge cases like
divide-by-zero), and it is the one part cheap to test in isolation — there is
no excuse to skip it.

### III. No Build Step
The project MUST remain runnable by opening `index.html` directly in a
browser, or by serving the directory as static files (e.g. `npx serve .`).
No bundlers, transpilers, frameworks, or dependencies that require a build
step may be introduced. Rationale: the project is plain HTML/CSS/JS by
design; a build step would undermine the simplicity that makes it useful as
a comparison baseline.

### IV. Baseline Fidelity for Cross-Tool Comparison
This repository is a fixed starting point used to trial spec-driven AI
development tools (OpenSpec, Spec-Kit, BMAD) side by side, each beginning
from the same baseline commit and given the same feature requests. Changes
MUST NOT quietly alter the comparison premise. Documented design decisions —
operators chaining left-to-right as entered (not by precedence), and
divide-by-zero showing `Cannot divide by zero` and blocking input until `C`
is pressed — are authoritative and MUST NOT be changed except by an explicit
feature request that says so. Rationale: the value of this repo is
comparability; silent behavior drift breaks that.

### V. Simplicity & Minimalism (YAGNI)
Keep the calculator flat and monochrome. Do not add scientific-calculator
features, themes, frameworks, or abstractions beyond what a given feature
request requires. Three similar lines of code are better than a premature
abstraction. Rationale: this is a small, deliberately constrained app; scope
creep defeats its purpose as a lightweight baseline.

## Technology Constraints

Plain HTML, CSS, and JavaScript only (ES modules, per `package.json`'s
`"type": "module"`). No external runtime dependencies. Tests run via Node's
built-in test runner (`node --test`, exposed as `npm test`) — no third-party
test framework. No CSS or JS frameworks/libraries.

## Development Workflow

Feature work follows the Spec Kit workflow appropriate to the change's size
(specify → clarify → plan → tasks → implement). Before a change is considered
done: `npm test` MUST pass, `calculator-logic.js` MUST remain DOM-free, and
any documented design decision it touches MUST be updated in `README.md` if
changed under Principle IV.

## Governance

This constitution supersedes ad hoc practices for this repository. Amendments
require: (1) a documented rationale for the change, (2) an updated Sync
Impact Report at the top of this file, and (3) a version bump per semantic
versioning — MAJOR for backward-incompatible governance/principle removals or
redefinitions, MINOR for new principles or materially expanded guidance,
PATCH for clarifications and wording fixes. All feature work MUST be checked
against these principles before being considered complete; any deviation
(e.g. adding a dependency, breaking the logic/DOM split) MUST be justified in
the relevant spec or plan under a Complexity Tracking section, or rejected.

**Version**: 1.0.0 | **Ratified**: 2026-09-29 | **Last Amended**: 2026-09-29
