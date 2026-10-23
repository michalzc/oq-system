# Choose v0.9 migration and compatibility policy

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md
Blocked by: 02, 03, 04, 05, 06, 07

## Question

What compatibility work is needed for officially supported pre-v0.9 data when adding temporary points, effects,
conditions, stored spells and casting snapshots?

The user explicitly excludes migration/support of pre-existing user/macro/module-created ActiveEffects. OQ has not
provided an officially supported effects feature before this release. Do not convert their roles, payloads, bindings,
status sources, clocks or grant history, or build repair/compatibility machinery for them. Leave their stored definitions
alone rather than deliberately deleting them; continued behavior is outside the release contract. Core capability to
store/apply some effects is not a prior OQ support promise.

Focus on ordinary actor/item data, recoverable above-max HP/MP, manual modifiers/formulas/skill references, old chat
results and adoption of new official compendium templates. There is no prior supported pool/store/charm/snapshot schema
to convert. Preserve existing IDs and supported values; do not infer enchantments from names or descriptions. Future
v0.9 save/reload/copy/import preservation contracts remain in force and are distinct from migrating unsupported effects.

Record the minimal conversion/initialization matrix, before/after examples and checks required by those supported
workflows. Include world actors/items, unlinked actors' own resource data, world compendia and later imports where
supported-data conversion is required. Reuse the migration framework and existing retry/GM-skip behavior; add new steps
rather than editing released migrations. No general legacy-effects adapter, repair dashboard or rollback framework.
Exact implementation/schema follows later. The remaining live choices concern excess-point attribution and how owners
adopt the newly supplied official templates on existing spell/item copies.

## Comments

[Define excess HP/MP and temporary magical resource behavior](02-resource-semantics.md),
[Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md),
[Specify Apply effect on spell and ability result cards](04-chat-card-application.md), and
[Separate item-local effects, passive transfer, and applied templates](05-item-ownership-and-transfer.md) fix the
resource/application preservation contracts and the effect ownership/reference boundaries.
[Bound magic point stores and stored-spell casting for v0.9](07-enchanted-items.md) must settle its data ownership first.
[Finalize reviewable chunks and release acceptance criteria](08-release-chunks.md) depends on this compatibility decision.

[Choose OpenQuest conditions and useful manual reminder workflows](06-conditions-and-reminders.md) adds the curated
palette and explicit marker/special-status boundary. Include existing core status IDs, marker-only versus source-linked
effects, vision-related status mappings and Dead/defeated behavior in the compatibility matrix. Preserve stored effects
without silently deleting unsupported palette entries, inventing numeric payloads or bulk-removing independent sources.

[Bound magic point stores and stored-spell casting for v0.9](07-enchanted-items.md) resolves its ownership prerequisite:
one store and self-contained named Personal Magic spell entries on a physical item, with saved balance/capacity and
reuse/expended states. The current equipment/spell schemas contain no native store/stored-spell fields. Do not fabricate
a legacy schema, infer enchantments from names/descriptions or turn ordinary learned spells into charms. Preserve
unknown third-party data; decide defaults/activation explicitly and keep physical item IDs/state intact. Include new
entry identities and recoverable payment/expenditure state in save/copy/import expectations without charging the
original actor, recharging a store, clearing an expended spell or rerolling. The pending-operation implementation
schema is not chosen by this decision. Current zero-clamped underpayment is deliberately superseded; legacy/incomplete
cards must not acquire invented payment records or be charged retroactively. This ticket is now the open frontier.
## Investigation and first decision round — superseded by scope clarification

[Migration and compatibility evidence](../compatibility-evidence.md) records current source fields, empty authored
pack effects, phase/role ambiguity, source-only overflow, native IDs, incomplete historical cards and framework gaps.
No world database was inspected or modified. This ticket remains claimed; the following are recommendations awaiting
human decisions, not a resolution.

1. Recover legacy above-max HP/MP from source values using the effective normal maximum under corrected supported
   calculations, not the stale stored max or clamped prepared current. Put excess in one identifiable manual pool per
   resource, without guessed Vigour/Tap attribution or expiry. Preserve total points exactly and make conversion repeat-safe.
   Existing valid new-format pools/order/deadlines remain unchanged, with no second recovery grant.
2. Preserve learned/manual characteristic, skill, resource and formula data. Establish existing active effects as a
   baseline without retroactive grants/current-point adjustments just for upgrading or loading. Future real transitions
   use the agreed delta rules; corrected derived calculations can change displayed maxima/skills, explained in release notes.
3. Carry recognized actor effects and unambiguous owner-transferred effects into corresponding roles, keeping IDs,
   changes, disabled state and clocks. Apply agreed equipped-state gating to owner passives and report changed access.
   transfer:false alone is insufficient to choose local versus dormant-template intent; retain ambiguous definitions for
   explicit role selection without newly activating them. Unsupported changes stay preserved for review, no invented intent.
4. Preserve exact overlapping native status identities and source effects; retain out-of-palette statuses as inspectable
   legacy/custom reminders. No numeric payload guessing or restrain-to-Held/Entangled/Stuck inference. Apply agreed
   reminder-only vision policy to legacy blind/invisible too, retaining explicitly saved token settings and Dead/defeated.
   Known exact themed icon mappings may change paths; unmatched custom images remain intact.
5. Preserve existing name-slug skillReference and formula behavior rather than migrating all skill links. New selected
   effect targets require explicit trustworthy identity; missing/ambiguous bindings stay visibly unresolved for manual
   selection. Never guess by name or modify learned skills to make an effect match.
6. Keep historical cards readable, actual rolls/totals usable, and no retroactive casting charge/entry expenditure.
   Incomplete cards gain no invented snapshots/Apply action. Old live-item follow-up damage becomes an explicit
   current-item/manual fallback with visible context, not purported historical damage; source missing means manual entry.
7. Initialize absent store/charm/new-effect data inertly, preserve ordinary items/spells and third-party data, and do not
   infer enchantments or sources from names/descriptions/modifiers. Rebuild system packs with stable IDs and new content,
   but do not automatically overwrite/update existing actor/world copies; owner/GM explicitly adopts refreshed templates.
8. Apply the same safe compatibility to world actors/items/effects, unlinked synthetic resources/items/effects, world
   compendia (restore locks) and older data imported later. Extend traversal/source-load coverage as necessary; global
   world version alone is insufficient. Preserve inherited/tombstoned delta identity. Module packs stay untouched.
9. Preserve retry-by-default and explicit GM skip, with inspectable per-record unresolved/failed state so advancing the
   world version never falsely certifies skipped data. Guard only affected new automation until repair, allowing manual
   use/inspection. Report affected documents and changes without a separate general migration dashboard. Preserve unknown
   newer-format data and avoid guessing/downgrading it. No automatic rollback or retroactive resource reconstruction.

After this frontier is answered, record before/after fixtures and any remaining ambiguity exposed by the choices.

## User clarification: pre-v0.9 effects are unsupported

The user explained that the system does not currently support ActiveEffects as a feature. Any existing effects were
created through macros or third-party modules, and the user does not intend to support or migrate them. This supersedes
the proposed compatibility expansion above; the first question round was not approved.

Consequences of this explicit scope decision:

- Exclude conversion/adoption of all pre-existing user/module effect roles, numeric payloads, conditions, bindings,
  durations, temporary grants and supposed transitions. No inferred legacy grants, transfer-role mapping, equipment
  eligibility grandfathering, effect-specific repair flags, icon/status semantic migration or behavior guarantee.
- Do not deliberately erase or bulk-disable these stored definitions as cleanup. Leaving data alone is not a promise
  to support or preserve its runtime behavior through the new preparation pipeline or palette.
- Existing core marker definitions are also ActiveEffects; no separate legacy-marker migration adapter is required.
  New official palette behavior and source-aware controls still follow the conditions decision. Preserve ordinary
  explicit token settings and saved combatant defeated state; no mass token rewrite is implied by the new palette.
- Native manual characteristic/skill/resource modifiers and formulas remain supported user data; never turn them into
  effects or infer a spell history. Likewise preserve current skillReference behavior, ordinary item/spell data and IDs.
- Old chat cards remain on the already-agreed incomplete-card fallback: retain known rolls/totals, no invented Apply
  snapshot or retroactive charge, and clearly distinguish a live-current-item/manual damage action from historical data.
- There is no supported pre-v0.9 pool/store/charm schema. New data starts absent/inactive; names, descriptions and unknown
  third-party data do not trigger inference. Future new-format save/copy/import correctness remains required by the
  resolved resource/application/ownership/charm decisions, without a legacy-effects conversion layer.
- Keep existing migration retry/explicit-GM-skip behavior; do not add the previously proposed general per-effect failure
  state/reporting/repair machinery. Ordinary supported-data migration errors still need to be reported and retry-safe.

### Simplified live decision round — awaiting choices

Q1. For existing stored HP/MP above the ordinary maximum, preserve the excess in one manual temporary-point pool per
resource. Example: stored HP 15, supported ordinary maximum 10 becomes ordinary 10 plus temporary 5. No source/expiry
is invented and no repeat grant on reload/import. This refines the already-agreed excess-preservation requirement.

Q2. Preserve existing owned/world spell and item copies, including their edits; owners/GM explicitly adopt refreshed
compendium templates to gain the new official effects. Rebuild official compendia with stable IDs, but do not auto-merge
new effect definitions into existing copies or overwrite descriptions/modifiers. This decides template adoption,
independently of the excluded third-party effect migration.

No resolution answer has been recorded; this ticket stays claimed pending these choices.

### Simplified round confirmed and requested check completed

The user accepted Q1 subject to verifying that above-max points can remain stored, and Q2 with an optional manually
invoked macro to replace SRD spells on world actors, never automatically. Source inspection confirms that HP/MP current
has no schema upper bound; preparation caps the displayed/prepared value without necessarily changing source. Some
later controls persist capped values, so only still-recorded excess can be recovered. This is a code-level possibility,
not an assertion about any particular world database.

The additional macro's scope is sharp enough for a separate decision:
[Define the optional SRD spell refresh macro](10-srd-spell-refresh.md). Its precise matching/replacement behavior is not
silently approved by this compatibility answer.

## Answer

Resolved with the user after narrowing the initial compatibility proposal to officially supported pre-v0.9 data.
The original broad question round was superseded, not accepted. Native Foundry ability to store/apply some effects is
not a prior OQ feature-support contract. [Compatibility evidence](../compatibility-evidence.md) records facts and gaps.

### Scope boundary

Pre-v0.9 user/macro/third-party ActiveEffects are **unsupported and are not migrated**. Do not classify their roles,
rewrite numeric payloads, bind targets, infer source grants, repair clocks, migrate status/icon semantics, or build
compatibility/repair tooling for them. Do not deliberately delete or bulk-disable their stored definitions as cleanup.
Leaving their data alone does not guarantee their runtime behavior after changes to preparation or the new palette.

This includes existing core marker ActiveEffects: there is no separate legacy-status adapter. New official palette,
source-aware controls and reminder-only vision behavior follow the conditions decision. Preserve explicitly saved
ordinary token settings and combatant defeated state rather than performing a mass scene rewrite. Unsupported old
effect behavior and module integration are outside acceptance requirements.

The system has no supported old temporary-pool, grant-linkage, target-binding, MP-store, charm-entry or historical
snapshot schema. Do not fabricate migrations for those hypothetical formats or infer them from names/descriptions.
The future v0.9 feature's agreed persistence, copy/import and exactly-once behavior remains required; this boundary
removes a legacy-effects adapter, not the new feature's own state preservation.

### Supported-data conversion and initialization matrix

| Existing data | v0.9 policy | Boundary |
| --- | --- | --- |
| Ordinary HP/MP within normal maximum | Keep current points and supported native modifiers unchanged; initialize no temporary grant. | No retroactive healing, expenditure or guessed spell history. |
| Stored current HP/MP above reliably calculated normal maximum | Ordinary current becomes min(stored current, normal maximum); excess becomes one identifiable manual temporary-point pool per resource. | Preserve total available points; no attribution to Vigour/Tap, no clock or invented original grant amount. |
| Stored max zero/stale; prepared current capped | Read still-available source current and compute ordinary capacity from supported native characteristics/modifiers. | Stored max and prepared current are not migration inputs sufficient on their own. |
| Excess already overwritten by a capped update | Keep actual remaining stored values. | No reconstruction from old UI, names, chat or an unsupported effect. |
| Native characteristic/skill/resource modifiers, advancement and formulas | Preserve these as entered. | Do not extract them into effects or guess whether a spell caused them. |
| Current name-slug skillReference links | Keep their existing behavior and strings. | This release is not a migration of all skill references to document IDs. New effect binding identity remains a distinct feature. |
| Existing spell/equipment/weapon/armour data, IDs and states | Preserve supported user data, owned copies and edits by default. New optional stores/charm/effect definitions start absent/inactive. | No inferred enchantments and no automatic SRD template merge or replacement. |
| Existing pre-v0.9 ActiveEffects and module data | No intentional OQ conversion/deletion, no compatibility guarantee. | No role, status, clock, resource or origin reconstruction; no automatic adoption into new OQ definitions. |
| Old chat cards without new snapshots | Keep readable history, actual rolls and known totals; no invented Apply snapshot/payment operation or retroactive charge. | Follow the previously agreed manual/incomplete-card fallback. A live-current-item damage action must not be represented as historical damage. Missing source needs manual entry. |
| System compendium sources | Add the release's authored definitions in source YAML with stable IDs. | Do not overwrite existing actor/world copies automatically. System journal source rules still apply. |
| Optional adoption of refreshed official SRD spells | User/GM explicitly chooses new templates; a manually invoked world-actor refresh macro is a candidate delivery tool. | Exact macro semantics are a new decision, not an upgrade-time migration or authorization to overwrite now. |
| Existing valid v0.9-format state on save/reload/copy/import | Preserve points, pool identity/order/remainders/deadlines, effect state, entry availability and cast progress as previously agreed. | No repeat grant, refill, cast, payment or charge against the original actor. No supported pre-v0.9 counterpart is implied. |

For legacy excess, use the ordinary maximum under supported v0.9 calculations, without interpreting unsupported effect
history. At zero normal capacity all still-recorded positive current points are excess. If source/native capacity is
not reliably recoverable, do not silently replace it with a guessed zero or grant; preserve recoverable input and report
the ordinary migration error using the existing framework. Unsupported module-produced resource semantics are not
reconstructed.

Recovered excess is an ordinary **manual temporary-point pool**, not an applied effect. It participates in agreed FIFO
spending, remains nonregenerating under ordinary healing/rest, and can be explicitly corrected/cleared. It has no
expiration until a person supplies a rule; disabling/deleting an unrelated legacy effect must not remove it. Never
create a zero-amount recovery grant just to initialize an actor.

The conversion must be pure/repeat-safe and persist reduced ordinary current plus recovered remainder together, so
reloading/retrying cannot duplicate or lose points. Existing valid new-format pools are not reinitialized or reordered.
No retroactive maximum/current transition, spell grant, cast payment, Divine expenditure or temporary-point grant occurs
merely from initialization. Future explicit new-feature transitions retain their previously agreed semantics.

### Coverage, persistence and failure behavior

Apply supported ordinary-data compatibility to world actors (character/NPC), relevant owned/world items, world
compendia, and unlinked actors' own resource data. Preserve actual scene/token/synthetic ownership, inherited embedded
identities and deletion tombstones. A linked token's shared actor is not a second independent conversion target.
Do not add ActiveEffect traversal solely for excluded legacy-effect conversion.

Older official data arriving after world upgrade must receive the same safe source compatibility, including JSON
imports and compendium copies. A world-level migrationVersion alone is insufficient for this path; a preUpdate-only
hook also misses noHook JSON imports. Choose the appropriate source/model/import integration during implementation.
Preserve excess before new field cleaning/preparation could discard it. This is ordinary resource compatibility, not
a generic adapter for arbitrary third-party schema.

Reuse the existing migration framework: append new versioned steps; never edit released migrations. Each handler is
pure and safe when called twice or retried after partial persistence. World compendium updates restore their previous
lock state. Rebuild system packs from their sources and leave module packs untouched. Existing active-GM persistence,
player in-memory conversion and retry-by-default/explicit-GM-skip behavior remain. Report errors through the existing
mechanism; no new per-effect failure registry, repair dashboard or automatic rollback is required.

Successful writes remain successful on retry, without second recovery pools or point adjustments. Preserve existing
IDs/source links. Do not retroactively mark old cards paid/unpaid or charge their actors to create a new receipt.
No backward-version conversion or promise to recover data already overwritten is introduced.

### Explicit adoption of updated SRD spells

Existing copies are left unchanged by upgrading. The user accepted explicit adoption and suggested a manually run
macro for SRD spells on world actors. It must never run automatically at load, ready, migration or compendium rebuild.
The precise source matching, actor scope, replacement fields/IDs, spell magnitude and Divine remaining-state handling,
preview/confirmation and partial failures belong to
[Define the optional SRD spell refresh macro](10-srd-spell-refresh.md). That ticket must resolve before final sequencing
so the release does not promise an unspecified destructive replacement tool.

### Before/after acceptance fixtures

| Starting source / action | Required result |
| --- | --- |
| Supported normal HP max 10, stored current 15; source max stale at 0; prepared sheet shows 10 | Ordinary HP 10/10 plus one manual temporary HP pool 5; total 15 preserved. |
| Normal MP max 10, stored current 14 | Ordinary MP 10/10 plus manual temporary MP 4; no spell/store attribution or decay timer. |
| Normal HP max 10, stored current 6 | Ordinary HP 6/10; no recovery pool or healing. |
| Normal max 0, stored current 3 | Ordinary current 0 plus manual temporary 3; no point loss. |
| Prior control already stored current 10 after clamping an earlier unknown excess | Keep 10; no inferred/reconstructed pool. |
| Repeat conversion/reload/import or retry after other documents failed | Same total, one recovery pool, same identity/order; no new grant or resource transition. |
| Converted HP 10/10 + recovered 5; take 3 damage then heal ordinary HP | Temporary remainder 2; ordinary healing does not refill it; unrelated effects do not own/end it. |
| Characteristic/skill/manual HP mod, formula and name-slug links already edited | Values and formulas preserved; no automatic effect extraction or reference rewrite. |
| Actor has arbitrary old user/module effect and unsupported marker | No OQ conversion, deletion, role inference or repair record; no guarantee of legacy behavior. |
| World includes two unlinked tokens with different stored MP excess and a base actor | Convert each actual actor's supported source independently; no repeated base conversion, cross-token write or recreated tombstone. |
| Locked world compendium holds actor with excess | Convert supported data and restore lock; preserve IDs; module packs untouched. |
| Import old actor JSON after world migrationVersion advanced | Recover still-stored excess once despite noHook import; no fresh new-format grant on subsequent load. |
| Old cast/damage card lacks snapshots but retains a known roll/total | History retained; no new Apply or payment reconstructed; current-item/manual follow-up explicitly distinguished. |
| Existing owned SRD spell has local edits or spent Divine magnitude; upgrade and rebuild packs | Owned copy and actor state unchanged; no automatic merge, refill or macro invocation. |
| Manual SRD refresh macro is later deliberately invoked | Governed by its separate approved contract; not executed or fully specified in this ticket. |

Implementation checks should exercise source-versus-prepared excess (including stale max), conservation and idempotence,
partial-write retry, linked/synthetic isolation, world-pack lock restoration and late-import coverage. Add fixtures to
`test/test-migrations.js` and meaningful source-conversion tests as appropriate. No compatibility tests for unsupported
third-party effects are promised; a no-intentional-conversion assertion is sufficient to guard the scope boundary.

### Delivery consequences

Keep supported-resource conversion with the temporary HP/MP slices, before any route can discard recorded excess.
Use ordinary default initialization for absent new-feature state. Carry forward the existing historical-card fallback
and future save/copy/import contracts in their own feature slices; do not add legacy-effect adapters to them. Reuse
existing migration reporting/retry rather than a separate compatibility project. Final release chunk sizing waits for
the explicit SRD refresh decision; no implementation or actual world-data migration occurred in this session.
