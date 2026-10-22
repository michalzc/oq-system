# Specify Apply effect on spell and ability result cards

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md
Blocked by: 01, 03

## Question

What exact workflow should the successful spell/ability chat card's **Apply effect** button provide?

The user chose explicit application after a successful roll; opposed-roll automation is not available and is not a
prerequisite. Decide recipient selection, one versus multiple targets, who may update another actor, and treatment of
unlinked tokens. Decide the equivalent application opportunity for non-rolled divine spells and non-rolled abilities.

Determine which resolved cast values are captured on the card, especially magnitude, selected characteristic/skill/
weapon, duration and source. Later changes to the original spell must not silently change the historical cast.
Set behavior for repeated clicks, multiple cards, a missing/deleted source, cancellation and failure. Applying an effect
must not cast again or pay MP twice. Manual resistance/adjudication must remain possible before clicking.

Record a click-by-click scenario for a caster applying Protection to an ally and a creature applying a hostile ability.
Use the mechanics and duplicate decisions rather than introducing a second conflict policy here.

## Comments

The mechanics decision includes per-test selection of matching conditional effects. Decide which selected contributions
are captured with the roll, including any contribution needed for a later damage roll from that card. This must not
re-query an unrelated current selection or silently consume the effect. It is distinct from the magnitude/source
snapshot for applying a spell to another actor.

The resource decision selects separate temporary HP/MP buffers. Vigour's application grants temporary HP; it must not
be implemented as an ordinary maximum/current modifier. Preserve the cast magnitude and use the resolved grant/cap
policy; coordinate source ending/overlap cleanup with the lifetime decision rather than silently clearing unrelated points.

[Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md) now settles clocks,
human duplicate/conflict resolution and source-specific pool lifecycles. Use that answer for repeated application
and explicit new grants; this ticket still owns their precise UI, permission and snapshot behavior.

### Application evidence and first question round

[Current-code application evidence](../application-evidence.md) records non-rolled divine cards, the missing non-rolled
ability activation path, live-item follow-up damage, and the recipient/permission constraints.

The first question round is awaiting the user's choices. Recommendations, **not approved decisions**, are:

- Confirm one or several recipients in a dialog prefilled from current targets, with an explicit Self choice and
  token-specific synthetic actors. Humans adjudicate target limits/eligibility.
- Capture the resolved cast/template independently of later source edits/deletion; choose recipient-specific bindings
  during application and never charge casting costs again.
- Start the recorded duration on confirmed application, with explicit GM correction for delayed adjudication.
- Require recipient ownership or GM authority; a GM can apply from a player's card to an unowned recipient.
- Give non-rolled divine casts and explicit non-rolled ability uses equivalent application cards.
- Preserve selected conditional contributions on test cards for later damage, without automatic consumption.

Permission/visibility details, repeat actions, cancellation/partial application and concrete acceptance scenarios still
need discussion. The ticket remains claimed; no resolution or release-plan approval has been recorded.

### First question round confirmed

The user accepted Q1–Q3 and Q5–Q6, and specified Q4 as: "GM or actor owner can apply effects from chat cards."

- Confirm one or several recipients, prefilled from current targets, with an explicit Self choice. Preserve the actor
  of each unlinked token and leave target limits/eligibility to human adjudication.
- Preserve resolved magnitude, effect rules/template, duration, source name/identity and cast-time choices on the card.
  Select recipient-specific weapon/skill bindings during application. Source changes/deletion must not rewrite the cast.
- Start the recorded duration when application is confirmed; show the start/deadline and allow explicit GM correction
  for elapsed time. Respect the previously agreed combat-round boundary.
- A GM or actor owner can apply from a chat card. The working interpretation stated to the user is ownership of the
  recipient actor, including its synthetic actor; card authorship/caster ownership alone does not grant that authority.
- Non-rolled divine casting retains its existing confirmation/cost and gains the same application opportunity;
  non-rolled abilities gain an explicit Use ability card. Rolled applications require success. Informational/instant
  manual actions show their rules without inventing a persistent effect.
- Preserve selected conditional effects and their resolved contributions for follow-up damage from the test card.
  A fresh roll uses current effects and its own choices. No automatic consumption or second casting charge.

Repeat-click presentation, multi-recipient failure handling, stale recipient choices and incomplete historical cards
remain to be settled before recording the final answer.

### Final question round confirmed

The user answered "yes to all" to Q7–Q11: explicit repeat/new-application handling, per-recipient batch results,
revalidation of stale recipient choices, manual handling for incomplete historical cards, and a complete original
follow-up damage formula with explicit manual adjustment. This completes the application decision.

## Answer

Resolved with the user through both question rounds. This is the application contract for the release plan;
implementation and content authoring remain a later effort. Earlier pending/proposed comments above are discussion
history; this answer records the agreed result.

### Entry points and recipients

- A successful rolled spell or ability card offers **Apply effect** when it has an applicable effect template.
  Failure/fumble cards do not offer successful-effect application. Casting outcome costs remain part of casting;
  applying an effect never rolls the cast again or pays MP, Divine magnitude or another casting cost again.
- Non-rolled Divine casting retains its existing confirmation and cost, then offers the same application action.
  Non-rolled abilities gain **Use ability**, which posts an equivalent card without inventing a casting test or MP cost.
  Informational and instant manual actions show their rules rather than manufacturing a persistent actor effect.
- **Apply effect** opens a recipient dialog prefilled from the applying user's current targeted tokens. Offer an
  explicit **Self** choice and allow one or several recipients. Show their names and required choices before confirmation.
  Target limits, range, resistance and other eligibility/adjudication remain human decisions, with the relevant rules visible.
- Resolve each unlinked token to its own synthetic actor, preserving scene/token identity. Two tokens linked to the
  same world actor represent one recipient for this operation; do not accidentally apply twice to that actor.
- A GM or the **recipient actor's owner** can apply from a card whose content they can read, including another person's
  card. Ownership of the caster or authorship of the card alone does not authorize changing an unowned recipient.
  Respect normal whispered/blind content visibility; merely seeing a message placeholder is not access to its action.
- Explain recipients that the current user cannot update before confirmation. Their owner or a GM can perform that
  application from the card. No GM request/approval queue is required. Without an online GM, owners can still update
  their own recipients; other applications wait for an authorized person.

### Historical casts and recipient-specific choices

Preserve resolved cast magnitude, effect rules/template, duration, source identity/name, and cast-time choices such as
characteristic, skill or weapon wherever already chosen. Applying uses this historical cast rather than rereading the
current originating spell/ability. Editing, transferring or deleting the source must not change the historical payload
or prevent applying a complete valid snapshot. An applied benefit is not silently ended by those source-item changes.

Recipient-specific choices are made during application and recorded with that applied effect: for example, choose one
weapon belonging to the ally receiving Weapon Enhance. They do not rewrite the original cast's magnitude or rules.
Values defined by the recipient, such as Vigour's normal-HP-maximum cap, use that recipient at application rather than
freezing an unrelated caster value. Keep the recorded source name visible even when its original document is missing.

A card without the required historical data, including an older/incomplete card, cannot reconstruct automated
application from a live item or rendered text. Explain that automatic application is unavailable and provide the
manual rule-handling route. Missing source documents are distinct from missing snapshot data.

### Duration, confirmation and cancellation

Start the recorded duration when application is confirmed, not when the spell originally posted its card. Show the
start/deadline before confirmation; delayed adjudication permits an explicit GM correction for time already elapsed.
Use the clock and execution boundary established by
[Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md): a round-based effect
survives declaration and expires at its appropriate execution boundary. No automatic conversion between clocks.

Before mutation, review recipients, parameters, existing effects, intended conflict choices and duration. If a selected
weapon disappears, permission changes or a new conflict appears while the dialog is open, that recipient needs review
again. Never silently substitute another item or use a stale conflict approval. Cancelling before confirmation leaves
effects and resource pools unchanged. It neither refunds nor charges again for an already completed cast.

### Repeated application and multiple cards

Show previous application information and current recipient effects when the user clicks again. Offer explicit
inspection/keep, end/replace and cancellation choices using the existing human conflict policy. Do not silently stack,
refresh, select a magnitude or refill a grant. Different cards for the same spell enter the same conflict workflow.
This remains human adjudication with visible rules, not a general automatic conflict engine.

After an earlier application has ended, creating another effect from the old card requires confirming a **new
application**, with a new start and any fresh temporary-point grant made explicit. It still does not cast or pay again.
A repeat UI action, retry or reload is not that confirmation. Concurrent/double submissions of the same confirmed
application must not accidentally produce two effects or two grants.

Retain enough application context to distinguish the card, recipient and resulting application across reload and to
show an earlier application that has ended. Its storage/representation remains with the ownership decision; this does
not require recipient owners to gain permission to edit somebody else's chat message. See the
[current-code evidence](../application-evidence.md) for that core permission constraint.

### Multi-recipient results and resource grants

Check permissions and required choices before confirmation, then report success, failure or skipped application per
recipient. A runtime failure on one recipient does not undo successful applications to others. Retry defaults to the
failed recipients, without automatically repeating the successful applications or their grants. Report actual outcomes;
do not describe an incomplete application as successful.

Vigour creates a new source-specific HP pool only on a confirmed new grant. Its amount is
`min(2 × recorded magnitude, recipient normal HP maximum)` at application. It is not an ordinary HP-maximum/current
modifier. Disabling, re-enabling, spending and ending that grant retain the agreed remainder/FIFO/cleanup semantics;
reopening the card cannot refill it. Other grants and ordinary points are untouched except for the specific transitions
already defined by the resource and lifetime decisions.

### Test choices and follow-up damage

Record selected conditional effects and their resolved numeric contributions with the test. Follow-up damage from
that card preserves the **entire original damage formula**: normal weapon dice, actor Damage Modifier, unconditional
bonuses and selected conditional contributions, together with the original test result needed to resolve that damage.
Keep component distinctions needed by True Weapon, magical damage and manual immunity adjudication.

Do not reread a subsequently edited weapon, current actor values, an expired effect or choices from another dialog to
alter that original formula. The damage dialog still permits an explicit manual adjustment. This records the damage
basis, not a previously rolled damage total; dice are rolled when the damage action is performed. A fresh independent
roll uses current values and its own conditional choices. Neither test nor damage automatically consumes an effect.

### Click-by-click: Protection on an ally

1. Start with an ally whose physical armour supplies 2 AP and no active Protection. The caster selects magnitude 3,
   completes the casting dialog and succeeds. Casting resolves its ordinary cost once and posts the successful card.
2. Edit the caster's spell afterward, or delete that originating item. The card still describes its magnitude-3 cast.
3. Target the ally's token. The ally's owner or GM clicks **Apply effect** on the readable card; the ally is prefilled.
   If only the caster is using the UI without recipient ownership, explain that the ally's owner or GM must apply it.
4. Review the recipient, recorded magnitude, existing effects and proposed duration/start. Confirm application.
5. The ally has one applied Protection 3 and 5 AP. The card's source edits do not change this. Casting cost is unchanged.
6. Click again. Show the prior application and existing Protection. Choose keep or cancel: AP remains 5, duration is
   not refreshed and no second effect is created. An explicit later replacement follows the agreed conflict policy.
7. Repeat with two linked tokens of that ally: one actor application. Repeat with two unlinked NPC tokens from one
   base actor: only explicitly selected synthetic actors change, and the base actor remains unchanged.

### Click-by-click: a creature's hostile ability

Use the local bestiary's Ghoul Howl as the non-rolled example; its proposed numeric portion reuses Demoralise, while
range, target eligibility, behavioural restrictions and other adjudication stay manual. This does not add a resistance
roll to that ability or invent an opposed-roll feature.

1. The GM opens a ghoul and clicks **Use ability** for its authored Ghoul Howl. Post the ability card with captured
   source/rules and applicable effect definition. Do not charge MP or perform a casting roll.
2. The GM checks the stated POW-metre radius and applicable rules, then targets the affected creatures. A genuinely
   rolled hostile ability would instead need its own successful test card before application; resistance is adjudicated
   manually wherever that ability's rules require it.
3. Click **Apply effect**, review named recipients and each one's current effects. Resolve any conflicting mental
   effects explicitly using the already-agreed policy; cancel or omit a recipient when the rule/adjudication requires it.
4. Confirm the selected recipients. Apply the supported Demoralise numeric contribution and retain its behavioural
   rules as visible reminders. Use the recorded clock only where one is defined; do not invent a Howl duration here.
5. Report each recipient's outcome. If one update fails, the others remain applied; retry selects only the failure.
   The ghoul's card does not produce another cast or charge. Owners/GM explicitly end effects when their rules require.

### Acceptance cases for the later implementation plan

| Setup/action | Expected result |
| --- | --- |
| Rolled spell/ability fails, or user cancels casting | No successful-effect application opportunity; casting cost/cancellation follows the existing casting rules. |
| Cast succeeds; user cancels application | Original casting cost stays resolved; no recipient effect or pool change. |
| Recipient owner uses somebody else's readable card | Application succeeds without requiring ownership of the caster or permission to edit its message. |
| User owns the caster/card but not the recipient | Recipient cannot be mutated by that user; explain owner/GM application. |
| Original source edited/deleted after a complete card is created | Recorded magnitude, rules and duration remain usable; source deletion does not end an applied benefit. |
| Card lacks its required historical snapshot | Explain the manual fallback; do not guess from the current item. |
| Apply one card repeatedly, or submit one confirmation twice | No silent duplicate, duration refresh or extra grant; show prior/current state and require an explicit new application. |
| End an application, then explicitly confirm a new one from the old card | New application uses the recorded cast and a new confirmed start/grant, with no second casting payment. |
| One of several recipients fails at update time | Preserve and report successes, identify failures, and retry failures without repeating successful grants. |
| Selected weapon/permission/conflict changes while the dialog is open | Require review for that recipient; do not substitute or apply stale choices. |
| HP 6/10, unrelated pool B=3; apply Vigour magnitude 6 | New Vigour pool is 10; ordinary HP stays 6/10 and B stays 3. Reload/repeat-click does not grant again. |
| Test damage basis is 1D8 + 1D4 Damage Modifier + selected +2; source values change afterward | Card damage still starts from 1D8 + 1D4 + 2; a manual dialog edit is explicit, and a fresh independent roll uses current values. |
| A selected conditional effect ends before follow-up damage | Its recorded contribution still belongs to that test's damage; it is not consumed or restored as a current effect. |
| Round-based application during round R | Confirmation starts its recorded duration; the next declaration does not itself advance/expire it. |

Exercise characters/NPCs, owners/GM, ordinary/whispered/blind cards as appropriate, linked/unlinked tokens, source
deletion, simultaneous clicks, partial failures and reload. These are acceptance requirements for later implementation,
not executable tests or a claim that the workflows already exist.

### Delivery consequences and remaining decisions

The [evaluation](../assessment.md) remains a candidate sequence. Application now requires a complete historical-cast
path, recipient review/permissions/conflicts and per-recipient outcomes, non-rolled use cards and full follow-up damage
context. The final sequencing decision must assess whether those behaviours need separate reviewable increments.

[Separate item-local effects, passive transfer, and applied templates](05-item-ownership-and-transfer.md) still owns
effect representation, grant ownership and stable recipient-item bindings, constrained by the independent snapshot
and applied-benefit behaviour above. [Choose OpenQuest conditions and useful manual reminder workflows](06-conditions-and-reminders.md)
still owns condition presentation, conditional checkbox defaults and quick-roll behaviour. The damage snapshot contract
here does not settle those defaults. [Bound magic point stores and stored-spell casting for v0.9](07-enchanted-items.md)
still owns store/stored-spell casting rules; application never introduces another casting charge.

No new decision ticket is required: these follow-ups already have tickets. Exact schema/migration work remains fog
until representation, item references and stored-spell ownership are selected; incomplete historical cards already
have the manual fallback fixed above.
