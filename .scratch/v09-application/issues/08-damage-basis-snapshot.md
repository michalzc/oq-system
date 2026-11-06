# 08: Damage basis on test cards

**What to build:** A player attacks with a 1D8 sword, Damage Modifier +1D4, and ticks a conditional +2 in the test
dialog. The attack succeeds. They delete the sword, the effect behind the +2 ends, and they click the card's damage
button: the damage dialog is prefilled with 1D8 +1D4 +2 and still editable, and an edited formula is shown as a manual
adjustment. A fresh attack uses current values and its own choices. On a pre-v0.9 attack card the damage dialog and
resulting card say that current weapon values were used. This is chunk **App5**; see [the spec](../spec.md), section
"Damage basis (App5)", and user stories 49–54.

Every test card that offers follow-up damage (weapon and rolled-ability tests) records a **damage basis** in its system
flags: normal weapon dice, whether the Damage Modifier applies and its resolved value, item-local and actor-wide
unconditional damage terms with sources, selected conditional damage contributions with sources, test outcome, and
actor and item identity. The damage action rolls the basis and needs no live item. Components stay distinguishable on
the damage card for later True Weapon and manual immunity handling; no new damage rules.

**Blocked by:** [actor-effects 08 (Conditional choices and reminders in the test
dialog)](../../v09-actor-effects/issues/08-conditional-choices-and-reminders.md), [actor-effects 10 (Actor-wide weapon
damage addition)](../../v09-actor-effects/issues/10-actor-wide-weapon-damage.md), [actor-effects 13 (Item-local weapon
damage)](../../v09-actor-effects/issues/13-item-local-weapon-damage.md)

**Status:** ready-for-agent

- [ ] Successful weapon and rolled-ability test cards record a damage basis with separate components and sources.
- [ ] The card's damage action rolls from the basis after the weapon is edited or deleted, an effect ends or the Damage
      Modifier changes. Permission: a GM or the owner of the recorded actor.
- [ ] The damage dialog is prefilled with the recorded formula and stays editable; an edit is marked as manual on the
      damage card.
- [ ] The damage card keeps weapon dice, Damage Modifier, item-local, actor-wide and conditional terms distinguishable.
- [ ] Pre-v0.9 cards keep the live-item damage action; dialog and card state that current weapon values were used.
- [ ] Roll test file: basis capture from weapon damage, Damage Modifier and selected conditional contributions; the
      follow-up formula is built from the basis independently of current values.
- [ ] The Rolls documentation page explains the damage basis and old-card damage.
- [ ] Manual: every App5 row of the spec's acceptance table passes, plus a fresh attack after the change using current
      values.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
