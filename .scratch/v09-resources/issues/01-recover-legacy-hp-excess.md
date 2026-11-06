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

**Status:** ready-for-agent

- [ ] HP has a stored, ordered pool list; each pool has a stable identity, a label and a nonnegative integer remaining
      amount with no upper cap. No expiry, suspension or effect-link fields.
- [ ] Prepared data exposes the available temporary HP total (sum of remaining amounts); preparation never writes
      resource state, and the existing clamp of ordinary current to the normal maximum stays.
- [ ] The normal-maximum formula is shared between preparation and conversion.
- [ ] Legacy conversion (pure, in the resource-points module) computes the maximum from source characteristics and the
      HP modifier, ignoring the stored maximum, floored at zero. Excess becomes one pool with a fixed deterministic
      identity and a localized "Recovered excess" label; no excess gives an empty list; no zero-amount pool is created.
- [ ] A source that already has a pool list, even empty, is never reinterpreted; converting twice gives an identical
      result with the same pool identity.
- [ ] Load-time conversion covers complete actor sources and skips partial delta sources; creating an actor and
      importing an old actor JSON after the upgrade persist the full converted source (confirm this, as the spec's
      Further Notes require).
- [ ] A new versioned migration step (HP only) persists the conversion for world actors and world compendium actors
      (lock restored, IDs kept), and its Token handler gives an overriding delta its own explicit pool list (recovery
      pool or empty) computed from the delta's characteristics merged over the base actor's, with no writes to the
      base actor or other tokens. Deltas that don't override HP keep inheriting. No ActiveEffect traversal is added.
- [ ] Character and NPC sheets show HP `current / max` and a distinct "+N" when temporary HP is above zero. New strings
      live under `OQ.*`; the parchment theme is kept.
- [ ] Resource-points module tests: excess, no excess, zero maximum, stale stored maximum, negative modifiers,
      idempotence, available total.
- [ ] Migration tests: actor sources, token sources with and without overriding deltas (including the inherited
      recovery pool trap), already-converted sources returning no changes, locked world compendia and retry at runner
      level, and an actor with arbitrary legacy ActiveEffects getting no effect changes.
- [ ] Manual: the HP rows of the spec's acceptance table for "v0.8 actor", "Unlinked token delta HP 6", "Locked world
      compendium actor", "Old actor JSON", "Converted actor (empty pool list)" and "Repeat migration / retry" pass,
      with reloads between steps.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
