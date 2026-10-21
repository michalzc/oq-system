# Plan v0.9 effects as reviewable, playable increments

Labels: wayfinder:map

## Destination

An evaluated v0.9 release plan with ordered implementation chunks small enough to review and manually test in one
sitting. Each chunk defines observable behavior, dependencies, manual acceptance scenarios, and its automation boundary.
Implementation starts in a later effort, after the relevant decisions are resolved.

## Notes

- Source proposal: [Buffs and Active Effects](../../temp/effects.md).
- [Evaluation and candidate delivery chunks](assessment.md) is the supporting draft, not an approved specification.
- Use the wayfinder, grilling, and domain-modeling skills. Read `CLAUDE.md`, `GLOSSARY.md`, and the local tracker guidance.
- This is a tabletop aid. Prefer visible rules reminders and explicit human actions when automation requires interpreting
  intent, tracking the next applicable roll, resolving opposed tests, or modeling complicated event chains.
- Confirmed with the user: produce both a release plan and a decision map; provide ready-to-use templates for
  straightforward SRD spells and bestiary abilities, with an explicit inventory of manual cases.
- Confirmed with the user: next-roll relevance and clearing remain human actions. Supported numeric contributions can
  use matching conditional choices in the test dialog; automatic consumption is deferred.
- User's application baseline: an **Apply effect** button on a spell/ability chat card after a successful roll.
  Opposed rolls are not currently supported; the plan must not depend on adding them.
- Planning only: implementation and compendium authoring follow this map. Candidate chunks remain provisional until
  their decision prerequisites are resolved.
- The local tracker uses `Type:` for ticket type, absence of `Status:` for open/unclaimed, `Status: claimed` to claim,
  `Status: resolved` to close, and `Blocked by:` for dependencies. Only wayfinder labels belong on these tickets.

## Decisions so far

- [Choose effect mechanics and the spell/ability coverage boundary](issues/01-supported-mechanics.md): numeric effects,
  direct-formula skill matching, per-test conditional selection, and the SRD coverage boundary are agreed.

## Not yet specified

- Exact migration and compatibility work once the effect representation, item references, and stored-spell ownership
  are chosen. Preserve existing document IDs and world data; do not guess the migration shape now.
- Additional review splits exposed by a concrete sheet/application flow or by the first representative implementation.

## Out of scope

- Implementing the release as part of this planning map.
- Automatic interpretation/consumption of next-applicable-roll benefits, including disease-only or purpose-based tests.
- Adding opposed-roll resolution as a prerequisite for applying effects.
- Recursive/transitive skill-formula analysis, stored skill-basis metadata, and characteristic inference from names.
- A general engine for line of sight, auras, AI behavior, resistance resolution, attack triggers, or damage immunities.
  Such rules must remain representable as reminders even when their adjudication is manual.
