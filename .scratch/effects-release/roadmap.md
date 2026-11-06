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
| Tickets per track | `.scratch/v09-*/issues/` | **In progress: resources and actor-effects done, next application or conditions** |
| Implementation | One PR per chunk into `master` | Not started |

Where 08 and a spec disagree on a blocking edge, the spec is newer and wins. The specs added three edges:
App4 also needs Itm2, App6 also needs Fx5, and Clk1 also needs App1. The actor-effects tickets added two more: Itm1's
hit-modifier ticket also needs Fx5's first ticket (actor-effects 06), and Itm2 starts after Itm1's first ticket
(actor-effects 13), which adds the item effect role and Effects section both chunks use.

## Step 1: write tickets, one folder at a time, in this order

Run `/to-tickets .scratch/<folder>/spec.md` in a fresh session for each folder. Cross-track `Blocked by:` lines point
at another folder's ticket files, so a folder can only be ticketed after every folder it depends on.

| # | Folder | Chunks | Needs tickets from | Tickets |
| --- | --- | --- | --- | --- |
| 1 | [v09-resources](../v09-resources/spec.md) | Res1, Res2 | — | [x] |
| 2 | [v09-actor-effects](../v09-actor-effects/spec.md) | Fx1–Fx6b, Itm1, Itm2 | resources | [x] |
| 3 | [v09-application](../v09-application/spec.md) | App1–App6, Clk1, Clk2 | resources, actor-effects | [ ] |
| 4 | [v09-conditions](../v09-conditions/spec.md) | Cnd1, Cnd2 | actor-effects | [ ] |
| 5 | [v09-enchanted](../v09-enchanted/spec.md) | Ench1–Ench4 | resources, application | [ ] |
| 6 | [v09-content](../v09-content/spec.md) | Cov, Sp1–Sp6c, Ab1–Ab5b, Man, Ref, Rel | actor-effects, application, conditions | [ ] |

Steps 3 and 4 do not depend on each other and can be done in either order. Content goes last because it depends on
three other tracks.

You can start implementing as soon as step 1 is done: Res1 has no blockers.

## Step 2: build, one chunk per PR

A chunk can start once every chunk in its "Blocked by" column has merged. The waves below group chunks by the
earliest point they can start. Anything in a wave can be worked in any order, or in parallel.

| Wave | Can start once earlier waves are done | Notes |
| --- | --- | --- |
| 0 | Res1, Fx1, Ench1, Cov | No blockers at all |
| 1 | Res2, Fx2, Fx3, Fx5, Itm1, Itm2, App1, Cnd1 | Most need only Fx1, so Fx1 opens the most work |
| 2 | Fx4, Fx6a, App2, App3, App4, App6, Cnd2, Ench2, Sp1, Sp2, Sp6b, Sp6c | First content batches become possible |
| 3 | Fx6b, App5, Clk1, Ench3, Ench4, Sp3, Sp4, Sp6a, Ab1, Ab3, Ab4, Ab5a, Ab5b, Ref | |
| 4 | Clk2, Sp5, Ab2 | |
| 5 | Man | Needs every Sp and Ab batch |
| 6 | Rel | Needs every must-ship chunk |

The longest path to release is **Fx1 → Fx5 → Fx6a → App5 → Sp5 → Man → Rel**, so Fx1, Fx5 and Fx6a should not wait
behind other work. The path through the resource track (Res1 → Res2 → Fx4 → Clk1 → Clk2) is one step shorter.

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
| App1 Apply effect | application | Fx1 | | [ ] |
| App2 Conflict review | application | App1 | | [ ] |
| App3 Multiple recipients | application | App1 | | [ ] |
| App4 Use ability / non-rolled | application | App1, Itm2 | | [ ] |
| App5 Damage basis snapshot | application | Fx6a | | [ ] |
| App6 Weapon/skill binding | application | App1, Itm1, Fx5 | | [ ] |
| Clk1 Core clocks | application | Fx4, App1 | | [ ] |
| Clk2 Vigour | application | Res1, App1, Clk1 | | [ ] |
| Cnd1 Conditions display | conditions | Fx1 | | [ ] |
| Cnd2 Source-aware controls | conditions | Cnd1, Itm2 | | [ ] |
| Ench1 Store ledger | enchanted | — | | [ ] |
| Ench2 Recoverable payment | enchanted | Res2 | | [ ] |
| Ench3 Store-paid casting | enchanted | Ench1, Ench2 | | [ ] |
| Ench4 Personal Magic charms | enchanted | Ench2, App1 | | [ ] |
| Cov Coverage page | content | — | | [ ] |
| Sp1 Movement and combat order | content | App1, Fx2, Fx5, Cov | | [ ] |
| Sp2 Skill test modifiers | content | App1, Fx5, Cov | | [ ] |
| Sp3 Characteristics | content | App1, App6, Fx3, Fx4, Sp2, Cov | | [ ] |
| Sp4 Conditional and damage additions | content | App1, App6, Fx6a, Sp2, Cov | | [ ] |
| Sp5 Selected weapons | content | App1, App5, App6, Itm1, Cov | | [ ] |
| Sp6a Conditions and behaviour | content | App1, Cnd1, Sp2, Cov | | [ ] |
| Sp6b Wards | content | App1, Cnd1, Cov | | [ ] |
| Sp6c Senses and permissions | content | App1, Cnd1, Cov | | [ ] |
| Ab1 Venoms and poisons | content | App4, Fx3, Fx4, Cnd1, Cov | | [ ] |
| Ab2 Demoralising and spirit | content | App4, Fx5, Fx6a, Sp2, Sp3, Cov | | [ ] |
| Ab3 Conditional creature modifiers | content | App4, Itm2, Fx6a, Sp2, Cov | | [ ] |
| Ab4 Werewolf | content | App4, Itm2, Fx2, Fx3, Cov | | [ ] |
| Ab5a, Ab5b Manual creature abilities | content | App4, Cnd1, Cov | | [ ] |
| Man Manual-coverage documentation | content | every Sp and Ab batch | | [ ] |
| Ref SRD spell refresh macro | content | Sp1 | | [ ] |
| Rel Release-acceptance checklist | content | every must-ship chunk | | [ ] |

Vigour is not a separate content batch: its template ships with Clk2.
