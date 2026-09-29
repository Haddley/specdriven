# Quickstart: Validating Statistics Mode

Prerequisites: Node.js installed (for `npm test`); no build step or install
needed to run the app itself (Constitution III).

## Automated check

```bash
npm test
```

Expected: all existing tests in `test/logic.test.js` still pass (Standard
Mode and Programmer Mode regressions — SC-006), plus the new Statistics Mode
cases described in
[contracts/calculator-engine.md](./contracts/calculator-engine.md) and
[data-model.md](./data-model.md).

> **Note on the Standard Deviation example below**: research.md flags that
> spec.md's User Story 3 Acceptance Scenario 1 states an expected value
> (`"2"`) that is the *population* standard deviation of its example data
> set, not the *sample* standard deviation FR-007 requires. The correct
> sample-stddev value for that data set is used below (≈`2.1380899353`).
> The spec's worked example should be corrected to match before this becomes
> a generated task/test.

## Manual check (open the app)

Open `index.html` directly in a browser, or serve the directory
(`npx serve .`) and open it there.

### 1. Build a data set (US1)

1. Switch to Statistics Mode.
2. Enter `10`, press Add — count shows `1`.
3. Enter `20`, press Add — count shows `2`.
4. Enter `30`, press Add — count shows `3`.
5. Press `-` sign toggle (±) then enter `5` (i.e. compose `-5`), press Add —
   count shows `4`; the data set includes a decimal-capable, negative entry
   (US1 AC4).
6. Press Add again without typing anything first — count stays `4` (edge
   case: no-op without new digits since the last add).

### 2. Sum and Average (US2)

1. With a fresh data set containing `10`, `20`, `30`: request Sum — display
   shows `60`. Request Average — display shows `20`.
2. Clear the data set, add a single point `7`: request Sum — display shows
   `7`; request Average — display shows `7`.
3. Clear the data set (now empty): request Sum — display shows `No data`, not
   `0`. Same for Average.

### 3. Standard Deviation (US3)

1. Clear the data set. Add `2`, `4`, `4`, `4`, `5`, `5`, `7`, `9`. Request
   Standard Deviation — display shows the sample standard deviation,
   `2.1380899353` (see the note above re: the spec's worked example).
2. Clear the data set, add a single point. Request Standard Deviation —
   display shows `Undefined`, not `0` or an arbitrary number (FR-009).
3. Clear the data set (empty). Request Standard Deviation — display shows
   `No data` (FR-008).

### 4. Manage the data set (US4)

1. Add `10`, `20`, `30`. Remove the `20` data point (via its list entry) —
   count shows `2`; requesting Sum now shows `40` (10 + 30).
2. Add several more points, then clear the entire data set in one action —
   count shows `0`, no data points remain.
3. With the data set already empty, clear it again — nothing changes, no
   error occurs.

### 5. Mode switch and regression checks (FR-013, FR-014, SC-006)

1. With data points and an in-progress entry in Statistics Mode, switch to
   Standard Mode — the data set and in-progress entry are cleared (FR-013).
   Switching back to Statistics Mode starts from an empty data set.
2. In Standard Mode, verify the four operations, left-to-right chaining
   (`5 + 3 × 2` → `16`), and divide-by-zero behavior are unchanged.
3. In Programmer Mode, verify base selection and per-base arithmetic are
   unchanged (no cross-mode interference from the new `dataSet`/
   `dataEntryStarted` fields, which Programmer Mode never touches).

All scenarios above map directly to the Acceptance Scenarios in
[spec.md](./spec.md) (adjusted for the flagged Standard Deviation example);
the automated tests in `test/logic.test.js` are the authoritative, repeatable
version of this checklist.
