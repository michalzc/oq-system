# 01: Recover legacy HP excess and show temporary HP on the sheet

**What to build:** Every actor's HP gains an ordered list of temporary-point pools, and a Referee upgrading a world sees
any HP that earlier versions stored above the normal maximum recovered once into a single "Recovered excess" pool. The
character and NPC sheets show ordinary HP as `current / max` plus a distinct "+N" with the available temporary HP total
when it is above zero. This is the first slice of chunk **Res1**; see [the spec](../spec.md), sections "Resource
model", "Pure resource-points module", "Compatibility (legacy excess)" and "Sheet and pool editor".

It introduces the pure resource-points module with only what this slice needs: the plain resource state (ordinary
current, normal maximum, ordered pools), the available temporary total, and legacy excess conversion. Prefactor first:
pull the HP normal-maximum formula out of actor preparation into a pure function shared by preparation and conversion,
so both compute the same maximum.

The legacy signal is "the stored HP source has no pool list at all". Load-time data model migration converts complete
actor sources (world actors, compendium documents, compendium copies, late JSON imports); a new versioned migration
step persists ordinary current and the pool list for world actors and world compendium actors, and its Token handler
converts overriding actor deltas independently of the base actor. New actors persist an empty pool list at creation.
Conversion lands before any route can write a pool, so no route ships that could discard recorded excess.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] HP has a stored, ordered pool list; each pool has a stable identity, a label and a nonnegative integer remaining
      amount with no upper cap. No expiry, suspension or effect-link fields.
- [x] Prepared data exposes the available temporary HP total (sum of remaining amounts); preparation never writes
      resource state, and the existing clamp of ordinary current to the normal maximum stays.
- [x] The normal-maximum formula is shared between preparation and conversion.
- [x] Legacy conversion (pure, in the resource-points module) computes the maximum from source characteristics and the
      HP modifier, ignoring the stored maximum, floored at zero. Excess becomes one pool with a fixed deterministic
      identity and a localized "Recovered excess" label; no excess gives an empty list; no zero-amount pool is created.
- [x] A source that already has a pool list, even empty, is never reinterpreted; converting twice gives an identical
      result with the same pool identity.
- [x] Load-time conversion covers complete actor sources and skips partial delta sources; creating an actor and
      importing an old actor JSON after the upgrade persist the full converted source (confirm this, as the spec's
      Further Notes require).
- [x] A new versioned migration step (HP only) persists the conversion for world actors and world compendium actors
      (lock restored, IDs kept), and its Token handler gives an overriding delta its own explicit pool list (recovery
      pool or empty) computed from the delta's characteristics merged over the base actor's, with no writes to the
      base actor or other tokens. Deltas that don't override HP keep inheriting. No ActiveEffect traversal is added.
- [x] Character and NPC sheets show HP `current / max` and a distinct "+N" when temporary HP is above zero. New strings
      live under `OQ.*`; the parchment theme is kept.
- [x] Resource-points module tests: excess, no excess, zero maximum, stale stored maximum, negative modifiers,
      idempotence, available total.
- [x] Migration tests: actor sources, token sources with and without overriding deltas (including the inherited
      recovery pool trap), already-converted sources returning no changes (Token handler only; see Comments), locked world compendia and retry at runner
      level, and an actor with arbitrary legacy ActiveEffects getting no effect changes.
- [x] Manual: the HP rows of the spec's acceptance table for "v0.8 actor", "Unlinked token delta HP 6", "Locked world
      compendium actor", "Old actor JSON", "Converted actor (empty pool list)" and "Repeat migration / retry" pass,
      with reloads between steps.
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

### 2026-11-25 implementation notes

- Module: `src/module/utils/resource-points.js` (`hpNormalMaximum`, `hasPoolList`, `availableTemporaryPoints`,
  `convertLegacyHp`). Prepared `system.attributes.hp.temporary` is the available total. The recovered pool is
  `{ id: 'recoveredExcess', label: 'OQ.Resources.RecoveredExcess', remaining }`; the label is stored as a localization
  key so every client converts identically, and it is localized where it is shown (pool editor, ticket 02).
- Load-time conversion: `OQActorDataModel.migrateData`, skipped when `options.partial` (updates and creation input
  are cleaned as partial data in v14, `common/abstract/data.mjs` `_preUpdateSource`, `client/data/client-backend.mjs`
  `#preCreateDocumentArray`). `ActorDelta#system` is an `ObjectField`, so deltas are never converted on load.
- Confirmed (Further Notes): JSON import goes through `fromImport` → a complete source → converted before
  `update(…, {diff: false, recursive: false})`, so the full converted source is persisted. Creation input is *not*
  migrated (`migrate: false`), so `OQBaseActor#_preCreate` converts raw legacy creation data; `{name, type}` gets the
  schema's empty pool list.
- Confirmed: the migration handler sees the load-time converted data (as with the 0.6.0 renames). It therefore cannot
  tell a stored legacy actor from a stored converted one, so the **Actor handler writes HP value and pool list for every
  actor with HP** (converting first when the source has no pool list), never reinterpreting a source that has one.
  Repeat runs write identical values. "Already-converted sources return no changes" holds for the Token handler
  (deltas with a pool list, deltas not overriding HP, linked tokens), whose deltas are seen as stored.
- Token handler takes the base actor through a new runner helper `worldActor(id)` (the in-memory, already migrated
  world actor source).

### 2026-11-25 manual QA

Foundry 14.370, `oq-dev` world, GM client (Chromium via DevTools MCP). Legacy fixtures were created while the page
still ran the old build (stored HP without pool lists, world migration version 2), then the page was reloaded into the
new build. Persisted state was read raw from the server (`modifyDocument` `get` over the socket), not from documents.

| Row | Observed |
| --- | --- |
| v0.8 actor: SIZ 10, CON 10, stored current 15, stored max 0 | Stored and shown HP 10/10 + Recovered excess 5; "+5" on the sheet, tooltip "Temporary points: 5". |
| v0.8 actor: max 10, stored 6 (NPC) | 6/10, stored empty pool list, no "+N". |
| v0.8 actor: max 0, stored 3 (NPC, HP mod −10) | 0/0 + Recovered excess 3; sheet "0 / 0 +3". |
| Unlinked token delta HP 6, base stored 15 | Base 10/10 + 5; token delta stored `{value: 6, pools: []}`, token 6/10 with no pool. A second unlinked token without an HP override kept an empty delta and inherits 10/10 + 5. |
| Locked world compendium actor HP 15/10 | Stored 10 + Recovered excess 5, same `_id`, compendium locked again. |
| Old actor JSON HP 15/10 (exported before the upgrade) | `importFromJSON` after the upgrade persisted 10 + Recovered excess 5; after a reload still one pool of 5. `Actor.create` from the same raw JSON also persisted 10 + 5. A new `{name, type}` NPC persisted an empty pool list. |
| Converted actor (empty pool list), HP 6, HP mod lowered to −6 (max 4), reload | Shown 4/4; stored value 6, pools `[]`; no recovery pool. |
| Repeat migration / retry | First load with a hook rejecting the migration write for one actor (13/10): dialog, chose Retry; version stayed 2; that actor still stored 13 without pools, the others persisted. Next load: migration 3 completed, version 3, that actor 10 + 3; every actor's totals unchanged and one recovery pool each. |

Console: only the induced "omitted updates" errors of the blocked first load. Not checked: a player client's in-memory
application (covered by runner tests). The QA fixtures (`QA *` actors, two `QA token *` tokens, `world.qa-actors`)
remain in `oq-dev`.

### 2026-11-25 review

Two-axis review (standards, spec) of 38d0327. Changes made:

- `convertLegacyHp(characteristics, hp)` no longer takes a whole `system` nor checks the pool list itself; callers
  check `hasPoolList`. This removed the fake `system` objects in `_preCreate` and the Token handler.
- In-world re-check found a bug: the `pools` field's `initial: []` was one array shared by every new actor, and
  `_preCreate`'s `updateSource` pushed a recovered pool into it, so the next `{name, type}` actor was created with
  that pool. Fixed with `initial: () => []`; re-verified (legacy create, then a new character and NPC persist
  `pools: []`). Noted in `docs/foundry-v14-notes.md`. Other fields with a plain array/object `initial` predate this
  change (`personal.money`, four item array fields) and may share the same trap.

Open decisions for the user (behaviour kept as implemented):

1. The Actor handler writes HP for every actor because handlers see load-converted sources; step 3 therefore writes
   every world actor and every world Actor compendium once (and again on a retry). The alternative would need the raw
   stored data, which the client doesn't keep.
2. The recovered pool's label is stored as the key `OQ.Resources.RecoveredExcess` (deterministic across clients), so
   every display (ticket 02 pool editor, ticket 04 HUD, chat) must localize pool labels; macros reading raw data see
   the key.
3. `_preCreate` converts creation data that has `hp.value` and no pool list. That covers `Actor.create` from an old
   export, but it also turns a v0.9 macro's `Actor.create({system: {attributes: {hp: {value: 20}}}})` on a maximum-10
   actor into 10 + a 10-point "Recovered excess" pool. Without it, that creation would store 20 hidden above the
   maximum.
4. A token in a world compendium scene whose base actor is not a world actor is left unconverted (no base to merge
   with); if imported later, an overriding delta inherits the base's pool list. The spec's late-import list names
   actors only.
5. "Recovered excess" is not in `GLOSSARY.md` yet.
