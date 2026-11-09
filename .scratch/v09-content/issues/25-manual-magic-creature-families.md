# 25: Manual Magic page: creature families

**What to build:** A Referee running a ghost looks up spirit combat on the coverage page and follows the link to a workflow
for spirit combat and possession. Regeneration, drain and feeding, transformations, immunities and damage components
have the same guidance, so the bestiary side matches the spell side. Second and last slice of chunk **Man**; see [the
spec](../spec.md), section "Manual-coverage documentation (Man)", and user stories 105, 106.

**Blocked by:** 17, 18, 19, 20, 21, 22, 23 (every ability batch, so the rows it links are final), 24 (Manual Magic page:
spells, enchanted items, Tap and reservoirs)

**Status:** ready-for-agent

- [ ] The page has sections for spirit combat and possession, regeneration, drain and feeding, transformations, and
      immunities and damage components.
- [ ] Each workflow names the existing tool, and the immunities section uses the separate components on damage cards.
- [ ] Every Manual creature row links its section where one exists, and profile-data rows still say to author the
      creature's statistics.
- [ ] The row contract test still passes.
- [ ] Manual: follow a link from one row of each creature family to its section, and run the werewolf immunity workflow
      on a damage card.
- [ ] `yarn build:docs` output is included, and `yarn test`, `yarn lint` and `yarn build` pass.
