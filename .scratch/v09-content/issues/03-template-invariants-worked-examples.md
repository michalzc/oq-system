# 03: Template invariants and worked-example harness

**What to build:** A maintainer adds one table row, (pack item, magnitude, choices, entered values, fixture actor) →
expected values, and the test proves what that pack template really does through the same pure modules the game uses.
Protection at magnitude 3 gives +3 AP and Shield at magnitude 2 gives its AP, starting from the pack sources. A template
with an unknown change target, or an item marked Manual that carries a numeric change, fails the test. This ticket
gives every content batch one place to add its acceptance examples, so no batch has to build the harness first. See
[the spec](../spec.md), sections "Testing Decisions" (seam 1) and "Template authoring rules", and user stories 12–16, 22.

The harness reads the pack sources and runs them through the application track's snapshot resolution and the actor-effects
track's effect-contributions module, in plain Node with stubbed globals. Its blocker also makes **Apply effect** available
on non-rolled Divine cards, which every spell batch needs: each one contains Divine spells.

**Blocked by:** 01 (Coverage journal: Overview, spell pages and the pack-content test),
[application 06 (Non-rolled Divine casts offer Apply effect; Shield template)](../../v09-application/issues/06-divine-cast-apply.md)

**Status:** ready-for-agent

- [ ] The pack-content test gains the template invariants: only known change targets, operations and selectors; template
      ids unique and stable; template icons themed and existing; per-magnitude values only on spells.
- [ ] It checks treatments against content: an item with an Automated or Assisted row carries at least one numeric
      change, and an item whose rows are all Manual carries none. A reminder template doesn't count as numeric.
- [ ] The worked-example table runs a pack item at a magnitude, with choices and entered values, against a fixture
      actor, and asserts the resulting actor values.
- [ ] Protection and Shield are the first rows, and their coverage rows agree with their templates.
- [ ] A failure names the pack item and the broken rule or example.
- [ ] The test covers the effect template conventions in the spec: a template's duration, rules text and stable id are
      readable from the pack source.
- [ ] Manual: change a pack template to an unknown target and see the test fail naming the item; restore it.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
