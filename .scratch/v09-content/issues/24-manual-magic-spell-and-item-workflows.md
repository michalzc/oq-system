# 24: Manual Magic page: spells, enchanted items, Tap and reservoirs

**What to build:** A player looks up Dispel Magic on the coverage page, sees Manual and follows the link straight to a
workflow that says which existing roll, resource edit or marker to use. The new **Manual Magic** page in the System
Documentation journal covers every manual spell family, matrices, potions, scrolls, blessed items and relics, Tap and
special reservoirs. First slice of chunk **Man**; see [the spec](../spec.md), section "Manual-coverage documentation
(Man)", and user stories 100–104, 106.

Each workflow names the existing tool: a skill test, the damage dialog, a resource or pool correction, a store spend, a
standalone marker, a hand-made effect or ending an effect. Product limits are kept apart from rules. It's written against
the enchanted chunks that have landed; if they slip, store and charm references say "from 0.9.x". Creature families are
ticket 25.

**Blocked by:** 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16 (every spell batch, so the rows it links are final)

**Status:** ready-for-agent

- [ ] The page has sections for one-time damage and healing, ordered dispels, wards, information spells, summoning and
      creation, areas and regions, and enchantment creation.
- [ ] Ordered dispels states that Dispel Magic and Dismiss Magic stop at the first unremovable effect and Neutralise Magic
      skips.
- [ ] It has sections for matrices, potions, scrolls, Divine blessed items and relics, and the manual split-payment
      recipe.
- [ ] The Tap workflow follows the spec: ordinary MP first, then a manual temporary pool up to twice normal capacity, one
      excess MP removed per minute after it ends, and permanent drain recorded on the characteristic.
- [ ] Special reservoirs (Sorcerer's Stone, bound Magic Spirits, Mindlink, Places of Power) name the closest tool.
- [ ] Product limits (single-source payment, ordinary-only refill) are labelled as interface choices, not SRD rules.
- [ ] Every Manual spell row links its workflow section, and the row contract test still passes.
- [ ] Manual: follow a link from one row of each spell family to its section, and run the Tap workflow on a character.
- [ ] `yarn build:docs` output is included, and `yarn test`, `yarn lint` and `yarn build` pass.
