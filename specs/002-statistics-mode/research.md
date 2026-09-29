# Phase 0 Research: Statistics Mode

The feature spec's Assumptions section already resolved most open product
questions (sample stddev formula, decimal/negative-capable entry, data set
scoped to the Statistics Mode session, no extra statistics beyond
sum/average/stddev). What remains is technical: how to implement data-set
accumulation, sign entry, and the three computations inside the existing
`CalculatorEngine` without breaking Constitution I (logic/DOM split) or IV
(baseline fidelity) — plus one genuine spec defect found while cross-checking
the worked examples. No NEEDS CLARIFICATION items remain in the Technical
Context.

## ⚠ Spec consistency issue: User Story 3's worked example contradicts FR-007

**The problem**: US3's Acceptance Scenario 1 states that for the data set
`{2, 4, 4, 4, 5, 5, 7, 9}`, requesting Standard Deviation "shows '2'". But:

- Mean of that set = 40 / 8 = 5.
- Sum of squared deviations = (3² + 1² + 1² + 1² + 0² + 0² + 2² + 4²) = 32.
- **Population** standard deviation (÷ n = 8): √(32/8) = √4 = **2** — this
  matches the scenario's expected "2".
- **Sample** standard deviation (÷ n−1 = 7), which is what FR-007 and the
  Assumptions section explicitly mandate: √(32/7) ≈ **2.1380899353** — this
  does *not* match "2".

This data set is the textbook example for *population* standard deviation
(it appears with this exact expected value in numerous statistics
references), and it appears the acceptance scenario's expected value was
carried over from that convention without adjusting for the sample (n−1)
formula the spec elsewhere commits to.

**Decision**: Implement FR-007 as written — sample standard deviation,
dividing by n−1. FR-007 and the Assumptions section state this formula
explicitly and independently of any worked example, and the Assumptions
section gives an explicit rationale (matching the "s" statistic in the
classic Windows Calculator Statistics Box) that the population-stddev
reading has no counterpart for. A single acceptance-scenario example is the
weaker signal of the two and is more likely to be the error.

**Consequence — action needed before `/speckit-tasks`**: US3 Acceptance
Scenario 1's expected value should be corrected from `"2"` to the correct
sample-stddev value for that data set (≈`2.1380899353`, or
`formatNumber`'s output for that value), or the example data set should be
swapped for one where sample and population stddev coincide, before task
generation turns this scenario into a test — otherwise the generated test
will encode a mathematically incorrect expectation that no correct
implementation can satisfy. This plan and its quickstart use the corrected
(sample-stddev) value.

**Alternatives considered**:
- Implement population standard deviation (÷ n) instead, to match the worked
  example — rejected: this directly contradicts FR-007's explicit text ("the
  sample standard deviation (dividing by the count of data points minus
  one)") and the Assumptions section's explicit, reasoned choice of sample
  over population stddev. Silently switching the formula to fit one example
  would be a bigger, less visible spec deviation than flagging the example
  as wrong.
- Silently pick one and say nothing — rejected: SC-003 requires the result
  to be "mathematically correct... 100% of the time across representative
  test cases"; leaving the contradiction unflagged risks a task/test being
  written straight from the flawed example, then "failing" against a
  correct implementation.

## Decision: Extend `CalculatorEngine`, don't create a parallel engine

**Decision**: Add `dataSet` (array of numbers) and `dataEntryStarted`
(boolean) fields to the existing `CalculatorEngine` class, and add
statistics-specific methods (`addDataPoint`, `removeDataPoint`,
`clearDataSet`, `toggleSign`, `requestSum`, `requestAverage`,
`requestStdDev`) to it, rather than writing a separate "StatisticsEngine"
class or wrapper — the same pattern 001-programmer-mode used for Programmer
Mode.

**Rationale**: Digit entry, decimal entry, and the display/`waitingForOperand`
state machine are already mode-agnostic (Programmer Mode already branches
`inputDigit`/`inputDecimal` on `mode`), so Statistics Mode's number entry
reuses that machinery for free — only accumulation and computation are new
behavior. A separate engine would either duplicate digit/decimal entry or
require an awkward hand-off of partially-entered values between two engines.

**Alternatives considered**:
- Separate `StatisticsEngine` class — rejected: would duplicate digit/decimal
  entry logic already shared across modes, for no behavioral benefit
  (Constitution V, YAGNI).
- A generic "mode plugin" abstraction so future modes don't need engine
  changes — rejected: only two modes have ever needed this, and no
  requirement asks for a third; premature abstraction (Constitution V).

## Decision: A dedicated `dataEntryStarted` flag gates "Add to data set"

**Decision**: Track whether the user has pressed a digit or decimal-point key
since the last successful add (or since the data set was last cleared/mode
was entered) with a boolean field, `dataEntryStarted`. `addDataPoint()` is a
no-op unless this flag is true; it is set on any successful `inputDigit`/
`inputDecimal` call while `mode === "statistics"`, and cleared after a
successful add, after `clearDataSet()`, and whenever `setMode()` (re-)enters
Statistics Mode.

**Rationale**: The spec's edge case is explicit: "Pressing 'Add to data set'
without having entered any digits since the last add... has no effect — it
does not silently add a '0' data point." The display alone can't
distinguish "user typed 0" from "nothing typed since last add" (both leave
`display === "0"`), so a separate flag is the simplest correct signal —
consistent with how `waitingForOperand` already exists to disambiguate
"about to start a fresh entry" from "mid-entry" for arithmetic.

**Alternatives considered**:
- Infer from `display !== "0"` — rejected: fails the exact edge case in the
  spec (entering "0" explicitly and adding it must work like any other
  digit, per US1 AC4's "same as a positive whole number" and the general
  principle that 0 is a valid data point).
- Reuse `waitingForOperand` directly instead of a new flag — rejected: that
  field's meaning ("next digit press starts a fresh entry") is inverted
  from what's needed here and is already load-bearing for arithmetic mode
  transitions; overloading it risks subtle cross-mode bugs.

## Decision: Sign entry via a new `toggleSign()` method and a dedicated ± key

**Decision**: Add a `toggleSign()` method that flips a leading `-` on
`display` (no-op when `display === "0"`, when `mode !== "statistics"`, or
when `error` is true), wired to a new "±" button shown only in the
Statistics control panel — not a repurposing of the existing `-` (subtract)
key.

**Rationale**: FR-002 requires negative-number entry in Statistics Mode, but
Standard Mode has no existing negative-entry key today (its `-` key is
exclusively the subtract operator; negative values only ever arise as
computed results). Statistics Mode has no arithmetic chaining need for `+`,
`-`, `×`, `÷` at all, but reusing the visually-identical `-` key to silently
mean "toggle sign" in this one mode would be a confusing, hidden semantic
switch on an existing control. A dedicated, mode-scoped ± key is one small
addition (matching how 001-programmer-mode added dedicated A–F keys rather
than overloading existing digit keys) and needs no change to Standard Mode
at all (Constitution IV).

**Alternatives considered**:
- Repurpose the existing `-` key as sign-toggle in Statistics Mode —
  rejected: same physical button silently changing meaning between modes is
  more surprising than adding one new button, and this project already hides
  mode-irrelevant controls (base-selector, hex-keys) rather than
  reinterpreting shared ones.
- Require typing a leading minus via keyboard input — rejected: this app has
  no keyboard-input handling today (button-click only); out of scope.

## Decision: `setOperator`/`equals` no-op in Statistics Mode; dataSet resets on any mode change

**Decision**: `setOperator()` and `equals()` gain
`if (this.mode === "statistics") return;` guards, matching the existing
`inputDecimal()` guard style for Programmer Mode. `setMode()` unconditionally
resets `dataSet = []` and `dataEntryStarted = false` on any actual mode
change (Standard↔Programmer↔Statistics, in any direction), alongside its
existing `reset()` call.

**Rationale**: Statistics Mode has no use for arithmetic chaining (FR-005/
FR-006/FR-007 define its own request-based computations), so leaving
`setOperator`/`equals` live would let a stray `+`/`×`/`÷`/`=` press mutate
`previousValue`/`operator` state that Statistics Mode never reads — harmless
today, but a latent trap if that state is ever read in this mode later. A
guard costs one line and matches the project's existing early-return idiom.
Resetting `dataSet` on *any* mode change (not just Statistics→Standard) is
the simplest symmetric rule and matches 001-programmer-mode's "mode switch
always resets" precedent; FR-013 only mandates the Statistics→Standard
direction, but no requirement says data should survive a detour through
Programmer Mode either, and symmetric reset avoids inventing a partial-retain
rule with no spec backing.

**Alternatives considered**:
- Leave `setOperator`/`equals` active in Statistics Mode — rejected: no
  functional requirement uses chaining in this mode, and leaving it live
  adds an unused, untested code path.
- Only clear `dataSet` on the specific Statistics→Standard transition named
  in FR-013 — rejected: more state-machine branches for no spec-mandated
  behavioral difference; symmetric reset is simpler (Constitution V).
