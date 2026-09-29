# Phase 1 Data Model: Statistics Mode

This feature has no persistent storage or records — all state lives in the
single in-memory `CalculatorEngine` instance, same as today. This document
describes the spec's Key Entities and how they map onto engine fields, plus
the one new internal flag needed to satisfy an edge case.

## Statistics Data Set

The ordered collection of numeric Data Points the user has added while in
Statistics Mode (spec Key Entities).

| Field | Type | Notes |
|---|---|---|
| `dataSet` | `number[]` | Ordered array, one entry per `addDataPoint()` call. Defaults to `[]`. A multiset, not a set — duplicate values are stored as separate entries (FR-012). |

**Operations** (see [contracts/calculator-engine.md](./contracts/calculator-engine.md) for full method contracts):
- `addDataPoint()` — appends `parseFloat(display)` to `dataSet`, if entry
  conditions are met (see `dataEntryStarted` below).
- `removeDataPoint(index)` — removes the entry at `index` (identifies one
  specific occurrence, so removing one of several equal-valued points
  doesn't remove the others). No-op if `index` is out of range (FR-010,
  edge case: removing an already-removed point).
- `clearDataSet()` — resets `dataSet` to `[]` (FR-011). No-op (but harmless)
  when already empty.

**Count** (FR-004): `dataSet.length`, read directly — no separate field.

**Transitions**:
- Reset to `[]` whenever `setMode()` changes the mode, in any direction
  (Standard↔Programmer↔Statistics) — see research.md's "dataSet resets on
  any mode change" decision. This covers FR-013 (Statistics→Standard) and
  extends the same rule symmetrically to other transitions, matching
  001-programmer-mode's precedent.

## Data Point

A single numeric value (integer or decimal, positive or negative) added to
the Statistics Data Set (spec Key Entities). Represented directly as a plain
JS `number` inside the `dataSet` array — no wrapper object, since no
per-point metadata (e.g. an id) is required by any requirement; index
position in the array is sufficient to identify a specific occurrence for
`removeDataPoint`.

## Calculator Mode (extended)

Existing field from 001-programmer-mode, gaining a third value.

| Field | Type | Values | Notes |
|---|---|---|---|
| `mode` | string | `"standard"` \| `"programmer"` \| `"statistics"` (**new value**) | Defaults to `"standard"`. Set via `setMode(newMode)`. |

**Transitions** (extending 001's existing rules):
- `* → "statistics"`: resets entry/calculation state (`reset()`) and resets
  `dataSet = []` / `dataEntryStarted = false`.
- `"statistics" → *`: same reset, satisfying FR-013.
- Same-mode "transition": no-op, no reset (unchanged from 001).

## New internal flag: entry-since-last-add tracking

Not a spec-level entity, but required to correctly implement the edge case:
"Pressing 'Add to data set' without having entered any digits since the last
add... has no effect."

| Field | Type | Notes |
|---|---|---|
| `dataEntryStarted` | boolean | Defaults to `false`. Set `true` by a successful `inputDigit()`/`inputDecimal()` call while `mode === "statistics"`. Set `false` after a successful `addDataPoint()`, after `clearDataSet()`, and whenever `setMode()` changes mode. `addDataPoint()` is a no-op while this is `false`. |

`display === "0"` alone cannot distinguish "no entry since last add" from
"user explicitly entered 0", so this flag is necessary — see research.md's
"dataEntryStarted flag" decision for the rejected alternative.

## Existing engine fields (unchanged shape and meaning)

Reused as-is; Statistics Mode does not alter their meaning, though
`setOperator`/`equals` now no-op while `mode === "statistics"` (see contract):

| Field | Type | Statistics Mode behavior |
|---|---|---|
| `display` | string | The number currently being entered (digits + optional leading `-` and one `.`), or a computed Sum/Average/StdDev result, or `"No data"` / `"Undefined"` per FR-008/FR-009. |
| `previousValue` | number \| null | Unused in Statistics Mode (arithmetic chaining is inert here); remains `null` throughout. |
| `operator` | string \| null | Unused in Statistics Mode; remains `null` throughout. |
| `waitingForOperand` | boolean | Set `true` after `addDataPoint()`/`requestSum()`/`requestAverage()`/`requestStdDev()` so the next digit press starts a fresh entry, same pattern as after `equals()` in Standard Mode. |
| `error` | boolean | Unchanged meaning; Statistics Mode never sets this (empty/single-point data sets show a display message, not an error lock — the user can keep entering and adding after seeing "No data" or "Undefined"). |

No new entities beyond `dataSet`, the Data Point values it holds, and the
`dataEntryStarted` bookkeeping flag are needed — Sum, Average, and Standard
Deviation are computed on demand from `dataSet` and never stored.
