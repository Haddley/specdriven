<!-- bmad:context -->
<!-- Verified 2026-09-29 against 22de8bd. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## specdriven

A plain HTML/CSS/JS four-function calculator, a flat monochrome homage to the Windows 1.0 Calculator. Fixed baseline used to trial three spec-driven AI dev tools (OpenSpec, Spec-Kit, BMAD), each starting from the same commit.

## Where things are

- `index.html` / `style.css` — UI; `calculator.js` — DOM wiring; `calculator-logic.js` — pure calculation engine (no DOM access); `test/logic.test.js` — tests.

## Running and verifying

- No build step — open `index.html` directly, or serve with `npx serve .`.
- `npm test` (`node --test`) exercises `calculator-logic.js` only; `calculator.js` has no test coverage.

## Conventions that differ from defaults

- Operators chain left-to-right as entered (`5 + 3 × 2` = `16`), not by operator precedence.
- Divide by zero is intentional behavior, not a bug: display shows `Cannot divide by zero` and blocks input until `C` (Clear).
- Keep `calculator-logic.js` free of DOM access — it's the directly-tested engine. DOM wiring belongs in `calculator.js`.

<!-- /bmad:context -->
