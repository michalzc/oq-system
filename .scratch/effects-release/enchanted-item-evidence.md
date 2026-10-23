# Enchanted-item evidence

Supporting facts for [Bound magic point stores and stored-spell casting for v0.9](issues/07-enchanted-items.md).
This file is evidence, not an approved product specification. Sources are the repository's SRD and current code.

## Local rules

Paths below are relative to `docs/OpenQuest3-SRD/`.

| Kind | Source | Distinct rule |
| --- | --- | --- |
| MP store | OQ3-SRD-Personal-Magic.adoc:363–390 | Separate additional MP; initial inserted MP sets maximum. May coexist with a charm. Default nonregenerating enchantment ends at zero; growth-point investment makes reusable, refillable from the caster's MP. No explicit equipment state, school or touch gate. Damage/destruction release is manual; text also calls item unbreakable. |
| Charm | OQ3-SRD-Personal-Magic.adoc:334–361 | One or more Personal Magic spells; specified stored magnitudes. Wielder's Personal Magic Casting and MP. Growth point makes spell reusable; otherwise cast dispels charm. Breakage dispels enchantment. |
| Personal Magic costs | OQ3-SRD-Personal-Magic.adoc:70–99 | Success/fumble full magnitude; failure/critical one MP. Calm unhurried casting need not roll; this is not currently a separate automatic casting path. |
| Variable Personal Magic | OQ3-SRD-Personal-Magic.adoc:129–135,145–154 | Ordinary knowledge/magnitude limits; interaction of wielder knowledge with a higher-magnitude charm is not explicitly settled. |
| Personal Magic potion | OQ3-SRD-Personal-Magic.adoc:392–422 | Single-use, no drinker MP or casting test; all spells target drinker together. Athletics determines timing. |
| Personal Magic scroll | OQ3-SRD-Personal-Magic.adoc:424–455 | Language requirement, ordinary casting, fires at end of round; learned/cast consumes unless made reusable. |
| Sorcery matrix | OQ3-SRD-Sorcery.adoc:713–732 | Original enchanter's casting AND manipulation skill; wielder MP; permanent/reusable. |
| Sorcery potion | OQ3-SRD-Sorcery.adoc:679–689 | All spells release at creator's stored magnitudes. Short entry does not expressly repeat every Personal Magic potion rule. |
| Sorcery scroll | OQ3-SRD-Sorcery.adoc:691–711 | Stored manipulations. Success consumes; failure preserves but prevents retry until casting skill improves; fumble consumes without benefit. |
| Divine blessed item | OQ3-SRD-Divine-Magic.adoc:726–749 | Religion gate, cast discharges; temple recharge hours equal magnitude, priest required above magnitude two. |
| Divine relic | OQ3-SRD-Loot.adoc:153–167 | Same religion/good standing, deceased owner's spell magnitude; reusable after reconsecration. |
| Sorcerer's Stone | OQ3-SRD-Sorcery.adoc:119–127,376–383; OQ3-SRD-Loot.adoc:118–122 | Can fund manipulated Sorcery, capacity up to current POW; recharge/current-balance response to changed POW not specified here. |

Charm ambiguities needing a product interpretation: whether failure/fumble consumes; whether casting one spell ends
all spells in a multispell charm; whether a variable spell can be cast below its stored magnitude; whether wielder's
own learned magnitude restricts the charm. Store refill ambiguities: caster versus any wielder, and whether temporary
personal MP is transferable. No general cross-pool splitting rule was found.

Distinct manual cases: bound Magic Spirits (`OQ3-SRD-Creatures.adoc:1863–1899`); Places of Power
(`OQ3-SRD-Personal-Magic.adoc:1168–1179`); Transcended Magi's body transfer
(`OQ3-SRD-Sorcery.adoc:184–199`); wands/staves as focus rather than stored spell
(`OQ3-SRD-Sorcery.adoc:84–98,129–145`).

## Current implementation

- `src/module/dataModel/data-models-item.js:146,184`: ordinary equipment and spell schemas, no store/contained-spell
  fields. No existing enchanted-item APIs were found in `src/module`.
- `foundryvtt-api/common/documents/item.mjs:31,54`: Item embeds ActiveEffects, not other Items. Stored spell definitions
  require explicit system support; cannot assume native embedded spell Items.
- `src/module/document/item/spell.js:78–104`: actor ordinary MP only; full-cost affordability before rolling; rechecks
  after dialog; cancellation changes nothing. After evaluating dice, charges then-current MP with zero clamp.
- `test/test-spell-casting.js:194–232`: stale-dialog rejection is tested; another test expressly accepts a magnitude-3
  cast completing when only two MP remain after dice, with zero-clamped deduction. A stricter payment decision changes
  that current behavior; it is not already implemented by a store selector.
- `src/module/utils/magic.js:8–21,39–42,65–77`: full cost/magnitude calculations and outcome adjustments;
  failure/critical one MP, success/fumble full cost.
- `src/module/document/item/spell.js:88–91`; `test/test-spell-casting.js:250–268`: quick casting chooses highest affordable
  magnitude without a source selector. `src/module/utils/oq-game.js:6–12` ordinary macros use the dialog.
- `src/module/document/item/spell.js:52–55`: skillReference resolves against wielder's actor skill map.
  `:22–28` adjusts newly added variable Sorcery spell magnitude to receiving actor; must not accidentally rewrite
  stored spell definitions if that creation path is reused.
- `src/module/document/item/spell.js:107–137,189–212`: no-MP spells use Divine-like magnitude expenditure/regaining;
  no-MP flag does not implement charms, scrolls or potions.
- `src/module/consts/items-config.js:100–115`: readied/carried/stored equipment; weapons additionally natural; armour
  uses worn/carried/stored/natural. No current casting access gate.
- `src/module/document/item/equipment.js:3–30`; `src/module/sheet/actor/actor-base-sheet.js:153–168`: ordinary quantity
  bookkeeping, no enchanted consumable use or per-unit store balances.
- `foundryvtt-api/client/applications/sheets/actor-sheet.mjs:341–350`: drag copies items, not an atomic transfer.
  Prior ownership decision already fixes copy semantics; do not promise a new physical-item transfer engine.
- `src/module/dataModel/data-models-actor.js:46–51,87–92`; `src/module/document/actor/base-actor.js:127–139`;
  `src/module/chat-handlers/updates-from-chat.js:68–75`: current ordinary MP model/adjustment routes. Temporary personal
  MP is agreed planned work, not implemented yet.

## Targeted payment-source recheck requested by the user

The local SRD was searched across all chapters for store/pool/MP/spending language. Findings:

- `docs/OpenQuest3-SRD/OQ3-SRD-Personal-Magic.adoc:8–14` expressly permits several additional pools/stores and casting
  without using personal MP. Their regeneration, if any, is independent of personal rest; no contradictory automatic
  refill promise is made. `:368–374` describes owner access and store+charm coexistence, without making coexistence
  mandatory. `docs/OpenQuest3-SRD/OQ3-SRD-Loot.adoc:106–108` describes users spending stored rather than personal MP.
- No ordinary-store restriction to Personal Magic, original creator as spender, same item as invoked charm, physical
  touch or equipment state was found. Refill specifically names the caster (`Personal-Magic.adoc:380–387`), unlike
  general owner/user spending. Equipped-state gating is an accepted product boundary, not a quoted SRD prohibition.
- No passage expressly requires or forbids combining personal MP with one store, combining several stores, choosing a
  fallback, remembering a source or using a prescribed spending order. Single-source payment and personal-only quick
  casting are proposed interface/release limits, not rules that combining reservoirs is illegal.
- `docs/OpenQuest3-SRD/OQ3-SRD-Sorcery.adoc:379–383` expressly supports external reservoirs funding manipulated spells
  beyond normal personal resources. Do not cap a selected store's spending at the caster's personal POW/MP maximum.
- `Personal-Magic.adoc:169–170` describes magnitude as minimum MP required to cast; critical/failure cost exceptions
  remain `:81–99`. Pre-roll full affordability is consistent with current system behavior; the SRD does not prescribe
  a reservation protocol or mandate that all available MP reside in one pool.
- Store payment does not remove normal gestures/chant/target or other casting requirements (`Personal-Magic.adoc:72–79`;
  `Sorcery.adoc:297–311`), change casting skill ownership or turn a no-MP Divine spell into MP expenditure.
- `Sorcery.adoc:1056–1064` Tap grants spendable excess personal MP but does not explicitly decide whether transferring
  excess to stores is legal. The accepted ordinary-only refill restriction is a release policy, not an explicit SRD ban.
- Spirit reservoirs, Places of Power and Magus body-transfer rules are distinct cases; do not generalize their access,
  regeneration, opposed tests or transfer rules to ordinary enchanted items.

Additional distinct sharing rules: Mindlink (`docs/OpenQuest3-SRD/OQ3-SRD-Divine-Magic.adoc:1081–1113`) permits linked
participants to use each other's MP without further consent, within link range, without sharing skills. Wise sanctuary
creation permits companion MP contributions (`docs/OpenQuest3-SRD/OQ3-SRD-Personal-Magic.adoc:1158–1166`). These specific
sharing cases do not establish a universal automatic split-payment algorithm. Divine no-MP casting is explicit at
`docs/OpenQuest3-SRD/OQ3-SRD-Divine-Magic.adoc:502–505`.
