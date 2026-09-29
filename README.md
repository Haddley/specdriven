# specdriven

A plain HTML/CSS/JS four-function calculator — a flat, monochrome homage to
the Windows 1.0 (1985) Calculator, not a pixel-accurate recreation.

This is a fixed baseline used to trial three spec-driven AI development
tools — [OpenSpec](https://github.com/Fission-AI/OpenSpec),
[Spec-Kit](https://github.com/github/spec-kit), and
[BMAD](https://github.com/bmad-code-org/BMAD-METHOD) — each starting from
this same commit, given the same feature requests, so the results are
comparable.

## Run it

No build step. Open `index.html` directly in a browser, or serve the
directory:

```bash
npx serve .
```

## Test it

```bash
npm test
```

Runs the calculation-engine tests with Node's built-in test runner
(`node --test`).

## Structure

- `index.html` / `style.css` — the flat, boxy UI
- `calculator-logic.js` — the pure calculation engine (no DOM access), so
  it can be tested directly
- `calculator.js` — DOM wiring: button clicks call into the engine and
  re-render the display
- `test/logic.test.js` — tests against `calculator-logic.js`

## Design decisions already made

- Operators chain **left-to-right as entered** (`5 + 3 × 2` = `16`), the
  way a plain calculator works — not by operator precedence.
- Dividing by zero shows `Cannot divide by zero` and blocks further input
  until `C` (Clear) is pressed.
