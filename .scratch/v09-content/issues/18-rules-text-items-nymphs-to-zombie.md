# 18: Rules-text items, Nymphs to Zombie and Spirits

**What to build:** A Referee drags Regeneration onto a Troll and sees the rule with its exact exceptions and a link to the
Bestiary page, with no value changed. The Pixie's At-Will Mischief points at the Mischief spell, and the Unicorn's Healing
Touch describes its Heal-like effect, touch range and 6 MP cost, so the spell rules aren't duplicated. Second slice of
chunks **Ab5a and Ab5b**; see [the spec](../spec.md), section "Ab5a, Ab5b Manual creature abilities", and user stories
75, 76, 79, 80, 97, 99.

Same conventions as ticket 17. Abilities that leave a state on a target are ticket 19's job.

**Blocked by:** 17 (SRD Creature Abilities compendium and rules-text items, Basilisk to Mummy)

**Status:** ready-for-agent

- [ ] Rules-text items exist for the remaining Manual rule families of Nymphs, Dryad, Hag, Naiad, Oread, Orc, Pentaghast,
      Pixie, Troll, Skeleton, Slime, Spirits, Unicorn, Vampire and Zombie, excluding profile-only rows, the Assisted
      families in tickets 20–23 and the abilities in ticket 19.
- [ ] Each description starts with the rules summary, then a Source link to the Bestiary page by UUID.
- [ ] Pixie's At-Will Mischief links the Mischief spell, and Unicorn's Healing Touch describes its effect and cost.
- [ ] These coverage rows now link their items and stay Manual.
- [ ] Manual: the spec's Ab5 row passes (a Troll with Regeneration shows the item with its rules and journal link; no
      effect, no values changed), on a character and an NPC.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
