# 04: Characteristic changes: effective vs learned values

**What to build:** A Referee adds Enhance STR +2 and sees STR rise, Close Combat rise with it, the Damage Modifier cross
its threshold and weapon damage update; removing it restores everything. CON and SIZ changes recalculate the HP normal
maximum. Halving rounds down and Diminish never goes below 1. A skill pushed to 100% or more only by an effect does not
make the character a Master, and the skill tooltip reveals the learned value. POW effects never change MP. This is
chunk **Fx3**; see [the spec](../spec.md), sections "Actor preparation order" (steps 1 and 2) and "Curated change
vocabulary", and user stories 22–31.

The actor keeps native characteristic values (base + modifier) as **unmodified** values and derives **effective**
values from the effect contributions. HP maximum, Damage Modifier and `getDataForItems` read effective values; MP
maximum reads unmodified POW. Skills compute an **effective value** from effective characteristics and a **learned
value** from unmodified ones; Master eligibility reads the learned value (both learned and Modified skill at 100% or
more, under the existing mastery Rule Option). Current HP does not move when the HP maximum changes (that is ticket 05).
Document this interim behaviour in the notes.

**Blocked by:** 02 (Protection: AP changes and contribution tooltips)

**Status:** resolved

- [x] The editor offers a characteristic target (STR, CON, DEX, SIZ, INT, POW, CHA) with add, multiply and override and
      an optional minimum. Results round down after multiplication.
- [x] Skills, Damage Modifier, weapon damage and HP normal maximum use effective characteristics; MP normal maximum
      uses unmodified POW.
- [x] Skills expose effective and learned values; Master eligibility uses the learned value.
- [x] Characteristics and skills changed by effects show a marker and tooltip; the skill tooltip shows the learned
      value.
- [x] The characteristics dialog and native modifiers work as today.
- [x] Effect-contributions module tests: INT 13 halved → 6, Diminish −20 min 1 → 1, combination order, POW
      contributions excluded from MP maximum, learned vs effective skill and Master eligibility.
- [x] The Actors documentation page explains effective and learned values and gives an Enhance STR recipe, noting that
      current HP does not yet follow maximum changes.
- [x] Manual: the spec's Fx3 rows (Enhance STR on STR 12/SIZ 13/DEX 14; Deception learned 98 with Enhance DEX +4;
      INT 13 halve and Diminish; MP 8/10 with Enhance POW +3) pass on a character and an NPC with reloads.
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

- 2026-11-26: Implemented on `feature/v09-fx3-characteristics`. The seven characteristics are targets of their own in
  `EFFECT_TARGETS` (`str` … `cha`, listed after `CHARACTERISTICS`), with add, multiply and override, rounding down
  and an optional minimum; the editor offers them labelled with the characteristic names. The data model's base data
  sets each characteristic's `unmodified` (base + mod) and `value`; `OQBaseActor#applyCharacteristicEffects`
  then replaces `value` with the effective value and puts the breakdown on `effects`. Pure pieces in
  `utils/effect-contributions.js`: `effectiveCharacteristics`, `normalMaximums` (HP from effective SIZ/CON, MP from
  unmodified POW), `skillValues` (effective and learned values, Master from learned) and
  `referencedCharacteristics` (direct `@int` / `@{int}` references, no recursion or algebra; Fx6a can reuse it).
  `getDataForItems({ learned: true })` gives unmodified characteristics, learned skill values and a DM from
  unmodified STR/SIZ, for learned values. `evaluateTestRoll` passes `learnedValue` (falling back to `value`) to
  `getResult` and `isMaster`. Judgement calls:
  - Encumbrance follows effective STR + SIZ, like everything but MP.
  - Rolled special abilities get a `learnedValue` too, so an ability raised to 100 by an effect is not a Master
    either. They show no marker or tooltip.
  - Typing a negative advance sets the learned value (`learnedBaseValue`), so effects never become advances. Without
    effects this is unchanged.
  - The skill tooltip ("Learned, without effects") lists the effects on the characteristics the skill's own formula
    references directly, as `Str +2`, and flags review when one of them does. A skill changed only through
    `@skills.x.value` shows its marker and learned value but lists no effects.
  - Only multiplication rounds; an override or a fractional addition on a characteristic is kept as entered.
  - The NPC sheet's characteristic input shows the unmodified value (it writes `base`, and showed base + mod before),
    so saving the sheet never stores effects; the effective value appears under the roll formula with the marker.
  - DM, HP maximum and weapon damage change without a marker of their own; the characteristic's marker explains them.
  - Current HP does not follow the HP maximum (ticket 05); the Actors page says to adjust it by hand.
  - New partials `effect-marker.hbs` and `skill-value.hbs`; glossary gains "Effective characteristic" and "Learned
    skill", and "Master" now reads the learned skill.

- 2026-11-26 in-world QA (Foundry 14.370, `oq-dev` world, GM client): passed. Fixtures `QA Fx3 PC` (character) and
  `QA Fx3 NPC` (NPC): STR 12, CON 10, DEX 14, SIZ 13, INT 13, POW 10, MP 8/10, Close Combat `@str+@dex` adv. 20,
  Deception `@dex+@int` adv. 71, Longsword 1D8 + DM. Effects were created from the sheet in the editor.
  - Enhance STR 2 (Strength / Add / 2): STR 14, DM none → +1d4, Close Combat 46 → 48, damage 1d8 → 1d8 + 1d4, on both.
    Same after reload. Disable (character, then reload) and delete (both): 12, none, 46, 1d8. The stored data
    without effects equalled the baseline after every step. STR tooltip "Without effects 12 / Enhance STR 2 (Enhance)
    +2"; Close Combat tooltip "Learned, without effects 46 / Enhance STR 2 (Enhance) Str +2".
  - Enhance DEX 4: Deception effective 100 (102 under the SRD skill cap), learned 98, no Master badge, same after
    reload. Forced rolls of 57 and 100 gave Success and Fumble on both actors: rolled normally, not as a Master.
  - INT 13: Halve INT (Multiply by 0.5) 6; Diminish INT 20 (Add −20, Minimum 1) 1; both again after reload.
  - Enhance POW 3: POW 13, MP 8/10; same after reload.
  - Characteristics dialog with Enhance STR 2 on: it shows base 12 and mod 0; STR mod +1 gives 13 unmodified and 15
    effective; POW mod +2 gives MP 8/12. Restored afterwards.
  - NPC: editing CHA on the sheet while Enhance STR is on left the stored STR base at 12.
  - Negative advance −90 on Deception with Enhance DEX 4: advancement 63, learned 90, effective 94.
  - After the review fixes: halved STR + 2 shows the review hint in both the STR and Close Combat tooltips (Close
    Combat 42); the Protection AP marker still renders. No console errors or warnings.
  - Not checked in the world: linked/unlinked tokens (the preparation path is the one Fx1 checked), a player client.
  - `yarn build:packs` was not run, because Foundry was running; `yarn check:packs` compiled the packs.
