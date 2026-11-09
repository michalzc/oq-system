# 11: Sp5a: negative weapon damage, dice multiplier, Dull Weapon, Damage Boosting and True (Weapon)

**What to build:** A caster applies True (Weapon) to a 1D8 sword with Damage Modifier +1D4, and its damage becomes 2D8
+1D4 while the wielder's other sword is unchanged. Dull Weapon 2 makes the same sword 1D8 −4 +1D4, leaving the Damage
Modifier alone, with each component separate on the damage card. Damage Boosting adds 1 per magnitude to the chosen
weapon. First slice of chunk **Sp5**; see [the spec](../spec.md), sections "Template capability extensions" (weapon dice
multiplier, negative weapon damage term) and "Spell batches", and user stories 13–19, 22, 56–58, 63.

A bound-weapon change can "multiply normal weapon dice" (×2): only the weapon's own dice terms multiply, and the Damage
Modifier and added terms don't. A bound-weapon damage addition may be negative, with the weapon's own dice and the Damage
Modifier kept separate. Before writing code, confirm how the damage roll treats a total below zero; follow that handling
and document it.

**Blocked by:** 03 (Template invariants and worked-example harness),
[application 08 (Damage basis on test cards)](../../v09-application/issues/08-damage-basis-snapshot.md),
[application 09 (Weapon Enhance binds to a chosen weapon; missing target, rebind or end)](../../v09-application/issues/09-weapon-enhance-binding.md)

**Status:** ready-for-agent

- [ ] Bound-weapon changes offer a normal-dice multiplier and negative damage additions, in the editor and data model.
- [ ] Weapon damage and the damage basis apply the multiplier to the weapon's own dice only, and keep negative terms
      separate from the dice and the Damage Modifier.
- [ ] The pack's Dull Weapon, Damage Boosting and True (Weapon) carry the templates in the spec's Sp5 table, keeping their
      item ids. Damage Boosting's 5 ENC limit is in its rules text.
- [ ] Effect-contributions module and roll tests: dice multiplier with added terms and DM; negative terms; a total below
      zero.
- [ ] Worked examples: the spec's True (Weapon) and Dull Weapon rows, plus Damage Boosting.
- [ ] These spells flip to Automated on the coverage page.
- [ ] The Magic documentation page explains both changes, and how a total below zero is handled.
- [ ] Manual: on fresh pack copies, the spec's True (Weapon) and Dull Weapon rows pass, including the damage card
      components and an unaffected second weapon, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
