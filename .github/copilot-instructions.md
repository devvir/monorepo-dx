# dx — Copilot Instructions

## What This Is

dx is a **standalone, publishable npm package** — a CLI framework for Docker-based monorepo development. It is NOT part of any host monorepo. It is included as a submodule (or dependency) by projects that use it. All code must reflect this:

- **No imports from the host monorepo.** dx must never reference packages, services, or modules from its parent project. It discovers those at runtime via the filesystem.
- **All dependencies must be declared in `dx/package.json`.** If you use a library, it must be in `dependencies` or `devDependencies`. Never rely on hoisted packages from a parent workspace.
- **No `workspace:` protocol.** This package is published independently.

## Documentation Requirements

This package is intended for public npm publication. Documentation is a first-class deliverable, not an afterthought.

### When to update docs

Any change to the public API **must** include corresponding documentation updates. Specifically:

- **Adding/removing/renaming a command** → update `README.md` (command table), `USAGE.md` (command table), and `docs/commands.md` (full reference).
- **Adding/removing/changing a flag or option** → update `docs/commands.md` for that command. If the flag is noteworthy (like `-i` on `up`), mention it in `README.md` too.
- **Changing argument semantics** (e.g. what `[target]` resolves to) → update `docs/commands.md` resolution logic section.
- **Changing environment variables** (`DX_SERVICES_DIR`, `DX_MODULES_DIR`, `DX_EXECUTOR`, etc.) → update `USAGE.md`.
- **Changing directory structure expectations** → update `USAGE.md` (directory structure section).

### Documentation structure

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Quick overview, why/what, command table, setup pointer | Anyone evaluating the package |
| `USAGE.md` | Full setup guide, directory conventions, env config | Users integrating dx into a project |
| `docs/commands.md` | Complete command reference with all flags and examples | Users looking up specific command behavior |

Keep `README.md` concise — it should sell the tool and get someone started, not be a manual. `docs/` is for depth.

### What NOT to create

Do not create files that narrate your work (changelogs, strategy docs, session logs, "what I did" summaries). Documentation describes the package, not the process of building it.

## Code Conventions

- ESM only (`"type": "module"` in package.json).
- `node:` prefix for all core Node.js imports (e.g. `import fs from 'node:fs'`).
- Semicolons always.
- Space after negation: `if (! condition)`.
- Each command lives in `commands/<name>.js` and exports `register(program)` (Commander registration) and `action(...)` (testable logic).
- Tests live in `tests/` using vitest. Tests call `action()` directly, not `register()`.

## Architecture

- `dx.js` — Entry point. Creates Commander program, registers all commands, parses argv.
- `commands/*.js` — One file per command. Each exports `register(program)` and `action(...)`.
- `utils/` — Shared utilities (docker compose helpers, service/module discovery, runner logic).
- `docs/` — In-depth documentation.
- `tests/` — Vitest test files. Fixtures in `tests/fixtures/`.
