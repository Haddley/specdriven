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

- `index.html` / `style.css` — the flat, boxy UI, including the DEC/HEX/OCT/BIN
  mode toggle and hex digit keys
- `calculator-logic.js` — the pure calculation engine (no DOM access), so
  it can be tested directly
- `calculator.js` — DOM wiring: button clicks call into the engine and
  re-render the display, including enabling/disabling keys for the active base
- `test/logic.test.js` — tests against the decimal four-function behavior
- `test/programmer-mode.test.js` — tests against Programmer Mode (base
  switching, base-aware calculation)

## Design decisions already made

- Operators chain **left-to-right as entered** (`5 + 3 × 2` = `16`), the
  way a plain calculator works — not by operator precedence.
- Dividing by zero shows `Cannot divide by zero` and blocks further input
  until `C` (Clear) is pressed.
- **Programmer Mode** lets the user switch the active base between Decimal,
  Hexadecimal, Octal, and Binary. Hex/Octal/Binary are **integer-only**
  (the decimal-point key is disabled) and represented as **signed 32-bit
  two's-complement integers**, so arithmetic overflow wraps (e.g. `7FFFFFFF`
  in Hex `+ 1` wraps to `80000000`) rather than erroring or growing
  unbounded. Switching bases reformats the current value into the new base
  rather than resetting it, truncating toward zero if a fractional Decimal
  value is present.
