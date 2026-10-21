# Define excess HP/MP and temporary magical resource behavior

Labels: wayfinder:grilling
Type: grilling
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
