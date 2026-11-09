# 17: SRD Creature Abilities compendium and rules-text items, Basilisk to Mummy

**What to build:** A Referee opens the new **SRD Creature Abilities** compendium, finds a folder per creature, and drags
Dragon Breath onto an NPC. The sheet shows the ability with its rules and exact SRD exceptions, and a Source link that
opens the Bestiary page. No value changes. First slice of chunks **Ab5a and Ab5b**, and the ticket every ability batch
builds on; see [the spec](../spec.md), sections "Creature ability pack" and "Ab5a, Ab5b Manual creature abilities", and
user stories 74–76, 79, 80, 97.

These items carry no templates, so they need nothing from the effects tracks. The six abilities that leave a state on a
target are ticket 19's job. Items are `specialAbility` items named for the ability, not prefixed with the creature, with
no test formula unless the SRD gives the ability its own test. Group related rules into one item, using the "Reusable
special-ability item authoring work" section of the bestiary inventory. Profile numbers are never items.

**Blocked by:** 02 (Coverage journal: Creature Abilities page)

**Status:** ready-for-agent

- [ ] The compendium is registered in the manifest's pack list and pack folder, with the same ownership as the other
      packs, and is built by `yarn build:packs`.
- [ ] It has one folder per creature or creature group, following how the spells pack expresses folders.
- [ ] Rules-text items exist for the remaining Manual rule families from Basilisk to Mummy, including Dragon breath, Duck
      swimming and Elemental concealment, and excluding the Assisted families in tickets 20–23 and the abilities in
      ticket 19.
- [ ] Each description starts with the rules summary, then a Source link to the Bestiary page by UUID.
- [ ] Items carry no default-actor flag, so they aren't added to new actors.
- [ ] The pack-content test also reads ability items: each appears in at least one row, and each journal link resolves.
- [ ] These coverage rows now link their items and stay Manual.
- [ ] Manual: drag an item onto a character and an NPC; rules and Source link work, no value changes, a new actor doesn't
      receive it.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
