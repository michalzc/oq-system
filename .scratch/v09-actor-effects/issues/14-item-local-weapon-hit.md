# 14: Item-local weapon hit modifier

**What to build:** A Referee gives sword A a "this item" effect with +2 to hit. Attacks with A show the +2 as a magic
modifier in the test dialog and on the card, competing with the skill's own effect modifiers under the
strongest-modifier rule. Sword B and the skill are unaffected. Second and last slice of chunk **Itm1**; see [the
spec](../spec.md), sections "Item effects (Itm1, Itm2)" and "Test resolution", and user stories 72, 74, 75.

**Blocked by:** 13 (Item-local weapon damage; item Effects section and role), 06 (Named-skill test modifiers and the
strongest magic modifier)

**Status:** ready-for-agent

- [ ] For "this item" definitions the editor also offers the weapon hit modifier target (add).
- [ ] Weapon tests include the weapon's item-local hit modifiers in the same strongest-magic-modifier selection as the
      referenced skill's contributions.
- [ ] Dialog and card show the item-local modifier and its source.
- [ ] Effect-contributions module tests: weapon contributions scoped to one weapon, competing with skill modifiers.
- [ ] The Items documentation page's weapon recipe covers the hit modifier.
- [ ] Manual: the spec's Itm1 row "Swords A (+2 hit local) and B, same skill" passes (roll A, B and the skill;
      rename, store and ready A; copy A to another actor).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
