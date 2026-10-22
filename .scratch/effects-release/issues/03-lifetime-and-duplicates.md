# Choose duration, duplicate, and conflicting-effect handling

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md

## Question

Which expiration clocks should v0.9 support automatically, and how should humans handle duplicate/conflicting effects?

Decide the practical minimum using Foundry v14's existing duration/expiration behavior. Compare elapsed world time,
combat rounds, concentration, repeated application, and manual early removal. Next-applicable-use consumption remains
manual. Do not turn special cancellation such as healing ghoul paralysis into a generic event engine.

Decide how repeated applications are presented and selected. Divine duplicate magnitudes do not add, but some different
defenses combine and others explicitly cancel/exclude one another. Is visible human selection sufficient for these
cases? Do not invent a universal stacking policy beyond the local SRD evidence.

Record explicit examples for duplicate Protection, duplicate Shield, cancelling mental effects, repeated chat-card
application, expiration after reload, and a manual reminder with no clock. Check timing assumptions against the
existing declaration/round workflow and installed core before recommending a custom timer.

## Comments

### Source-specific temporary-point pools and FIFO confirmed

The user approved one temporary-point pool per grant, separately for HP and MP, with a visible aggregate total
and access to its source pools. They chose spending in grant order (**FIFO**) for v0.9: oldest available temporary
pool first, then subsequent pools, and ordinary points only after available temporary points are exhausted.
Earliest expiration does not determine priority. A later manual choice of pool/order is deferred.

This supersedes the initial no-ledger preference and single-buffer/single-source proposal. Grant identity and
remaining amounts allow ending one grant to remove only its own unspent points. The existence of separate pools
does not authorize duplicate-spell stacking; the confirmed human conflict decision still governs application.
FIFO must survive reload and have a stable grant sequence even when several grants share a world-time value.
Manual pool editing and disable/re-enable behavior remain to be settled.

### Round boundary and reload catch-up confirmed; grant model reopened

The user accepted the next two recommendations:

- Round-based effects expire when execution of the next round starts; declaration does not advance time.
  After combat ends or is deleted, remaining round effects require explicit manual ending or duration editing,
  without automatic conversion to elapsed-world-time durations.
- On world initialization the active GM catches up effects whose recorded deadline has already elapsed and
  performs their resource transitions once. Opening the world does not advance game time; repeated reloads
  must not repeat resource changes.

The user did **not** accept the proposed single-attributed-buffer cleanup workflow. They explicitly reopened
whether HP and MP should each have one temporary buffer or multiple source-specific pools, and how multiple
pools would be spent. This reopens the earlier no-ledger preference; do not treat it as a settled constraint.
Temporary-before-ordinary spending, ordinary-only recovery, manual adjudication of spell stacking, and the
single-grant Vigour cap remain settled. Storage/attribution, ordering, overlap and reactivation are still open.

### Clock and human-adjudication boundary confirmed

The user answered "yes to all" to the first four question recommendations:

- Support automatic expiration by elapsed world time and combat rounds using Foundry's existing mechanism.
  Configure the SRD five-second round so rounds also advance elapsed world time. The precise expiry boundary
  relative to declaration remains to be confirmed.
- Resolve overlapping temporary-HP grants explicitly with the human, rather than automatically summing or replacing
  them or introducing a per-source points ledger. A single Vigour grant into an empty buffer can be automatic.
- Present existing effects and require a visible human decision for duplicates/conflicts, including repeated
  application from a chat card. Display the relevant specific rules rather than inventing universal stacking.
- Keep concentration, situational ending conditions and reminders without clocks manually ended. Timed effects
  can also be ended early by a human.

Reload catch-up and the attribution/cleanup details of the single automatic temporary grant are still under discussion.

### Local lifetime and conflict evidence

[Duration and duplicate-effect evidence](../lifetime-evidence.md) records installed-core expiration behavior,
the missing five-second combat clock configuration, reload limitations, declaration timing, and the local SRD's
specific duplicate/cancellation rules. The user has confirmed the boundary above; the remaining lifecycle details
keep this ticket claimed, not resolved.

[Define excess HP/MP and temporary magical resource behavior](02-resource-semantics.md) establishes one temporary buffer
for each resource, buffer-first damage/spending, ordinary-only recovery, and Vigour's single-grant behavior. Decide how
overlapping/replacement grants interact with shared buffers and how ending one grant identifies its remaining points.
Compare manual conflict resolution or a single selected grant with any per-source ledger proposal; the latter has not
been approved. Do not silently remove unrelated temporary points or assume duplicate Vigour grants add together.

### Pool suspension and manual correction confirmed

The user accepted both final recommendations: disabling an effect makes its remaining grant unavailable without
refilling it or changing its FIFO position; the clock continues. Re-enabling before expiry restores only that
remainder. Expiration/deletion discards it. A fresh grant is explicit and joins the queue last. The aggregate is
a summary; humans correct an individual pool or add a manual grant, preserving existing pools' positions.

## Answer

Resolved with the user through the question rounds above, including their explicit choice of FIFO and acceptance
of the final suspension/editing recommendations. This answer supersedes the earlier single-buffer/no-ledger
proposal in the discussion. It establishes behavior for the release plan, not an implementation or storage schema.

### Supported clocks and ending

- Support elapsed world time (seconds/minutes, including longer durations expressed in that clock) and combat
  rounds through Foundry v14's existing duration/expiration machinery. Configure the SRD five-second round;
  turns do not independently add elapsed time. Passage of real time or opening a world does not advance game time.
- Round-based expiration happens when execution of the next round begins, using the existing combat lifecycle.
  Entering declaration does not advance the round or world time. A one-round benefit created in round R remains
  through the next declaration and ends at the execution boundary for round R+1.
- Elapsed-world-time effects expire when their duration elapses; do not accidentally inherit the core's default
  wait for a starting combatant's turn. Use the appropriate core expiry configuration for the chosen clock.
  Round and world-time durations remain distinct; do not attach two independent expiry clocks to one effect.
- After combat ends or is deleted, remaining round-based effects require explicit manual ending or duration editing.
  There is no automatic conversion to minutes. Elapsed-world-time effects continue to follow world time.
- Retain core's normal expired-state behavior rather than requiring automatic deletion. Expired effects are inactive
  and their ended resource grants are unavailable. Their records can remain visible for inspection/removal.
- The active GM catches up deadlines already elapsed when the world initializes. Persist expiration and its resource
  transitions once, including any ordinary maximum/current adjustment and selective grant cleanup. Repeated reloads,
  preparation and rerenders must neither apply those transitions again nor grant points again.
- Concentration ending, next-applicable-use consumption, special cancellation such as healing ghoul paralysis,
  and other situational ending conditions remain human actions. Show their rules and allow explicit early ending.
  An indefinite reminder with no clock remains until explicitly ended; it need not have numeric changes.

The [local evidence](../lifetime-evidence.md) identifies the missing five-second configuration, core's expiry-event
default and initialization catch-up gap. Reuse core clocks and add the necessary system lifecycle integration;
this decision does not call for a separate timer/event engine.

### Duplicate and conflicting effects

Present the existing effects and relevant rule text so a human can explicitly resolve duplicates/conflicts before
completing application, including application from an already-used chat card. Do not silently sum, replace,
refresh or select the greatest magnitude as a universal policy. The human can retain a selected effect, explicitly
end/replace one, or cancel application. An inactive record/reminder must not contribute another numeric benefit.

- **Protection:** its entry does not specify duplicate stacking. The human chooses the treatment; do not infer a
  global strongest-only or additive rule. A simple supported workflow keeps one selected Protection active.
- **Shield:** duplicate Divine magnitudes do not add. Shield 1 and Shield 2 must not yield Shield 3; the human selects
  the active instance rather than the system silently choosing a replacement.
- **Different defenses:** retain specific combination/exclusion rules. Shield can combine with physical armour
  and permitted spells, but excludes Absorption, Reflection and Spirit Block. Damage Resistance has its own
  combination/order rule; it does not become an AP modifier through a generic defense policy.
- **Mental effects:** show that Fanaticism and Demoralise cancel, and that Berserk takes precedence over Fanaticism.
  The human explicitly ends/selects the affected effects. Do not infer the same cancellation for Befuddle.
- **Repeated application:** encountering an existing effect enters the same visible conflict workflow; it does not
  silently add another effect or another resource grant. Applying never casts again or pays casting costs again.
  Recipient selection, cast snapshots, permissions and the precise repeat-click UI remain with
  [Specify Apply effect on spell and ability result cards](04-chat-card-application.md).

Selecting multiple permitted grants is distinct from granting blanket permission to stack copies of a spell.
No general conflict-detection/resolution engine is required; the workflow must make human adjudication usable.

### Source-specific temporary-point pools

Each explicit grant creates a distinct **temporary-point pool** for HP or MP. Display the available aggregate total
with access to its constituent source pools. This refines the aggregate buffer semantics in
[Define excess HP/MP and temporary magical resource behavior](02-resource-semantics.md); ordinary-only recovery,
temporary-before-ordinary spending, nonnegative amounts, grant-specific limits and normal-maximum transitions remain.

- Spend available pools in **FIFO grant order**, then ordinary points. Finish the oldest available pool before
  taking points from the next one. Earliest expiry is not a priority rule. No manual source/order selector in v0.9.
- Preserve grant identity, remaining amount and stable sequence across reload. Grants made at the same world-time
  value still have a stable order. The storage shape and migration remain to be specified later.
- Ending an applied benefit removes only its own remaining points. Never subtract its original amount from the
  aggregate or clear other grants. Consuming a pool to zero does not authorize preparation/reload to refill it.
- Disabling an effect suspends availability of its remaining grant, preserving that amount and its FIFO position.
  Spending skips it. Its clock continues. Re-enabling before expiry restores only the remainder at its original
  position, without granting fresh points. Expiration or deletion discards the remainder even if suspended.
- A fresh grant requires an explicit action and goes to the end of the queue. It does not reuse an expired grant
  or silently turn an enable/disable toggle into healing. Its application still observes the human conflict workflow.
- The aggregate is a summary. Manual correction edits a named pool's remaining amount without moving it in FIFO;
  adding points as a new grant creates a new pool at the end. Manual grants can exist without an effect or a clock.
  Ordinary current-value edits remain distinct from explicit damage/spending and from pool corrections.
- Vigour creates a pool using its already-agreed `min(2 × magnitude, normal HP maximum)` grant. Ordinary healing
  never refills it. Ending that applied Vigour discards just its pool's remainder. Other permitted pools coexist
  without being trimmed by Vigour's cap or deleted by its ending.
- Tap gain/distribution and post-Tap decay remain manual. Edit the relevant MP pool during that bookkeeping;
  ending Tap is not an instruction to erase its entire excess immediately. There is no automatic Tap decay clock.
  Item/spirit MP stores remain separate payment sources, not automatically merged personal temporary-point pools.

### Acceptance examples for the later implementation plan

These scenarios specify observable results, not implementation tests written during this planning effort. In pool
examples A precedes B in FIFO; ordinary points, pools and available total must survive reload distinctly.

| Scenario | Expected behavior |
| --- | --- |
| Actor has 2 AP before magic; Protection 2 is active and Protection 3 is applied | Show the existing effect and rule. If the human explicitly replaces Protection 2 with Protection 3, final AP is 5. Do not silently produce 7 AP or auto-select a magnitude. |
| Shield 1 exists; apply Shield 2 | Human selects the active instance; selecting Shield 2 gives its magnitude-2 benefits, never Shield 3. |
| Fanaticism exists; apply Demoralise and human confirms their cancellation | End both contributions explicitly and restore the affected values. Do not apply this cancellation rule to unrelated mental effects. |
| Click Apply effect again on a card whose effect already exists | Present the existing effect for explicit conflict handling; cancelling leaves effects, pools and MP unchanged. No second casting charge. |
| HP 6/10; A grants 4, then B grants 3; take 5 damage | A has 0, B has 2, ordinary HP remains 6. Ending A leaves B's 2 untouched. Ending B then leaves ordinary HP 6/10. |
| MP 8/10; A grants 2, then B grants 4; spend 5 | A has 0, B has 1, ordinary MP remains 8. Reload preserves B's remainder and order. |
| HP 6/10; A has 1 and B has 2; heal 4 | Ordinary HP becomes 10/10; A and B remain 1 and 2. |
| HP 6/10; A has 4 and B has 3; disable A, then take 5 damage | B is exhausted and ordinary HP becomes 4; A retains 4 unavailable points. Re-enable A before its deadline: only those 4 return, in A's original FIFO position. |
| A is suspended when its deadline passes | End A and discard its remainder. Re-enabling/reloading does not recreate points. Other pools survive. |
| Correct A's remaining 1 to 3, then explicitly add C with 4 | A keeps its original order; C follows all existing grants. The aggregate reflects the corrections without assigning points to an unrelated source. |
| A timed grant and a +4 ordinary-HP-maximum effect elapsed but were not persisted as expired; HP is 2/14 and unrelated pool B has 3 | Active-GM initialization discards only the timed grant and applies the maximum transition once: ordinary HP 0/10, B still 3. Reload again changes neither. |
| One-round effect applied during round R | Opening the next declaration neither advances time nor ends it. Starting execution of R+1 advances world time by 5 seconds and expires it. |
| Elapsed-time effect spans several rounds, then world time advances outside combat | Combat rounds contribute 5 seconds each; subsequent world-time advance can reach its deadline without waiting for a combatant's turn. |
| Indefinite reminder or concentration effect without a clock | Advancing rounds/world time and reloading do not end it. Human ends it early/when the rule requires. |

Exercise the relevant cases on characters/NPCs, linked and unlinked tokens, and after reload. The later delivery plan
must separate ordinary maximum transitions from grant spending/cleanup so each can be reviewed and tested directly.

### Delivery consequences and remaining route

The independent temporary-HP and temporary-MP chunks now need manual source pools, aggregate display and FIFO spending
as complete workflows. Vigour adds the effect-to-pool grant/suspension/ending integration. Core clock configuration
and expiration catch-up form another visible slice. These refine candidates in the [evaluation](../assessment.md);
final implementation order remains with [Finalize reviewable chunks and release acceptance criteria](08-release-chunks.md).

No additional decision ticket is needed for pool order or lifetime policy. Effect ownership/representation and
application details remain in their existing tickets; migration compatibility remains fog until those are chosen.
Manual FIFO reordering/source selection and a general automatic conflict engine are outside this release plan.
