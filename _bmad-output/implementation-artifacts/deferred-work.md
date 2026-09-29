- source_spec: `_bmad-output/implementation-artifacts/spec-programmer-mode.md`
  summary: No DOM test harness exists for `calculator.js`'s render/wiring logic (mode/base visibility, digit enable-disable, active-base highlight, decimal-button disabling).
  evidence: Confirmed the repo has no jsdom/playwright/puppeteer dependency anywhere and `test/logic.test.js` only imports `calculator-logic.js`, never `document`. Pre-existing to the whole file (the original digit/decimal/operator/equals/clear wiring was equally untested before Programmer Mode), so out of scope for this story; adding a DOM test harness is a larger, separate effort.

- source_spec: `_bmad-output/implementation-artifacts/spec-statistics-mode.md`
  summary: No automated test coverage for calculator.js's Statistics Mode DOM wiring (toggle, Add/Sum/Avg/Std Dev/Clear Data buttons, panel visibility, data-list rendering).
  evidence: Same pre-existing, already-logged gap as Programmer Mode's DOM/render logic — repo has no jsdom/puppeteer/playwright dependency and test/logic.test.js only imports calculator-logic.js. Extended to new code via the same established pattern, not a new regression; compensated with a manual browser check (see the spec's Verification section).

- source_spec: `_bmad-output/implementation-artifacts/spec-statistics-mode.md`
  summary: CalculatorEngine never sets `error = true` on a non-finite (overflow) computation result — formatNumber renders "Error" text but the engine stays unblocked, allowing a corrupted follow-on computation.
  evidence: Confirmed in sum()/average()/standardDeviation() (new) and equals()/setOperator() (pre-existing, unchanged) alike — only divide-by-zero explicitly sets `this.error`. Pre-existing to the whole engine, not introduced by this diff; fixing it consistently across all arithmetic paths is a larger, separate effort.
