# Separate item-local effects, passive transfer, and applied templates

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md
Blocked by: 01

## Question

How will users author and distinguish an effect that modifies its item, a passive benefit transferred to the owner,
and a spell/ability template applied explicitly to a recipient?

Use a weapon enhancement, a worn enchanted item, a permanent creature ability, and a known-but-uncast spell as examples.
Owning a spell must not activate its template. Decide eligible item states, manual activation for abilities, source
visibility, removal/transfer behavior, and how a chosen weapon/skill reference survives ordinary editing/imports.

Respect the installed core's item-local versus transferred targeting behavior. Choose the smallest representation
that covers the agreed mechanics; do not create a general item containment framework as a side effect.
Record manual acceptance scenarios for equipping, storing, deleting, transferring, disabling and reimporting sources,
including a synthetic NPC actor. State where an applied effect remains independent of the originating item.

## Comments

[Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md) settles timed ending
and grant-pool suspension/cleanup. This ticket must define which applied effect owns a grant and distinguish its
lifecycle from deleting/transferring the originating spell or item. Preserve that resolved pool behavior while
choosing the representation; do not make source-item changes silently erase an independently applied benefit.

[Specify Apply effect on spell and ability result cards](04-chat-card-application.md) now fixes historical cast/template
snapshots, recipient-specific choices and independent applied benefits. Choose the representation and stable binding
strategy within that contract; do not make application depend on rereading or retaining the original spell item.
It also requires prior-application context without granting recipient owners edit permission on another user's card.

### Evidence and first question round

[Item ownership and effect-targeting evidence](../item-ownership-evidence.md) records current item states, the core's
item-local/transferred targeting distinction, missing item-local calculation/state gating, name-based current skill
references, copy/import identity behavior, and synthetic actor scope.

The first question round is awaiting the user's choices. Recommendations, not approved decisions, are:

- Give each definition an explicit role: This item, Owner while active, or Apply to recipient. Ownership never
  activates a recipient template; spell definitions default to templates.
- Reuse current item states with author-selected eligibility. Default passive benefits to readied/worn/natural as
  applicable; carried/stored are excluded unless explicitly eligible. Equipment uses readied for worn gear.
- Enable passive creature abilities by default with explicit manual suspension. Use ability / Apply effect remains
  separate from passive activation.
- Bind selected weapon/skill targets by identity within the actual recipient, preserving renames/ordinary edits.
  Missing/replaced targets require explicit rebinding, with no automatic name substitution. Group/characteristic
  selectors retain their agreed dynamic matching behavior.

Lifecycle/copy boundaries, representation, grant ownership and application-history storage still need discussion.
The ticket remains claimed; no answer or release-plan approval has been recorded.

### First question round confirmed, with ability clarification

The user accepted Q1, Q2 and Q4. For Q3 they clarified that abilities can both grant an effect when used, like spells,
and grant passive effects to their owner. These roles can coexist on one ability; ability type does not force one role.

- Definitions have the three explicit roles, with spell definitions defaulting to recipient templates. Owning a
  recipient template does not activate it.
- Passive eligibility uses existing item states and explicit author-selected exceptions, as proposed in Q2.
- Selected weapon/skill bindings use identity within the recipient. Renames/ordinary edits survive; a missing or
  replaced target requires explicit rebinding, never silent name matching. Dynamic selectors remain dynamic.
- An ability can contain both passive owner benefits and use-triggered recipient templates. Default enabled state
  and the exact passive controls still need explicit confirmation; do not infer them from the clarification alone.

The glossary now distinguishes item-local effects and passive effects from effect templates and applied effects.
The next round must settle passive control defaults, source lifecycle, selected-weapon handoff, source visibility,
and history/grant ownership within the existing duration/application contracts.

### Second question round pending

The following recommendations are awaiting the user, not settled decisions:

- Q5: Control passive definitions independently, enabled by default when newly authored/added. Use ability posts only
  its recipient templates; it does not toggle passives. Preserve explicitly disabled definitions when copying.
- Q6: Source item state/disable/delete controls its passive benefits. Item-local definitions travel with copied items;
  passive definitions affect the destination only when eligible. Ordinary drops copy and leave the source intact.
  Previously applied benefits remain independent of their originating spell/ability/item and keep their own clocks.
- Q7: Keep a cast weapon enhancement bound to the selected weapon in its recipient actor. Renaming and state changes
  do not erase it or restart its clock. Moving/copying the weapon to another actor does not automatically transfer or
  duplicate that applied spell. A missing selected weapon suspends the contribution pending explicit rebind/end.
- Q8: Create temporary-point pools only through explicit application/manual grant, not through passive equipment
  activation or data preparation. Each applied grant belongs to its applied effect on the recipient; manual pools
  can stand alone. Retain the earlier suspension/FIFO/ending rules.
- Q9: Show role, source name, target, active/inactive reason and duration. Preserve a brief recipient-owned application
  receipt after ending/deleting an applied effect so old cards can show prior application without editing the card.
  Receipts do not activate benefits, recreate pools, or survive deletion of their entire recipient actor as a promise.

Whole-actor copy/import rebinding and the minimal storage representation remain to check after these answers.

### Second question round confirmed

The user answered “Yes to all” to Q5–Q9, accepting independent passive controls/default activation, source-versus-applied
lifecycles, recipient-bound cast weapon enhancements, explicit-only temporary-point grants, and source/target/status
visibility plus persistent recipient-owned application history. This supersedes the pending status of the preceding
round. No implementation is authorized by this planning decision.

### Minimal representation implied by confirmed behavior

Use core item-embedded Active Effects for item-local definitions (transfer false) and owner passives (transfer true),
with system role/state metadata and preparation/suppression integration. Recipient templates are dormant definitions
explicitly excluded from live application; transfer false alone cannot distinguish them from item-local effects.
Application creates an independent actor-owned effect, retaining the historical definition and recipient-local item
bindings. A cast weapon enhancement therefore is not embedded on the weapon and is not copied with an ordinary
weapon drop. Intrinsic item-local definitions do travel with the item.

Keep recipient pools and application receipts as recipient-owned data, linked by stable application/effect identity;
a receipt outlives effect deletion and does not depend on editing the source message. The applied effect owns the
lifecycle of its grant, not the original spell/ability/item or the receipt. Manual grants remain independently owned.
Exact field names/schema and compatibility details are for the later compatibility decision/implementation work.
No new item type or containment framework is needed.

### Final question pending

Q10 recommendation, not yet approved: a whole-actor duplicate or complete actor import preserves included applied
effects, their remaining deadlines, pool remainders/order, and recorded resource state without granting again or
restarting clocks. Resolve selected items only inside that destination actor; preserve/remap bindings when identities
are known, otherwise show a missing target requiring explicit rebind. The copy is independent and changes cannot
reach the original actor or another synthetic token. Application receipts are scoped to the destination; copied
historical context cannot address or mutate the original recipient. Expired deadlines still catch up once normally.
Imports preserve the included saved state rather than adding another copy of a grant to the existing state.

Approval of this final behavior completes the current ownership/activation decision. Compatibility strategy remains
separate; stored-spell ownership must still be decided before the entire migration scope is sharp.

### Final question confirmed

The user accepted Q10. Whole-actor duplicate/import preserves included saved effect/resource state and remaining
clocks, without a new grant or cross-actor binding. The ownership/activation decision is complete.

## Answer

Resolved with the user through Q1–Q10, including their clarification that one ability may supply both passive owner
benefits and effects granted when used. This answer is the authoritative result; earlier pending/proposed comments
are discussion history. Implementation and compendium authoring remain a later effort.

### Roles and authoring

An item can contain several effect definitions, each with one explicit role:

| Role | Meaning | Example |
| --- | --- | --- |
| This item | Changes only the item bearing the definition. | An intrinsic weapon hit/damage enhancement. |
| Owner while active | Supplies a passive benefit to the owning actor when enabled and eligible. | A readied enchanted ring or a creature's permanent ability. |
| Apply to recipient | A dormant template made into an independent applied effect through the agreed use/cast and application workflow. | Protection, Weapon Enhance or an ability used on another creature. |

Spell definitions default to recipient templates. Owning a known-but-uncast spell never activates a template.
Special abilities may mix owner passives with recipient templates; item type does not force one role. Use ability
posts the applicable recipient-template card and does not toggle, copy or reapply its owner's passive benefits.
Rolled/non-rolled use, historical casts and recipient permissions follow
[Specify Apply effect on spell and ability result cards](04-chat-card-application.md).

Each passive has its own on/off control. Newly authored/added passive definitions default to enabled; copying an
explicitly disabled definition preserves its disabled state. A manual toggle is independent of conditional per-test
selection and is not a new cast or temporary-point grant.

### Eligibility and source lifecycle

Authors select which existing item states permit each passive. Defaults are readied for weapons/equipment,
worn for armour, and natural for natural weapons/armour. Carried/stored are excluded by default but may be explicitly
included where the particular rule requires. Equipment has no worn state; a worn enchanted ring uses readied.
Abilities have no equipment-state requirement; their passive enabled state controls eligibility. State gating applies
to owner passives; it does not erase an item-local definition or a separately applied spell.

Changing an eligible state, disabling a passive or deleting its source removes the corresponding owner contribution.
Re-enabling/re-equipping restores the definition's contribution once, with normal derived-data preparation and the
already-agreed maximum/current lifecycle rules. Do not rewrite learned skills or underlying source values.
Suppression must preserve expiry and manual disabling rather than replacing those checks.

Item-local and passive definitions travel with an item copy. At its destination, item-local definitions affect that
copy and passives affect only its owner when eligible. An ordinary Foundry drag copies rather than moves: the original
item and its benefits remain until explicitly removed/disabled. Do not add an inventory-transfer engine. References
to another selected item/skill must still satisfy the identity/scope rules below; copying a definition is not permission
to pick a same-named or unrelated same-ID target at the destination.

### Independent applied effects and selected targets

A confirmed application creates an independent applied effect on the recipient actor, including a selected-weapon
application. It retains the historical cast/template, source name/identity, duration and recipient-specific choices.
Editing, disabling, storing, transferring or deleting the originating spell/ability/item does not alter that snapshot,
end the applied benefit, or discard its grant. Source links are context, not lifecycle ownership.

Bind a specific selected weapon/skill by identity within the actual recipient actor. Renames and ordinary edits
preserve the binding. Group and characteristic selectors retain their previously agreed dynamic matching semantics.
No name matching, recursive inference or generalized rewrite of existing weapon/spell skillReference fields is implied.

For a cast weapon enhancement, changing the weapon's readied/carried/stored state neither erases the spell nor resets
its clock. It remains scoped to that weapon on that recipient; an independent roll with another weapon or their shared
skill does not inherit its benefit. Copying the weapon to another actor does not copy or transfer this actor-owned cast
effect. Removing the selected weapon leaves a visible missing target and suppresses that contribution until the human
explicitly rebinds or ends it. The clock continues. A new import with the same name is not an automatic replacement.
Ending or rebinding is explicit and cannot silently create a new grant or restart duration.

In-place edits/imports retain bindings only when the selected document's identity is retained. For whole-actor copies
or complete actor imports, preserve included effects, saved resource state, remaining deadlines and pool remainders/order
without regranting or restarting clocks. Bindings resolve only within the destination actor. Preserve/remap them where
the copied identity is known; otherwise show a missing target for explicit repair. Import restores included saved state
rather than adding its grants to preexisting balances. Cloned effects, pools and history are independent of the original
actor. Already elapsed deadlines still receive the normal once-only expiration catch-up.

For unlinked tokens, the recipient is that token's synthetic actor, not its base world actor. Resolve bindings against
its own embedded collection, even when multiple tokens share embedded item IDs. Copy/import context may not mutate
or bind to another recipient merely through retained source UUIDs.

### Grant ownership and application history

Temporary HP/MP comes only from explicit application or manual grant. Equipping, toggling, preparation, copying or
reload does not create a fresh pool. Maximum/current effects remain distinct from temporary-point grants.

The recipient's applied effect owns the lifecycle of its grant; the original casting item does not. Link each grant
pool to that application/effect identity on the recipient. Disabling suspends only its remainder, re-enabling restores
only that remainder at its original FIFO position, and ending/expiry discards only its remaining points. Preserve the
full contract in [Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md).
Manual pools can exist independently of an effect and keep their explicit editing/spending workflow.

Keep a brief application receipt in recipient-owned data, linked to the originating card and application. It survives
ending/deletion of the applied effect and retains sufficient history for old-card inspection and explicit new-application
review. It never recreates an effect or grants points. A recipient owner can write it without editing somebody else's
message; permissions remain those of the recipient/card visibility contract. On whole-actor copy/import, scope history
to the destination so a copied record cannot address or mutate the original recipient. Deleting the entire recipient
actor need not preserve this history elsewhere. No global ledger or shared-message mutation is required.

### Minimal representation and visible controls

Use item-embedded core Active Effects with transfer false for item-local definitions and transfer true for owner
passives. Retain the definition on its source item rather than mirroring a passive onto the actor. Include role and
eligibility metadata. Templates are dormant definitions explicitly excluded from live calculations; transfer false
alone does not distinguish a template from an item-local effect.

Applications become actor-owned effects with a resolved snapshot and recipient-local target binding. Keep pools and
receipts in recipient-owned data, linked by stable application/effect identities. Exact field names, data-model shape,
compatibility conversion and import hooks remain later work; the ownership boundary is settled. No new item type,
stored-spell containment structure or general inventory framework is required by this decision.

Expose role, source name/link when available, selected target, enabled/eligible/expired/missing-target state and reason,
and duration. Preserve a readable source name when its document no longer exists. Clearly distinguish passive
contributions from independently applied effects and dormant templates. Owners can inspect/end applied effects and
repair missing bindings through explicit controls, subject to normal permissions.

The [local evidence](../item-ownership-evidence.md) establishes two necessary system integration tasks: the current
Item path needs explicit item-local preparation, and core suppression needs system state gating. Do not assume that
core's target getter implements either. Preserve the established preparation dependencies and avoid double application.

### Manual acceptance scenarios for later implementation

These are observable acceptance requirements, not tests run during planning. Use character and NPC recipients,
reload between relevant steps, and verify underlying source values are unchanged.

| Setup/action | Expected result |
| --- | --- |
| Put an intrinsic +2 hit enhancement on one of two weapons; rename, store, ready and reload it | Only that item has its +2; the definition survives state changes and rename, and never becomes a general owner bonus. Copying that item carries its intrinsic definition. |
| Give a readied equipment item a passive +2 AP; change it to carried, stored and back to readied | Owner gains 2 AP once while readied, loses it while ineligible, and regains 2 rather than 4. An explicit carried-state eligibility choice works only for that definition. |
| Give worn armour or natural equipment an owner passive; change eligible states and disable/re-enable it | State and manual enable checks both apply; worn/natural defaults follow item type. Existing worn-armour AP remains distinct from its added passive. |
| Add a permanent creature ability with a passive +2 AP and a recipient template | Passive is initially active; Use ability produces its template card without another owner bonus. Disable only the passive: the template remains usable and already-applied benefits persist. |
| Add a Protection spell and edit its template without casting | No actor AP change. A later successful cast/application creates the independent effect through the agreed workflow. |
| Apply Protection from a complete card; edit, disable, delete or transfer its source spell | Recipient keeps the recorded magnitude/duration/source name. Neither source deletion nor transfer ends it; complete historical cards remain usable. |
| Copy a passive enchanted item to another actor, then delete the original | Copy obeys its own state; original benefit disappears only when its own source is removed. No duplicate passive actor effect remains behind. |
| Apply +2 Weapon Enhance to sword A while sword B shares its skill; rename A, store it and reload | Only A's weapon test/damage has the recorded contribution. B and the shared skill do not gain it. The deadline does not restart. |
| Copy enhanced A to another actor, then delete original A | New copy carries intrinsic definitions but not the separately cast enhancement. Original recipient shows a missing target; another same-named sword is not substituted. Rebinding/end is explicit. |
| Delete a selected skill/weapon and import a fresh same-named item; separately update the original item in place preserving identity | Fresh identity requires explicit rebind; preserved identity retains its binding. Dynamic skill selectors continue their agreed matching independently. |
| Apply Vigour, spend part of its pool, then delete the caster's source item | Only its recipient effect owns the remaining pool. Disable/re-enable preserves remainder/FIFO; ending that effect discards its remainder and leaves unrelated pools intact. |
| Toggle equipment/abilities repeatedly, reopen sheets and reload | No new temporary pools or repeated maximum/current transition. New temporary points require explicit application/manual grant. |
| End/delete an applied effect, then inspect its old card as recipient owner without message edit rights | Brief recipient-owned history identifies prior application; no hidden regrant or duration refresh. A new application uses the earlier explicit confirmation/conflict workflow. |
| Duplicate/export-import a whole actor with a running weapon effect and partially spent pool | Included duration, pool remainder/order and resource state are restored, with local binding or an explicit missing-target warning. No fresh grant or cross-actor mutation; once-only expiry still works. |
| Two unlinked NPC tokens share a base actor and item IDs; equip/toggle/apply/rebind on only one | Only the selected synthetic recipient changes. The other token and base actor retain their own effects, resources and bindings through reload. |

### Consequences for the remaining map

[Choose OpenQuest conditions and useful manual reminder workflows](06-conditions-and-reminders.md) still owns condition
presentation and conditional test/quick-roll choices. [Bound magic point stores and stored-spell casting for v0.9](07-enchanted-items.md)
still owns stored-spell data/payment/consumption and must reuse the dormant-template boundary without inventing automatic
casting on ownership. Stored spells do not require a containment framework as a consequence of this ticket.

Compatibility policy is now a precise, separate question: preserve existing documents/resources, handle legacy effects
and references without guessing intent, and distinguish safe in-place conversion from explicit repair/manual fallback.
The new compatibility ticket can wait for stored-spell ownership while remaining fully specified as a question.
The final sequencing decision must account for item-local preparation, passive state gating, independent application,
missing-target repair, source receipts, and actor copy/import acceptance cases as reviewable behaviors.
