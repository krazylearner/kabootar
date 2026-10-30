# Kabootar

A channel-agnostic escrow platform: a community and listing surface plus custodial USDT escrow with manual INR settlement, run by a single operator. Telegram and the web app are first-class channels; Discord and Slack are specified but not built.

This repository is **specification only** — no implementation. It holds the reverse-engineering of a live Telegram escrow community and the target design derived from it, frozen at v1.

**Read the spec:** https://krazylearner.github.io/kabootar/

## Layout

| Path | What it is |
|---|---|
| `docs/re/` | The specification, in reading order — start at `00-index.md` |
| `docs/adr/` | Architecture decision records for the eight major trade-offs |
| `schemas/` | JSON Schema for `account`, `listing`, `deal`, `deposit-address`, `dispute`, `event`, `adapter-config`, `install-config` |
| `GLOSSARY.md` | The domain vocabulary the spec uses, and the synonyms it avoids |
| `docs/agents/` | How agents in this repo find issues, labels, and domain docs |

## Working on the spec

`main` is protected: changes land through a pull request with green checks.

- `prose` — markdownlint
- `schemas` — every JSON Schema compiles (draft 2020-12)
- `diagrams` — every Mermaid block parses
- `links` — internal links resolve

The site builds with MkDocs Material and deploys to GitHub Pages on merge:

```bash
pip install -r requirements.txt
mkdocs serve
```

Mermaid diagrams render on GitHub and on the site; VS Code needs the *Markdown Preview Mermaid Support* extension.

## Licence

Apache-2.0. See [LICENSE](./LICENSE) and, before deploying anything, the known limitations in [docs/re/09-security-and-limitations.md](./docs/re/09-security-and-limitations.md).
