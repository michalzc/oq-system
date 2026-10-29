# Finalize reviewable chunks and release acceptance criteria

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 09, 10

## Question

Given the resolved decisions, what ordered implementation plan can the user review and manually test one increment at
a time? Refine the [candidate sequence](../assessment.md), splitting broad rows further where necessary.

For each chunk record its observable behavior, prerequisites, representative content and a headline acceptance
scenario pointing at the resolved decisions' acceptance tables. Each slice must be playable and reviewable; do not
replace this with technical-layer-only tickets or one large content-loading PR. Exact per-ticket setup/actions/expected
values, diff boundary, documentation and automated checks are written later by the spec and ticket flows (amended
with the user while resolving this ticket, to avoid duplicating that work here).

Identify independent tracks and the minimum complete v0.9 scope. Record the agreed chunk boundaries and acceptance
criteria so the completed map can feed the subsequent specification and implementation-ticket flows. Carry forward
the coverage inventories with explicit manual workflows, including the now-agreed conditional test-selection behavior.
Do not label wayfinder decisions as implementation-ready or execute the release inside this map.

## Comments

The resource decision requires separate temporary HP/MP buffers. The candidate sequence now splits HP buffers, MP
buffers, non-resource characteristic effects, maximum/current transitions and Vigour integration into separately
testable behaviors. Tap stays manual. Carry forward the explicit acceptance examples and compatibility requirement
for stored legacy excess values; do not reintroduce scalar ordinary overflow as the planned representation.

[Specify Apply effect on spell and ability result cards](04-chat-card-application.md) now provides the application
contract and click-by-click Protection/hostile-ability scenarios. Assess separate reviewable slices for historical
cast snapshots, recipient application/permissions/conflicts and partial results, non-rolled use cards, and complete
follow-up damage snapshots. These are concrete behaviours to size here, not approved extra implementation chunks.
Keep old/incomplete cards on the explicit manual fallback and preserve the owner-without-message-edit-permission case.

[Separate item-local effects, passive transfer, and applied templates](05-item-ownership-and-transfer.md) now owns
activation, source lifecycle, target binding, application receipts and whole-actor copy/import behavior. Use its
acceptance table to size the item-local preparation, owner-passive/state-gating, missing-target repair and recipient
history work; abilities can combine owner passives and used templates. Do not silently fold all of these into one
large item-effects increment. Keep this sequence provisional until
[Choose v0.9 migration and compatibility policy](09-migration-and-compatibility.md) is resolved.

[Choose OpenQuest conditions and useful manual reminder workflows](06-conditions-and-reminders.md) now owns the curated
palette, numeric-free generic markers, source-aware controls, reminder surfaces, unchecked conditional defaults and
quick-roll dialog policy. Use its Hinder/Truth Seeker/Demoralise workflows and acceptance table. Size the generic and
spell-specific roll paths, token/tracker visibility, indefinite no-change reminders and source-safe marker controls as
reviewable behaviors; follow-up damage must retain its already-agreed historical basis.

[Bound magic point stores and stored-spell casting for v0.9](07-enchanted-items.md) now owns the store/refill/access,
single-source payment, unpaid settlement and portable Personal Magic charm contracts, with a scope table and exact
acceptance scenarios. Keep ledger, payment integration, casting recovery and charm authoring/use reviewable separately;
recovery must accompany/predecessor any release of payment/single-use casting. Ledger has no effect dependency; a
personal-paid charm does not inherently depend on store selection. Size snapshot/application integration explicitly.
Other enchanted kinds and special reservoirs have documented manual workflows, not hidden extra automation scope.
Do not describe single-source UI or ordinary-only refill policies as explicit SRD prohibitions.

The user narrowed compatibility scope while discussing
[Choose v0.9 migration and compatibility policy](09-migration-and-compatibility.md): pre-v0.9 ActiveEffects created by
users/macros/modules are unsupported and will not be migrated, classified or repaired. Do not size legacy-effect
adapters, role inference, status/grant conversion or repair tooling into the release. Preserve official pre-existing
actor/item/resource/chat data and the new feature's own save/copy/import contracts; leaving old effect definitions
alone does not guarantee their behavior. The remaining compatibility choices concern excess resource attribution
and adoption of new official templates on existing world/owned spell copies.

[Choose v0.9 migration and compatibility policy](09-migration-and-compatibility.md) is resolved with the narrowed support
boundary and source-overflow fixtures: recover only excess still stored, no legacy-effect adapter, no retroactive
resource actions, existing migration retry behavior and safe ordinary-data imports. The user suggested an optional,
manually invoked macro to refresh SRD spells on world actors; its exact adoption/replacement contract is now
[Define the optional SRD spell refresh macro](10-srd-spell-refresh.md). Resolve that prerequisite before sizing its
content/tooling chunk; do not silently include an automatic world spell replacement in migration work.

[Define the optional SRD spell refresh macro](10-srd-spell-refresh.md) is resolved: size it as one late slice after
the first templated spells exist, with its documentation page; its pure planning/payload functions carry the tests.

## Answer

Resolved with the user in three question rounds (Q1–Q20); every recommendation was accepted except that the
`prototype/*` branches from the earlier `#14` effort are ignored entirely, and the bestiary ability pack was clarified
as building blocks for a later actor bestiary. This answer is decision-level: the spec and ticket flows expand each
chunk into exact setup, expected values, diff boundary, documentation and automated checks.

### Minimum complete v0.9

| Must ship | May slip to 0.9.x as a unit, blocking nothing else |
| --- | --- |
| Res, Fx, Itm, App, Clk, Cnd tracks; content batches for every Automated/Assisted spell and the bestiary abilities; the manual-coverage documentation batch; release-acceptance checklist | Ench track (ledger → recoverable payment → store casting → charms) and the SRD refresh macro |

If Ench slips, today's underfunded-cast behavior remains in v0.9, because recoverable payment (Ench2) is what replaces
it for ordinary casting too.

### Delivery rules

- One PR per chunk into `master` as it passes review; `check.yml` runs on each. No release is cut until every
  must-have chunk has landed. A 0.8.x hotfix branches from the `v0.8.2` tag. No long-lived integration branch.
- Every chunk meets the [Definition of a reviewable chunk](../assessment.md#definition-of-a-reviewable-chunk) unchanged:
  one coherent behavior, no infrastructure-only PR, reversible source-aware changes, character/NPC and linked/unlinked
  checks where relevant, documentation (`docs/packs/`) and coverage inventory updated in the same PR, `yarn test`,
  `yarn lint` and `yarn build`, and tests only where calculation/lifecycle/migration risk exists.
- Mechanic chunks carry only the one or two representative templates their acceptance scenario needs. The remaining
  content follows in separate batches (below).
- The spec/ticket flows and implementers may split a chunk further when the implementation exposes it; they never
  merge chunks across tracks. This replaces the map's former "Not yet specified" item.

### Chunks and dependency graph

Headline scenarios name the behavior to demo; the linked decision's acceptance table owns the full cases.

| Chunk | Behavior and representative content | Headline acceptance | Blocked by |
| --- | --- | --- | --- |
| **Res1** Temporary HP pools | Manual source pools, aggregate display, FIFO damage before ordinary HP, ordinary-only healing, sheet/chat/token consistency; legacy stored HP excess recovered into one manual pool (migration + late import). | HP 6/10, pools A=4 then B=3, take 5 → 6/10, A=0, B=2; v0.8 actor at 15/10 becomes 10/10 + 5 once. [02](02-resource-semantics.md), [03](03-lifetime-and-duplicates.md), [09](09-migration-and-compatibility.md) | — |
| **Res2** Temporary MP pools | Same for MP, including affordability/payment and legacy MP excess. | MP 8/10, A=2 then B=4 funds 5 → 8/10, A=0, B=1; cancelling changes nothing. [02](02-resource-semantics.md), [09](09-migration-and-compatibility.md) | Res1 |
| **Fx1** Actor effects with Protection | Actor-sheet effect create/edit/enable/disable/delete with source/rules text, preparation-order fix, numeric AP, one no-change reminder. Sheet only; token/tracker display is Cnd1. | Protection 3 over 2 AP armour → 5 AP; disable/remove/reload restores 2 with no repeated bonus. [01](01-supported-mechanics.md) | — |
| **Fx2** Movement | Movement operations and floor; Mobility, Slow. | Each independently changes and restores movement through reload. [01](01-supported-mechanics.md) | Fx1 |
| **Fx3** Characteristics | Characteristic operations through effective skills and Damage Modifier without granting learned Master eligibility; Enhance STR. No resource lifecycle. | STR across a Damage Modifier threshold changes skill and weapon damage; removal restores. [01](01-supported-mechanics.md) | Fx1 |
| **Fx4** Maximum/current transitions | Signed maximum delta adjusts ordinary current once; temporary pools untouched; POW spell exception. | HP 6/10 + temp 4 under +4 max → 10/14 + 4; removal → 6/10 + 4. [02](02-resource-semantics.md) | Res1, Res2, Fx3 |
| **Fx5** Named skill modifier | Target one skill preserving strongest-modifier, caps and Master rules; Enhance Skill. | Test bonus reaching 100% does not confer Master. [01](01-supported-mechanics.md) | Fx1 |
| **Fx6a** Conditional choices | Unchecked matching conditional choices and a separate reminders section in skill and weapon test dialogs; direct-formula matching; Strength Athletics, Ironmind. | Conditional +20 on skill 60: starts 60, selected 80, next test unchecked again, nothing consumed. [01](01-supported-mechanics.md), [06](06-conditions-and-reminders.md) | Fx5 |
| **Fx6b** Quick-roll paths | Quick requests on skill, weapon, rolled ability and rolled casting open the dialog when a conditional choice matches; otherwise stay quick and show reminder context on the card. | Quick-roll with matching Hinder opens the dialog; with only Demoralise stays quick with reminder on card. [06](06-conditions-and-reminders.md) | Fx6a |
| **Itm1** Item-local effects | Item-local preparation; intrinsic weapon enhancement on its item only. | +2 hit on sword A only, surviving rename/state change/reload/copy. [05](05-item-ownership-and-transfer.md) | Fx1 |
| **Itm2** Owner passives | Transfer to owner with per-definition state gating and enable toggle; equipment AP passive and a passive creature ability. | Readied +2 AP passive: 2 once, 0 when carried, 2 (not 4) when readied again. [05](05-item-ownership-and-transfer.md) | Fx1 |
| **App1** Apply effect | Successful card **Apply effect** to one recipient: historical snapshot, owner/GM permission, duration shown at confirmation, double-submit guard, recipient-owned application receipt; repeat click shows the earlier application and needs an explicit new application. Protection. | 04's click-by-click Protection steps 1–6 for one recipient. [04](04-chat-card-application.md), [05](05-item-ownership-and-transfer.md) | Fx1 |
| **App2** Conflict review | Review against existing recipient effects from any card: inspect/keep, end/replace, cancel; stale-conflict recheck. | Second Protection card on the same ally offers keep/replace; keep leaves AP and duration unchanged. [03](03-lifetime-and-duplicates.md), [04](04-chat-card-application.md) | App1 |
| **App3** Multiple recipients | Several recipients, linked-token dedupe, unlinked synthetic actors, per-recipient outcomes and retry of failures only. | Two linked tokens → one application; two unlinked tokens → only selected synthetic actors change; a failure retries alone. [04](04-chat-card-application.md) | App1 |
| **App4** Use ability / non-rolled | **Use ability** card for non-rolled abilities and Apply after non-rolled Divine casting, without casting tests or MP. | Ghoul Howl applies Demoralise numbers plus reminders; no charge. [04](04-chat-card-application.md) | App1 |
| **App5** Damage basis snapshot | Test cards record the full damage formula and selected conditional contributions; follow-up damage uses them. | 1D8 + 1D4 + selected +2 survives later source edits and effect ending. [04](04-chat-card-application.md), [06](06-conditions-and-reminders.md) | Fx6a |
| **App6** Weapon Enhance binding | Recipient-chosen weapon binding by identity; missing-target suppression and explicit rebind/end. | Only sword A gains +2; deleting A shows missing target, no same-name substitution. [05](05-item-ownership-and-transfer.md) | App1, Itm1 |
| **Clk1** Core clocks | Five-second rounds, round and world-time expiry, declaration/execution boundary, once-only active-GM catch-up including maximum/current transitions. | One-round effect survives declaration, expires at execution; reload catch-up happens once. [03](03-lifetime-and-duplicates.md) | Fx4 |
| **Clk2** Vigour | Applied effect creates a linked source-specific HP pool with the grant cap; disable suspends remainder, ending discards it. | HP 6/10, Vigour 4, take 3 → ending leaves 6/10; unrelated pool survives. [03](03-lifetime-and-duplicates.md), [04](04-chat-card-application.md) | Res1, App1, Clk1 |
| **Cnd1** Conditions display | Curated palette replacing the core list, custom reminders, sheet/token/tracker icons with reachable rules, Dead keeps defeated-combat behavior, Blinded/Invisible leave vision alone. | Standalone Prone visible everywhere, no numbers; no-change reminder persists through reload. [06](06-conditions-and-reminders.md) | Fx1 |
| **Cnd2** Source-aware controls | HUD/marker controls that expose and end individual sources, multi-source badges including eligible passives. | Two paralysis sources: ending one keeps Paralysed. [06](06-conditions-and-reminders.md) | Cnd1, Itm2 |
| **Ench1** Store ledger | Capacity/balance, single-use/reusable, quantity-one, explicit spend/correction/refill from ordinary MP. | Reusable 0/8, MP 5 + temp 4, refill 3 → 3/8, MP 2, temp 4. [07](07-enchanted-items.md) | — |
| **Ench2** Recoverable payment | Unpaid/unresolved outcomes, settlement and retry for all MP casting; replaces finishing underfunded. | Write fails after dice → visibly unpaid, no Apply until settled, retry pays once. [07](07-enchanted-items.md) | Res2 |
| **Ench3** Store-paid casting | Explicit single-store selection, outcome costs, personal-only quick casting. | Store 5, cost-4 success/critical/failure/fumble → 1, 4, 4, 1. [07](07-enchanted-items.md) | Ench1, Ench2 |
| **Ench4** Personal Magic charms | Self-contained spell entries, wielder's casting skill, fixed/variable magnitude, success-only per-entry expenditure; personal payment (store payment arrives with Ench3). | Charm given to another wielder uses their skill; success expends the single-use entry, failure keeps it. [07](07-enchanted-items.md) | Ench2, App1 |

Day-one starts: Res1, Fx1, Ench1. Longest chain: Res1 → Res2 → Fx4 → Clk1 → Clk2.

### Content, documentation and tools

- **Spell batches** of roughly a dozen items, each with its own short manual check, in mechanic order: Protection/AP →
  movement → characteristics → skills → conditional → Vigour → condition/reminder-only. Each batch is blocked by its
  mechanic chunk and App1. Earth Scream and Venom are added in their matching batch.
- **Bestiary ability batches** go into a **new compendium pack of `specialAbility` items**, one folder per creature,
  each item linking to its Bestiary journal page as the rules source. Related rows group into one item with several
  effect definitions. They are reusable building blocks for a later actor bestiary; the journal remains the reference.
  Batches are blocked by App4 and, for numeric payloads, their mechanic chunk.
- **Coverage inventory** becomes a generated documentation journal page from `docs/packs/`, listing every spell and
  bestiary ability as Automated, Assisted or Manual with its manual workflow. Each batch updates its rows. The
  [spell](../spell-coverage-draft.md) and [bestiary](../bestiary-coverage-draft.md) drafts are its starting data and
  stop being maintained.
- **Manual-coverage documentation batch** comes last: the Manual spells, matrices/potions/scrolls/blessed items, Tap
  and special reservoirs, per decisions [02](02-resource-semantics.md) and [07](07-enchanted-items.md).
- **SRD refresh macro** per [10](10-srd-spell-refresh.md), blocked by the first spell batch.
- **Release-acceptance checklist**: a code-free ticket after all must-haves land. Run a short end-to-end session on a
  fresh world and on a copy of a v0.8.2 world (excess recovery, preserved owned spells, untouched legacy effects), then
  bump the version and cut the release.

### Handoff to the spec and ticket flows

Write one spec per track, each in its own `.scratch/` folder, in graph order, one session each (resources and actor
effects first):

| Folder | Chunks |
| --- | --- |
| `v09-resources` | Res1, Res2 |
| `v09-actor-effects` | Fx1–Fx6b, Itm1, Itm2 |
| `v09-application` | App1–App6, Clk1, Clk2 |
| `v09-conditions` | Cnd1, Cnd2 |
| `v09-enchanted` | Ench1–Ench4 |
| `v09-content` | Spell and bestiary batches, manual-coverage batch, refresh macro, release checklist |

Cross-track blocking edges are written as relative paths to the other folder's ticket. Each spec reads this answer,
the decisions it cites and the [assessment](../assessment.md) definition of a reviewable chunk; this answer
supersedes the assessment's candidate sequence. The `prototype/effect-editor-and-sheets` and
`prototype/resource-accounting` branches belong to the earlier `#14` effort and are not inputs.
