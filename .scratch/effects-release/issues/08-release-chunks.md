# Finalize reviewable chunks and release acceptance criteria

Labels: wayfinder:grilling
Type: grilling
Parent: ../map.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 09

## Question

Given the resolved decisions, what ordered implementation plan can the user review and manually test one increment at
a time? Refine the [candidate sequence](../assessment.md), splitting broad rows further where necessary.

For each implementation issue record one observable behavior, prerequisites, concrete content examples, diff boundary,
exact manual setup/actions/expected values, documentation, meaningful automated checks, and migration needs. Each slice
must be playable and reviewable; do not replace this with technical-layer-only tickets or one large content-loading PR.

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
