# 23: Ab4: werewolf

**What to build:** A Referee drops Wolf Form on a human-form werewolf with STR 14, INT 13 and movement 15, and switches it
on: STR 28, INT 6, movement 30, with the Damage Modifier recalculated. Switching it off restores everything. It ships
switched off, and its description warns against using it on a wolf-form profile. The werewolf's other rules each have a
manual item. This is chunk **Ab4**; see [the spec](../spec.md), section "Creature ability batches" (Ab4), and user stories
76, 79, 94–96.

Wolf Form is an owner passive with no template, so it doesn't use Use ability. AP, attacks, the damage-modifier
discrepancy and anatomy are in its rules text.

**Blocked by:** 03 (Template invariants and worked-example harness), 17 (SRD Creature Abilities compendium and rules-text
items, Basilisk to Mummy),
[actor-effects 03 (Movement changes with minimum)](../../v09-actor-effects/issues/03-movement-changes.md),
[actor-effects 04 (Characteristic changes: effective vs learned values)](../../v09-actor-effects/issues/04-characteristic-changes.md),
[actor-effects 16 (Creature ability passives)](../../v09-actor-effects/issues/16-creature-ability-passives.md)

**Status:** ready-for-agent

- [ ] Wolf Form has its passive with STR ×2, INT ×0.5 (rounded down) and movement override 30m, switched off in the pack.
- [ ] Its description warns to use it on a human-form profile only.
- [ ] Shapeshifting, Night Vision, Wolf-Form Immunity (listing the damage-component rules) and Mortal Vulnerabilities exist
      as manual items.
- [ ] Worked example: the spec's Ab4 row, on and off.
- [ ] Wolf Form flips to Assisted and the manual rows stay Manual; all rows link their items.
- [ ] Manual: on a fresh copy, the spec's Ab4 row passes on a character and an NPC, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
