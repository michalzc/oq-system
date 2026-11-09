# 05: Sp2a: standard-skill selector and skill test spells

**What to build:** A caster applies Thunder's Voice to a hand-built NPC whose skill is simply called "Influence", and its
Influence tests gain +20 without anyone choosing the skill. An NPC with no Influence shows a missing target and no
contribution. Fanaticism raises Close and Unarmed Combat by 20 and Persistence by 50. Applying Demoralise to a Fanatic
shows Fanaticism in the conflict review, and ending it leaves Close Combat 65 at 32. First slice of chunk **Sp2**; see
[the spec](../spec.md), sections "Template capability extensions" (standard-skill selector) and "Spell batches", and user
stories 13–19, 22, 28–34.

A skill-test selector can name a standard skill by the same name slug the system already uses to find a spell's casting
skill, and matches the recipient's skill with that slug. It works on templates and owner passives and survives copies to
other actors. It deliberately differs from the identity binding in application 10: that one rejects name matching for a
skill the applier picked. Before writing code, check that the slug lookup is available during effect preparation for
unlinked token actors.

**Blocked by:** 03 (Template invariants and worked-example harness),
[actor-effects 07 (Group/all selectors, skill multipliers, combat order)](../../v09-actor-effects/issues/07-group-selectors-multipliers-combat-order.md),
[application 04 (Conflict review: duplicates, replace and end-marks)](../../v09-application/issues/04-conflict-review.md)

**Status:** ready-for-agent

- [ ] The skill test modifier target gains a standard-skill selector in the data model, and the editor offers the SRD
      basic skills as a fixed list.
- [ ] The selector matches by slug on any recipient. No match shows a missing target with no contribution on the applied
      effect.
- [ ] The selector works on templates and owner passives, and after copying to another actor.
- [ ] The pack's Thunder's Voice, Radiant Appearance, Stink Bomb, Fanaticism, Berserk, Demoralise and Glow carry the
      templates in the spec's Sp2 table, keeping their item ids. Rules text names conflicting spells so the conflict
      review shows them.
- [ ] Effect-contributions module tests: slug match, no match, hand-built NPC skill, passive after a copy.
- [ ] The pack-content test checks that standard-skill selectors name a slug of a basic-skills pack skill.
- [ ] Worked examples: the spec's Sp2 rows for Fanaticism, Thunder's Voice (found and missing) and Demoralise.
- [ ] These spells' coverage rows flip to their target treatments.
- [ ] The glossary gains **standard skill**, and the Magic documentation page explains the selector.
- [ ] Manual: on fresh pack copies, the spec's Sp2 rows (except Fear) pass on a character and a hand-built NPC, linked
      and unlinked, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
