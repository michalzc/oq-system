# 07: Ability templates, Use ability and Apply on rolled abilities

**What to build:** A Referee gives a Ghoul's Howl ability an "apply to recipient" template (Demoralise numbers plus
reminders) next to any owner passives. On the actor sheet the ability, which has no test formula, now has **Use
ability**: it posts a card with the ability's rules text and Apply effect, with no roll, no MP and no toggling of the
ability's own passives (an ability with a +2 AP passive leaves the owner's AP unchanged). Applying to two targets halves
their combat skills and shows the reminders. A rolled creature ability's success or critical card offers Apply effect
like a spell card. Abilities without templates keep posting their description, and range, resistance and who is
affected stay the Referee's call. Second and last slice of chunk **App4**; see [the spec](../spec.md), sections
"Effect templates" and "Use ability and non-rolled casts (App4)", and user stories 42–45, 47, 48.

Special abilities gain the "apply to recipient" role in their Effects section next to "owner while active". Ability
templates have fixed values only (no per-magnitude). Use ability and rolled-ability successes write the same cast
snapshot as spells.

**Blocked by:** 03 (Application receipts, repeat clicks and the double-submit guard), [actor-effects 16 (Creature
ability passives)](../../v09-actor-effects/issues/16-creature-ability-passives.md) (closes Itm2, gives abilities their
Effects section)

**Status:** ready-for-agent

- [ ] Special-ability Effects sections offer the "apply to recipient" role; its templates take fixed values only.
- [ ] Abilities with templates and no test formula show Use ability on character and NPC sheets; it posts a card with
      rules text and snapshot, and never rolls, charges MP or toggles the ability's passives.
- [ ] Successful and critical rolled-ability cards with templates show Apply effect; failures don't.
- [ ] Abilities without templates keep posting their description.
- [ ] Applied-effects module tests: ability snapshot resolution with fixed values.
- [ ] The Magic documentation page explains Use ability and has a Ghoul Howl recipe built by hand.
- [ ] Manual: the spec's App4 rows "Ghoul with hand-built Howl; Use ability; Apply to two targets" and "Ability with
      passive +2 AP and a template; Use ability" pass, plus a rolled ability success and failure.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
