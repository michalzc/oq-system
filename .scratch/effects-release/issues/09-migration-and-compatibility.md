# Choose v0.9 migration and compatibility policy

Labels: wayfinder:grilling
Type: grilling
Parent: ../map.md
Blocked by: 02, 03, 04, 05, 06, 07

## Question

Which stored world/compendium data needs conversion for the agreed resource, effect, reference and stored-spell
representations, and which cases require explicit repair or a manual fallback instead of guessing prior intent?

Define a preservation/conversion matrix after the prerequisite decisions: ordinary and legacy excess HP/MP; source
pools and effect/grant linkage; existing actor/item effects without role/eligibility metadata; selected-item bindings
versus current name-based skillReference/formulas; historical cards without snapshots; and existing enchanted-item or
stored-spell data identified by that scope decision. Establish what can be inferred safely, what stays inert/unchanged,
what must be explained to the owner/GM, and what must not be silently dropped, clamped, regranted or rebound by name.
Do not invent a legacy schema that the actual stored data does not have.

Preserve existing document IDs, learned/source values, current resources, remaining pool/order/deadline state and
independent actor/synthetic-token ownership. Decide scope for world documents, embedded documents, synthetic actors,
world compendia and rebuilt system-compendium sources using the established migration framework. Add new migrations;
never rewrite a released migration. Include safe repeated loading/conversion behavior and once-only lifecycle handling.

Record concrete before/after acceptance fixtures, warnings/manual recovery cases and the meaningful automated checks
needed during implementation. Exact code/schema belongs to implementation; resolve the release's compatibility policy
and the prerequisite migration work needed by its playable increments. This ticket does not implement migrations.

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
