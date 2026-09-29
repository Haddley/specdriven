# Design

## Context

`CalculatorEngine` (`calculator-logic.js`) already tracks mode-like state as plain fields on the instance — `base` (added for Programmer mode) alongside `display`, `previousValue`, `operator`, `waitingForOperand`, and `error`. `calculator.js` re-renders by reading engine state and toggling `disabled`/`active` on DOM buttons after every event; there is no separate view layer or framework. Statistics mode follows the same shape: new instance fields, new engine methods, and render-time enable/disable logic in `calculator.js` — no new architecture is introduced.

## Goals / Non-Goals

**Goals:**
- Reuse the existing digit/decimal-point entry path unchanged; Statistics mode only adds what happens to a completed entry (Add it to a data set) and three new read-only computations over that data set (Sum, Average, Standard Deviation).
- Make Statistics mode a distinct, mutually exclusive mode from Programmer mode's base selection — entering Statistics mode does not need to reason about hex/octal/binary at all.
- Define an unambiguous standard-deviation formula, since proposal.md intentionally left this to design.md.

**Non-Goals:**
- Sample standard deviation, variance, median, mode, min/max (proposal.md - Non-goals) — no design work needed for these here.
- Any UI for viewing, editing, or removing individual entries from the data set — the entered-count indicator is the only feedback; the values themselves are only used in aggregate.

## Decisions

**Standard deviation is population standard deviation (divide by `n`), not sample standard deviation (divide by `n - 1`).**
Windows Calculator's historical Statistics box actually exposes both (`σ` population and `s` sample), but proposal.md scopes this change to a single "standard deviation" figure. Population standard deviation is chosen because it is defined for every non-empty data set, including `n = 1` (result `0`), whereas sample standard deviation divides by zero at `n = 1` and would need special-casing. It also reads as the more natural interpretation of "the standard deviation of these numbers" for a data set that isn't being treated as a sample of some larger population. Alternative considered: implement both and let the user pick — rejected as unnecessary complexity beyond what the proposal asks for; can be revisited as a follow-up if a sample-statistics need arises.

**Statistics mode is a boolean flag (`statisticsMode`) on `CalculatorEngine`, independent of `base`.**
Programmer mode's `base` field answers "which radix is active"; Statistics mode answers a different question ("is the calculator in data-collection mode") and doesn't interact with radix at all — Statistics mode is decimal-only. Keeping them as separate fields (rather than folding Statistics mode into the existing base enum as a fifth value) avoids conflating two orthogonal concerns and keeps `base`'s existing semantics untouched. Alternative considered: treat `"STAT"` as a fifth value of `base` — rejected because `base` is read by `_parseDisplayValue`/`_formatValue` to select a radix, and Statistics mode isn't a radix.

**The data set is a plain array of numbers (`dataSet`) on the engine, populated only by an explicit `addToDataSet()` call.**
`addToDataSet()` parses the current display as a float (reusing decimal parsing, since Statistics mode is decimal-only), pushes it onto `dataSet`, and resets `display` to `"0"` with `waitingForOperand` semantics equivalent to starting a fresh entry. This mirrors the existing pattern where `setOperator` captures the current entry before starting the next one.

**Sum/Average/StdDev are pure read computations that do not mutate `dataSet`.**
`computeSum()`, `computeAverage()`, and `computeStdDev()` each compute their result from `dataSet` and write it to `display`, exactly like `equals()` writes a result to `display` without needing further engine state changes. They leave `dataSet` untouched so the user can request multiple statistics over the same entered sequence (spec.md - "Computing a result does not modify the data set"). Internally, `computeStdDev()` reuses `computeSum()`'s logic for the mean rather than duplicating a summation loop.

**Empty-data-set error reuses the existing `error` flag and blocked-input pattern from divide-by-zero.**
`_compute`'s divide-by-zero path already sets `this.error = true`, writes an error string to `display`, and relies on every input method's existing `if (this.error) return;` guard to block further input until `clear()`. Sum/Average/StdDev set the same `error` flag with the message `No data entered` when `dataSet.length === 0`, so no new blocking mechanism is needed.

**Toggling Statistics mode on or off clears `dataSet` and calls `reset()`.**
Switching into Statistics mode starts from a clean slate (matches spec.md - "Entering Statistics mode starts with an empty data set"); switching out clears the data set rather than preserving it in the background, since there's no UI for a hidden data set to be meaningful, and it avoids stale data silently reappearing if the user re-enters Statistics mode later expecting a fresh start.

**Operator, equals, and base-toggle buttons are disabled via the same render-time pattern Programmer mode uses for digit keys, not via new engine guards.**
`calculator.js` already disables digit/decimal buttons based on `engine.base` on every `render()` call. The same function will additionally disable the operator, equals, and mode-toggle (DEC/HEX/OCT/BIN) buttons when `engine.statisticsMode` is true. This keeps the "UI communicates what's valid" pattern established in Programmer mode's design (design.md precedent in `programmer-mode`) rather than silently no-op'ing those methods in the engine as a second line of defense.

**New keys (STAT toggle, Add, Sum, Avg, Std) are added as buttons styled with the existing `.key` class, in a new row, consistent with Programmer mode's `.mode-toggle` row.**
No new visual language is introduced — same flat/boxy borders, same monospace font, same active/disabled states already defined in `style.css`.

## Risks / Trade-offs

- **[Risk]** Choosing population over sample standard deviation may not match what a user coming from a specific other calculator expects → **Mitigation**: documented explicitly as a decision here and as a non-goal in proposal.md, with the formula's behavior fully pinned down by spec.md scenarios (including the exact expected value for `{2, 4, 6}`), so it is a documented contract rather than an ambiguous edge case.
- **[Risk]** Disabling operator/equals/base-toggle keys only at the DOM layer means a test that calls `engine.setOperator(...)` directly while `statisticsMode` is true would not be blocked → **Mitigation**: out of scope per this design's chosen pattern (matches Programmer mode's existing precedent of DOM-layer-only restriction for digit keys); not a real-world path since the DOM never exposes disabled buttons as clickable.
- **[Trade-off]** Clearing the data set on every mode exit/entry means a user cannot toggle to Standard mode mid-sequence to do a quick unrelated calculation and come back to their data set → accepted because proposal.md's scope is simple sequence-entry-then-compute, and preserving a hidden data set across mode switches would need UI to surface that state, which is out of scope.

## Migration Plan

No data migration — this is a client-only static app with no persisted state. Ship as a normal code change: update `calculator-logic.js`, `calculator.js`, `index.html`, `style.css`, and add `test/statistics-mode.test.js`, run `npm test`, and manually click through data entry and each computation in a browser before merging. No feature flag needed; rollback is a plain revert.
