# Define excess HP/MP and temporary magical resource behavior

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md

## Question

What should HP/MP above maximum mean, and what minimal workflow should cover Vigour and Tap?

Separate a permissive above-max value from an independent temporary pool, a changed maximum, and an instantaneous
resource change. Decide spending, healing, editing maxima, removing an effect, reload persistence, and token bars.
Vigour absorbs damage with magical HP first; expiry must not delete ordinary HP or retain magical HP as healing.
Tap has distinct excess-MP limits/decay. Do these need dedicated automation or documented manual bookkeeping in v0.9?

Produce expected-value examples for wounded and full-health actors before/after applying, spending, healing, and
removing a benefit. Keep the independent overflow chunk small; do not make every HP edit depend on Active Effects.

## Comments

### Constraint from the mechanics discussion

While discussing [Choose effect mechanics and the spell/ability coverage boundary](01-supported-mechanics.md),
the user specified that increases to MP maximum directly, and HP maximum directly or through characteristics, must
increase current value by the same amount; removing the effect must subtract that amount from current value.
That discussion is still clarifying exceptions and edge cases. This ticket remains open; it must preserve the
confirmed policy and decide overflow, temporary pools and the remaining lifecycle/resource details.

The user subsequently confirmed the POW exception: Enhance/Diminish POW change neither MP maximum nor current MP.
Agreed HP example: 6/10 plus a +4 maximum becomes 10/14; removal with no intervening changes returns 6/10.
This decision still needs to settle spending, lower bounds, negative maximum effects and distinct magical pools.

### Local evidence gathered

[HP/MP rules and current behavior](../resource-evidence.md) records the existing update routes, hidden overflow loss,
Vigour's separate damage-absorption requirement, Tap's cap/decay and source ambiguities. It supports this discussion;
the proposed choices remain open until answered by the user.

### Temporary buffers, signed deltas and zero floor confirmed

The user chose separate temporary HP and MP buffers rather than putting excess inside ordinary current values.
Temporary points are spent first; normal regeneration does not touch the buffers. The user confirmed this also
settles Vigour's separate pool and first-damage absorption: ordinary HP 6/10 plus 4 magical HP takes 3 damage, leaving
ordinary HP 6 and magical HP 1; ending Vigour leaves ordinary HP 6/10.

Use the actual signed maximum delta consistently for applying, editing, disabling, removing and expiring effects.
HP 6/10 under a -4 maximum effect becomes 2/6 and returns to 6/10 when removed. Changing a bonus from +4 to +6
adds only 2 current points. Keep the existing zero floor for HP and MP, including when effect removal would otherwise
take current below zero. HP 2/14 when a +4 maximum benefit ends becomes 0/10; death/consequences remain GM decisions.

### Healing, grant limits and Tap confirmed

Healing spells/buttons restore only ordinary HP up to its current maximum. They do not refill temporary points.
Maximum-effect adjustments likewise change ordinary points and leave buffers untouched.

Generic buffers accept any nonnegative amount explicitly entered by the GM. Vigour's spell-specific grant is capped
at normal HP maximum: at ordinary HP 6/10, magnitude 6 grants 10 temporary HP, not the nominal 12. This is the agreed
interpretation of the ambiguous wounded-target cap, not a claim that the source text specifies it unambiguously.

Tap remains manual: fill ordinary MP first, then put excess in temporary MP up to twice normal combined capacity.
MP 8/10 plus 6 becomes ordinary 10 plus temporary 4; spending 3 leaves temporary 1. After Tap ends the GM removes
one excess MP per minute. Do not implement an automatic permanent-drain or Tap-decay engine for this release.

## Answer

Resolved with the user through the resource question rounds. The earlier maximum/current coupling and POW exception
remain in force. The user chose **separate temporary HP/MP buffers**, superseding the initial proposal to store
ordinary current values above their maxima.

### Resource model

The representation is subsequently refined in
[Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md): the user approved
source-specific temporary-point pools with an aggregate total and FIFO spending. Its answer owns that refinement,
including editing and lifecycle details. References below to a temporary buffer describe the aggregate resource semantics,
not a requirement to store every grant as one unattributed number.

Each of HP and MP has ordinary current points, a normal maximum, and a separate temporary-point total; explicit
grants and corrections operate on its source pools as specified in the linked refinement.
The normal maximum is the capacity of ordinary points; temporary points can take the available total above it.
Generic buffers are nonnegative and have no universal upper cap. Specific granting rules have their own limits.
This model works without an Active Effect: the GM can grant, edit or clear temporary points directly.

- Explicit damage and resource expenditure consume temporary points first, then ordinary points, floored at zero.
  Spell affordability/payment must use the available combined MP, not ordinary MP alone.
- Ordinary healing and regeneration restore ordinary points only, up to normal maximum. They neither replenish nor
  reduce a temporary buffer. Refilling temporary points requires an explicit grant/edit.
- A direct edit of the ordinary current field edits ordinary points. It does not silently change the temporary buffer
  or reinterpret a correction as damage. Explicit spend/damage controls must use buffer-first allocation.
- Current points and temporary buffers keep the system's existing zero floor. Damage/removal does not automatically
  resolve death, unconsciousness or other consequences; the GM remains responsible for those outcomes.
- Preparation, sheet rerenders and reloads must preserve both ordinary and temporary state without granting points
  again. Actor/character/NPC views and token controls must make available points usable consistently.
- Display ordinary current/maximum and temporary points distinctly. Token presentation must make the temporary amount
  discoverable and must not hide/discard it just because the ordinary bar is full. Exact layout/styling belongs to the
  later specification, not a new animated or segmented-bar requirement.

Existing stored values above derived maximum need explicit compatibility handling: preserve those excess points in
the new temporary representation instead of silently clamping them away. Migration details follow the chosen schema;
this is a data-preservation requirement, not permission to rewrite unrelated actor data.

### Maximum-effect transitions

Apply the actual signed change in normal maximum to ordinary current points once on a real effect transition.
This includes activation, magnitude/edit changes, disable/re-enable, deletion, expiration and replacement where the
active maximum actually changes. Use the effective maximum difference, not the raw characteristic or modifier delta.

Temporary buffers are untouched by this adjustment: it changes ordinary capacity/current, not damage/spending.
Never repeat the adjustment during ordinary preparation or reload. Multiple changes that leave effective maximum
unchanged must not grant/remove current points. Maxima remain nonnegative.

Keep the zero floor at each transition. No hidden negative balance or automatic restoration of points lost below zero
is required. Thus the zero-floor case is intentionally not perfectly reversible; a GM can explicitly correct values.

Enhance/Diminish POW remain explicit exceptions: neither MP maximum nor current MP changes. Ordinary temporary MP
grants and direct MP-max effects are distinct operations.

### Vigour

Vigour grants magical HP into the temporary HP buffer, independently of ordinary HP current/maximum. It is not an
ordinary maximum effect with an inverse subtraction of the original grant.

- Grant `min(2 × magnitude, normal HP maximum)` in the single-grant case. Wounds do not reduce this grant cap.
- Explicit damage uses remaining magical HP first. Ordinary healing does not refill the magical HP.
- Ending the benefit discards its remaining magical HP and preserves ordinary HP. Do not subtract the original grant
  from a combined current value after some of the grant has already absorbed damage.
- Explicit GM corrections remain available through the source-pool editor. Applying the rule's normal cap does not
  create a universal buffer cap or continuously trim buffers whenever ordinary maximum changes.

Overlapping grants, replacement and attribution are settled in
[Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md). That answer owns
the source-pool lifecycle refinement; the single-grant amount/cap remains here. Effect-application details remain
with their existing decision.

### Tap and other exceptional gains

Tap's permanent characteristic drain, MP gain and minute-by-minute excess decay are manual in v0.9. The buffers provide
the bookkeeping needed to follow its rule without a special trigger/timer engine.

Fill ordinary MP to normal maximum first, put remaining gain in temporary MP, and respect Tap's combined limit of twice
normal capacity. Spell spending then naturally spends temporary MP first. After Tap finishes, the GM removes one
remaining excess MP per minute until no excess remains. Ordinary regeneration does not refill the temporary buffer.

The GM resolves interactions with other temporary grants/caps. Do not apply Tap's limit to every generic buffer or
automatically trim pre-existing unrelated points. Other gains, such as Absorption, still follow their own rules;
permissive temporary editing does not mean every recovery or gain creates temporary points.

### Acceptance examples

`ordinary current / normal maximum + temporary` distinguishes the three quantities below.

| Starting state | Action | Expected state |
| --- | --- | --- |
| HP 6/10 + 4 temporary | Apply 3 damage | HP 6/10 + 1 temporary |
| HP 6/10 + 1 Vigour HP | End Vigour | HP 6/10 + 0 temporary |
| HP 6/10 + 4 temporary | Apply 7 damage | HP 3/10 + 0 temporary |
| HP 6/10 + 1 temporary | Heal 4 ordinary HP | HP 10/10 + 1 temporary |
| MP 8/10 + 4 temporary | Cast/spend 5 MP | MP 7/10 + 0 temporary |
| MP 10/10 + 25 explicitly granted temporary | Spend 30 MP | MP 5/10 + 0 temporary; generic buffer was not capped at normal maximum |
| HP 6/10 + 4 temporary | Apply +4 normal maximum effect | HP 10/14 + 4 temporary |
| HP 10/14 + 4 temporary | Remove that effect without intervening changes | HP 6/10 + 4 temporary |
| HP 6/10 + 0 temporary | Apply −4 normal maximum effect, then remove it | HP 2/6, then 6/10; buffer remains zero |
| HP 2/14 + 0 temporary | Remove +4 maximum effect | HP 0/10 + 0 temporary |
| HP 6/10 + 0 temporary | Apply −8 maximum effect, then remove it | HP 0/2, then 8/10; floor is applied at each transition, without hidden debt |
| HP 6/10 + 0 temporary | Apply Vigour magnitude 6 | HP 6/10 + 10 temporary |
| MP 8/10 + 0 temporary | Manually resolve Tap gain 6 | MP 10/10 + 4 temporary |
| MP 10/10 + 4 Tap excess | Spend 3, then GM removes one excess after a minute of post-Tap decay | MP 10/10 + 1 temporary, then 10/10 + 0 temporary |

Verify these through damage/spending/healing controls, sheet adjustments and token updates as appropriate, with reload
checks between actions. Normal field edits must remain distinct from explicit damage/spending actions. Verify
affordability when temporary MP alone funds a spell, and verify that a cancelled cast changes neither pool.

### Reviewable delivery consequences

Split the independent buffer feature into a complete temporary-HP workflow and a complete temporary-MP workflow, each
with visible editing, update-route consistency and manual tests. Keep maximum/current effect transitions separate from
those buffers. Vigour's grant/removal integration is a subsequent spell/resource slice reusing temporary HP, blocked
on the relevant application/lifetime/overlap decisions. Tap needs rule instructions and buffer bookkeeping, not a
dedicated automated resource-drain feature.

[HP/MP rules and current behavior](../resource-evidence.md) holds the investigation evidence; the answers above own the
chosen policies, including the wounded-target Vigour interpretation and retention of zero-floor HP.
