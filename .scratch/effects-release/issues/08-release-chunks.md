# Finalize reviewable chunks and release acceptance criteria

Labels: wayfinder:grilling
Type: grilling
Parent: ../map.md
Blocked by: 01, 02, 03, 04, 05, 06, 07

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
