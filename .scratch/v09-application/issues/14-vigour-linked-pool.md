# 14: Vigour grants a temporary-HP pool linked to its effect

**What to build:** A recipient at HP 6/10 with pool B=3 receives Vigour magnitude 6. Applying creates the applied effect
and a new temporary-HP pool of 10 (2 × magnitude, capped at the normal HP maximum) after B, labelled with the source
and linked to the effect: HP 6/10, B=3. Damage takes the Vigour pool in its FIFO place before ordinary HP. Ending
Vigour removes only its remaining pool; other pools and ordinary HP are untouched. Reopening the card, retrying or
reloading never refills the pool; a new grant needs an explicit new application and joins the end of the queue. First
slice of chunk **Clk2**; see [the spec](../spec.md), section "Vigour (Clk2)", and user stories 76–78, 80–82.

A template can carry a **temporary HP grant** definition (2 per magnitude, capped at the recipient's normal HP
maximum), stored apart from its curated changes and recorded in the snapshot; the cap is resolved per recipient at
application. After creating the applied effect the writer grants the pool through the resources track's actor-level
interface, with an optional effect link on the pool record, and the receipt records the grant as done, so a retry after
a failed grant finishes only the grant. Deleting the linked effect removes its pool in the same client action.
Suspension while disabled and discard on expiry are ticket 15.

**Blocked by:** 03 (Application receipts, repeat clicks and the double-submit guard), [resources 04 (Temporary HP on the
token HUD and canvas bar)](../../v09-resources/issues/04-hp-token-hud-and-bar.md) (closes Res1)

**Status:** ready-for-agent

- [ ] Templates can define a temporary HP grant; the snapshot records it and the plan resolves
      `min(2 × magnitude, normal HP maximum)` per recipient.
- [ ] A confirmed new application grants one pool at the end of the queue, labelled with the source name and linked to
      the applied effect's id; the receipt records the grant.
- [ ] Repeat clicks, retries and reloads never grant again; a retry after a failed grant completes only the grant.
- [ ] Deleting the linked effect removes its pool and nothing else.
- [ ] The pool editor shows the link; manual correction of a linked pool keeps working.
- [ ] The SRD Vigour spell ships with its template; the coverage inventory row is updated once it exists.
- [ ] Applied-effects module tests: Vigour's capped grant; outcomes and retry set when the grant fails after the effect
      was created.
- [ ] Resource-points module tests: removing a linked pool leaves the others.
- [ ] The Magic documentation page explains Vigour's pool.
- [ ] Manual: the spec's Clk2 rows "HP 6/10, pool B=3: Apply Vigour magnitude 6", "HP 6/10, Vigour 4: take 3 damage; end
      Vigour" and "Vigour applied: reopen card, retry, reload" pass.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
