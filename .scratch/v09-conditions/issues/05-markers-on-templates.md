# 05: Markers on effect templates and applied effects

**What to build:** A Referee gives a Demoralise spell template the Demoralised reminder, its combat-skill change and a
marker from the Conditions field. A caster succeeds, someone clicks **Apply effect**, and the recipient's applied
effect carries the marker: the icon appears on the token and tracker and the condition shows in the sheet summary.
Editing or deleting the spell afterwards changes nothing about what the card applies, markers included. Ability
templates carry markers the same way. This is the step the spec assigns to "whichever of Cnd1 and App1 lands second";
it belongs to neither chunk alone. See [the spec](../spec.md), section "Markers and standalone markers" (markers on
templates), user story 13, and the [application spec](../../v09-application/spec.md), section "Historical cast
snapshot".

The cast snapshot records each template's markers alongside its resolved changes, and the applied effect is created
with them. Apply effect still reads only the snapshot. Cards created before this ticket have no markers in their
snapshot and apply effects without markers.

**Blocked by:** 03 (Conditions field in the effect editor),
[application 02 (Apply effect from a successful spell card)](../../v09-application/issues/02-apply-effect-single-recipient.md),
which creates the cast snapshot and applied effects

**Status:** ready-for-agent

- [ ] The Conditions field is available on every "apply to recipient" template, so spell templates have it now and
      ability templates ([application 07](../../v09-application/issues/07-ability-templates-use-ability.md)) get it
      without further work, whichever lands first.
- [ ] The cast snapshot records each template's markers; the applied effect carries them.
- [ ] Editing or deleting the template after the cast does not change the markers applied from that card.
- [ ] A snapshot without markers (older cards) applies without error and without markers.
- [ ] Applied-effects module tests: snapshot resolution keeps a template's markers; a snapshot without markers
      resolves to none.
- [ ] The Magic documentation page mentions markers on templates.
- [ ] Manual: apply a template carrying Paralysed from a card; the recipient shows the Paralysed icon, chip and row
      marker; delete the spell and apply the card again to a second recipient with the same result.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
