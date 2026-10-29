# v0.9 application: Apply effect, recipient bindings and clocks

Status: ready-for-agent

Track **App/Clk** of the v0.9 effects release: chunks **App1** (Apply effect), **App2** (conflict review), **App3**
(multiple recipients), **App4** (Use ability and non-rolled application), **App5** (damage basis snapshot), **App6**
(recipient target binding), **Clk1** (core clocks) and **Clk2** (Vigour). Source plan:
[effects release map](../effects-release/map.md) and its
[release chunks decision](../effects-release/issues/08-release-chunks.md). Policies come from the resolved decisions
[03 lifetime and duplicates](../effects-release/issues/03-lifetime-and-duplicates.md) (clocks, conflicts, pools),
[04 chat card application](../effects-release/issues/04-chat-card-application.md) (the application contract),
[05 item ownership and transfer](../effects-release/issues/05-item-ownership-and-transfer.md) (templates, bindings,
receipts), [06 conditions and reminders](../effects-release/issues/06-conditions-and-reminders.md) (test cards and
follow-up damage) and [09 migration and compatibility](../effects-release/issues/09-migration-and-compatibility.md)
(old cards). The effect records, curated change vocabulary and calculation module come from the
[actor effects spec](../v09-actor-effects/spec.md); temporary-point pools come from the
[resources spec](../v09-resources/spec.md). Every chunk must meet the
[definition of a reviewable chunk](../effects-release/assessment.md#definition-of-a-reviewable-chunk).

## Problem Statement

Once actors can carry effects (Fx track), the Referee still has to build every spell's effect by hand on every
recipient. A caster succeeds at Protection 3, and someone must open the ally's sheet, create an effect, type "+3 AP",
remember the source and the ten-minute duration, and later remember to remove it. Nothing connects the successful chat
card to the result. Nothing stops the same card being applied twice or two Protections silently adding up. Nothing
explains why a player cannot change an ally they don't own. A Ghoul's Howl or a Divine blessing has no card to apply
from at all: non-rolled abilities only post their description, and non-rolled Divine cards are plain text.

Cards today hold rendered HTML and nothing structured. A follow-up damage roll reads the weapon and the actor as they
are now, so a weapon edited or deleted after the attack, a Damage Modifier changed by an expired Enhance STR, or a
conditional +2 chosen in the test dialog are lost or misrepresented. Weapon Enhance and Enhance Skill name one weapon
or skill of the recipient; there is no way to pick it, no protection against a same-named substitute and no visible
state when it is gone.

Durations don't run. OpenQuest rounds are five seconds, but the system never configured that, so combat doesn't advance
world time. Core's default expiry waits for a combatant's turn rather than the round boundary the declaration workflow
needs, and an effect that elapsed while nobody was connected is not expired on reload. Vigour's magical hit points
have nowhere to live that ends with the spell.

## Solution

Spells and abilities can carry **effect templates**: dormant effect definitions with the curated changes, rules text,
per-magnitude values and a recorded duration. When a spell or ability test succeeds, its chat card records a
**historical cast snapshot**: magnitude, the resolved templates, duration, source name and identity, and test choices.
The card then offers **Apply effect**. Applying never rolls or pays again, and later edits or deletion of the source
never change what the card applies.

Apply effect opens a review dialog prefilled from the user's targeted tokens, with an explicit **Self** choice. It
shows each recipient, the recorded values, the recipient's existing effects and earlier applications from this card,
the required choices (which weapon, which skill), and the start and deadline. A GM or the recipient's owner confirms.
The recipient receives an independent **applied effect** and an **application receipt** in its own data. Clicking the
card again shows that earlier application and needs an explicit new application. Duplicates and conflicting effects
are presented for the human to keep, replace or cancel. Several recipients are reported one by one, and only the
failures are retried. Non-rolled abilities gain **Use ability**, and non-rolled Divine casts gain the same Apply effect.

Test cards record the full damage basis, so follow-up damage rolls what the attack had, not what the weapon has now.
Templates that need one of the recipient's weapons or skills bind it by identity at application. They show a missing
target instead of substituting a same-named item.

Combat rounds advance world time by five seconds. Round durations expire when execution of the following round starts,
never at declaration. World-time durations expire when time passes, and the active GM catches up elapsed deadlines
once when the world loads. Vigour creates a temporary-HP pool linked to its applied effect. The pool is suspended
while the effect is disabled and discarded when it ends.

## User Stories

### Effect templates and Apply effect (App1)

1. As a Referee, I want to add an effect template to a spell, so that casting it can place the spell's benefit on a
   recipient.
2. As a Referee, I want a template to hold the same curated changes, rules text and icon as an actor effect, so that
   applied spells behave like effects I build by hand.
3. As a Referee, I want a template change value to be either fixed or per magnitude (Protection: +1 AP per
   magnitude), so that one template serves every magnitude.
4. As a Referee, I want to record a template's duration (none, rounds or world time, with a base amount and an optional
   increase per magnitude), so that the applied effect knows how long it lasts.
5. As a Referee, I want owning a known spell never to activate its template, so that a character with Protection in
   their spell list gains no AP until it is cast and applied.
6. As a Referee, I want the spell sheet's Effects section to show templates as "apply to recipient", distinct from
   other roles, so that I know which definitions are dormant.
7. As a player, I want a successful spell card to show Apply effect when the spell has a template, so that I can put
   the result on its target.
8. As a player, I want failed and fumbled cards to offer no Apply effect, so that only successful casts produce effects.
9. As a player, I want the card to keep the magnitude, rules, duration and source I cast with, so that editing or
   deleting my spell afterwards doesn't change the cast.
10. As a player, I want applying never to roll the cast again or charge MP again, so that applying is bookkeeping, not
    another cast.
11. As a recipient's owner, I want to apply an effect from somebody else's card I can read, so that I don't need the
    caster's permissions.
12. As a caster who doesn't own the recipient, I want the dialog to explain that the recipient's owner or the GM must
    apply it, so that I know why I can't.
13. As a GM, I want to apply from any readable card to any recipient, so that I can resolve effects for everyone.
14. As a player, I want the dialog prefilled from my targeted token and to offer Self, so that choosing the recipient is
    quick.
15. As a player, I want the dialog to show the recipient, recorded magnitude, resulting changes, rules text and the
    proposed start and deadline before I confirm, so that I know exactly what will happen.
16. As a player, I want cancelling the dialog to change nothing, so that opening it is free.
17. As a player, I want a confirmed application to create one applied effect with the recorded values and the source
    name, so that the recipient's sheet shows Protection 3 from that caster.
18. As a player, I want the applied effect to survive edits, transfer and deletion of the originating spell, so that
    the benefit keeps its own lifecycle.
19. As a player, I want clicking Apply effect again to show the earlier application from this card and its current
    state, so that I don't apply it twice by accident.
20. As a player, I want a second application from the same card to need an explicit "new application" confirmation,
    so that a repeat click, retry or reload is never a new application.
21. As a player, I want a double-click or two simultaneous submissions of one confirmation to create one effect, so
    that lag doesn't duplicate benefits.
22. As a recipient's owner, I want a short receipt kept on my actor, so that the old card can show what was applied
    even after the effect ended, without anyone editing the caster's message.
23. As a player, I want whispered and blind cards to offer Apply effect only to people who can read their content, so
    that hidden results stay hidden.
24. As a Referee, I want cards from before v0.9, or cards whose snapshot is incomplete, never to guess from the current
    spell, so that history isn't rewritten; incomplete v0.9 cards explain the manual route.
25. As a Referee, I want the SRD Protection spell to ship with its template, so that the feature works out of the box.

### Conflict review (App2)

26. As a player, I want the dialog to list the recipient's existing applied effects with their rules text, so that I
    can follow rules such as "Fanaticism and Demoralise cancel".
27. As a player, I want an existing effect from the same template, or with the same name, highlighted as a possible
    duplicate, so that two Protections are noticed even when they came from different cards.
28. As a player, I want to choose keep existing, replace or apply alongside for a duplicate, with no default, so that
    the system never silently stacks, refreshes or picks the bigger magnitude.
29. As a player, I want keeping the existing effect to leave AP and its duration untouched, so that "keep" really
    changes nothing.
30. As a player, I want replacing to end the old effect and apply the new one in one confirmation, so that Protection 2
    → 3 gives 5 AP over 2 AP armour, never 7.
31. As a player, I want to mark other existing effects to end as part of the application, so that applying Demoralise
    can end Fanaticism when the rule says they cancel.
32. As a player, I want the dialog to recheck each recipient just before writing, so that an effect someone else added
    meanwhile, or one I chose to end that already disappeared, sends that recipient back for review instead of using a
    stale decision.
33. As a Referee, I want the same review whichever card it comes from, so that a second caster's Protection gets the
    same treatment as a repeat click.

### Multiple recipients (App3)

34. As a player, I want to apply one card to several recipients at once, so that a blessing on the whole party is one
    action.
35. As a player, I want two tokens linked to the same actor to count as one recipient, so that the actor isn't given
    the effect twice.
36. As a Referee, I want each unlinked token to be its own recipient, changing only its synthetic actor, so that two
    goblins from one base actor stay independent and the base actor is unchanged.
37. As a player, I want recipients I can't update listed as needing their owner or the GM, while I apply to the others,
    so that one unowned ally doesn't block the rest.
38. As a player, I want per-recipient results (applied, kept existing, needs review, failed and why), so that I know
    what actually happened.
39. As a player, I want one failure not to undo successful applications, so that partial progress is kept.
40. As a player, I want "Retry failed" to retry only the failures under the same confirmation, so that successful
    recipients are not given the effect again.
41. As a table, I want a short summary message with the card's visibility, so that everyone who saw the cast sees who
    received it.

### Use ability and non-rolled application (App4)

42. As a Referee, I want to add effect templates to special abilities next to their owner passives, so that one
    ability can be both a permanent trait and something it uses on others.
43. As a Referee, I want a Use ability action for abilities without a test formula, so that a Ghoul's Howl posts a card
    with its rules and its effects.
44. As a Referee, I want Use ability never to roll, charge MP or toggle the ability's own passives, so that using an
    ability isn't casting.
45. As a Referee, I want a successful rolled ability card to offer Apply effect like a spell card, so that rolled
    creature attacks with effects work the same way.
46. As a player, I want non-rolled Divine casting to keep its confirmation and magnitude cost and then offer Apply
    effect, so that Divine blessings can be applied too.
47. As a Referee, I want abilities and spells without templates to keep their current card, so that informational and
    instant effects don't invent persistent effects.
48. As a Referee, I want the hostile-ability workflow to stay manual where the rules require (range, resistance, who is
    affected), so that the system supports my adjudication rather than replacing it.

### Damage basis snapshot (App5)

49. As a player, I want a successful attack card to record the full damage basis (weapon dice, Damage Modifier,
    unconditional bonuses and the conditional contributions I selected), so that the damage roll matches the attack.
50. As a player, I want the follow-up damage roll to use that basis even after the weapon is edited or deleted, an
    effect ends, or my Damage Modifier changes, so that the attack's damage is what it was.
51. As a player, I want the damage dialog prefilled with the recorded formula and still editable, so that I can make an
    explicit manual adjustment.
52. As a player, I want a fresh attack to use current values and its own choices, so that recorded bases never leak into
    new rolls.
53. As a player, I want the card to keep the components separate (normal weapon dice, Damage Modifier, magical and
    conditional additions), so that the table can adjudicate True Weapon, magical damage and immunities by hand.
54. As a Referee, I want damage buttons on pre-v0.9 cards to say they use current weapon values, so that a live lookup
    is never presented as historical damage.

### Recipient target binding (App6)

55. As a player, I want a Weapon Enhance template to ask which of the recipient's weapons it enhances, so that only
    that weapon gains the bonus.
56. As a player, I want an Enhance Skill template to ask which of the recipient's skills it enhances, so that the
    bonus binds to that skill.
57. As a player, I want the binding to survive renames, state changes and reload, so that storing and readying the
    sword keeps its Enhance.
58. As a player, I want another weapon sharing the skill, and the skill itself, to stay unaffected by Weapon Enhance,
    so that the bonus is truly the weapon's.
59. As a Referee, I want deleting the bound weapon or skill to show a missing target and suppress the contribution
    while the clock continues, so that nothing silently attaches to a same-named replacement.
60. As a Referee, I want to explicitly rebind a missing target to another weapon or skill of the same recipient, or end
    the effect, so that I can repair it without regranting or restarting the duration.
61. As a Referee, I want copying the enhanced weapon to another actor not to carry the cast enhancement, so that the
    applied effect stays with its recipient.
62. As a player, I want the dialog to send a recipient back for review when the chosen weapon or skill disappeared
    while the dialog was open, so that no other item is substituted.

### Core clocks (Clk1)

63. As a Referee, I want each combat round to advance world time by five seconds, so that minute-based effects run
    during combat.
64. As a Referee, I want a round-based effect to survive the next declaration and expire when execution of the
    following round starts, so that a one-round effect cast in round R lasts until R+1 begins.
65. As a Referee, I want an application confirmed during declaration to start in the round being declared, so that it
    doesn't expire the moment that round starts.
66. As a Referee, I want world-time effects to expire when their time elapses, without waiting for any combatant's
    turn, so that ten minutes means ten minutes.
67. As a Referee, I want the applied duration to start at confirmation, and as GM to set time already elapsed, so that
    delayed adjudication doesn't give extra time.
68. As a Referee, I want to set and edit durations of effects I create by hand, so that rulings can expire too.
69. As a player, I want the Effects list to show remaining rounds or time and an expired state, so that I know what is
    about to end.
70. As a Referee, I want expired effects kept visible and inactive until removed, so that I can inspect what ended.
71. As a Referee, I want effects with no clock (reminders, concentration) never to expire on their own, so that I end
    them when the rule says.
72. As a Referee, I want round-based effects to stay, flagged, after their combat ends or is deleted, so that I end or
    edit them explicitly instead of the system converting clocks.
73. As a Referee, I want a round-based effect applied outside combat to warn that it won't expire automatically, so
    that I know to end it.
74. As a Referee, I want the active GM to expire, once, effects whose deadline passed while nobody was connected, so
    that reloads neither skip nor repeat expiry.
75. As a Referee, I want expiry of an effect that changed an HP or MP maximum to adjust current points once, so that
    expiry behaves like disabling it.

### Vigour (Clk2)

76. As a player, I want applying Vigour to create a temporary-HP pool of 2 × magnitude, capped at the recipient's
    normal HP maximum, so that the spell grants magical hit points.
77. As a player, I want that pool labelled with its source and linked to the applied effect, so that the pool editor
    shows where the points came from.
78. As a player, I want damage to come out of the Vigour pool in its FIFO place before ordinary HP, so that magical
    hit points absorb damage first.
79. As a player, I want disabling Vigour to suspend its remaining points without losing them, and re-enabling it to
    restore exactly that remainder in its original place, so that toggling is neither a heal nor a loss.
80. As a player, I want ending or expiring Vigour to discard only its own remainder, so that other pools and ordinary
    HP are untouched.
81. As a player, I want reopening the card, retrying or reloading never to refill the pool, so that one cast grants
    once.
82. As a Referee, I want a new Vigour grant only through an explicit new application, joining the end of the queue, so
    that grants follow the FIFO rule.

### Cross-cutting

83. As a Referee, I want character and NPC recipients, linked and unlinked tokens, to behave the same way throughout,
    so that the workflow is predictable.
84. As a Referee, I want duplicating, exporting and importing an actor to keep its applied effects, deadlines, bindings,
    pools and receipts scoped to the copy, so that a copy never changes the original.
85. As a Referee, I want the documentation to explain templates, Apply effect, reviews, receipts, damage bases,
    bindings and clocks, so that the table can use them.

## Implementation Decisions

### Effect templates

- A template is an item-embedded core Active Effect with the third role from the actor effects spec: **apply to
  recipient** (transfer off, explicitly excluded from all live calculation, never suppressed into or out of activity).
  App1 adds the role and the spell sheet's Effects section, defaulting new spell definitions to this role. App4 adds
  the role to special abilities, alongside their owner passives from Itm2.
- A template reuses the curated change vocabulary. On spell templates a change value can be marked **per magnitude**;
  the snapshot multiplies it by the cast magnitude. Ability templates have fixed values only.
- A template records a **duration**: clock (none, rounds or world time with a unit), base amount and optional increase
  per magnitude. It is stored in the template's system data, not in core duration fields, so core never tracks or
  expires a template.
- A template may carry a **binding requirement** (App6): its weapon hit/damage or named-skill changes target "the
  weapon/skill chosen at application" instead of a fixed identity.
- A template may carry a **temporary HP grant** (Clk2): 2 per magnitude for Vigour, capped at the recipient's normal HP
  maximum. It is stored separately from the curated changes because it is a one-time grant, not a calculated value.
- Every template has a **template key**: the originating item's compendium source plus the template's id when the item
  came from a compendium, otherwise the item's identity plus the template's id. Spell copies of the same SRD spell
  therefore share a key.

### Historical cast snapshot

- When a rolled spell or ability test succeeds (success or critical) and the item has templates, the card's author
  writes a structured snapshot into the message's system flags at creation. Non-rolled Divine casts and Use ability
  cards do the same (App4). Rendered HTML is never parsed.
- The snapshot holds: snapshot format version; source name, item identity, item type and spell type; the speaker actor
  and token identity (for Self); magnitude; test outcome; and for each template its key, name, icon, rules text,
  resolved changes (per-magnitude values already multiplied), resolved duration, binding requirements and grant
  definition. Recipient-dependent values (Vigour's cap, bound items) are resolved at application, not here.
- Apply effect reads only the snapshot. Source edits, transfer or deletion don't change it and don't block applying.
  The card shows the recorded source name when the source document is gone.
- Pre-v0.9 cards have no Apply action. A card whose snapshot fails validation (unknown version, missing fields) shows
  Apply effect disabled with an explanation and a pointer to the manual recipe in the documentation.

### Pure applied-effects module (the main seam)

A new pure module, free of Foundry calls at import time, owns all application decisions over plain data. Its inputs
are the snapshot, the candidate recipients (actor identity, linked/unlinked token identity, whether the current user
is GM or owner, existing applied effects with template key, name, source, active state and duration, receipts,
weapons and skills for binding, normal HP maximum) and the clock state (world time, combat id, round, phase). It
provides:

- **Snapshot resolution**: template + cast magnitude → resolved snapshot entries, and snapshot validation.
- **Recipient resolution**: targeted tokens and Self → recipients, merging linked tokens of one actor and keeping each
  unlinked token's synthetic actor separate.
- **Planning** per recipient: permitted or needing owner/GM; earlier receipts for this card (repeat) and whether an
  explicit new application is required; possible duplicates (same template key or same name) and other existing
  applied effects; required binding choices and their candidates; the resolved changes, grant amount
  (`min(2 × magnitude, normal HP maximum)` for Vigour) and duration with start and deadline; and whether the plan is
  complete enough to confirm (all duplicates decided, all bindings chosen).
- **Revalidation**: compare a confirmed plan with a fresh plan for the same recipient and report "needs review" when
  permission, the duplicate set, effects marked to end, a bound candidate or the receipt state changed.
- **Outcomes**: per-recipient results (applied, kept existing, skipped, needs review, failed with reason) from write
  results, and the retry set (failures only).
- **Clock arithmetic** (Clk1): start and deadline for each clock including the declaration rule and GM elapsed
  correction; remaining time; and catch-up selection, meaning which effects are past their deadline but not yet marked
  expired, and which round effects lost their combat.

Dialogs, cards and hook handlers are thin callers: they gather plain data, call the module and perform the writes it
describes.

### Application workflow

- **Who can apply**: anyone who can read the card's content (respecting whisper and blind) sees Apply effect. Only a
  GM or the recipient actor's owner can apply to a recipient; owning the caster or authoring the card doesn't grant
  that. Recipients the user can't update are listed as needing their owner or a GM and can't be selected. There is no
  GM relay queue; an unowned recipient waits for an authorized person.
- **Dialog**: an ApplicationV2 review dialog (light parchment theme) per click. App1 supports one recipient chosen from
  the targeted tokens or Self; App3 makes it a multi-select. Each recipient row shows the resolved changes, rules text,
  start and deadline, earlier applications from this card and (App2) existing effects with duplicate choices and
  end-marks, and (App6) binding choices. Confirm is enabled only when every selected recipient's plan is complete.
- **Repeat**: when a recipient has a receipt for this card, the row shows that earlier application and the current
  state of its effect (active, disabled, expired, ended). Applying again needs an explicit "new application" tick for
  that row. Unticked, the recipient is skipped (kept existing).
- **Write** per recipient, after revalidation: end the effects marked to end (App2), create the applied effect, write
  the receipt, then (Clk2) grant the pool. Each **confirmation** has an application id. The applied effect's id is
  derived deterministically from the application id and the recipient, so a double submission or a retry of an
  already-written recipient cannot create a second effect, and the existing one is reported as applied. The confirm
  control is also disabled while writing.
- **Applied effect**: an actor-owned effect with the resolved changes, rules text, icon, source name and identity,
  template key, card message id, application id, recorded duration and confirmed start, and (App6) the recipient-local
  binding. Its lifecycle is its own: source changes never end it.
- **Application receipt**: a short record in the recipient actor's system data with application id, card message id,
  template key, source name, applied effect id, confirmed time and, once ended, the end time. Deleting the applied
  effect marks its receipt ended. Receipts never recreate effects or grant points. They travel with whole-actor copies
  and imports and only ever refer to the copy's own effects.
- **Outcomes** (App3): after writing, the dialog switches to the per-recipient results with "Retry failed", which reuses
  the application id for the failed recipients only. A summary chat message lists the outcomes with the originating
  card's visibility. App1 shows the single result as a notification.
- **Ending** an applied effect is deleting it, through the existing Effects list. Ending from the dialog (App2 replace
  and end-marks) uses the same path.

### Use ability and non-rolled casts (App4)

- Special abilities with recipient templates and no test formula get a **Use ability** action on the actor sheet. It
  posts a card with the ability's rules text and snapshot and nothing else: no test, no MP, no toggling of the
  ability's own passives. Abilities without templates keep posting their description.
- A rolled ability's success or critical card gets the snapshot and Apply effect, like a spell card.
- Non-rolled Divine casting keeps its magnitude dialog and remaining-magnitude cost and adds the snapshot and Apply
  effect to its card.
- App4 is additionally blocked by [Itm2](../v09-actor-effects/spec.md), which gives abilities their Effects section.

### Damage basis (App5)

- Every test card that offers follow-up damage (weapon and rolled ability tests) records a **damage basis**: normal
  weapon dice, whether the Damage Modifier applies and its resolved value, item-local and actor-wide unconditional
  damage terms with their sources, the selected conditional damage contributions with their sources, the test outcome
  and the actor and item identity.
- The card's damage action rolls the recorded basis. It needs no live item, so it works after the weapon is edited or
  deleted. The damage dialog is prefilled with the recorded formula and remains editable. Permission: a GM or the
  owner of the recorded actor.
- Components stay distinguishable in the basis and on the damage card, for later True Weapon and manual immunity
  handling. App5 adds no new damage rules.
- Pre-v0.9 cards keep their live-item damage action, but its dialog and resulting card state that current weapon values
  were used.

### Recipient target binding (App6)

- At application, each template change with a binding requirement asks for one weapon (Weapon Enhance) or one skill
  (Enhance Skill, Hinder) of that recipient, listed from the recipient's own embedded items. The choice is stored on the
  applied effect as the item's identity within that recipient actor.
- Weapon bindings feed the actor effects spec's single-weapon contribution channel: only the bound weapon's tests and
  damage gain the contribution, not other weapons or the shared skill. Skill bindings feed the named-skill selector.
- A bound item that no longer exists makes the applied effect show a **missing target** and contribute nothing, while
  its clock continues. The Effects list offers an explicit rebind (choose another weapon or skill of the same
  recipient) or end. Rebinding never regrants points or restarts the duration. No name matching.
- Identity-preserving in-place updates keep the binding. Whole-actor copies keep bindings when the embedded ids are
  kept and otherwise show a missing target. Copying the weapon alone doesn't copy the applied effect.
- App6 is additionally blocked by [Fx5](../v09-actor-effects/spec.md) (named-skill selector) besides App1 and Itm1. The
  skills content batch for named-skill templates is blocked by App6.

### Clocks (Clk1)

- The system sets the round time to five seconds and the turn time to zero. Starting execution of a round already
  advances world time by the round time, so each round adds five seconds once. Declaration still advances nothing.
- Applied effects get core duration fields from their recorded duration and confirmed start. Round clocks expire at
  the start of the round after the last covered round, which the declaration workflow dispatches when execution
  starts. An application confirmed during declaration starts in the round being declared. World-time clocks use no
  expiry event, so they expire on elapsed time alone. One clock per effect; no conversion between clocks.
- The effect editor gains duration controls (clock, amount, start) for actor effects and the template duration fields;
  the review dialog shows a GM-only "already elapsed" field that moves the start back.
- Expired effects keep core's expired state: inactive, visible, removable. Expiry is a lifecycle event for the Fx4
  maximum/current transition, run once by the active GM that persists the expiry.
- **Catch-up**: when the world is ready, the active GM selects, through the pure module, effects past their deadline
  but not marked expired on world actors and on unlinked token actors in every scene. It marks them expired and runs
  their transitions once. A persisted expired state is never processed again, so reloads repeat nothing.
- Round effects whose combat ended or was deleted show a "combat ended" state and stay until ended or edited. Round
  effects confirmed outside combat show a warning in the dialog and on the sheet that they won't expire automatically.
- The Effects list shows remaining rounds or time and the expired state.
- Clk1 is blocked by [Fx4](../v09-actor-effects/spec.md) and App1 (applications need their recorded duration and start).

### Vigour (Clk2)

- On a confirmed new application whose snapshot has a temporary HP grant, after creating the applied effect, the
  writer grants a pool through the Res actor-level interface: amount `min(2 × magnitude, normal HP maximum)` of that
  recipient at application, labelled with the source name and **linked** to the applied effect's id. The receipt
  records the grant as done, so a retry after a failed grant finishes only the grant and a retry after success grants
  nothing.
- The Res pool record gains an optional effect link. Preparation derives each linked pool's availability from its
  effect (unavailable while disabled, suppressed or expired); the resource-points module's spend operation skips
  unavailable pools without changing their position. Nothing about availability is stored.
- Deleting the linked effect removes its pool in the same client action; expiry removes it in the active GM's expiry
  write; catch-up removes it too. A linked pool whose effect no longer exists is removed by catch-up. Other pools and
  ordinary HP are untouched.
- The pool editor shows the link and the suspended state. Manual correction of a linked pool keeps working.

### Representative content

- App1: the Protection template on the SRD Protection spell in its pack source (per-magnitude +1 AP, ten-minute
  world-time duration).
- App4: the Shield template on the SRD Shield spell (non-rolled Divine). Ghoul Howl (Demoralise numbers plus
  reminders) is built by hand in the manual check and documented as a recipe; the bestiary ability pack is content
  track.
- App6: Weapon Enhance and Enhance Skill templates on their SRD spells.
- Clk2: the Vigour template on the SRD Vigour spell.
- Other spells and abilities arrive in the content track's batches. Each chunk updates the coverage inventory rows of
  the spells it ships.

### Delivery and dependencies

| Chunk | Blocked by | Delivers |
| --- | --- | --- |
| App1 | [Fx1](../v09-actor-effects/spec.md) | Template role and spell Effects section, per-magnitude values, template duration fields, card snapshot, single-recipient review dialog, permission rules, applied effect, receipts, repeat/new application, double-submit guard, incomplete-card fallback, Protection template, documentation |
| App2 | App1 | Existing-effect review, duplicate detection by template key and name, keep/replace/alongside, end-marks, revalidation before write |
| App3 | App1 | Multi-recipient selection, linked dedupe, unlinked synthetic actors, per-recipient outcomes, Retry failed, summary message |
| App4 | App1, [Itm2](../v09-actor-effects/spec.md) | Ability templates, Use ability, rolled-ability Apply, non-rolled Divine Apply, Shield template |
| App5 | [Fx6a](../v09-actor-effects/spec.md) | Damage basis on test cards, follow-up damage from basis, old-card labelling |
| App6 | App1, [Itm1, Fx5](../v09-actor-effects/spec.md) | Weapon and skill binding at application, missing target, rebind/end, Weapon Enhance and Enhance Skill templates |
| Clk1 | [Fx4](../v09-actor-effects/spec.md), App1 | Five-second rounds, core durations on applied and hand-made effects, round/world-time expiry, declaration rule, GM elapsed correction, catch-up, expiry transitions, duration display and editing |
| Clk2 | [Res1](../v09-resources/spec.md), App1, Clk1 | Linked temporary-HP grant, pool availability, discard on end/expiry, Vigour template |

One PR per chunk into master. Downstream: Cnd1 and Cnd2 (conditions track) display and end applied effects; Ench4
(enchanted track) reuses the snapshot and Apply effect; the content batches are blocked by App1 and their mechanic
chunk, the bestiary ability batches by App4, the named-weapon and named-skill batches by App6 and the Vigour batch by
Clk2. Chunks may be split further, but never merged across tracks.

## Testing Decisions

A good test exercises observable outcomes through a public seam: resolved snapshots, plans, outcomes, retry sets,
deadlines, resulting resource state, recorded damage formulas, rather than internal helpers or markup. Tests run in
plain Node with stubbed globals, per the repository convention. Four seams, agreed with the user:

1. **Applied-effects module** (new test file): snapshot resolution (Protection magnitude 3 → +3 AP; per-magnitude
   duration increase; ability fixed values) and validation of incomplete snapshots; recipient resolution (two linked
   tokens → one recipient; two unlinked tokens → two; Self from a speaker token); permission (GM, recipient owner,
   caster-only user); repeat detection from receipts and the explicit new-application requirement; duplicate detection
   by template key and by name, and plan completeness until each duplicate is decided; binding candidates and missing
   choices; revalidation cases (new conflicting effect, marked effect already gone, bound weapon deleted, permission
   lost, receipt appeared); outcomes and retry sets including partial failure and already-written recipients;
   Vigour's capped grant; start and deadline for each clock, the declaration-phase rule and GM elapsed correction;
   catch-up selection (elapsed but unmarked, already marked, no clock, combat gone). Prior art: the pure-function
   tests in the magic, difficulty and roll test files.
2. **Roll resolution** (existing roll test file): damage basis capture from weapon damage values, Damage Modifier and
   selected conditional contributions, and the follow-up formula built from a basis independently of current values.
3. **Combat harness** (existing combat test file): with a five-second round time, entering declaration neither
   advances world time nor dispatches round-start expiry; starting execution of R+1 advances world time by 5 seconds
   once and dispatches the round-start event that expires a one-round effect from round R.
4. **Resource-points module** (Res track's test file): spending skips unavailable linked pools and keeps their
   position; restoring availability returns exactly the remainder; removing a linked pool leaves the others.

The review dialog, cards, sheet controls and the hooks that write effects, receipts, pools and expiry are thin
callers, verified by the manual scenarios on a character and an NPC, linked and unlinked tokens, owner and GM users,
public, whispered and blind cards, with reloads between steps.

### Acceptance examples

| Chunk | Setup | Action | Expected |
| --- | --- | --- | --- |
| App1 | Ally with 2 AP armour; caster's Protection 3 succeeds | Edit or delete the caster's spell; ally owner targets ally, Apply effect, confirm | Card still shows magnitude 3; ally has one Protection 3, 5 AP; caster's MP unchanged by applying |
| App1 | Same card | Caster (not the ally's owner) clicks Apply effect | Ally listed as needing owner or GM; nothing changes |
| App1 | Same card, already applied | Click again; keep (no new-application tick) | Earlier application shown; AP 5; no second effect, no duration refresh |
| App1 | Same card | Double-click confirm on a new application | One effect, one receipt |
| App1 | Protection applied | Delete the applied effect; reopen the card as ally owner without message edit rights | Receipt shows it ended; new application needs explicit tick |
| App1 | Protection cast failed | View card | No Apply effect |
| App1 | Pre-v0.9 spell card | View card | No Apply effect; card unchanged |
| App1 | Blind cast card | Player who can't read it | No Apply effect available |
| App2 | Ally with Protection 2 active, 2 AP armour | Apply Protection 3 from another card; replace | AP 5, not 7; Protection 2 ended |
| App2 | Same | Keep existing | AP 4, Protection 2's duration unchanged |
| App2 | Ally with Fanaticism | Apply Demoralise, mark Fanaticism to end | Fanaticism ended, Demoralise applied; reminders visible |
| App2 | Dialog open with ally selected | Another user applies Protection to the ally; confirm | Ally needs review; nothing written for it |
| App3 | Two tokens linked to one actor targeted | Apply | One recipient, one effect |
| App3 | Two unlinked goblin tokens from one base actor | Apply to both | Each synthetic actor has one effect; base actor unchanged |
| App3 | Three recipients, one write fails | Confirm; Retry failed | Two applied and kept; retry writes only the third; no duplicates |
| App4 | Ghoul with hand-built Howl ability (Demoralise numbers + reminders) | Use ability; Apply to two targets | Card with rules, no roll, no MP; each target halved combat skills plus reminders |
| App4 | Shield 2 Divine, remaining 2 | Cast, Apply to self | Remaining magnitude 0 once; Shield applied; applying charges nothing |
| App4 | Ability with passive +2 AP and a template | Use ability | Owner AP unchanged; card offers Apply |
| App5 | Sword 1D8, DM +1D4, selected conditional +2 | Attack succeeds; delete the sword, end the effect; roll damage | Formula 1D8 +1D4 +2 |
| App5 | Same card | Roll damage, edit formula in dialog | Edited formula used, shown as manual |
| App5 | Pre-v0.9 attack card | Roll damage | Dialog and card state current weapon values |
| App6 | Swords A and B on one skill | Apply Weapon Enhance +2 choosing A | Only A +2 hit and damage; B and skill unchanged |
| App6 | A enhanced | Rename, store, ready A; reload | Still bound; deadline unchanged |
| App6 | A enhanced | Delete A; import a sword named A | Missing target, no contribution; no substitution; rebind to B is explicit and keeps the deadline |
| App6 | Enhance Skill +20 bound to Stealth | Roll Stealth; roll Perception | 20 added to Stealth only |
| Clk1 | Combat in round R execution | Apply a one-round effect; open declaration; start R+1 | Survives declaration; expires at R+1 start; world time +5 s |
| Clk1 | Combat in declaration for R+1 | Apply a one-round effect; start R+1; start R+2 | Active through R+1; expires at R+2 start |
| Clk1 | Ten-minute effect applied at world time T | Advance world time 600 s outside combat | Expires without any turn |
| Clk1 | HP 10/14 under a +4 maximum effect, deadline passed while offline, pool B=3 | GM loads world; reload again | HP 6/10, B=3, effect expired; second reload changes nothing |
| Clk1 | Indefinite reminder | Advance rounds and time, reload | Still active |
| Clk1 | Round effect, combat deleted | Inspect | Flagged "combat ended", stays until ended |
| Clk1 | Application confirmed 3 rounds late | GM sets 3 rounds elapsed | Deadline 3 rounds earlier |
| Clk2 | HP 6/10, pool B=3 | Apply Vigour magnitude 6 | New pool 10 after B; HP 6/10; B=3 |
| Clk2 | HP 6/10, Vigour 4 | Take 3 damage; end Vigour | Vigour pool 1, then gone; HP 6/10; unrelated pool intact |
| Clk2 | HP 6/10, A=4 (Vigour), B=3 | Disable Vigour; take 5; enable | B=0, HP 4/10, A keeps 4 unavailable; then A=4 available in first place |
| Clk2 | Vigour applied | Reopen card, retry, reload | No second grant |
| Clk2 | Vigour suspended, deadline passes | Expire | Pool discarded; re-enable or reload recreates nothing |

Run `yarn test`, `yarn lint` and `yarn build` for each chunk.

## Out of Scope

- Opposed rolls, resistance tests, range, area and target-limit checks; humans adjudicate them before confirming.
- Automatic consumption or clearing of next-test effects (Hinder, Truth Seeker); humans end them.
- A general conflict, stacking or cancellation engine; the review presents effects and rules for human decisions.
- A GM relay or approval queue for applications by users without recipient permission.
- Reconstructing snapshots for pre-v0.9 cards or from rendered HTML; old cards stay readable history.
- Concentration, special endings (ghoul paralysis healing) and other situational ending conditions; they are reminders
  ended by hand.
- Automatic conversion between round and world-time clocks; per-turn clocks.
- Sorcery duration manipulation chosen at casting; the applied duration is edited by hand afterwards.
- Tap gain, distribution and decay; manual pools from the Res track cover them.
- True Weapon's doubling and Fireblade's typed damage; App5 only keeps their components distinguishable.
- Condition markers on applied effects and source-aware marker controls (conditions track).
- Magic point stores, store-paid casting, recoverable payment and charm application (enchanted track).
- Templates for spells and abilities beyond the representative ones, the bestiary ability pack and the coverage
  inventory batches (content track).
- Migrating, classifying or repairing pre-v0.9 effects.

## Further Notes

- Glossary terms used: **effect template**, **applied effect**, **reminder**, **temporary points**,
  **temporary-point pool**, **normal maximum**, **conditional effect**, **Modified skill**. Candidate new terms for
  review: **cast snapshot** (the card's structured record of a successful cast), **application receipt** (the
  recipient's record of one application) and **damage basis** (the recorded follow-up damage formula and its
  components). Add them to the glossary if they stick.
- Placement decided with the user in this spec: recipient choice of a named skill joins App6, generalized from Weapon
  Enhance to recipient target binding. This adds Fx5 as an App6 blocker and makes the named-skill content batch
  depend on App6.
- Refinements of the release chunks decision recorded here: App4 is also blocked by Itm2 (ability Effects sections),
  and Clk1 is also blocked by App1 (applications carry the duration Clk1 enforces). App1 records and shows durations
  but doesn't write core duration fields. Before Clk1 lands, applied effects don't expire. That state is unreleased
  development data and needs no conversion.
- Implementer checks in the Foundry v14 sources (read `docs/foundry-v14-notes.md` first): creating an embedded effect
  with a caller-supplied id on world actors and on unlinked token actors; how core computes round-based expiry from
  start round and which lifecycle event expires it under the system's declaration dispatch; core duration fields for
  world-time clocks with no expiry event; whether core's registry already covers unlinked token actors on inactive
  scenes; and message content visibility for whisper and blind cards.
- The deterministic effect id guards one confirmation. Two different users confirming independent applications to the
  same recipient at the same moment can still both succeed. Revalidation narrows the window, and the duplicate stays
  visible for the next review. This matches the accepted concurrency limit in the actor effects spec.
- Documentation in the same PRs, edited as HTML under `docs/packs/` and regenerated: the Magic page (templates, Apply
  effect, review, receipts, Use ability, Divine application, bindings, Vigour), the Rolls page (damage basis, old-card
  damage), the Combat page (five-second rounds, expiry at execution start, catch-up) and manual recipes for Ghoul
  Howl and for applying effects from cards without snapshots.
