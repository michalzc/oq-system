# 05: Temporary MP pools: legacy recovery, sheet "+N", editor

**What to build:** MP gains the same ordered temporary-point pools as HP. A Referee upgrading a world sees MP stored
above the normal maximum recovered once into a "Recovered excess" MP pool (no spell or store attribution, no decay),
sheets show ordinary MP `current / max` plus "+N", and the pool editor grants, labels, corrects and removes MP pools
exactly as for HP. First slice of chunk **Res2**; see [the spec](../spec.md), sections "Resource model",
"Compatibility (legacy excess)" and "Sheet and pool editor".

HP and MP are detected and converted independently: MP has its own legacy signal and its own, later versioned
migration step. The pool editor and sheet indicator are extended, not duplicated. MP conversion lands before any MP
route writes pools.

**Blocked by:** 02 (HP pool editor: grant, correct, remove)

**Status:** ready-for-agent

- [ ] MP has a stored, ordered pool list with the same pool record as HP; prepared data exposes the available
      temporary MP total.
- [ ] The MP normal-maximum formula is shared between preparation and conversion.
- [ ] MP legacy conversion follows every HP guarantee: once only, calculated maximum, zero maximum, unlinked token
      deltas converted independently, locked world compendia, late imports, no reconstruction of clamped-away points.
- [ ] A separate, later versioned migration step persists the MP conversion; the HP step is not edited.
- [ ] Sheets show MP "+N" when temporary MP is above zero; the pool editor opens from beside MP with the same grant,
      correct, remove and validation behavior as HP.
- [ ] Resource-points module tests for MP conversion cases; migration tests for the MP step on actor and token sources
      (including two unlinked tokens with different deltas), already-converted sources, and runner-level coverage.
- [ ] Manual: the spec's acceptance rows "v0.8 actor: MP max 10, stored 14" and "Two unlinked tokens with MP 12 and
      15" pass, plus grant/correct/remove of MP pools on a character and an NPC, with reloads.
- [ ] The Actors documentation page covers temporary MP (edit the HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
