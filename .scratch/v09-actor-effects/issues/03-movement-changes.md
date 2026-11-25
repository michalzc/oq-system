# 03: Movement changes with minimum

**What to build:** A Referee adds Mobility (+2m per magnitude) or Slow (−2m per magnitude, never below 1m) to an actor,
and the sheet shows the resulting movement rate with a contributions tooltip. When both apply, the breakdown lists both
so the Referee can adjudicate. This is chunk **Fx2**; see [the spec](../spec.md), sections "Curated change vocabulary"
and "Pure effect-contributions module", and user stories 18–21.

**Blocked by:** 02 (Protection: AP changes and contribution tooltips)

**Status:** resolved

- [x] The editor offers a movement rate target with add, multiply and override, and an optional minimum. The change
      data model gains the minimum field.
- [x] Movement includes its contributions in base data preparation. Fractional results from a multiplier are kept as
      calculated (no rounding).
- [x] Movement changed by effects shows a marker and a contributions tooltip.
- [x] Effect-contributions module tests: add, multiply (fractional kept), override, minimum applied last, both
      Mobility and Slow in the breakdown.
- [x] The Actors documentation page gains Mobility and Slow recipes.
- [x] Manual: the spec's Fx2 row (MR 15: Mobility +4m; Slow −6m; both; Slow −16m min 1 → 19; 9; 13 with both listed; 1) passes with reloads.
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

- 2026-11-25: Implemented on `feature/v09-fx2-movement`. The movement target is `mr` in `EFFECT_TARGETS`, which now
  also records per target whether a multiplied value rounds down (`roundDown`, AP) and whether a change may carry a
  minimum (`minimum`, movement). The change schema gains an optional, nullable `minimum` without an initial value, so
  changes stored without one save back without it. Movement is calculated in `calculateBaseAttributes`; the actor
  reads its effect changes once per preparation (`effectChanges`, set in `prepareBaseData`) and both AP and movement
  go through `OQBaseActor#effectAttribute`. The sheet value-with-marker markup moved into
  `actor/parts/effect-value.hbs`. Judgement calls:
  - The minimum applies after an override too; with several minimums the highest wins.
  - The minimum is a floor for the effects, not a "raise to": it never lifts a value that is already lower without
    effects (MR 0 with Slow stays 0), following the SRD's "may not go below one metre through use of this spell".
    So a change that only sets a minimum (add 0) changes nothing and is ignored, like any add 0. Taken from the
    review; the first version raised MR 0 to 1.
  - A minimum stored on a target without minimums (such as AP, by a macro) is ignored.
  - `EFFECT_TARGETS` flags are `roundsDown` and `allowsMinimum`.
  - Multiplied values drop floating point noise (9 × 1.2 = 10.8, not 10.799999999999999).
  - The tooltip shows each change's minimum next to its amount: `−6 (minimum 1)`.
  - Changing a row's target in the editor saves the effect, like adding or deleting a row, so the row is drawn with
    its target's fields (the Minimum input appears only for movement).
  - Fixed a Fx1 editor bug found during QA: changing a row's operation threw
    `TypeError: Cannot set properties of null (setting 'placeholder')`, because core's `_onChangeForm` treats any
    select named `*.type` as its own change row. The select is now `oqChanges.N.operation`; the trap is recorded in
    `docs/foundry-v14-notes.md`.

- 2026-11-25 in-world QA (Foundry 14.370, `oq-dev` world, GM client): passed.
  - Character A (MR 15): "Mobility 2" created from the Effects tab in the editor (source Mobility; the new row's
    target switched from Armour points to Movement rate, which re-rendered it with a Minimum input; Add 4): MR 19,
    19 after reload. "Slow 3" created the same way (Add −6, Minimum 1; the operation select was switched to
    Multiply by and back without errors): both enabled 13, 13 after reload, tooltip "Movement Rate: 13 / Without
    effects 15 / Mobility 2 (Mobility) +4 / Slow 3 (Slow) −6 (minimum 1)". The editor reopened with Minimum 1.
    Slow edited to −16 in the editor with Mobility enabled: 3 (15 + 4 − 16, above the floor). Mobility disabled from
    the list: 1, 1 after reload. Slow back to −6: 9, 9 after reload. Mobility enabled and Slow disabled from the
    list: 19. Both deleted: 15 with no marker; after reload the actor's stored data (without effects) was identical
    to the baseline taken before the test.
  - Unlinked Elf token (NPC): Mobility 2 and Slow 8 (−16, minimum 1): 3, 3 after reload, marker on the NPC sheet;
    Slow only 1; Mobility only 19; none 15. The other Elf token and the base actor stayed at 15.
  - No console errors or warnings.
  - After the review fix: Slow 8 on MR 15 gives 1 and its editor shows Minimum 1; with the MR mod at −15 (MR 0
    without effects) Slow leaves 0; MR back to 15 afterwards.
  - Fractional movement from a multiplier was checked only by the module tests, not in the world.
  - `yarn build:packs` was not run, because Foundry was running; `yarn check:packs` compiled the packs.
