# 28: Rel: release-acceptance sessions and the v0.9 release

**What to build:** The maintainer runs a short end-to-end session on a fresh world, covering each track's headline scenario
on a character and an NPC, and the same on a copy of a v0.8.2 world, then bumps the version and cuts v0.9 with release
notes collected from every track. This is chunk **Rel**, a code-free ticket; see [the spec](../spec.md), section "Release
checklist (Rel)", and user stories 121–123.

It needs a person: the sessions use a real v0.8.2 world copy and the last step publishes a release.

**Blocked by:** 01–25 in this folder; every ticket in [resources](../../v09-resources/issues/),
[actor-effects](../../v09-actor-effects/issues/), [application](../../v09-application/issues/) and
[conditions](../../v09-conditions/issues/). The [enchanted](../../v09-enchanted/issues/) tickets and tickets 26–27 may
slip to 0.9.x and don't gate this one; the session and notes cover them only if they shipped.

**Status:** ready-for-human

- [ ] Fresh world: each track's headline scenario from the release chunks decision passes once, in order, on a character
      and an NPC, including one spell from each content batch and one ability from each ability batch.
- [ ] Copy of a v0.8.2 world: excess HP/MP is recovered into one manual pool once; owned spells are unchanged after the
      upgrade and pack rebuild; pre-v0.9 effects are still listed and untouched; old cards are readable without Apply.
- [ ] If Ref shipped, a deliberate refresh run on the upgraded copy behaves as decision 10 states.
- [ ] Release notes cover the replaced status list, Blinded and Invisible no longer changing vision, out-of-palette
      statuses, five-second rounds, the new compendium and coverage page, and recoverable payment if Ench2 shipped.
- [ ] The manifest version is bumped and the release is cut through the existing workflow.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass on the release commit.
