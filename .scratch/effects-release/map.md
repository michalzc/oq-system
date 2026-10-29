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
- [Define excess HP/MP and temporary magical resource behavior](issues/02-resource-semantics.md): separate buffers are
  spent first; ordinary healing, signed maximum adjustments, Vigour's grant cap and manual Tap bookkeeping are agreed.
- [Choose duration, duplicate, and conflicting-effect handling](issues/03-lifetime-and-duplicates.md): core clocks,
  human conflict decisions, and source-specific temporary-point pools with FIFO spending and selective cleanup are agreed.

- [Specify Apply effect on spell and ability result cards](issues/04-chat-card-application.md): historical cast/damage
  snapshots, recipient-owner/GM application, explicit repeats, per-recipient outcomes and non-rolled use cards are agreed.

- [Separate item-local effects, passive transfer, and applied templates](issues/05-item-ownership-and-transfer.md): three
  roles, mixed passive/use abilities, state gating, independent applications, identity bindings and copy/import behavior
  are agreed.

- [Choose OpenQuest conditions and useful manual reminder workflows](issues/06-conditions-and-reminders.md): curated
  reminder markers, source-owned numbers, source-aware controls, unchecked test choices and quick-roll dialogs are agreed.

- [Bound magic point stores and stored-spell casting for v0.9](issues/07-enchanted-items.md): item stores, explicit
  single-source payment, recoverable casts and portable Personal Magic charms are agreed; other enchanted kinds stay manual.

- [Choose v0.9 migration and compatibility policy](issues/09-migration-and-compatibility.md): preserve supported data,
  recover stored resource excess, leave unsupported legacy effects alone and adopt official templates explicitly.

- [Define the optional SRD spell refresh macro](issues/10-srd-spell-refresh.md): GM-only, manually invoked in-place
  refresh of pack-linked spells on world actors/items/unlinked tokens; learned/spent state kept, unlinked spells excluded.

- [Finalize reviewable chunks and release acceptance criteria](issues/08-release-chunks.md): 25 chunks across Res, Fx,
  Itm, App, Clk, Cnd and Ench tracks with a dependency graph; Ench and the refresh macro may slip; PR per chunk to
  master; content in mechanic-ordered batches; one spec per track for the handoff.

## Not yet specified

None. The map is complete; further chunk splits are left to the spec/ticket flows and implementation, as recorded in
[Finalize reviewable chunks and release acceptance criteria](issues/08-release-chunks.md).

## Out of scope

- Implementing the release as part of this planning map.
- Automatic interpretation/consumption of next-applicable-roll benefits, including disease-only or purpose-based tests.
- Adding opposed-roll resolution as a prerequisite for applying effects.
- Recursive/transitive skill-formula analysis, stored skill-basis metadata, and characteristic inference from names.
- Automatic Tap characteristic drain/MP decay and negative-HP tracking; explicit buffer bookkeeping and zero-floor HP
  are sufficient for this release.
- A general engine for line of sight, auras, AI behavior, resistance resolution, attack triggers, or damage immunities.
  Such rules must remain representable as reminders even when their adjudication is manual.
- Manual choice/reordering of temporary-point spending and a general automatic effect-conflict engine; the
  [duration and conflict decision](issues/03-lifetime-and-duplicates.md) fixes the v0.9 boundary.
- Dedicated crafting, matrix/potion/scroll/blessed-item use and special-reservoir automation beyond the bounded
  [enchanted-item scope](issues/07-enchanted-items.md); these retain documented manual workflows for v0.9.
- Automatic multi-source MP allocation, store fallback and equipment-slot/attunement limits; single-source payment and
  unlimited readied ordinary items are the agreed release boundary.
- Migration or compatibility support for pre-v0.9 user/macro/module-created ActiveEffects, including inferred
  effect roles, status/grant conversions and repair tooling. The system had no supported effects feature before v0.9;
  leave those stored definitions alone without promising continued behavior. This boundary is recorded in
  [migration and compatibility decision](issues/09-migration-and-compatibility.md).
- A proper bestiary compendium of creature actors. v0.9 ships the special-ability item pack as its building blocks; the
  journal bestiary stays as the reference until that later effort
  ([release chunks decision](issues/08-release-chunks.md)).
