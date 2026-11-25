# Coding standards

Judgement rules for reviewing a change. Mechanical rules live in the linters (`eslint.config.mjs`, stylelint,
Prettier) and need no review. The conventions in `CLAUDE.md` (architecture, data preparation order, migrations,
compendium content, icons, tests) apply as well; check the diff against the sections it touches.

## Documentation matches the branch

The journal pages (`docs/packs/`), `CLAUDE.md` and `docs/` describe what the code on the branch does. Check every
changed sentence against the code:

- A feature that a later ticket delivers is not described yet, not even by implication ("earlier versions let you
  type…" implies this one prevents it).
- A sentence about several things (HP and MP, characters and NPCs, linked and unlinked tokens) holds for each of them.
- Examples use values the code actually produces.

## One route per resource change

Ordinary HP and MP and their temporary-point pools change only through `OQBaseActor`'s resource methods
(`damageHp`, `healHp`, `setOrdinaryHp`, `grantTemporaryPoints`, `correctTemporaryPool`, `removeTemporaryPool`, and
their MP counterparts). Every route — chat buttons, sheet inputs and clicks, the token HUD, dialogs, macros the
system ships — calls them, so later chunks extend one place. Data migrations are the exception: they write sources
directly.

## Updates carry only what changed

A document update writes the fields the action changed. Resending unchanged data, a whole array above all, can
overwrite another user's edit made between the read and the write, and triggers needless re-renders. A computation
that leaves a field as it was leaves it out of the update; one that changes nothing makes no update.

## Shown state stays current

A sheet, dialog or HUD element that shows document state either re-renders when that state changes (document
sheets do; other applications register in `document.apps`, see `docs/foundry-v14-notes.md`) or reads it at the
moment of use. A form that saves on change re-reads the stored state, so an edit made elsewhere since it rendered is
neither shown stale nor overwritten.
