# Design

## Context

`CalculatorEngine` (`calculator-logic.js`) currently tracks a single `display` string and does all arithmetic as JS floating-point numbers, formatted for decimal display by `formatNumber`. `calculator.js` wires DOM buttons directly to engine methods and re-renders `engine.display` after every event. There is no existing spec for this baseline decimal behavior (see proposal.md - Capabilities), so this design only has to account for the actual current implementation, not a prior contract.

Programmer mode is inherently integer-only (Windows Calculator's Programmer mode has never supported fractional values), so this design introduces an integer domain alongside the existing float-based decimal domain, rather than trying to make one representation serve both.

## Goals / Non-Goals

**Goals:**
- Let the engine hold one "true" integer value and render it in whichever base (Decimal/Hex/Octal/Binary) is currently selected.
- Keep the existing decimal float behavior (including `formatNumber`'s rounding/trailing-zero handling) unchanged when in Decimal mode.
- Define exact, testable behavior for base switching, digit-entry restriction, and negative-number display — the details proposal.md defers to this doc.

**Non-Goals:**
- Bitwise operators, word-size selection, MOD, and other Programmer-mode operators (proposal.md - Non-goals) — no design work needed for these here.
- Preserving fractional precision across a switch into a non-decimal base — Programmer mode is integer-only, so switching away from Decimal necessarily truncates.

## Decisions

**Fixed 32-bit signed two's-complement word, not a selectable word size.**
Real Windows Calculator lets users pick BYTE/WORD/DWORD/QWORD; proposal.md scopes that selector out. A single fixed word size is needed regardless so hex/octal/binary strings and negative values are well-defined. 32-bit is chosen over 64-bit because JS bitwise-style integer math is naturally 32-bit (`value | 0` truncates to int32), keeping the implementation simple and avoiding `BigInt`. Alternative considered: arbitrary-precision integers via `BigInt` — rejected as unnecessary complexity for a scope that explicitly excludes word-size selection; can be revisited if a future change adds QWORD support.

**Single internal integer value, base is a display concern.**
The engine keeps one internal integer (the "true value"), separate from the string currently shown. The active base only determines (a) how that integer is formatted for display, and (b) which digit keys are currently valid input. Switching bases re-renders the same true value in the new radix; it never re-interprets the on-screen digits as if they were typed in the new base. Alternative considered: store the raw display string per base and reparse on switch — rejected because it would make "12" typed in decimal silently become a different value if the user then switches to hex, which is confusing and not how Windows Calculator behaves.

**Entering Decimal → non-decimal base: truncate toward zero, then wrap into the 32-bit signed range.**
`Math.trunc()` the current decimal value (drop any fractional part) and apply the same wraparound as arithmetic overflow (next decision). This mirrors a C-style `(int32_t)` cast, a well-understood and testable rule.

**Arithmetic overflow in non-decimal bases wraps using 32-bit two's-complement semantics** (equivalent to JS `value | 0` after each operation), rather than clamping or erroring. This matches how fixed-word-size calculators (including Windows Calculator's word-size-clamped modes) behave, and keeps overflow handling uniform with the truncation rule above. Divide-by-zero keeps the existing error behavior (`Cannot divide by zero`, blocked until Clear) unchanged, in every base.

**Digit-entry restriction is per-base, via enabling/disabling keys, not validation-after-entry.**
Binary allows `0`–`1`; Octal `0`–`7`; Decimal `0`–`9`; Hex `0`–`9` and `A`–`F`. The decimal-point key is disabled in every non-decimal base. This is enforced by disabling the invalid buttons in the DOM layer (`calculator.js`) rather than the engine silently ignoring bad input, so the UI itself communicates what's valid — consistent with the existing pattern of a "dumb" DOM layer that only forwards valid events, but here the DOM layer also needs to know the active base to decide which keys are enabled.

**Hex digits display uppercase (`A`–`F`), no radix prefix (no `0x`/`0b`/`0o`).**
Matches Windows Calculator's Programmer-mode display, which shows bare digits with the active base indicated by the mode selector, not a prefix.

**Mode toggle is a new UI control (e.g., a row of DEC/HEX/OCT/BIN buttons), not a dropdown or keyboard shortcut.**
Consistent with the existing flat, boxy, all-button aesthetic (style.css) — no `<select>` elements exist anywhere in the current UI, and introducing one would break the visual language of the Windows-1.0 homage.

## Risks / Trade-offs

- **[Risk]** Fixed 32-bit word silently truncates/wraps values a user might expect to see in full (e.g., typing a large hex value in Decimal-equivalent) → **Mitigation**: documented explicitly as a non-goal in proposal.md; wraparound behavior is deterministic and covered by tests, so it's surprising-but-correct rather than buggy. A future change can add word-size selection.
- **[Risk]** Truncating fractional values when leaving Decimal mode is lossy and one-way (no undo) → **Mitigation**: matches universal Programmer-mode calculator behavior; scenario is covered explicitly in the spec so it's a documented contract, not an edge case someone can miss.
- **[Trade-off]** Enforcing digit restrictions in the DOM layer (not just the engine) means `calculator.js` must know the active base → accepted because the engine already exposes `base`/mode state for rendering, and keeping invalid keys visibly disabled is better UX than silently rejecting clicks.

## Migration Plan

No data migration — this is a client-only static app with no persisted state. Ship as a normal code change: update `calculator-logic.js`, `calculator.js`, `index.html`, `style.css`, and `test/logic.test.js` together, run `npm test`, and manually click through mode switches and calculations in a browser before merging. No feature flag needed; rollback is a plain revert.
