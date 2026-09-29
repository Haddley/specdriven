# Quickstart: Validating Programmer Mode

Prerequisites: Node.js installed (for `npm test`); no build step or install
needed to run the app itself (Constitution III).

## Automated check

```bash
npm test
```

Expected: all existing tests in `test/logic.test.js` still pass (Standard
Mode regressions — SC-005), plus the new Programmer Mode cases described in
[contracts/calculator-engine.md](./contracts/calculator-engine.md) and
[data-model.md](./data-model.md).

## Manual check (open the app)

Open `index.html` directly in a browser, or serve the directory
(`npx serve .`) and open it there.

### 1. Base selection and restricted entry (US1)

1. Switch to Programmer Mode.
2. Select Binary. Press `9` — display stays unchanged (SC-003).
3. Select Hexadecimal. Press `2`, `A`, `F` — display shows `2AF`.
4. Select Octal. Press `8` — display stays unchanged.

### 2. Calculating in a selected base (US2)

1. Select Hexadecimal. Enter `F`, press `+`, enter `1`, press `=` — display
   shows `10`.
2. Select Binary. Enter `11`, press `×`, enter `10`, press `=` — display
   shows `110` (3 × 2 = 6).
3. In any base, divide by zero — display shows `Cannot divide by zero`;
   further digit presses do nothing until Clear is pressed.
4. In Decimal (Programmer Mode), compute `3 − 5` — display shows `-2`.

### 3. Base switching mid-session (US3)

1. Switch to Decimal, enter `255`.
2. Switch the base to Hexadecimal — display updates to `FF` with no further
   input (SC-004).
3. Switch to Binary with `1010` on the display, then switch to Octal —
   display shows `12`.
4. Enter an operand, press `+` (pending operator), then switch base — the
   already-entered operand is converted and shown in the new base, and `+`
   is still pending.

### 4. Mode switch and Standard Mode regression (FR-008, SC-005)

1. With a value/calculation in progress in Programmer Mode, switch back to
   Standard Mode — entry and calculation are cleared.
2. In Standard Mode, verify the four operations, left-to-right chaining
   (`5 + 3 × 2` → `16`), and divide-by-zero behavior are unchanged from
   before this feature.

All scenarios above map directly to the Acceptance Scenarios in
[spec.md](./spec.md); the automated tests in `test/logic.test.js` are the
authoritative, repeatable version of this checklist.
