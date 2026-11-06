# v0.9 enchanted items: magic point stores, recoverable payment and charms

Status: ready-for-agent

Track **Ench** of the v0.9 effects release: chunks **Ench1** (store ledger), **Ench2** (recoverable payment),
**Ench3** (store-paid casting) and **Ench4** (Personal Magic charms). Source plan: [effects release
map](../effects-release/map.md) and its [release chunks decision](../effects-release/issues/08-release-chunks.md).
Policies come from the resolved decisions
[07 enchanted items](../effects-release/issues/07-enchanted-items.md) (scope, ledger, refill, access, payment,
recovery, charms), [02 resource semantics](../effects-release/issues/02-resource-semantics.md) (personal MP with
temporary pools first), [04 chat-card application](../effects-release/issues/04-chat-card-application.md) and
[05 item ownership](../effects-release/issues/05-item-ownership-and-transfer.md) (snapshots, eligible states, copies),
and [09 migration and compatibility](../effects-release/issues/09-migration-and-compatibility.md) (no legacy schema).
Supporting facts: [enchanted-item evidence](../effects-release/enchanted-item-evidence.md). Every chunk must meet the
[definition of a reviewable chunk](../effects-release/assessment.md#definition-of-a-reviewable-chunk).

The whole track may slip to 0.9.x as a unit without blocking anything else. If it slips, today's underfunded-cast
behavior stays in v0.9, because Ench2 is what replaces it for ordinary casting too.

## Problem Statement

OpenQuest characters routinely carry enchanted items: a ring holding magic points to cast from, an amulet holding a
Protection charm anyone can invoke. In Foundry today the Referee has nowhere to put them. An item has no MP balance or
capacity, so stores live in the description or on scrap paper, and spending from one means editing text and then
casting a spell that charges the caster's own MP anyway. A charm is a learned spell on the wrong actor: it uses the
creator's skill and magnitude, it is "learned" by whoever holds it, and nothing records that a single-use charm has been
spent.

Payment itself is fragile. The casting dialog checks affordability before rolling, but if MP drops while the dice are
being resolved, the cast completes anyway and the deduction is silently clamped to zero, so the caster gets a free
spell. If the MP write fails, the roll is lost with no card. Nothing makes the shortfall visible or lets the table
settle it.

## Solution

Any physical item (equipment, weapon, armour) can carry one **magic point store** and any number of **charm entries**,
next to its existing item-local effects and owner passives. No new item type is added.

- **Ench1, store ledger.** The item sheet shows the store's balance and capacity, whether it is single-use or reusable,
  and whether it is expended. Owners correct values explicitly. They can spend from the store, and they can refill a
  reusable store from the owner's ordinary MP (never temporary MP), bounded by ordinary MP and free capacity. Spending
  a single-use store to zero expends it. Nothing regenerates on its own.
- **Ench2, recoverable payment.** Every MP-costing cast becomes one recoverable **cast operation**. If the actual
  outcome cost can't be paid after the dice are resolved, or a write fails, the card shows the rolled outcome as
  **unpaid** instead of finishing underfunded. Apply effect stays unavailable until the owner or GM settles it by
  paying, recording an adjudicated external payment, or voiding the cast. A retry finishes the missing steps without
  paying twice or rerolling.
- **Ench3, store-paid casting.** The cast dialog offers a payment source: personal MP (default) or exactly one eligible
  store on the caster's own equipped items. The selected store pays the actual outcome cost; personal MP is untouched.
  Quick casting stays personal-only.
- **Ench4, Personal Magic charms.** Dropping a Personal Magic spell onto a physical item copies it into a
  self-contained charm entry with its own stored magnitude, rules text and effect templates. The wielder casts it with
  their own Personal Magic Casting skill and pays with their own MP (or, once Ench3 is in, a store). A successful cast
  expends a single-use entry and failures keep it. The success card offers Apply effect like any spell card.

Matrices, potions, scrolls, Divine blessed items, relics and special reservoirs stay manual. The content track's
manual-coverage documentation batch describes their workflows.

## User Stories

### Magic point store ledger (Ench1)

1. As a Referee, I want to add a magic point store to an equipment item, weapon or armour, so that an enchanted ring,
   sword or breastplate can hold MP without a new item type.
2. As a Referee, I want to set the store's capacity and current balance when I add it, so that I can configure an
   already-created enchantment directly without simulating its creation.
3. As a Referee, I want to mark a store single-use or reusable, so that the item follows the rules for how it was made.
4. As a player, I want the item sheet to show the store's balance, capacity, single-use or reusable kind and expended
   state, so that I know what the item can pay for.
5. As a player, I want my actor sheet to show the balance of each store on my items, so that I don't have to open each
   item to plan a cast.
6. As a Referee, I want capacity and balance to accept only nonnegative whole numbers, with the balance no greater than
   the capacity, so that a store can't become invalid.
7. As a Referee, I want lowering the capacity below the current balance to be rejected with an explanation, so that
   stored points are never silently thrown away.
8. As a Referee, I want removing a store that still holds points to ask for confirmation and state how many points are
   discarded, so that I don't lose them by accident.
9. As a Referee, I want typed changes to capacity, balance and expended state to be clearly presented as corrections,
   so that bookkeeping fixes are not mistaken for spending or refilling.
10. As a player, I want to spend a chosen number of points from a store explicitly, so that I can record uses the
    system doesn't automate, such as a manually adjudicated split payment.
11. As a player, I want explicit spending to take points from the selected store only, never from my own MP or temporary
    MP, so that each source is accounted for separately.
12. As a player, I want spending more than the balance to be refused, so that the store never goes negative.
13. As a player, I want a single-use store spent down to zero to become expended, so that the enchantment visibly ends.
14. As a player, I want an expended store to keep showing as expended on the item and to offer no refill, so that I can
    see what the item used to be.
15. As a Referee, I want expending a store to leave the physical item, its quantity, its charms and its passives in
    place, so that ending one enchantment doesn't destroy the object or its other powers.
16. As a Referee, I want a correction that sets a single-use store's balance to zero not to expend it, so that only
    actual spending ends the enchantment.
17. As a player, I want a reusable store at zero to stay usable after a refill, so that rechargeable items work.
18. As a player, I want to refill a reusable store from my ordinary MP, so that I can recharge it as the rules allow.
19. As a player, I want a refill to move exactly the chosen amount once, decreasing my ordinary MP and increasing the
    balance by the same amount, so that no points are created or lost.
20. As a player, I want refill to ignore my temporary MP pools, so that surplus points from Tap or similar rulings are
    not poured into a permanent item.
21. As a player, I want the refill amount limited by my current ordinary MP and the store's free capacity, so that I
    can neither overdraw nor overfill.
22. As a player, I want a refill rechecked against current MP and balance when I confirm it, so that changes made while
    the refill dialog was open are respected.
23. As a player, I want a cancelled or rejected refill to change neither my MP nor the store, so that trying is free.
24. As a player, I want a refill that is retried after a partial failure to complete without repeating the transfer,
    so that I never pay twice for one refill.
25. As a Referee, I want to decide myself whether the refilling character is the item's original caster, so that the
    system doesn't need a creator-identity engine.
26. As a Referee, I want to record a refill from another character or an adjudicated transfer as an explicit
    correction, so that unusual cases can be tracked without a transfer system.
27. As a Referee, I want stores never to regenerate on rest, on reload or over time, so that the store changes only
    through explicit actions.
28. As a player, I want refill to require the item to be equipped (readied, worn or natural as its type allows), so
    that it follows the same access rule as casting from it.
29. As a Referee, I want equipment holding a store to need a quantity of one before its store can be spent from,
    refilled or used for payment, with an explanation to split the stack, so that one saved balance is never treated
    as a separate full balance for each unit.
30. As a Referee, I want a Sorcerer's Stone to use the same ledger with its capacity managed by hand, so that I can
    track it without the system pretending to follow its changing-POW rule.
31. As a Referee, I want store spending and refills on an unlinked token's item to change only that token's actor, so
    that two bandits copied from one base actor keep separate rings.
32. As a player, I want store actions to need the same permission as editing the item, so that owners can manage their
    own gear without the Referee.
33. As a player, I want a store's capacity, balance, kind and expended state to survive a reload unchanged, so that
    preparation never grants or loses stored points.
34. As a player, I want two quick spends on the same store from my client to be applied one after the other against
    the current balance, so that double-clicking can't overspend.

### Recoverable payment (Ench2)

35. As a player, I want every MP-costing cast to keep the rolled outcome even when the cost can't be paid, so that a
    roll is never thrown away or silently rerolled.
36. As a Referee, I want a cast whose actual cost exceeds the caster's available MP after the dice are resolved to
    appear as unpaid on its card, instead of completing with a zero-clamped deduction, so that nobody gets a free spell.
37. As a Referee, I want a cast whose payment write fails to appear as unresolved on its card, with what was and wasn't
    done, so that I can see the state and finish it.
38. As a player, I want an unpaid cast to charge nothing, not part of the cost and not down to zero, so that payment
    is all or nothing from one source.
39. As a player, I want personal payment still to take temporary MP first, oldest pool first, then ordinary MP, so that
    recoverable payment keeps the agreed resource rules.
40. As a player, I want the actual outcome cost still to follow the existing rules (success and fumble full cost,
    failure and critical one MP, Sorcery manipulation costs as today), so that payment amounts don't change.
41. As a Referee, I want Apply effect to be unavailable on an unpaid or unresolved success card, with the reason shown,
    so that effects aren't applied before the spell is paid for.
42. As a player who owns the caster, I want a "Pay now" action on the unpaid card that retries the payment from the
    recorded source, so that I can pay once I've regained MP.
43. As a player, I want "Pay now" to recheck the current balance and refuse with an explanation if it's still
    insufficient, so that a retry never underpays either.
44. As a Referee, I want to settle an unpaid cast by recording that it was paid by adjudication, without any automatic
    debit, so that split or external payments I handled by hand can be closed.
45. As a Referee, I want to void an unpaid or unresolved cast explicitly, leaving every resource as it is, so that
    abandoning a cast is a deliberate human decision and never an automatic refund.
46. As a Referee, I want a voided cast's card to stay readable history with Apply effect permanently unavailable, so
    that the table can see what happened.
47. As a player, I want a settled cast's card to show how it was settled (paid from which source, or adjudicated by
    whom), so that bookkeeping is transparent.
48. As a player, I want Apply effect to become available on a success card as soon as its cast is settled, so that
    settlement unlocks the effect without recasting.
49. As a player, I want a retry or reload after a partial failure to finish only the missing steps (payment, entry
    expenditure, card) without repeating completed ones or rolling again, so that one cast is paid once.
50. As a player, I want the settle and void actions also listed on my actor sheet for each unresolved cast, so that
    deleting or losing the card doesn't strand the cast.
51. As a player who owns the caster but didn't author the card, I want to settle its cast, so that card authorship
    doesn't block bookkeeping.
52. As a player, I want a failed or fumbled cast that can't be paid to be unpaid too, so that failure costs are
    settled the same way.
53. As a player, I want shift-click quick casting to use the same recoverable payment, so that quick casts are equally
    safe.
54. As a player, I want the existing pre-roll checks (full affordability before rolling, recheck after the dialog,
    cancel writes nothing) to stay, so that unpaid outcomes are only for changes during dice resolution or write
    failures.
55. As a player, I want non-rolled Divine casting to keep its remaining-magnitude workflow unchanged, so that spells
    that cost no MP gain no payment state.
56. As a Referee, I want old cards from before this change to stay as they are, with no invented payment state and no
    retroactive charge, so that history isn't rewritten.

### Store-paid casting (Ench3)

57. As a player, I want the cast dialog to offer a payment source, defaulting to personal MP, so that I can choose to
    cast from a store.
58. As a player, I want the source list to contain only stores on my own actor's items that are equipped, not
    expended and of quantity one, so that I only see stores I can actually use.
59. As a player, I want stores that can't pay the full cost of the lowest selectable magnitude shown as unavailable
    with their balance, so that I understand why I can't pick them.
60. As a player, I want to select exactly one store, so that each cast is paid from one clearly identified source.
61. As a player, I want the dialog's highest selectable magnitude to follow the selected source's funds, so that
    variable spells offer what that source can pay for.
62. As a player, I want a selected store to fund a spell even when its cost is more than my personal MP balance or
    maximum, so that external reservoirs can power big Sorcery spells as the rules allow.
63. As a player, I want the actual outcome cost charged to the selected store only, with my personal MP and temporary
    MP untouched, so that the store pays and I don't.
64. As a player, I want store-paid outcomes to cost what personal casts cost (success and fumble full, failure and
    critical one MP; Sorcery as today), so that the source doesn't change the price.
65. As a player, I want the choice rechecked on confirmation (store still mine, still equipped, still affordable at
    the chosen magnitude) and a stale choice refused with what changed, so that I never cast against a vanished store.
66. As a player, I want the system never to lower my chosen magnitude or switch to another source behind my back, so
    that what I confirmed is what happens.
67. As a player, I want a store emptied or removed during dice resolution to make the cast unpaid, not to fall back to
    my personal MP, so that sources are never substituted.
68. As a player, I want a single-use store paid down to zero by a cast to become expended, so that casting and
    explicit spending end the enchantment the same way.
69. As a player, I want the next cast to default to personal MP again, so that a store is never an implicit default.
70. As a player, I want shift-click quick casting to stay personal-only and never take store points because my own MP
    is short, so that stored points are spent only by explicit choice.
71. As a player, I want a quick cast I can't afford personally to tell me to open the cast dialog to choose a store,
    so that I know how to use it.
72. As a player, I want a matching conditional test choice still to open the dialog on a quick cast, so that the
    earlier agreed rule keeps precedence.
73. As a Referee, I want Divine no-MP casting to show no source selector, so that it isn't turned into MP spending.
74. As a player, I want the card to name the source that paid, so that everyone can see whether the ring or the
    caster paid.
75. As a Referee, I want split payments across personal MP and stores to follow a documented manual path, so that the
    one-source interface isn't mistaken for a rule that splitting is forbidden.

### Personal Magic charms (Ench4)

76. As a Referee, I want to drop a Personal Magic spell onto a physical item to create a charm entry, so that I can
    make a charm from any spell in the compendium or on an actor.
77. As a Referee, I want spells of other types refused as charm entries with an explanation, so that matrices, potions
    and scrolls are not mistaken for charms.
78. As a Referee, I want the entry to copy the spell's name, rules text, traits, magnitude, variable or fixed kind,
    casting skill reference and effect templates, so that the charm keeps working after the original spell is edited
    or deleted.
79. As a Referee, I want to edit an entry's name, stored magnitude, variable or fixed kind, reusable flag and templates
    afterwards, so that I can configure the charm the enchanter made; changes affect only future casts.
80. As a Referee, I want one item to hold several charm entries and a magic point store at once, so that multi-spell
    charms and charm-plus-store items work.
81. As a Referee, I want each entry marked single-use or reusable independently, so that a charm can mix both.
82. As a player, I want my actor sheet's Magic tab to list the charm entries on my items, with their stored magnitude
    and availability, so that I can cast them where I cast my spells.
83. As a player, I want a charm entry to be castable only while its item is equipped, of quantity one and the entry
    not expended, with the reason shown otherwise, so that the access rule is clear.
84. As a player, I want to cast a charm with my own Personal Magic Casting skill and its current modifiers, not the
    creator's percentage, so that the wielder's ability matters.
85. As a player, I want a charm to be blocked with an explanation if I lack the casting skill, so that I know why.
86. As a player, I want to cast a charm without knowing the spell, and without it being added to my learned spells,
    so that holding a charm isn't learning magic.
87. As a player, I want a variable entry to let me choose any magnitude up to its stored magnitude, and a fixed entry
    to use exactly its stored magnitude, so that the stored magnitude is a ceiling, not a minimum.
88. As a player, I want my own knowledge of a stronger version of the spell not to raise the charm's magnitude, so
    that the charm is what was stored.
89. As a player, I want the charm cast dialog to offer my matching conditional test choices, so that charms are tested
    like any other cast.
90. As a player, I want charm casting to pay my personal MP through the recoverable payment of Ench2, and to offer the
    store selector once Ench3 is in, including a store on the charm's own item, so that charms reuse every payment
    rule.
91. As a player, I want a successful paid cast, including a critical, to expend a single-use entry even when cast below
    its stored magnitude, so that the charm is used up by one success.
92. As a player, I want failure and fumble to pay their outcome cost and keep the entry, so that a failed attempt
    doesn't waste the charm.
93. As a player, I want a reusable entry to stay available after a success, so that permanent charms keep working.
94. As a player, I want expending one entry to leave the other entries, the store, the item's passives and the item
    itself untouched, so that a multi-spell charm loses only what was cast.
95. As a player, I want a single-use entry with a pending or unpaid cast to be blocked from another cast until that
    cast is settled or voided, even when paying from another source, so that one charm can't be used twice.
96. As a player, I want an unpaid successful charm cast to expend its entry only once it's paid, so that settlement
    and expenditure happen together and never twice.
97. As a player, I want the charm's success card to offer Apply effect with the cast magnitude and the entry's
    templates, like a spell card, so that charm effects use the same application review.
98. As a Referee, I want Apply effect from a charm card never to pay again or expend another entry, so that applying is
    separate from casting.
99. As a Referee, I want charm effects copied from an SRD spell to be recognised as duplicates of the same spell's
    effects in application review, so that a Protection charm and a learned Protection conflict as expected.
100. As a Referee, I want a charm card to stay usable after the entry or item is edited, expended or deleted, so that
     the historical cast is what's applied.
101. As a Referee, I want effects already applied from a charm to stay when the charm is expended, unequipped or
     given away, so that applied effects keep their own lifecycle.
102. As a player, I want shift-click on a charm entry to quick-cast at the highest magnitude my personal MP affords up
     to the stored magnitude, so that charms support quick casting like spells.
103. As a player, I want equipping a charm item never to cast anything automatically, so that charms are invoked by
     choice.
104. As a Referee, I want the SRD spell refresh to leave charm entries alone, so that refreshing learned spells never
     rewrites what was stored in an item.

### Copy, import and compatibility (all chunks)

105. As a player, I want dragging an item with a store or charms to another actor to copy its capacity, balance, kind,
     expended state and entries, so that the copy is the same item.
106. As a player, I want the original and the copy to be independent afterwards, so that spending from one never
     changes the other.
107. As a Referee, I want duplicating or importing a whole actor to keep its stores and charm state without
     recharging, clearing expenditure, learning spells, rerolling or recasting, so that copies are faithful.
108. As a Referee, I want an unresolved cast copied along with an actor to be inert history on the copy, never charging
     or settling against the original, so that copying doesn't duplicate payment.
109. As a Referee upgrading a world, I want every existing item to start with no store and no charm entries, and
     nothing inferred from names, descriptions or traits, so that the upgrade doesn't invent enchantments.
110. As a Referee, I want the system documentation to explain stores, refill, store payment, unpaid casts, settlement,
     charms and the manual split-payment path, and to mark which limits are release choices rather than SRD rules,
     so that the table can learn and adjudicate them.

## Implementation Decisions

### Data ownership

- The bearer is the existing physical item: equipment, weapon or armour. No new item type, slot model or containment
  framework. Spells, skills and special abilities can't bear stores or charms.
- **Store** (Ench1): an optional record in the item's system data holding capacity, balance (nonnegative integers,
  balance no greater than capacity), kind (single-use or reusable) and expended flag. Absent means the item has no
  store. Adding a store creates the record; removing it deletes it. At most one store per item.
- **Charm entries** (Ench4): an ordered list in the item's system data. Each entry has a stable local identity, name,
  rules text, traits, stored magnitude (at least one), variable or fixed kind, casting skill reference, kind
  (single-use or reusable), expended flag, the template key source it was copied from, and the identity of the
  operation that expended it (for idempotent recovery).
- **Charm entry templates** are item-embedded effects on the physical item with the **apply to recipient** role from
  [App1](../v09-application/spec.md), tagged with their entry's identity. That role keeps them out of every live
  calculation. They reuse App1's template editor and snapshot resolution, and they travel with item copies natively.
  Deleting an entry deletes its templates. The item sheet lists them under their entry, not with the item's own
  item-local effects and owner passives.
- The entry keeps the source spell's template key origin, so App1/App2 duplicate detection treats a charm's
  Protection and a learned SRD Protection as the same template.
- Validation lives in the data model (integer and range constraints) and in the pure module (balance against capacity,
  capacity reductions). The data model never clamps silently.
- Absent store and entry data are inert. No migration step is needed, and nothing is inferred from existing data.

### Pure magic-store module (the main seam)

A new pure module, free of Foundry calls at import time, owns all ledger, payment and charm decisions over plain data.
Every operation returns the new state plus what changed, so callers can perform one write and report it:

- **Ledger**: validate a correction (capacity, balance, kind, expended) and refuse a capacity below the balance; spend
  an amount from a store (refuse above the balance; a single-use store reaching zero by spending becomes expended; a
  correction to zero does not); refill plan from ordinary MP and free capacity (refuse an expended or single-use store,
  overdraw or overfill; temporary pools are not an input).
- **Access**: whether an item's store or entries are usable by its owning actor: eligible state (readied for weapons
  and equipment, worn for armour, natural where the type already has it), quantity one for equipment, not expended,
  and an explanation when not.
- **Payment sources**: the candidate sources for a cast (personal plus every accessible store), each with its funds
  and whether it covers the full nominal cost of the lowest selectable magnitude; and the highest affordable magnitude
  for a given source, reusing the existing magnitude/cost calculations. Store funds are never capped by the actor's
  POW or personal MP maximum.
- **Charm cast parameters**: from an entry, the stored-magnitude ceiling, variable or fixed selection, and the source's
  funds, give the selectable magnitudes. Charm availability is blocked by expenditure, a missing casting skill, or an
  incomplete operation on the same single-use entry.
- **Cast operation**: an operation is a plain record (see below). The module answers, for a record and the current
  state of its source and entry: whether payment can be made now, the remaining steps in order (pay, expend entry,
  post card), whether Apply effect is allowed (settled, success or critical), and the transitions for pay, adjudicate
  and void. Settlement and expenditure for single-use entries follow the success-only rule.

Sheets, dialogs, chat buttons and the casting code are thin callers that gather plain data, call the module and
perform the writes it describes.

### Cast operation (Ench2)

Every MP-costing cast (learned spells now, charm entries from Ench4) runs as one **cast operation**. Non-rolled Divine
casting does not.

- **Record.** An operation record in the caster actor's system data holds: operation id, caster actor identity
  (including the token for synthetic actors), spell or entry identity and name, payment source (personal, or a store
  item identity), magnitude, test outcome and roll total, actual cost, completed steps, card message id once posted,
  status (pending, unpaid, settled, voided) and how it was settled (paid from source, adjudicated by which user). The
  caster's owner can always write it, so recording and settlement don't depend on chat-message permissions.
- **Flow after the dice are resolved**: compute the actual cost from the outcome; write the record (status pending);
  pay; expend the charm entry if the outcome is a success; post the card; mark the record settled. For personal
  payment, the record and the debit should be one actor update. A cast that completes in one go may then drop its
  record, since its card already says settled. A cast that became unpaid or unresolved keeps its record, with its
  final status, so the card can render it.
- **Idempotent steps.** Each step marks the operation id on the document it writes, in the same update: the paying
  source (the actor for personal payment, the store item for store payment) records the ids it has been debited for;
  the charm entry records the id that expended it; the card carries the id in its flags. A retry consults those markers,
  never the record alone, to decide what remains, so a crash between a debit and the record update can't cause a
  second debit. Retention of debit markers is the implementer's choice, as long as markers for incomplete operations
  are kept.
- **Unpaid.** If the source is gone, no longer accessible, or can't cover the actual cost at payment time, nothing is
  debited, the record becomes unpaid, and the card is posted with the outcome and an unpaid banner. If a write fails,
  the record stays pending with the steps done so far, and the card (or, if the card itself failed, the actor sheet)
  shows it as unresolved. There is no partial debit, zero clamp, fallback source, debt, reservation or refund.
- **First write failure.** If the very first write (the record) fails, nothing was charged or recorded. The cast is
  reported as not recorded and the person may cast again. This is the only case without a recoverable outcome, and it
  matches today's rejected-update behavior.
- **Settlement actions**, on the card and in an "Unresolved casts" list on the caster's actor sheet, for the caster
  actor's owner or a GM:
  - **Pay now / Finish**: rechecks the recorded source and runs the remaining steps. It refuses with an explanation if
    the source still can't pay. It never switches source or changes the magnitude.
  - **Record adjudicated payment**: marks the payment step done without a debit, recording the user. Remaining steps
    (entry expenditure, card) then run.
  - **Void**: marks the operation voided and changes no resource or entry. Apply effect stays unavailable for good.
- **Card rendering.** The card shows the payment source and status. When its operation record is reachable, the card
  renders the live status from it, so settlement by someone who can't edit the message still shows. Otherwise it
  shows the status saved at posting. Apply effect (App1) is enabled only for success or critical outcomes whose
  operation is settled. Cards without an operation id (pre-change cards, Divine casts) keep their existing behavior.
- **Serialization.** Debits from the same source (personal MP or one store), including refills and explicit spends,
  run one at a time in a client, each rechecking the current balance right before its write. A single-use entry with
  an incomplete operation on its owning actor can't be cast again. Two different users spending the same source at the
  same instant from different clients can still race. This is the same accepted concurrency limit as in the
  [actor effects spec](../v09-actor-effects/spec.md).
- **Resource interface.** Personal payment goes through the Res2 actor-level spend-MP method (temporary pools FIFO,
  then ordinary MP), extended to accept the operation id marker. Nothing writes MP fields directly.

### Ledger actions and UI (Ench1)

- **Item sheet**: a "Magic point store" section on equipment, weapon and armour sheets, for users who can edit the
  item. It offers "Add store" (capacity, initial balance, kind), then shows balance/capacity, kind and expended state,
  with correction fields and actions Spend, Refill (reusable, not expended, owned item, accessible) and Remove store
  (confirmation stating discarded points).
- **Spend** asks for an amount, spends from the store only and is available on any owned item regardless of state,
  because it is bookkeeping for uses the system doesn't automate.
- **Refill** opens a small ApplicationV2 dialog showing ordinary MP, free capacity and the maximum transferable amount.
  On confirm it rechecks both sides and transfers once: ordinary MP down, balance up, by the same amount. Temporary
  pools are untouched. It uses the same per-source serialization and debit markers as payment, so a retry never
  repeats a completed transfer.
- **Actor sheet**: items with a store show the balance next to the item in the inventory. The Magic tab shows a
  compact list of accessible stores.
- Equipment with a quantity above one shows a "split the stack" explanation in the store section. Spend, refill and
  payment are unavailable until it has a quantity of one. Configuration stays possible.
- Corrections are ordinary item edits by the item's editors. Clearing Expended is a correction for adjudicated cases.
- Light parchment theme; new strings under `OQ.*` in the English localization source.

### Store payment in the cast dialog (Ench3)

- The cast dialog for MP-costing spells (and charm entries) gains a payment-source selector listing personal MP first,
  then accessible stores with their balances. Stores that can't cover the full cost of the lowest selectable magnitude
  are shown disabled. The default is always personal. Changing the source updates the selectable magnitude range.
- The pre-roll check uses the selected source: full nominal cost of the chosen magnitude must be affordable from it.
  On confirmation the caster's code rechecks the actor, item identity, accessibility, entry availability and
  affordability, and refuses a stale choice with what changed. It never lowers the magnitude or switches source.
- The operation records the store's identity. Payment debits only that store (spending to zero expends a single-use
  store) with the operation marker. Outcome costs and Sorcery costs reuse the existing calculations unchanged; no new
  Sorcery manipulation controls are added.
- Quick casting (shift-click, macros using the quick path) stays personal-only with today's highest-affordable
  magnitude. When personal MP can't pay, the warning suggests opening the cast dialog to choose a store. The Fx6b
  rule that a matching conditional choice opens the dialog still takes precedence.
- Divine no-MP casting gets no selector.
- The card states the paying source by item name.

### Charms (Ench4)

- **Authoring**: the physical item sheet gains a "Charm" section listing entries. Dropping a spell document there
  creates an entry if the spell is Personal Magic, and is refused with an explanation otherwise. The copy takes the
  spell's current data, not a live reference, and never runs the spell's creation adjustments (such as the Sorcery
  magnitude adjustment on adding to an actor). Entry fields and templates are editable in place. Deleting an entry
  needs confirmation.
- **Listing**: the actor sheet's Magic tab gets a "Charms" group listing entries from the actor's items, with item
  name, stored magnitude, kind, and either a Cast control or the reason it's unavailable (not equipped, quantity,
  expended, pending cast, missing skill).
- **Casting** reuses the spell cast path with the entry as the spell data: the wielder's casting skill resolved from
  the entry's skill reference against the wielder's skills, with that skill's modifiers and Fx6a conditional choices;
  the magnitude range from the module; the payment selector (Ench3, if landed); and the cast operation. A successful
  paid cast expends a single-use entry as one of the operation's steps.
- **Card and snapshot**: the success card carries App1's cast snapshot built from the entry (entry and item names and
  identities, cast magnitude, entry templates with their origin template key) and offers Apply effect once the
  operation is settled. Apply never pays, casts or expends anything. The snapshot is independent of later entry or
  item changes.
- **No automatic behavior**: equipping, readying or copying a charm item casts nothing, learns nothing and applies
  nothing. Expending, unequipping or giving away the item doesn't touch effects already applied from it.

### Copy, import and compatibility

- Item drag-copies and whole-actor duplication/import preserve store state, entries, entry templates and expended
  flags as saved. Entry identities are local to their item, so copies don't collide.
- Operation records copied with a whole actor carry the original caster identity. On the copy they are shown as inert
  history (from another actor), with no settlement actions, and they don't block the copy's charm entries. Cards keep
  pointing at the original actor.
- No migration, legacy conversion or default population. System packs gain no enchanted items in this track. The SRD
  spell refresh macro (content track) excludes charm entries.

### Representative content

Mechanic chunks carry only what their acceptance scenarios need, created in the test world rather than in system
packs: a reusable ring store, a single-use store, and an amulet with a Protection charm (single-use) and a Mobility
charm (reusable). No compendium pack of enchanted items ships in v0.9.

### Delivery and dependencies

| Chunk | Blocked by | Delivers |
| --- | --- | --- |
| Ench1 | — | Store record and validation, item-sheet store section, corrections, explicit spend, refill from ordinary MP, single-use expiry, quantity and access rules, actor-sheet balances, serialization and refill markers, documentation |
| Ench2 | [Res2](../v09-resources/spec.md) | Cast operation record, idempotent step markers, unpaid/unresolved cards, Pay now / Finish, adjudicated payment, void, actor-sheet unresolved list, Apply gating (if App1 has landed), replacement of the zero-clamp behavior and its tests, documentation |
| Ench3 | Ench1, Ench2 | Payment-source selector, per-source affordability and magnitude range, store debit with expiry, confirmation recheck, quick-cast message, source on card, documentation |
| Ench4 | Ench2, [App1](../v09-application/spec.md) | Charm entries and their templates, drop-to-create from Personal Magic spells, Magic-tab Charms group, charm casting with wielder's skill and magnitude ceiling, success-only per-entry expenditure, pending-entry blocking, snapshot and Apply, documentation |

Ench3 and Ench4 are independent. Whichever lands second wires store selection into charm casting. If Ench2 lands
before App1, App1 must enable Apply effect only for settled operations; if after, Ench2 adds the gate. One PR per
chunk into master. Chunks may be split further, never merged across tracks.

## Testing Decisions

A good test exercises observable outcomes through a public seam: resulting balances, MP and pools, expended flags,
remaining steps, posted cards and warnings. It does not test internal helpers or markup. Tests run in plain Node with
stubbed globals, per the repository convention. Two seams, agreed with the user:

1. **Magic-store module** (new test file): every ledger row of the acceptance table as state in/state out;
   corrections refusing invalid values and capacity below balance; single-use expiry by spending but not by
   correction; refill ignoring temporary pools and bounded by ordinary MP and free capacity; access by type and state,
   quantity and expended; payment-source candidates and per-source maximum magnitude, including a store funding more
   than the actor's personal maximum and Sorcery magnitude 15; charm magnitude ceilings for variable and fixed
   entries; and cast-operation step planning from markers (paid but not expended, expended but card missing, unpaid,
   voided, adjudicated), Apply gating, and pending-entry blocking. Prior art: the pure-function tests for magic and
   rolls.
2. **Spell-casting harness** (existing spell-casting test file), extending its stub actor with temporary MP pools (from
   Res2), store items, charm entries and operation records:
   - Ench2: the existing "MP changed during dice fulfillment" case becomes unpaid (MP unchanged, card posted unpaid)
     where today it zero-clamps; a rejected payment update becomes an unresolved card instead of no card; Pay now
     after regaining MP pays once; a retry after "debited but record not updated" doesn't debit again; void changes
     nothing; quick casts follow the same rules; a rejected first write still posts nothing and charges nothing.
   - Ench3: store selection pays the store only; outcome costs per result for Personal Magic and Sorcery; stale store
     at confirmation refused without rolling; store emptied during dice → unpaid, no personal fallback; quick cast never
     touches a store; two casts from one store in turn serialize.
   - Ench4: charm cast uses the wielder's skill; variable below the ceiling, fixed exact; success expends a single-use
     entry once, failure and fumble keep it; a reusable entry stays; pending entry blocks a second cast from another
     source; no learned spell is created.

The existing tests that accept a zero-clamped underfunded cast are deliberately changed in Ench2. Sheets, the refill
dialog, card buttons and the Magic-tab lists are thin callers verified by the manual scenarios.

### Acceptance examples

Verify manually with reloads between steps, on a character and an NPC, and on linked and unlinked tokens where noted.

| Chunk | Setup | Action | Expected |
| --- | --- | --- | --- |
| Ench1 | Store 5/8 | Spend 2, reload | 3/8; actor MP untouched; no regeneration or repeat debit |
| Ench1 | Store 5/8 | Type balance 9; lower capacity to 4; type −1 | Each refused with explanation; still 5/8 |
| Ench1 | Single-use store 2/8 | Spend 2 | 0/8 Expended; item, quantity, charms and passives remain; no Refill offered |
| Ench1 | Single-use store 2/8 | Correct balance to 0 | 0/8, not expended |
| Ench1 | Reusable store 0/8, MP 5/10 + temporary 4 | Refill 3 | Store 3/8, MP 2/10, temporary 4 |
| Ench1 | Reusable store 6/8, MP 1/10 | Open refill | Maximum transferable 1; entering 2 refused |
| Ench1 | Refill dialog open for 3 | Spend MP to 1 elsewhere, confirm | Refused; neither side changes |
| Ench1 | Equipment with store, quantity 3 | Open item | "Split the stack" shown; spend/refill/payment unavailable |
| Ench1 | Two unlinked tokens of one base actor, each ring 4/8 | Spend 2 on token A's ring | A 2/8; B and base actor 4/8 |
| Ench1 | Ring 4/8 carried | Try Refill | Unavailable: not equipped; Spend still available |
| Ench2 | MP 10, magnitude-3 Personal Magic spell, quick cast | Lower MP to 2 during dice resolution; success | Card shows success, unpaid, cost 3; MP 2; Apply unavailable |
| Ench2 | That unpaid card | Regain MP to 5, Pay now | MP 2; card settled "paid from personal"; Apply available; reload doesn't pay again |
| Ench2 | Unpaid card | GM records adjudicated payment | No MP change; card settled "adjudicated by GM"; Apply available |
| Ench2 | Unpaid card | Void | Nothing changes; Apply permanently unavailable; card stays readable |
| Ench2 | MP 8 + temporary 4 | Cast cost 5, actor update fails | Card unresolved with nothing paid; Finish after fixing → temporary 0, MP 7, once |
| Ench2 | Unpaid card deleted | Open actor sheet | Unresolved cast listed with Pay now / adjudicate / void |
| Ench2 | Player owns caster, GM authored the card | Player clicks Pay now | Payment works; card shows settled |
| Ench3 | Personal MP 8 + temporary 4, store 6 | Cast cost 5 from personal | Temporary 0, MP 7; store 6 |
| Ench3 | Personal MP 2, store 8 | Cast full-cost 5 from store, success | Store 3; MP 2 |
| Ench3 | Personal MP 2, store 2 | Cast full-cost 4 | Neither source selectable at magnitude 4; dialog explains; no split |
| Ench3 | Store 5, Personal Magic cost 4 | Success / critical / failure / fumble (separate setups) | Store 1 / 4 / 4 / 1; personal untouched |
| Ench3 | Store 12, MP max 8, Sorcery magnitude 15 | Cast from store, success | Store 1; allowed despite personal maximum |
| Ench3 | Store selected in dialog | Unready the item, then confirm | Refused before rolling: store not equipped |
| Ench3 | Store 4, cost 4 | Spend 2 from store during dice resolution | Card unpaid from that store; personal MP untouched |
| Ench3 | Single-use store 4/8, cost 4 | Cast from store, success | Store 0/8 Expended |
| Ench3 | MP 1, store 8 | Shift-click cast cost 3 | Not cast; warning suggests the dialog; store 8 |
| Ench3 | Two stores | Cast from ring, then open dialog again | Default is personal |
| Ench4 | Amulet (readied) with single-use Protection 3 charm; wielder with Personal Magic Casting 40 | Cast at 2, success | MP −2; entry expended; card offers Apply with magnitude 2 |
| Ench4 | Same charm on a fresh copy | Cast at 2: failure, then fumble | Pays 1, then 2 (selected magnitude); entry kept both times |
| Ench4 | Fixed charm magnitude 3 | Open cast dialog | Magnitude fixed at 3 |
| Ench4 | Wielder knows Protection 5 | Cast the Protection 3 charm | Ceiling remains 3 |
| Ench4 | Charm given to another actor | Cast | Uses that actor's skill; original actor unaffected |
| Ench4 | Wielder without Personal Magic Casting | Cast | Blocked with explanation |
| Ench4 | Single-use entry, unpaid success | Try to cast it again from a store | Blocked: pending cast; after Pay now the entry is expended once |
| Ench4 | Amulet with Protection (single-use) and Mobility (reusable) entries and a store | Expend Protection | Mobility, store and passives intact |
| Ench4 | Protection applied from a charm card | Expend, unequip, delete the amulet | Applied effect stays; card still applies (snapshot) |
| Ench4 | Ally has learned-Protection effect | Apply Protection from a charm card | Review offers keep/replace (same template key) |
| All | Item with store 3/8 and expended single-use entry | Drag to another actor; spend 1 on copy | Copy 2/8, entry still expended; original 3/8 |
| All | Actor with an unpaid cast | Duplicate actor | Copy shows the cast as inert history; no actions; original still settles |
| All | v0.8.2 world | Upgrade | No item gains a store or charm |

Run `yarn test`, `yarn lint` and `yarn build` for each chunk.

## Out of Scope

- Matrices, Personal Magic and Sorcery potions and scrolls, Divine blessed items and relics: no activation,
  consumption, recharge or stored-skill automation. Their manual workflows are written in the content track's
  manual-coverage documentation batch. Never label one a charm to get charm behavior.
- Crafting and enchanting: Enchant rolls, materials, time, growth-point sacrifice, creator eligibility and temple
  recharge rituals. Already-created items are configured directly.
- Special reservoirs: Sorcerer's Stone POW-dependent capacity, bound Magic Spirits, Mindlink, Places of Power, Magus
  body transfer, and spirit or remote reservoirs, ground items and shared actors.
- Automatic split, multi-store or personal-plus-store allocation, fallback sources, remembered stores and a
  split-allocation UI. Splits follow the documented manual path.
- Store-to-store transfer, withdrawal into personal MP, automatic balancing, refill from temporary MP, regeneration,
  durability, damage or destruction triggers.
- Equipment slots, hand counts, jewellery or attunement limits; adding `natural` to item types lacking it.
- Per-unit balances or charges inside a stack and automatic stack splitting.
- Calm or unhurried casting lanes, new Sorcery manipulation controls, Divine store payment.
- Charm creation from Sorcery, Divine or custom spell types; macro entry points for charm entries.
- Full-cost reservation and refund schemes; a general transaction framework; cross-client locking beyond the accepted
  concurrency limit.
- Retroactive payment state for old cards; any migration or inference of enchantments from existing data.
- A compendium of enchanted items.

## Further Notes

- Glossary terms used: **magic point store** (never a temporary MP pool), **stored spell**, **charm**, **temporary
  points**, **temporary-point pool**, **effect template**, **applied effect**, **conditional effect**. Candidate new
  terms for review: **charm entry** (one stored spell in a charm, with its own single-use or reusable state), **cast
  operation** (one recoverable cast: outcome, payment, expenditure and card) and **unpaid cast** (a rolled outcome
  whose cost hasn't been settled). Add them to the glossary if they stick.
- Documentation must keep product limits apart from rules. Equipped-state access, ordinary-only refill, single-source
  payment, personal default and personal-only quick casting are v0.9 interface choices. The SRD allows several stores
  and casting without personal MP, and it neither requires nor forbids splitting. The success-only, per-entry charm
  expenditure is the user's chosen reading of ambiguous rules text.
- Manual split-payment recipe for the Magic page: adjudicate the allocation, record it with explicit store spends and
  MP corrections, roll the casting skill as a skill test if needed, and create or apply the effect by hand. Don't run
  an ordinary paid cast on top of those deductions; a generic skill card gains no snapshot or Apply effect. An
  already-unpaid cast can instead be closed with "Record adjudicated payment".
- Documentation in the same PRs, edited as HTML under `docs/packs/` and regenerated: the Items page (stores, refill,
  corrections, quantity, access, charm entries) and the Magic page (payment source, unpaid casts and settlement,
  charm casting and expenditure, manual split payment, a pointer to the manual enchanted-item kinds). Ench chunks don't
  change the spell coverage inventory.
- Implementer checks in the Foundry v14 sources (read `docs/foundry-v14-notes.md` first): whether an actor update can
  carry embedded item changes in the same database operation (which would make refill and store payment plus record a
  single write; otherwise the per-document markers carry idempotence); dropping a spell document onto an item sheet;
  and re-rendering a chat card from actor data when the viewer can't update the message.
- Ench2 changes established behavior that an existing test asserts (cast completing underfunded). That change is
  intended and must be called out in the PR description.
