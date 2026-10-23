# Bound magic point stores and stored-spell casting for v0.9

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md

## Question

What is the smallest useful v0.9 scope for magic point stores and stored spells, and which item kinds need distinct
follow-up chunks?

Separate a store's capacity/balance/manual refill from selecting a payment source during casting. Decide a single-store
workflow, eligibility/access, failure costs, and behavior when the balance changes while a dialog is open. Is partial
payment from actor plus store needed, or does explicit single-source payment suffice?

Choose the first stored-spell kind and define whose skill, magnitude and MP are used. Charms, matrices, potions and
scrolls have different rules; do not silently promise all of them through one generic stored spell field. Decide whether
stored spells need copied data or references, what travels with the item, and how consumption/reuse is handled.

Deliver a scope table and separate manually testable increments. Existing casting and the planned card application
should be reused without automatically activating a stored spell when its item is equipped. Dependencies on effect
application belong to the later implementation sequence, not to making this scope decision.

## Comments

[Define excess HP/MP and temporary magical resource behavior](02-resource-semantics.md) establishes ordinary plus
temporary personal MP, spent from temporary points first. Reuse that personal-payment behavior where personal MP is
the selected source; do not accidentally ignore the buffer. A separate item store is not the actor's temporary buffer.
Decide any cross-source fallback or transfer eligibility explicitly, including whether temporary personal points can
fund a store refill; no automatic splitting across all pools has been approved.

[Separate item-local effects, passive transfer, and applied templates](05-item-ownership-and-transfer.md) settles
passive versus dormant-template roles and independent applied benefits. Stored-spell ownership must preserve that
boundary. Resolve the store/stored-spell data ownership here so
[Choose v0.9 migration and compatibility policy](09-migration-and-compatibility.md) can assess actual compatibility
needs without inventing a containment model or legacy schema.
### First question round — awaiting human choices

Recommendations only; no scope decision has been approved in this round.

1. Include an item MP-store ledger, explicit casting payment from a store, and Personal Magic charms in v0.9.
   Cover the single-use/reusable distinction for stores and charms. Keep matrices, potions, Personal Magic/Sorcery
   scrolls and Divine blessed items as documented manual workflows, without dedicated casting/consumption automation.
   They have different skill, payment, timing, recharge and failure rules and must not inherit charm behavior.
2. Configure already-created enchanted items manually. Automating Enchant rolls, creation time/materials, growth-point
   sacrifice, creator eligibility and temple recharge rituals is outside v0.9; preserve the relevant rules as instructions.

Payment/access/refill, concurrency, charm data ownership, spell selection, consumption and acceptance decisions follow
once this scope frontier is answered. Local rules/current-code investigations are in progress.

### First question round confirmed

The user answered "Yes" to both questions. v0.9 includes the MP-store ledger, explicit store-paid casting and
Personal Magic charms, with single-use/reusable variants. Matrices, potions, scrolls and Divine blessed items retain
manual workflows rather than dedicated use automation. Already-created enchanted items are configured directly;
creation/enchantment procedures remain human adjudication. This does not yet approve payment, refill, representation
or consumption policies. [Enchanted-item evidence](../enchanted-item-evidence.md) records local rules and code facts.

### Second question round — awaiting human choices

Recommendations only, not approved decisions:

3. One store per physical equipment/weapon/armour item, capacity and balance nonnegative integers, balance <= capacity.
   Single-use store becomes expended at zero from spending; reusable store remains refillable. No automatic regeneration,
   POW-capacity/durability logic, item deletion or quantity consumption. Require quantity one for operational enchanted
   instances; split stacks manually. Owner/GM corrections are explicit; lowering capacity must not silently discard balance.
4. Separate corrections from a reusable-store refill action. Refill explicitly transfers ordinary personal MP to available
   capacity, never temporary MP; no free regeneration, store-to-store transfer or automatic balancing. Human checks
   original-caster eligibility; no cross-actor/creator identity engine. GM can correct adjudicated external transfers.
5. Use only the acting actor's own readied/worn/natural items, with normal owner/GM authority; carried/stored items must
   first be readied/worn. Remote actors/ground inventories/spirit reservoirs are manual. Same eligibility for charm use.
6. Default payment is personal MP (temporary pools first); explicit dialog choice selects exactly one eligible store for
   an MP-costing spell/charm. No split, automatic fallback or remembered store. Require full cost before roll, then charge
   outcome cost to selected source. No store payment for no-MP Divine casting. Quick casting remains personal-only, with
   no automatic store selection; open normal dialog to choose a store. Existing conditional-choice dialog rule still applies.
7. Recheck current permissions, item state, spell availability and full affordability on confirmation without silent
   magnitude lowering. During dice fulfillment, a lost source/insufficient final balance or failed write produces a visible
   unpaid/unresolved result: no automatic fallback/debt, successful effect application waits for settlement. Preserve same
   outcome for explicit payment retry/adjudication, never reroll/double-charge. Serialize same-source spending to prevent
   concurrent double spending; no full-cost reservation/refund scheme.
8. Store self-contained spell definitions on the physical item, including rules/effect templates/magnitude, with one or
   more named entries and per-entry reusable/expended state. Import/copy snapshots, not live dependencies on original
   spell/compendium; no learned spell created. Same physical item may hold both store and charms. Existing copy/import
   preservation contracts apply to balances, definitions and expended state, with independent destination identities.
9. Charm uses wielder's current Personal Magic Casting skill and applicable modifiers, including conditional choices;
   caster need not know stored spell. Stored magnitude is ceiling; variable spells may cast lower, fixed spells use exact
   stored magnitude. No higher magnitude because wielder knows more. Missing casting skill blocks use.
10. Successful paid casting expends only chosen single-use stored spell entry, at any selected magnitude; reusable entry
    stays. Failure/fumble pay ordinary outcome cost but retain entry. No item deletion, stack decrement or depletion of
    other spells/passives/store. This is an explicit interpretation of ambiguous multispell/failure wording.

Application cards, historical snapshots, manual relevance/resistance and independent already-applied effects reuse the
prior decisions; clicking Apply never pays again or expends a second entry. No automatic casting on equipping.

### Second question round — partial confirmation

The user accepted Q3–Q4. They also accepted Q5, explaining that an ordinary item must actually be equipped to supply
its benefit: necklace on neck, ring on finger, and so on. Armour uses `worn`; weapons and other physical items use
`readied`; natural items/effects use the existing `natural` state where supported. There is no numerical limit on
readied ordinary items. Do not infer an equipment-slot, hands, jewellery-count or attunement system from this gate.
Passive-effect state gating continues to follow the prior ownership decision; the Q5 access recommendation for explicit
store/charm use is also accepted. No new natural state is implied for item types lacking it.

Confirmed ledger/refill consequences:

- One store per physical item; nonnegative integer capacity/balance and no balance above capacity. Operational
  enchanted instances have quantity one, with manual stack splitting. Single-use depletion ends only the store
  enchantment; reusable stores at zero remain refillable. Never delete the physical item or consume its quantity.
- Explicit owner/GM corrections are distinct from spending/refilling. Lowering capacity must not silently discard
  points. No automatic regeneration, POW-dependent capacity changes or damage/destruction engine.
- Explicit reusable-store refill transfers ordinary personal MP only, limited by current ordinary MP and free capacity.
  Temporary personal MP, store-to-store transfer and automatic balancing are excluded. Human checks original-caster
  eligibility; GM can record externally adjudicated transfers using explicit corrections.

Q6–Q10 (payment selection, in-flight failure, stored definitions, casting skill/magnitude and charm consumption) remain
unanswered. The ticket stays claimed and has no resolution answer.

### Second question round — further confirmation and rules check requested

The user accepted Q7–Q10 and asked to check the rules for restrictions before deciding Q6. Payment-source selection
is not yet approved. Accepted: visible unpaid outcome and settlement without reroll/double charge; self-contained
multispell definitions and independent saved copy state; wielder's current Personal Magic Casting with stored-magnitude
ceiling; successful paid casting consumes only the chosen single-use entry, failure/fumble retains it.

A targeted SRD recheck is in progress for access, spell-school limits, mixing personal/store MP, several stores,
regeneration/refill and special reservoirs. Distinguish an explicit restriction from a release simplification or
silence in the text; do not present the proposed one-source workflow as an SRD prohibition on splitting.

### Payment-source rules recheck and next frontier

[Targeted source evidence](../enchanted-item-evidence.md#targeted-payment-source-recheck-requested-by-the-user)
finds no explicit ordinary-store school, creator-as-spender or same-item-as-charm requirement, and no explicit rule
requiring/forbidding personal+store or multi-store splits. Multiple stores and using them instead of personal MP are
explicitly allowed. Single-source automation, personal default and personal-only quick casting must be described as
v0.9 interface boundaries rather than SRD prohibitions. A selected store can fund a spell exceeding the actor's own
normal MP capacity. Refill names the creator separately; already agreed refill/access choices remain product policies.

Q6 remains pending: recommend keeping single-source automated payment, with explicit documented human bookkeeping for
split/external payments and no implication that the SRD forbids them. Manual split-payment play can use explicit
resource corrections, a normal casting-skill test and manual effect
creation/application; do not imply that every generic skill card gains a spell snapshot or Apply effect action. If an
automated cast already has an unpaid outcome, settlement reuses that outcome and records adjudicated payment without
a second automatic charge. No quick-cast store guessing. A dedicated split-allocation UI is not implied.

Consistency consequence of accepted Q7–Q10: payment and single-use charm expenditure must form one recoverable
casting operation. A pending use blocks another use of the same single-use entry even with a different payment source;
paid and expended steps must never repeat during recovery. If one update/card creation fails, show the recorded state
and finish the missing step from the same outcome. Ending/voiding an unresolved operation is explicit human action,
not an automatic refund, regrant, source switch or reroll. Application remains unavailable until settlement completes.
This is observable consistency/recovery behavior, not a commitment to a particular transaction schema.

### Final payment-source confirmation

After the targeted SRD check, the user answered "Yes" to Q6: keep single-source automated payment, personal default,
personal-only quick casting and manual split payments. These are release/interface limits, not a statement that the
SRD prohibits combining sources. All questions in this ticket are now answered.

## Answer

Resolved through the live question rounds, including the requested SRD payment-source check. This answer owns the
v0.9 enchanted-item scope, payment and stored-spell policies. Exact schema and UI implementation follow later.
[Enchanted-item evidence](../enchanted-item-evidence.md) holds local source facts and ambiguities.

### Release scope and rule boundaries

| Capability | v0.9 scope | Human responsibility / automation boundary |
| --- | --- | --- |
| Ordinary MP stores | Capacity/balance ledger, single-use and reusable variants, explicit spend/correction/refill, explicit casting payment. | Configure an already-created enchantment; adjudicate creation, original-caster refill eligibility, damage/destruction and exceptional rules. |
| Personal Magic charms | One or more self-contained spell entries on a physical item, wielder casting, per-entry single-use/reusable state, successful-card effect application. | Creation, intent, resistance, eligibility and unusual rules remain human decisions. |
| Matrices, potions, Personal Magic/Sorcery scrolls, Divine blessed items/relics | Document distinct manual workflows; no dedicated activation, consumption, recharge or stored-skill automation. | Follow each kind's own skill, payment, timing, religion, targeting, retry and recharge rules. Never label one as a charm to obtain incorrect automatic behavior. |
| Crafting/enchantment | Direct configuration of capacity, balance, spell definitions and reuse state. | Creation rolls, materials, time, growth-point sacrifice and temple rituals are manual. |
| Special reservoirs | Rules reminders and explicit bookkeeping. | Sorcerer's Stone POW-dependent capacity, bound spirits, Mindlink, Places of Power and Magus transfers retain their distinct rules; no general sharing/transfer engine. |

The SRD expressly allows several stores and paying without personal MP. No explicit ordinary-store prohibition on
personal+store or multi-store payment was found. The one-source casting interface is a deliberate release limit.
Ordinary stores have no discovered creator-only spending, same-item-as-charm or Personal-Magic-only restriction.
Original-caster wording concerns refill. A selected store may fund a spell exceeding the caster's normal personal MP
capacity; never cap store affordability at the actor's POW or personal MP maximum.

Equipped-state access, ordinary-only refill and personal-only quick casting are accepted product policies where the
source does not impose those exact restrictions. Keep the distinction visible in documentation; do not invent SRD bans.

### Physical items, ledger and access

Use the existing physical equipment/weapon/armour item as the bearer. Each physical instance may have one MP store
and several charm spell entries, alongside its existing item-local effects and owner passives. This does not require a
new item type, equipment-slot model or general item containment framework. Native Item documents cannot embed spell
Items; the implementation must explicitly support the agreed self-contained stored definitions.

- Capacity and balance are nonnegative integers, with balance no greater than capacity. Explicit owner/GM corrections
  are distinct from spending/refilling. Reject or require explicit correction when a capacity reduction would discard
  balance; never silently clamp away points.
- Spending the last point from a single-use store ends that store enchantment. Keep its expended state visible and do
  not offer normal refill. A reusable store at zero remains usable after explicit refill. Neither case deletes the
  physical item, changes quantity, expends a charm entry or removes unrelated passives.
- No automatic regeneration, rest refill, capacity adjustment from POW, or durability/destruction triggers. The GM
  records exceptional changes explicitly. A Sorcerer's Stone can use the ledger with its special capacity managed
  manually; do not claim automatic support for the changing-POW rule.
- Operational enchanted instances have quantity one; users split stacks manually before tracking individual stores or
  charm entries. No per-unit balances/charges inside a stack and no automatic item duplication/splitting on use.
- Use only the acting actor's own eligible items under normal owner/GM permissions. Armour uses `worn`, weapons and
  ordinary equipment use `readied`, natural items use `natural` where that state already exists. Carried/stored items
  must first be made ready. Do not add `natural` to unsupported item types as a consequence of this decision.
- As clarified by the user, `readied` represents actual equipping: necklace on neck, ring on finger, etc. There is
  **no numerical limit** on readied ordinary items. Do not infer slots, hand counts, jewellery limits or attunement.
  Permanent creature-ability/passive activation retains the prior ownership decision.
- Remote inventories, ground items, shared actors and spirit reservoirs are manual cases. Preserve actual synthetic
  actor ownership: using an unlinked token's item updates that token's actor, not its base actor or another token.

### Refill and explicit spending

A reusable-store refill is an explicit transfer from ordinary personal MP to that store, bounded by current ordinary
MP and free capacity. It decreases ordinary MP and increases the store by the same amount once. Temporary MP is not
used for this transfer even though it is spent first for ordinary personal casting. Do not route refill through a
buffer-first expenditure operation and accidentally transfer temporary points.

Humans check whether the refilling character satisfies the original-caster requirement. No creator-identity lookup or
cross-actor transfer system is required. GM corrections can record externally adjudicated refills; corrections are
visible intentional bookkeeping, not free ordinary refill. No automatic fallback to temporary MP, store-to-store
transfer, withdrawal into personal MP, or rebalancing. Recheck both balances/capacity before committing a refill;
cancellation and rejected transfers change neither side. Concurrent actions/retries must not duplicate a transfer.

Manual spending similarly consumes only the selected store and never personal MP. No store depletion should change
an unrelated source or grant temporary points.

### Casting payment and quick actions

The normal casting dialog defaults to personal MP. An explicit choice can select **one** eligible store instead for
an MP-costing spell, including an invoked charm. It may be on the charm's own item or another eligible owned item.
Do not remember a store as an implicit future default. No automatic split, fallback, multi-store allocation or
personal-balance top-up; a store is distinct from the actor's temporary MP pools.

Personal payment uses agreed temporary-point pools first, then ordinary MP. Store payment leaves all personal MP
untouched. Full nominal cost must be affordable from the chosen source before rolling; do not attempt an otherwise
unaffordable spell hoping for a critical. Offer variable magnitudes using that source's funds, recheck the chosen
magnitude on confirmation, and never silently lower it after confirmation.

Charge the actual outcome cost to the selected source:

| Cast | Ordinary success | Critical success | Ordinary failure | Fumble |
| --- | --- | --- | --- | --- |
| Personal Magic, including charm | Selected magnitude | 1 MP | 1 MP | Selected magnitude |
| Sorcery | Normal full cost, including selected manipulations | Base 1 MP, manipulation costs waived | 1 MP | Normal full cost |

Preserve the existing supported casting-cost calculation; adding store payment does not silently introduce all missing
Sorcery manipulation controls. No-MP Divine casting retains its existing magnitude/expenditure workflow and gains no
store selector. No new automatic calm/unhurried casting lane is implied; those rules remain available for human use.

Quick casting remains personal-only and uses the current affordable magnitude behavior. It must never silently choose
a store or take stored points because personal MP is insufficient. Open the ordinary dialog to select a store. The
prior conditional-choice rule still takes precedence: a matching conditional contribution opens the relevant dialog
rather than bypassing the person's choice, including for rolled casting.

For split/external payments, document a concrete manual path: adjudicate allocation, make explicit resource corrections,
roll the appropriate casting skill as necessary and create/apply the effect manually. Do not run an ordinary paid cast
on top of those deductions. A generic skill card does not acquire a spell snapshot or Apply effect button merely by
being used for manual casting. An already-created unpaid casting result can instead use the settlement path below.
A dedicated split-allocation interface is outside this release.

### Changed balances, interruption and recoverable outcomes

Recheck authority, actual actor/item identity, eligible state, stored-spell availability, selected magnitude and full
affordability on confirmation. Reject stale choices before rolling/payment and explain what changed. Cancellation
changes no resources, expended flags or card state.

If the source becomes unavailable, final actual cost is unaffordable, or an update fails while dice are being resolved,
retain the rolled outcome as visibly **unpaid/unresolved**. Never silently underpay, zero-clamp away a shortfall, take
personal MP as a fallback, incur hidden debt or reroll to obtain a cheaper result. Successful effect application waits
for settlement. This deliberately replaces the current tested behavior allowing a cast to finish underfunded after
dice fulfillment.

Allow explicit payment retry/adjudicated settlement from the same outcome. Show payment/source and expenditure state
so an owner/GM can fund the source, finish missing updates or record external adjudication without paying twice. A
void/abandonment or resource correction is an explicit human action, not an automatic refund or regrant. This does not
require reserving full cost and then refunding the difference.

Serialize competing spending from the same source. As a consistency consequence of single-use behavior, a pending use
also prevents another simultaneous invocation of that same single-use charm entry, even using another MP source.
Payment, entry expenditure and result publication must be recoverable as one cast: retries/reloads finish missing
steps without repeating completed debits/expenditure or generating a fresh roll. If payment succeeded but the entry
update or card creation failed, visibly retain that progress and finish that cast. A failed or deleted source may
need explicit GM adjudication; never substitute a same-named item or a different actor's balance.

These are observable consistency requirements. The choice of persistent operation/receipt schema belongs to
implementation; no general distributed transaction framework or automatic third-party payment engine is prescribed.

### Charm definitions, casting and consumption

Store named spell entries as self-contained copies of their rules, effect templates, magnitude and other cast data,
with stable local entry identities and independent reusable/expended state. Import/copy a source definition, rather
than depending on its live world/compendium reference. Editing/deleting the original spell does not change the charm;
future explicit edits to the stored definition affect future casts only. No spell is added to the wielder's learned
spell inventory merely by owning or invoking a charm.

Use the wielder's current **Personal Magic Casting** skill and applicable modifiers/conditional choices, not the
creator's percentage. Missing casting skill blocks use with an explanation. The stored magnitude is the ceiling;
variable entries may cast lower, fixed entries use their exact stored magnitude. The wielder need not know the spell
and cannot raise the stored magnitude because they personally know a stronger version.

A successfully paid cast, including critical success, expends only the selected single-use entry, even when cast below
its stored maximum. A reusable entry stays available. Failure and fumble pay the appropriate outcome cost but retain
the entry. Other spell entries, owner passives, the MP store and physical item remain; the store may independently
expire if that expenditure emptied a single-use store. Consumption is on successful casting, independent of whether
the human later applies an ongoing effect or adjudicates resistance.

The success-only/per-entry rule is the user's chosen interpretation of ambiguous charm wording, not an assertion
that the SRD unambiguously specifies failure or multispell depletion. No automatic cast on equipping, all-spells-at-once
potion behavior, Divine magnitude depletion, or matrix skill inheritance.

Reuse the prior successful casting-card/application contract: capture historical cast magnitude/template/damage basis,
choose recipient-local bindings at application, resolve resistance/intent manually, and require recipient owner/GM
authority. Apply does not pay again, cast again or expend another entry. A complete historical card remains usable
when the charm entry/source item is later edited, expended or deleted. Already-applied recipient effects and temporary
pools remain independent of the originating item; do not end them merely because the charm was consumed or unequipped.

### Copy/import and compatibility

Normal Foundry item drag copies, rather than moving, a document. Preserve the copied store's saved capacity, balance,
reuse/expended state, spell definitions and entry state. The original remains independent until explicitly removed.
Whole-actor duplication/import likewise preserves included saved state without recharging stores, clearing expenditure,
learning spells, rerolling or recasting. Local identities must stay scoped to the destination, including synthetic
actors. Pending operation recovery must not charge or resolve against the original actor after a copy/import.

There are no native existing store/stored-spell fields in the current schemas. Do not invent a legacy conversion or
infer enchantments from descriptions, traits, spell ownership or item names. Preserve existing physical item IDs/data,
ordinary spells and unknown third-party data. Concrete migration/default policies belong to
[Choose v0.9 migration and compatibility policy](09-migration-and-compatibility.md), now unblocked.

### Manual acceptance scenarios

| Setup and action | Expected result |
| --- | --- |
| Capacity 8/balance 5; explicitly spend 2, reload | Balance 3/8; actor MP untouched; no regeneration or repeat debit. |
| Attempt negative values, balance above capacity, or lower capacity beneath current balance | Reject/explain or request explicit correction; never silently lose stored points. |
| Single-use store 2/8; spend 2 | Store expended at 0; physical item, its quantity, charms and passives remain. Normal refill unavailable. |
| Reusable store 0/8; ordinary MP 5 plus temporary 4; refill 3 | Store 3/8, ordinary MP 2, temporary 4. No buffer-first transfer. |
| Refill beyond available ordinary MP/capacity; cancel or change balances while refill is open | Cannot overdraw/overfill; rejected or cancelled operation changes neither side, retry never repeats a completed transfer. |
| Operational enchanted item has quantity greater than one | Explain manual splitting; do not treat one saved balance as independent full balances for every unit. |
| Equip two rings and a necklace as readied ordinary items | All eligible benefits/access work; no count/slot limit. Carried/stored items are unavailable until readied. |
| Armour worn or natural weapon in existing natural state; unready/ready a source | Access follows the existing type's state, without recasting or changing saved balance/entry availability. |
| Personal ordinary MP 8 plus temporary pool 4; pay cost 5 personally | Temporary pool 0, ordinary MP 7; every item store untouched. |
| Personal MP 2, selected store 8; cast full cost 5 | Store pays actual outcome cost despite actor personal capacity/balance; personal MP unchanged. |
| Personal MP 2, store 2; choose full-cost-4 cast | Automated single-source payment unavailable; explain manual allocation, never silently combine pools. |
| Store balance 5; full-cost-4 success, critical, failure and fumble in separate setups | Resulting store balances respectively 1, 4, 4, 1; charge once; no personal debit. |
| Sorcery cast paid from store | Existing full cost on success/fumble, base one on critical/failure; do not cap payment at personal MP maximum. |
| Quick cast with insufficient personal MP and a full store | Store remains untouched; open ordinary dialog to choose it. Conditional choices still open a dialog as previously agreed. |
| Cancel cast or reduce/remove/unready store while dialog is open | No stale cast/payment; show changed eligibility/affordability rather than lower magnitude or choose another source. |
| After confirmation/dice, actual cost cannot be paid or write fails | Same outcome visibly unpaid/unresolved; no Apply effect until settlement; no clamp, fallback or reroll. |
| Retry after payment succeeded but entry update/card publication failed | Finish missing step with same outcome; no second payment, expenditure or cast. |
| Two owners concurrently spend the same store or invoke one single-use entry with different sources | No double spending or two successful uses of one available entry. Show pending/conflicting result for explicit recovery. |
| Give charm to wielder with different skill and no learned copy of spell | Uses new wielder's current casting skill/conditional choices; stored magnitude and definitions unchanged. Missing casting skill blocks use. |
| Variable stored magnitude 4; choose 2, then try 5; fixed magnitude 4 | Variable permits 2 but not 5; fixed uses 4. Successful single-use lower cast still expends that entry. |
| Two stored spells, one single-use; success/critical/failure/fumble in separate setups | Success/critical expends selected single-use entry; failure/fumble retains it. Other entry, store apart from payment, item and passives persist. |
| Successful cast resisted or recipient not selected | Selected single-use entry was expended on cast; no automatic refund because later effect application is absent. Human adjudicates resistance. |
| Edit/delete original spell, then invoke copied charm; edit/delete charm after card | Stored definition survives original edits; complete historical card preserves its cast and does not need the source for Apply. |
| Apply from a paid charm card, repeat Apply, or end its originating charm | Prior application review/receipt rules prevent accidental repeat grants; no new casting payment/entry expenditure; applied benefits keep their own lifecycle. |
| Copy item or duplicate/import actor with partially spent store and expended entry | Exact saved remainder/expenditure preserved, no recharge or clearing; copies independent; no pending recovery charges original actor. |
| Two unlinked tokens share a base actor; use/refill a token's enchanted item | Only that synthetic actor's item/resources change; reload retains its state. |

### Reviewable delivery consequences

Keep these as separately testable candidate increments, to be sized/ordered by
[Finalize reviewable chunks and release acceptance criteria](08-release-chunks.md):

1. Store ledger and access: capacity/balance/reuse state, quantity-one handling, manual spend/correction/refill,
   copy/reload and synthetic-actor behavior. Useful without Active Effects or casting integration.
2. Store-paid casting: explicit source selection, affordability/outcome costs, personal-pool integration, quick-path
   behavior and no-MP separation. Include meaningful cost-allocation tests and visible cast-source context.
3. Interrupted/concurrent casting: unpaid result, settlement, retry and recoverable payment/expenditure/publication.
   This correctness boundary must be present before releasing store-paid casting or single-use charm use; it may be
   reviewed as a prerequisite slice but cannot be left as an unfunded later promise.
4. Personal Magic charm authoring/use: self-contained entries, current wielder skill, fixed/variable magnitude,
   success-only per-entry expenditure and reusable behavior. Personal-payment use does not inherently depend on store
   selection; store-funded use reuses it. Successful-card application depends on the prior snapshot/application work.
5. Manual-case documentation and representative item examples accompany the relevant slices; matrices/potions/scrolls
   and blessed items must have usable manual steps and accurate distinctions, not a misleading generic Use charm action.

Ledger/refill tests should cover conservation, bounds, excluded temporary MP and duplicate operations; casting tests
should cover chosen-source/outcome allocation, changed balances, missing permissions/source, same-source concurrency,
partial failures and retry; charm tests should cover snapshot independence, per-entry consumption and copy identity.
These are requirements for later implementation, not tests of new runtime code in this planning session.
