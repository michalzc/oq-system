# Separate item-local effects, passive transfer, and applied templates

Labels: wayfinder:grilling
Type: grilling
Parent: ../map.md
Blocked by: 01

## Question

How will users author and distinguish an effect that modifies its item, a passive benefit transferred to the owner,
and a spell/ability template applied explicitly to a recipient?

Use a weapon enhancement, a worn enchanted item, a permanent creature ability, and a known-but-uncast spell as examples.
Owning a spell must not activate its template. Decide eligible item states, manual activation for abilities, source
visibility, removal/transfer behavior, and how a chosen weapon/skill reference survives ordinary editing/imports.

Respect the installed core's item-local versus transferred targeting behavior. Choose the smallest representation
that covers the agreed mechanics; do not create a general item containment framework as a side effect.
Record manual acceptance scenarios for equipping, storing, deleting, transferring, disabling and reimporting sources,
including a synthetic NPC actor. State where an applied effect remains independent of the originating item.

## Comments

[Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md) settles timed ending
and grant-pool suspension/cleanup. This ticket must define which applied effect owns a grant and distinguish its
lifecycle from deleting/transferring the originating spell or item. Preserve that resolved pool behavior while
choosing the representation; do not make source-item changes silently erase an independently applied benefit.

[Specify Apply effect on spell and ability result cards](04-chat-card-application.md) now fixes historical cast/template
snapshots, recipient-specific choices and independent applied benefits. Choose the representation and stable binding
strategy within that contract; do not make application depend on rereading or retaining the original spell item.
It also requires prior-application context without granting recipient owners edit permission on another user's card.
