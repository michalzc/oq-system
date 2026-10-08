# Journal pack sources

Journal compendia are written as plain HTML here and turned into Foundry pack sources by `yarn build:docs`.
It is not part of the build: run it after editing the documentation and commit the regenerated `src/packs/`.

```
docs/packs/
  <pack>/                 # generated into src/packs/<pack>/ (the whole directory is replaced)
    <journal>/            # any directory containing journal.yml is a journal entry
      journal.yml
      <Page>.html         # page content
```

`journal.yml`:

```yaml
_id: 0gYOY3NnDcT8Fzpj # Foundry document id, keep it stable so @UUID links keep working
name: System Documentation
sort: 0 # optional, default 0
pages: # listed order is the page order
  - _id: UTjphPIpYI0hCNn0
    name: Actors
    file: Actors.html
    level: 1 # optional, page title level 1-3 (table of contents nesting), default 1
    showTitle: true # optional, default true
```

New journals and pages need an `_id`. Leave it out and `yarn build:docs` fails, suggesting a generated one to paste;
nothing is written until all metadata is valid.
