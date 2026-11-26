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

**Status:** resolved

- [x] MP has a stored, ordered pool list with the same pool record as HP; prepared data exposes the available
      temporary MP total.
- [x] The MP normal-maximum formula is shared between preparation and conversion.
- [x] MP legacy conversion follows every HP guarantee: once only, calculated maximum, zero maximum, unlinked token
      deltas converted independently, locked world compendia, late imports, no reconstruction of clamped-away points.
- [x] A separate, later versioned migration step persists the MP conversion; the HP step is not edited.
- [x] Sheets show MP "+N" when temporary MP is above zero; the pool editor opens from beside MP with the same grant,
      correct, remove and validation behavior as HP.
- [x] Resource-points module tests for MP conversion cases; migration tests for the MP step on actor and token sources
      (including two unlinked tokens with different deltas), already-converted sources, and runner-level coverage.
- [x] Manual: the spec's acceptance rows "v0.8 actor: MP max 10, stored 14" and "Two unlinked tokens with MP 12 and
      15" pass, plus grant/correct/remove of MP pools on a character and an NPC, with reloads.
- [x] The Actors documentation page covers temporary MP (edit the HTML source, regenerate the journal sources).
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

### 2026-11-26 implementation notes

- Module: `mpNormalMaximum(pow, mod)` (shared with `calculateBaseAttributes`) and `convertLegacyMp(characteristics,
  mp, label)`, with the same recovery rules and the same fixed pool identity as HP. `LEGACY_CONVERSIONS` maps `hp` and
  `mp` to their conversions; the data model's `migrateData` and `OQBaseActor#_preCreate` loop over it, so each
  resource is detected and converted on its own (a world already at migration 3 has HP pool lists and legacy MP).
- Schema: MP uses the same resource model as HP (`pools` with a factory `initial`). Prepared
  `system.attributes.mp.temporary` is the available total.
- Migration 4 (`migration-4-legacy-mp-excess.js`) mirrors migration 3 for MP; migration 3 is untouched. Its runner
  tests now cover both steps together (the old HP-only runner block also saw migration 4's writes): world actors and
  four unlinked tokens (HP override, MP 12, MP 15, inheriting), a locked world compendium, and a retry where the HP
  step fails and the MP step waits.
- Sheet: "+N" and the pool editor control moved into the partial `actor/parts/temporary-points.hbs`, used for HP and
  MP. The pool editor itself needed no change; its title reads "Temporary Magic Points: <name>".
- `TEMPORARY_POINT_RESOURCES` is gone: its only user was the token display, which stays HP-only here
  (`BAR_RESOURCES` in `canvas/token.js`); ticket 06 adds MP there with the HUD input routes.
- Actors page: the section is now "Temporary Hit Points and Magic Points" (grant, editor, recovered excess). MP
  spending order is not described yet: the MP routes (06) and casting (07) still spend ordinary MP only.

### 2026-11-26 manual QA

Foundry 14.370, `oq-dev`, GM client (Chromium via DevTools MCP). Fixtures were created while the page still ran the
previous build (world migration version 3: HP with pool lists, MP without), then the page reloaded into the new
build. Stored state read raw from the server (`modifyDocument` `get`).

| Row | Observed |
| --- | --- |
| v0.8 actor: MP max 10, stored 14 (`QA MP v08`, character) | Stored and shown MP 10/10 + Recovered excess 4; version 4. |
| Two unlinked tokens with MP 12 and 15, base MP 9, max 10 (`QA MP base`, NPC) | Token deltas stored 10 + Recovered excess 2 and 10 + Recovered excess 5; base stored 9 with `pools: []`; a third unlinked token without an MP override kept no MP in its delta and inherits 9/10. |
| Locked world compendium actor MP 14 (`world.qa-actors`) | Stored 10 + Recovered excess 4, same `_id`, compendium locked again. |
| Old actor JSON MP 14 (exported before the upgrade) | `importFromJSON` and `Actor.create` both persisted 10 + Recovered excess 4; a new `{name, type}` NPC persisted an empty MP pool list. After a reload, still one pool each. |
| MP pool editor, character and NPC (sheet control, dialog DOM) | Grant A=2, B=4 → appended after existing pools; correct A to 3 kept its place; remove B dropped only B; grant 0 with a blank label added `Manual=0` last; corrections to -2 rejected with the message and snapped back to 3. HP pools unchanged. |
| Unlinked token editor | A "Tap" grant of 3 landed in that token's delta only; the base NPC and the other tokens unchanged. |
| Reload | MP of the character, the NPC and both tokens identical to the pre-reload baseline (pools, amounts, order). |

Sheets: character "HP 6 / 8 +2 · MP 10 / 10 +7" and NPC "MP 9 / 10 +15", each with its control and the
"Temporary points: N" tooltip; parchment theme kept, the row fits with two-digit totals. Console: the migration
notice and the two induced invalid-amount messages only. Not checked: a player client.

QA fixtures left in `oq-dev`: `QA MP v08`, `QA MP base` (with an extra `Big=12` MP pool), tokens `QA MP token 12`,
`QA MP token 15`, `QA MP token inherit`, `QA MP import`, `QA MP created`, `QA MP fresh`, and `QA MP pack` in
`world.qa-actors`.

### 2026-11-26 review

Two-axis review (standards, spec) of 1e99c19: no documented-standard breaches and nothing missing or wrong in this
ticket's scope. Changes made:

- The conversion loop duplicated in `OQActorDataModel.migrateData` and `OQBaseActor#_preCreate` became the pure
  `convertLegacyResources(characteristics, attributes, label)`, with module tests (HP converted and MP legacy, both
  legacy, partial and missing resources); the conversion table is now private to the module. Re-checked in `oq-dev`:
  `importFromJSON` and `Actor.create` of an old export with HP 12 (max 8) and MP 14 persisted 8 + 4 and 10 + 4; a new
  character persisted empty lists. No console errors.
- `BAR_RESOURCES` in `canvas/token.js` is now `TEMPORARY_POINT_BAR_RESOURCES`.

Kept: migration 4 copies migration 3's handler shape (migration 3 must not be edited); the recovered-excess label is
translated at each caller, as in Res1.

For ticket 06 (both reviewers): the MP number input on the sheet still stores the typed value unclamped. Now that MP
has a pool list, a value typed above the maximum is no longer the legacy signal, so it would stay hidden and never be
recovered. Res2 must not merge without 06's "sets ordinary MP clamped to 0…maximum". Likewise the Actors page names
Tap's MP as temporary points while spending still takes ordinary MP only until 06 and 07.
