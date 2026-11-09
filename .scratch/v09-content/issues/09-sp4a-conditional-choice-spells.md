# 09: Sp4a: conditional choice spells

**What to build:** A character with Coordination 2 tests Athletics and sees +20 offered unchecked, labelled "DEX-based
use", while Dodge gets +20 automatically and combat order rises. Ironmind, Truth Seeker, Second Sight, Resist (Element)
and Create Godform appear unchecked, with their condition text, on the tests they can match. Shield 2 now offers +20
"against malign magic" on Persistence alongside its AP. First slice of chunk **Sp4**; see [the spec](../spec.md), section
"Spell batches" (Sp4 table), the note on the resistance group in "Further Notes", and user stories 13–19, 22, 47, 49, 52,
54.

This is template authoring only, with no new capability. Everything that applies together goes in one template:
Coordination's order, Dodge and Athletics choice are three changes of one template. Resistance-group choices also appear
on Dodge tests by design, because they're unchecked and the person rolling judges relevance.

**Blocked by:** 05 (Sp2a: standard-skill selector and skill test spells),
[actor-effects 08 (Conditional choices and reminders in the test dialog)](../../v09-actor-effects/issues/08-conditional-choices-and-reminders.md)

**Status:** ready-for-agent

- [ ] The pack's Coordination, Ironmind, Truth Seeker, Second Sight, Resist (Element) and Create Godform (Deity) carry the
      templates in the spec's Sp4 table, keeping their item ids.
- [ ] Shield gains its resistance-group conditional, if its template shipped with AP only.
- [ ] Rules text carries each remainder: Truth Seeker excluding other spell bonuses, Resist's damage reduction as a
      reminder, Create Godform's temporary spells and knowledge.
- [ ] Truth Seeker carries no clock and says how it ends.
- [ ] Worked examples: Coordination 2 and the spec's Shield 2 row, with choices selected and unselected.
- [ ] These spells' coverage rows flip to their target treatments; Coordination's Automated parts are described in its
      Assisted row.
- [ ] Manual: on fresh pack copies, the spec's Sp4 Shield row passes, and the Coordination part of its Athletics row, on
      a character and an NPC with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
