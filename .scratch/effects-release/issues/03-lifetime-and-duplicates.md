# Choose duration, duplicate, and conflicting-effect handling

Labels: wayfinder:grilling
Type: grilling
Parent: ../map.md

## Question

Which expiration clocks should v0.9 support automatically, and how should humans handle duplicate/conflicting effects?

Decide the practical minimum using Foundry v14's existing duration/expiration behavior. Compare elapsed world time,
combat rounds, concentration, repeated application, and manual early removal. Next-applicable-use consumption remains
manual. Do not turn special cancellation such as healing ghoul paralysis into a generic event engine.

Decide how repeated applications are presented and selected. Divine duplicate magnitudes do not add, but some different
defenses combine and others explicitly cancel/exclude one another. Is visible human selection sufficient for these
cases? Do not invent a universal stacking policy beyond the local SRD evidence.

Record explicit examples for duplicate Protection, duplicate Shield, cancelling mental effects, repeated chat-card
application, expiration after reload, and a manual reminder with no clock. Check timing assumptions against the
existing declaration/round workflow and installed core before recommending a custom timer.
