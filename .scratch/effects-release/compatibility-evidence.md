# Migration and compatibility evidence

Supporting facts for [Choose v0.9 migration and compatibility policy](issues/09-migration-and-compatibility.md).
Local source investigation only; no user-world/database inspection or changes. This is evidence, not an approved policy.

## Existing source data

- `src/module/dataModel/data-models-actor.js:46–51` defines ordinary resource mod/max/value, with default max zero;
  no current upper bound and no temporary-pool, attribution or transition-history schema. Source max is not a capacity
  oracle. `src/module/document/actor/base-actor.js:122–139` recalculates capacity and clamps prepared current, hiding
  source excess. Characteristics derive value from base/mod (`data-models-actor.js:29–34,136–140`).
- Characteristic, skill and resource manual modifiers/formulas are real stored data, not proof of any temporary effect
  (`src/module/dataModel/data-models-item.js:54–64`). Do not assume they identify a source or deadline.
- OQ initial actor effects run after base attributes and item preparation (`src/module/document/actor/base-actor.js:58–76`);
  core final effects run after preparation (`foundryvtt-api/client/documents/actor.mjs:428–436`). A phase/key can currently
  affect an AP calculation while a characteristic change arrives too late for dependent HP/skills. Reordering changes
  consequences without changing payloads. No current OQ effect allowlist or custom effect model supplies new intent.
- Core effect changes have key/type/value/phase/priority (`foundryvtt-api/common/data/active-effect.mjs:15–24`). Core
  transfer defaults true (`common/documents/active-effect.mjs:69–72`); true targets owner, false targets item
  (`client/documents/active-effect.mjs:199–202`). Actor aggregation includes transfer-true effects without inventory state
  gating (`client/documents/actor.mjs:305–312`). OQ has no item-local application pass: transfer false does not distinguish
  deliberately dormant templates from previously ineffective local changes. No OQ role/conditional/target/grant metadata.
- Core already normalizes legacy change modes/locations/durations and preserves invalid origin text in
  `flags.core.originText` (`foundryvtt-api/common/documents/active-effect.mjs:150–199`). Schema normalization is not evidence
  of a spell template, source grant or recipient target.
- Scanned 299 system-pack YAML files: all 282 root `effects:` arrays are empty. This says nothing about user-created
  world effects. Representative files: `src/packs/spells/Protection_g6dVEuxsN0egrt3O.yml:1–15`,
  `src/packs/equipment/Longsword_SRuNkmIZ8pqudSPk.yml:1–18`.
- Existing states are saved and sufficient (`src/module/consts/items-config.js:100–115`); weapon/equipment default carried,
  armour worn (`src/module/dataModel/data-models-item.js:95–99,131–135,152–156`). No new state vocabulary is needed.
- Equipment/spell schemas have no native enchanted-store/contained-spell data (`src/module/dataModel/data-models-item.js:146–168,184–204`).
  Names, traits/descriptions, current spell possession and unknown third-party flags cannot establish that schema.

## References, statuses, icons and cards

- Skill slugs come from names (`src/module/document/item/skill.js:6–10`); actor map indexes by slug
  (`src/module/document/actor/base-actor.js:118–119`). Weapon/spell skillReference uses that map
  (`src/module/document/item/weapon.js:23–39`, `spell.js:52–55`). Formulas are strings evaluated with roll data
  (`skill.js:21–36`); no legacy identity binding is established, duplicate slugs already collide.
- Exact overlapping core status IDs include dead, unconscious, sleep, prone, paralysis, blind, deaf, burning, disease,
  poison, invisible (`foundryvtt-api/client/config.mjs:1738–1787,1799–1802,1824–1832,1869–1872`). New display labels
  need not require changing these identities. Core restrain does not distinguish Held/Entangled/Stuck; several new
  palette conditions lack exact native equivalents. Out-of-palette IDs can exist on stored effects.
- Dead/defeated uses both status and saved combatant flag (`foundryvtt-api/client/documents/combatant.mjs:122–126`);
  special blind/invisible currently have vision/perception/filter side effects (`client/canvas/placeables/token.mjs:4524–4539`).
  Reminder-only semantics need explicit integration even with unchanged IDs. Native status removal can delete several
  single-status sources together (`client/documents/actor.mjs:547–570`), so preserve source-aware controls.
- `src/module/migration/migration-1-themed-icons.js:30–64` does not enumerate ActiveEffects. Existing custom images
  cannot be assumed to have a themed counterpart; distinguish explicit known icon mapping from semantic guesses.
- Old test cards retain HTML, dice and a message-type flag (`src/module/utils/roll.js:75–99`), no historical template,
  payment operation, receipt or damage-basis snapshot. Weapon/ability buttons contain source item UUID; follow-up damage
  reads live item (`src/public/templates/chat/parts/weapon-roll.hbs:36–39`, `skill-ability-roll.hbs:36–39`;
  `src/module/chat-handlers/updates-from-chat.js:80–90`). Do not reconstruct historical conditional choices or bindings.
- Already-rolled damage cards do retain actual totals/rolls (`src/module/utils/roll.js:211–232`;
  `src/public/templates/chat/parts/damage-roll.hbs:29–35`). Incomplete historical basis is not permission to erase known
  rolled values or charge an old cast retrospectively. Spell cards show cast values as HTML, no structured snapshot
  (`src/public/templates/chat/parts/spell-cast.hbs:15–34`).

## Migration framework and coverage gaps

- `src/module/migration/migration-runner.js:21–40` traverses Actor→Items, Scene→Tokens, Journal→Pages, Table→Results,
  and unlinked Token→delta-managed Items only. No ActiveEffect traversal or synthetic-Actor resource handler exists.
  Delta items filter `items.manages(id)` to avoid rewriting inherited base data; tests at `test/test-migrations.js:298`.
- ActorDelta has separate system/items/effects and combines with base source using embedded identities/tombstones
  (`foundryvtt-api/common/documents/actor-delta.mjs:44,96`). Synthetic resources/effects need deliberate coverage without
  mutating the shared base or recreating deleted inherited items/effects.
- Runner handlers use `document.toObject()` (`migration-runner.js:80`), which is cleaned `_source`, not untouched DB JSON
  and not prepared values (`foundryvtt-api/common/abstract/data.mjs:295–308,836`). New cleaning/pruning must not discard
  recoverable old data before conversion. Handlers run twice and must be pure/idempotent.
- `src/module/oq.js:46` applies pending steps at setup and persists at ready. Every client gets in-memory conversions;
  only active GM writes (`migration-runner.js:173,221`). One world migrationVersion, no per-document marker or automatic
  late-import catchup (`migration-runner.js:177`; `src/module/init/register-settings.js:54`).
- World packs, including locked ones, are migrated with lock restoration in finally (`migration-runner.js:135–164`).
  System/module packs are excluded; rebuilt system YAML must retain IDs. No write to third-party module packs is implied.
- Existing writes are batched by 100, detect rejected/omitted returned IDs and continue (`migration-runner.js:109`).
  Nonarray update results currently assume success. Failures default retry, block persisting later steps and leave the
  world version unchanged; explicit GM skip advances it (`:236–251`). No persisted failed-document list currently exists.
  Already-successful writes remain. All pending steps may already be applied in memory before persistence stops.
- Retry fixtures verify only remaining changes are written after reload (`test/test-migrations.js:639`); other tests
  cover locks, missing writes, errors, player-only memory migration, skip and newer-version warning. There is no rollback.
- Existing item migrateData methods run on load independently of world version (`src/module/dataModel/data-models-item.js:67,118,171`;
  core `common/data/fields.mjs:4364`). Actor models have no corresponding custom method currently.
- JSON import executes fromImport/fromCompendium and update with noHook:true
  (`foundryvtt-api/client/documents/abstract/client-document.mjs:1025,1052–1068`), bypassing a preUpdate-only solution.
  Core-version migration is not the OQ runner. Compendium import likewise does not rerun OQ world steps after version
  advancement (`foundryvtt-api/client/documents/abstract/world-collection.mjs:80,109`). Late-import compatibility needs an
  explicit on-load/source-conversion path, with exactly-once persistence/resource behavior.

## Support scope clarified by the user

The existence of native Foundry effect fields/application paths above does not establish supported pre-v0.9 OQ
behavior. The user explicitly excludes supporting/migrating user/macro/module-created effects. Those facts are retained
as investigation history, not requirements for an adapter, legacy role inference, grant reconstruction or repair UI.
The compatibility ticket's revised question limits the remaining plan to officially supported data and future new-format
preservation requirements.

## Requested excess-value verification and optional template refresh

- Rechecked `src/module/dataModel/data-models-actor.js:46–51`: HP/MP value has min zero, integer and required/initial
  constraints, but no maximum. Rechecked `src/module/document/actor/base-actor.js:122–139`: Math.min changes prepared
  current, not a persistence update. Above-max source is therefore possible; no claim is made that any particular
  user's world currently contains it. `src/module/sheet/actor/actor-base-sheet.js:264–273` writes capped values from
  resource controls, so previously overwritten excess cannot be reconstructed from the current source.
- Exact official provenance exists for normally imported sources: core
  `foundryvtt-api/client/documents/abstract/world-collection.mjs:109–115` records `_stats.compendiumSource` from pack UUID;
  `client-document.mjs:998–999` also flags compendium drag data. OQ already uses that field to identify source overrides
  (`src/module/utils/compendium-utils.js:22`). Missing provenance is possible; item names are not evidence of source.
- `src/module/dataModel/data-models-item.js:184–204` includes magnitude, remainingMagnitude, type, noMagicPoints,
  nonVariant, description/traits and casting skill reference. `src/module/utils/magic.js:95–127` initializes or adjusts
  Divine remaining magnitude on creation/type/magnitude changes; `src/module/document/item/spell.js:22–28` can reset
  variable Sorcery magnitude on new item creation. Naive delete/recreate from pack defaults risks state loss/refill.
- The optional refresh macro's exact source matching, actor coverage, retained fields and replacement semantics belong
  to [Define the optional SRD spell refresh macro](issues/10-srd-spell-refresh.md), not to a legacy-effects migration.

Further refresh facts: official spell pack ID is `oq.oq-system-spells` (`src/system.yaml:58–62`). Provenance is lineage,
not proof of unedited content. It can be missing due to the former custom drop path (`docs/migration-issues.md:95–109`)
or cleared by export (`foundryvtt-api/client/documents/abstract/client-document.mjs:1116–1125`). No existing
refreshFromCompendium/updateFromCompendium implementation was found; normal drop/import creates items, not a selective
in-place template refresh. No current sourceId-flag migration was found; do not assume those legacy flags are canonical.
Core NumberField only upper-clamps where a finite max exists (`foundryvtt-api/common/data/fields.mjs:1503–1508,1525–1535`);
`toObject(true)` clones source (`common/abstract/data.mjs:830–842`), reinforcing the source-overflow verification.
