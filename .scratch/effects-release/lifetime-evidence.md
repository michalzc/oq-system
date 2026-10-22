# Duration and duplicate-effect evidence

Local investigation supporting [Choose duration, duplicate, and conflicting-effect handling](issues/03-lifetime-and-duplicates.md).
These are facts from the installed core and local SRD, not approved release policies.

## Foundry v14 clocks and expiration

- The core registry checks elapsed duration and the configured expiry event. The active GM normally persists
  `duration.expired: true`; that suppresses the effect without deleting it or changing `disabled`.
  See `foundryvtt-api/client/helpers/active-effect-registry.mjs:132-165`,
  `foundryvtt-api/client/config.mjs:2053`, and `foundryvtt-api/client/documents/active-effect.mjs:191-210`.
- Finite durations default to `expiry: "turnStart"`. Explicit `expiry: null` uses elapsed duration alone.
  Turn-event matching can use the stored starting combatant; do not assume it always means the recipient's turn.
  See `foundryvtt-api/common/documents/active-effect.mjs:60-66` and
  `foundryvtt-api/client/documents/active-effect.mjs:917,961`.
- Core `CONFIG.time.roundTime` and `turnTime` default to zero. OQ currently sets neither.
  See `foundryvtt-api/client/config.mjs:1989`. The SRD round lasts **five seconds**, twelve rounds per minute:
  [Combat](../../docs/OpenQuest3-SRD/OQ3-SRD-Combat.adoc), lines 305-307.
- Entering OQ declaration sets `turn: null` without advancing the round, world time, or expiry lifecycle.
  Starting execution of a subsequent round advances the round and configured world time, then dispatches the
  previous turn/round endings and new round/turn starts. Merely opening declaration does not expire a round effect.
  See `src/module/document/combat.js:185-195,228-237,262-313`.
- Reload prepares documents and initializes the registry, computing remaining duration but not running expiry
  actions. A persisted expired flag remains effective. An elapsed but unmarked effect needs a later matching
  registry event; reload alone is not a catch-up expiry pass. See `foundryvtt-api/client/game.mjs:910-918`,
  `foundryvtt-api/client/helpers/active-effect-registry.mjs:29-38`, and
  `foundryvtt-api/client/documents/active-effect.mjs:367-379`.
- A reminder can be indefinite (`duration.value: null`, `expiry: null`) and is not tracked for expiration.
  Core expiration does not update ordinary or temporary HP/MP. Resource transitions and grant cleanup require
  system integration with the chosen lifecycle, including reload/idempotence behavior.

## Local SRD duplicate and conflict rules

| Case | Evidence and limit |
| --- | --- |
| Protection | +1 AP per magnitude; no explicit duplicate-casting rule in its entry. Do not infer additive or strongest-only behavior from that alone. Personal Magic, line 824. |
| Duplicate Shield | Divine spells do not stack: Shield 1 plus Shield 2 does not become Shield 3. The text does not establish a universal replacement policy. Divine Magic, line 528. |
| Different defenses | Shield combines with other spells and physical armour, but excludes Absorption, Reflection and Spirit Block. Divine Magic, line 1390. Damage Resistance explicitly combines with Shield, checking damage first. Sorcery, line 527. |
| Mental cancellation | Fanaticism and Demoralise cancel each other; Berserk takes precedence over Fanaticism. Personal Magic, line 475; Divine Magic, line 662. Befuddle's entry supplies no equivalent cancellation rule (Personal Magic, line 237). |
| Concentration | Ends immediately when concentration stops; Sorcery explicitly makes concentration override its default duration. Personal Magic, line 137; Sorcery, line 406. This is a human stop condition, not itself an elapsed clock. |

Sources: [Personal Magic](../../docs/OpenQuest3-SRD/OQ3-SRD-Personal-Magic.adoc),
[Divine Magic](../../docs/OpenQuest3-SRD/OQ3-SRD-Divine-Magic.adoc),
[Sorcery](../../docs/OpenQuest3-SRD/OQ3-SRD-Sorcery.adoc).

## Multiple temporary grants: source rules and missing order

A follow-up scan found no SRD rule establishing FIFO, LIFO, earliest-expiring-first or another order between
multiple temporary grants. Those are product choices. The confirmed temporary-before-ordinary MP spending rule
comes from the user's resource decision; Vigour explicitly supplies magical-before-ordinary HP spending.

- Vigour specifies its magical HP and ending, without an allocation/stacking rule for overlapping castings:
  Personal Magic, lines 966-974.
- Tap specifies excess MP and post-spell decay, without allocation between repeated Taps or overlapping decay
  clocks: Sorcery, lines 1056-1064. Its decay remains manual under the existing resource decision.
- Absorption discards gains above POW rather than granting a separate excess pool: Divine Magic, lines 614-640.
- Item MP stores and bound spirits supply separate payment sources, rather than automatically contributing to
  the actor's personal temporary MP: Personal Magic, lines 8, 363; Creatures, line 1865.
  Mindlink likewise permits access to another participant's MP without merging their balances: Divine Magic, line 1081.
- Resting and vampire feeding are recovery, not evidence for extra timed pools. Personal Magic, line 19;
  Creatures, line 2078. Maximum/current adjustments remain separate from temporary grants.

An aggregate total alone cannot identify how many points remain from a particular grant when that grant ends.
Source-specific remaining amounts would support selective cleanup, but do not themselves authorize spell stacking
or determine spending order. The subsequent [resolved decision](issues/03-lifetime-and-duplicates.md) records the
user's source-specific pool and FIFO choices, separately from these source facts.
