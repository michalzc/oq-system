# Define the optional SRD spell refresh macro

Labels: wayfinder:grilling
Type: grilling
Parent: ../map.md
Blocked by: 09

## Question

What should a manually invoked macro do when adopting refreshed official SRD spell content on existing world actors,
and what does "replace" mean for identity, actor-specific casting state and user edits?

The user accepted leaving existing spells untouched on upgrade, and suggested a macro to replace SRD spells on world
actors, explicitly never automatically. Define reliable SRD-source identification, actor scope and authority, preview
and confirmation, overwritten versus retained fields, repeat execution and partial failure behavior. Decide whether
existing embedded IDs are kept through in-place refresh and how custom edits or unrecognized effects are skipped or
explicitly replaced without claiming to migrate those effects. Missing or ambiguous provenance must not silently
identify a spell by its name. Decide handling of duplicates, renamed source-linked spells, world-item intermediates,
unlinked synthetic actors and absent/changed compendium definitions.

Preserve or explicitly adjudicate learned magnitude, casting skill reference and Divine remaining magnitude: refresh
must not unexpectedly refill a spent spell, reset magnitude to pack defaults or break existing item references. The
macro must not cast, charge MP, apply recipient effects or migrate old user/module effects. Define a small complete
manual acceptance workflow and meaningful checks for the later implementation; do not implement the macro here.

## Comments

Newly surfaced while resolving compatibility. Core source provenance and current resource/spell-state observations
are captured in [Migration and compatibility evidence](../compatibility-evidence.md). Exact matching, replacement and
preview policies are not yet approved. This ticket exists to settle the proposed optional tool without widening the
compatibility answer into an unreviewed bulk replacement specification.

[Choose v0.9 migration and compatibility policy](09-migration-and-compatibility.md) now settles the manual-only adoption
boundary, excludes unsupported pre-v0.9 effect migration, and documents the confirmed source-overflow behavior.
[Finalize reviewable chunks and release acceptance criteria](08-release-chunks.md) waits for this macro decision.

Factual follow-up: normally imported official spells point to `Compendium.oq.oq-system-spells...` through
`_stats.compendiumSource`; lineage survives ordinary edits and does not mean the copy is unmodified. Older custom-drop
imports may lack provenance (`docs/migration-issues.md:95–109`), so an exact-source-only default would need a manual
fallback for some real SRD copies. Whether to offer that fallback, how to approve it, and whether edited spells are
skipped or overwritten are live choices here. Native drop/import is not selective refresh. Broad delete/recreate can
reset Sorcery magnitude or Divine remaining expenditure; exact retained fields and embedded identity must be decided.
