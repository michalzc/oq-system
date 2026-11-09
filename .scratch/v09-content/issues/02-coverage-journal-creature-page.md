# 02: Coverage journal: Creature Abilities page

**What to build:** A Referee opens the Creature Abilities page of the coverage journal and finds every creature rule
family from the SRD bestiary and Animal List, each with its treatment, what the system calculates and the steps to run it
by hand. Rules that are only profile data (giant height, elemental scores, mummification, skeleton mindlessness, magic
spirit traditions) say "author the creature's statistics", so nobody looks for an ability item that would double-count
them. Second and last slice of chunk **Cov**; see [the spec](../spec.md), section "Coverage treatments and the coverage
page", and user stories 2–4, 9, 11, 12.

Until ability items exist, a row links its Bestiary journal page, or cites the SRD section for an Animal List family
(Giant Spider, Viper), and every row says Manual. Ability batches relink their rows to the items and flip them. The
reclassifications to Manual (Dragon breath exhaustion, Duck swimming, Elemental same-element concealment) are recorded on
the Overview page.

**Blocked by:** 01 (Coverage journal: Overview, spell pages and the pack-content test)

**Status:** ready-for-agent

- [ ] The journal has a Creature Abilities page with 88 rule-family rows following the row contract.
- [ ] Rows link Bestiary journal pages by UUID; Animal List families cite the SRD section.
- [ ] Profile-data rows say to author the creature's statistics.
- [ ] Every row states what the system calculates and a concrete manual workflow, rewritten from the bestiary draft for
      players and GMs.
- [ ] The Overview page records the three creature reclassifications and the creature source ambiguities (werewolf
      rounding and damage, gargoyle's unsigned modifier, ingested-versus-sting venoms, pain spirit wording, healing
      spirit HP, vampire hit locations, elemental attack values).
- [ ] The pack-content test parses creature rows: 88 rows, valid treatments, and each journal link resolves to an
      existing Bestiary page. Removing a row fails the test.
- [ ] The bestiary inventory draft gets a note at its top pointing to the page and is no longer maintained.
- [ ] Manual: the spec's first Cov row passes in full (164 spell rows and 88 creature rows), and a creature row's link
      opens its Bestiary page.
- [ ] `yarn build:docs` output is included, and `yarn test`, `yarn lint` and `yarn build` pass.
