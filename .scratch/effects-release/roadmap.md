# v0.9 effects release: roadmap

One page to find your place in the v0.9 effects effort. It summarizes order and status only. The decisions live in
[map.md](map.md) and its `issues/`, and the behaviour lives in the six track specs. Update the status columns whenever
a folder gets its tickets or a chunk merges.

## Where things are

| Stage | Where | State |
| --- | --- | --- |
| Decisions (wayfinder) | [map.md](map.md), `issues/01`–`10` | Done |
| Chunk list and dependency graph | [08 release chunks](issues/08-release-chunks.md), section "Chunks and dependency graph" | Done |
| One spec per track | `.scratch/v09-*/spec.md`, section "Delivery and dependencies" in each | Done |
| Tickets per track | `.scratch/v09-*/issues/` | Done |
| Implementation | One PR per chunk into `master` | Not started |

Where 08 and a spec disagree on a blocking edge, the spec is newer and wins. The specs added three edges:
App4 also needs Itm2, App6 also needs Fx5, and Clk1 also needs App1. The actor-effects tickets added two more: Itm1's
hit-modifier ticket also needs Fx5's first ticket (actor-effects 06), and Itm2 starts after Itm1's first ticket
(actor-effects 13), which adds the item effect role and Effects section both chunks use. The application tickets
added more: App1 starts after actor-effects 13 (its role field), and App5 also needs Itm1's first ticket (actor-effects
13, item-local damage terms). Three edges moved to later slices: Itm2 gates only App4's ability slice (application 07;
the Divine slice 06 needs only App1), Fx4 gates only Clk1's last slice (application 13), and Clk1 gates only Clk2's last
slice (application 15). The conditions tickets added more: Cnd1's first ticket (conditions 01, the palette) has no
blockers, so it can start in wave 0; the rest of Cnd1 needs actor-effects 01 and 02. Markers on templates
(conditions 05) is its own ticket after conditions 03 and application 02, so content batches that put markers on
templates need it, not just Cnd1. Itm2 gates only Cnd2's last ticket (conditions 07).

The enchanted tickets added and narrowed more edges. Ench1's refill ticket (enchanted 03) also needs resources 05
(temporary MP pools), so Ench1 01–02 stay in wave 0 but 03 waits for Res2's first ticket. Ench4's authoring ticket
(enchanted 09) needs only application 01, not Ench2. Ench3's first ticket (enchanted 07) needs only Ench1's 02 and
Ench2's 04. Ench4's Apply ticket (enchanted 12) also needs App2 (application 04) for duplicate review. Enchanted 13
(charms paid from a store) needs both Ench3 and Ench4 and ships with whichever lands second.

The content tickets added and narrowed more edges. Every spell batch needs application 06 (Apply effect on non-rolled
Divine cards), because each contains Divine spells; it reaches them through content 03, a new harness ticket that also
carries the template invariants, which can't exist on Cov's day one. Sp2a (content 05) also needs App2 (application 04)
for Demoralise's conflict review. Sun Disc (content 10) and Ab3 (content 22) also need conditions 05 for their markers.
Rules-text ability items (content 17 and 18) need only Cov; only the six reminder abilities (content 19) need App4 and
Cnd1. Ab4 needs Itm2 but not App4, Sp3a (content 07) doesn't need Sp2, and Sp5c (content 13) doesn't need App5.
Two capabilities not in the content spec's extension table were agreed when ticketing: reminders bound to a weapon
(content 13) and the cast magnitude in an applied name (content 15).

## Step 1: write tickets, one folder at a time, in this order

Run `/to-tickets .scratch/<folder>/spec.md` in a fresh session for each folder. Cross-track `Blocked by:` lines point
at another folder's ticket files, so a folder can only be ticketed after every folder it depends on.

| # | Folder | Chunks | Needs tickets from | Tickets |
| --- | --- | --- | --- | --- |
| 1 | [v09-resources](../v09-resources/spec.md) | Res1, Res2 | — | [x] |
| 2 | [v09-actor-effects](../v09-actor-effects/spec.md) | Fx1–Fx6b, Itm1, Itm2 | resources | [x] |
| 3 | [v09-application](../v09-application/spec.md) | App1–App6, Clk1, Clk2 | resources, actor-effects | [x] |
| 4 | [v09-conditions](../v09-conditions/spec.md) | Cnd1, Cnd2 | actor-effects | [x] |
| 5 | [v09-enchanted](../v09-enchanted/spec.md) | Ench1–Ench4 | resources, application | [x] |
| 6 | [v09-content](../v09-content/spec.md) | Cov, Sp1–Sp6c, Ab1–Ab5b, Man, Ref, Rel | actor-effects, application, conditions | [x] |

Steps 3 and 4 do not depend on each other and can be done in either order. Content goes last because it depends on
three other tracks.

You can start implementing as soon as step 1 is done: Res1 has no blockers.

## Step 2: build, one chunk per PR

A chunk can start once every chunk in its "Blocked by" column has merged. The waves below group chunks by the
earliest point they can start. Anything in a wave can be worked in any order, or in parallel.

| Wave | Can start once earlier waves are done | Notes |
| --- | --- | --- |
| 0 | Res1, Fx1, Ench1, Cov | No blockers at all |
| 1 | Res2, Fx2, Fx3, Fx5, Itm1, Itm2, App1, Cnd1, Cov's creature page (content 02) | Most need only Fx1, so Fx1 opens the most work |
| 2 | Fx4, Fx6a, App2, App3, App4, App6, Cnd2, Ench2, first rules-text abilities (content 17) | First ability items become possible |
| 3 | Fx6b, App5, Clk1, Ench3, Ench4, template harness (content 03), rules-text abilities (content 18) | Content 03 opens every spell batch |
| 4 | Clk2, Sp1, Sp2, Sp3a, Sp5, Sp6b, Sp6c, Ab1, Ab4, reminder abilities (content 19) | |
| 5 | Sp3b, Sp4, Sp6a, Ab3, Ref | Need Sp2 or Sp1 |
| 6 | Ab2, Man's spell page (content 24) | Content 24 needs every Sp batch |
| 7 | Man's creature page (content 25) | Needs every Ab batch |
| 8 | Rel | Needs every must-ship chunk |

The longest path to release is **Fx1 → Itm1 (ticket 13) → App1 → App4 (ticket 06) → template harness → Sp2 → Sp3b → Ab2
→ Man → Rel**, so App1 and the first App4 ticket should not wait behind other work.

Ench1–Ench4 and Ref may slip to 0.9.x as a unit without blocking anything else. Everything else must ship.

## All chunks

Fill in the ticket path once a folder is ticketed and tick Merged when the PR lands.

| Chunk | Track folder | Blocked by | Ticket | Merged |
| --- | --- | --- | --- | --- |
| Res1 Temporary HP pools | resources | — | [01–04](../v09-resources/issues/) | [ ] |
| Res2 Temporary MP pools | resources | Res1 | [05–07](../v09-resources/issues/) | [ ] |
| Fx1 Actor effects with Protection | actor-effects | — | [01–02](../v09-actor-effects/issues/) | [ ] |
| Fx2 Movement | actor-effects | Fx1 | [03](../v09-actor-effects/issues/) | [ ] |
| Fx3 Characteristics | actor-effects | Fx1 | [04](../v09-actor-effects/issues/) | [ ] |
| Fx4 Maximum/current transitions | actor-effects | Res1, Res2, Fx3 | [05](../v09-actor-effects/issues/), 17 if after Itm2 | [ ] |
| Fx5 Skill test modifiers | actor-effects | Fx1 | [06–07](../v09-actor-effects/issues/) | [ ] |
| Fx6a Conditional choices | actor-effects | Fx5 | [08–10](../v09-actor-effects/issues/) | [ ] |
| Fx6b Quick-roll paths | actor-effects | Fx6a | [11–12](../v09-actor-effects/issues/) | [ ] |
| Itm1 Item-local effects | actor-effects | Fx1, Fx5 (ticket 14) | [13–14](../v09-actor-effects/issues/) | [ ] |
| Itm2 Owner passives | actor-effects | Fx1, Itm1 (ticket 13) | [15–16](../v09-actor-effects/issues/), 17 if after Fx4 | [ ] |
| App1 Apply effect | application | Fx1, Itm1 (ticket 13) | [01–03](../v09-application/issues/) | [ ] |
| App2 Conflict review | application | App1 | [04](../v09-application/issues/) | [ ] |
| App3 Multiple recipients | application | App1 | [05](../v09-application/issues/) | [ ] |
| App4 Use ability / non-rolled | application | App1, Itm2 (ticket 07 only) | [06–07](../v09-application/issues/) | [ ] |
| App5 Damage basis snapshot | application | Fx6a, Itm1 (ticket 13) | [08](../v09-application/issues/) | [ ] |
| App6 Weapon/skill binding | application | App1, Itm1, Fx5 | [09–10](../v09-application/issues/) | [ ] |
| Clk1 Core clocks | application | App1, Fx4 (ticket 13 only) | [11–13](../v09-application/issues/) | [ ] |
| Clk2 Vigour | application | Res1, App1, Clk1 (ticket 15 only) | [14–15](../v09-application/issues/) | [ ] |
| Cnd1 Conditions display | conditions | Fx1 (not ticket 01) | [01–04](../v09-conditions/issues/), 05 also needs App1 | [ ] |
| Cnd2 Source-aware controls | conditions | Cnd1, Itm2 (ticket 07 only) | [06–07](../v09-conditions/issues/) | [ ] |
| Ench1 Store ledger | enchanted | — (ticket 03: Res2 ticket 05) | [01–03](../v09-enchanted/issues/) | [ ] |
| Ench2 Recoverable payment | enchanted | Res2 | [04–06](../v09-enchanted/issues/) | [ ] |
| Ench3 Store-paid casting | enchanted | Ench1, Ench2 | [07–08](../v09-enchanted/issues/), 13 if after Ench4 | [ ] |
| Ench4 Personal Magic charms | enchanted | App1 (ticket 09), Ench2, App2 (ticket 12) | [09–12](../v09-enchanted/issues/), 13 if after Ench3 | [ ] |
| Cov Coverage page | content | — (ticket 03: App4 ticket 06) | [01–03](../v09-content/issues/) | [ ] |
| Sp1 Movement and combat order | content | Content 03, Fx2, Fx5 | [04](../v09-content/issues/) | [ ] |
| Sp2 Skill test modifiers | content | Content 03, Fx5, App2 (ticket 05 only) | [05–06](../v09-content/issues/) | [ ] |
| Sp3 Characteristics | content | Content 03, App6 (ticket 09), Fx4, Sp2 (ticket 08 only) | [07–08](../v09-content/issues/) | [ ] |
| Sp4 Conditional and damage additions | content | Sp2, Fx6a, App6 and Cnd1's markers (ticket 10 only) | [09–10](../v09-content/issues/) | [ ] |
| Sp5 Selected weapons | content | Content 03, App6 (ticket 09), App5 (tickets 11–12 only) | [11–13](../v09-content/issues/) | [ ] |
| Sp6a Conditions and behaviour | content | Content 03, Cnd1, conditions 05, Sp2 (ticket 06) | [14](../v09-content/issues/) | [ ] |
| Sp6b Wards | content | Content 03, Cnd1 | [15](../v09-content/issues/) | [ ] |
| Sp6c Senses and permissions | content | Content 03, Cnd1 | [16](../v09-content/issues/) | [ ] |
| Ab1 Venoms and poisons | content | Content 03, content 17, App4, Fx4, conditions 05 | [20](../v09-content/issues/) | [ ] |
| Ab2 Demoralising and spirit | content | Content 17, App4, Fx6a (ticket 08), Sp2 (ticket 05), Sp3 (ticket 08) | [21](../v09-content/issues/) | [ ] |
| Ab3 Conditional creature modifiers | content | Content 17, App4, Fx6a (ticket 08), Sp2 (ticket 05), conditions 05 | [22](../v09-content/issues/) | [ ] |
| Ab4 Werewolf | content | Content 03, content 17, Itm2, Fx2, Fx3 | [23](../v09-content/issues/) | [ ] |
| Ab5a, Ab5b Manual creature abilities | content | Cov (ticket 19: content 03, App4, Cnd1, conditions 05) | [17–19](../v09-content/issues/) | [ ] |
| Man Manual-coverage documentation | content | every Sp batch (ticket 24), every Ab batch (ticket 25) | [24–25](../v09-content/issues/) | [ ] |
| Ref SRD spell refresh macro | content | Sp1 | [26–27](../v09-content/issues/) | [ ] |
| Rel Release-acceptance checklist | content | every must-ship chunk | [28](../v09-content/issues/) | [ ] |

Vigour is not a separate content batch: its template ships with Clk2.
