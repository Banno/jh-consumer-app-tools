# JH Consumer App Tools — Copilot Instructions

## Repository overview

This is an **Nx-managed Yarn 4 workspaces monorepo** (Apache-2.0 licensed) containing tools and libraries for building consumer-facing applications in the Jack Henry ecosystem.

## Projects

| Project | Path | Description |
|---|---|---|
| `@jack-henry/consumer-tools` | `projects/jh-consumer-tools` | Vite plugins and web components (auth, theming, layout, nav) |
| `@jack-henry/create-consumer-app` | `projects/create-consumer-app` | CLI scaffolding tool for new consumer apps |
| Development Sandbox | `projects/development-sandbox` | Cloneable example app for quick experimentation |

Each project has its own `package.json`, test suite, and (where applicable) a more detailed `.github/instructions/` file. Prefer those project-specific instructions when working within a single project.

## Key commands (run from repo root)

```bash
yarn                   # Install all dependencies
yarn build             # Build all publishable packages (Nx)
yarn test              # Run all tests in parallel (Nx)
yarn typecheck         # TypeScript type-checking across all projects
yarn format            # Prettier formatting
```

Project-level commands (run from the project directory):

```bash
yarn test              # Run that project's tests
yarn test:coverage     # Tests + coverage report
yarn build             # Build that project
```

## Conventions

- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by commitlint (`feat:`, `fix:`, `chore:`, etc.). Max header length: 120 chars. Scope should be the project name (e.g., `feat(create-consumer-app): ...`).
- **Formatting**: Prettier handles all formatting. Do not manually adjust whitespace or semicolons.
- **Licensing**: All source files must include an SPDX license header. JS/TS use `// SPDX-FileCopyrightText` / `// SPDX-License-Identifier`, HTML/Markdown use `<!-- -->`, shell uses `#`.
- **Package manager**: Yarn 4 with `nodeLinker: node-modules`. Do not use npm or older Yarn versions.
- **Versioning & releases**: Nx Release with independent versioning and conventional-commit-driven changelogs. Do not manually edit `CHANGELOG.md` or version fields.

## Testing

- Test framework: **Vitest** across all projects.
- Aim for unit tests on individual modules; avoid brittle end-to-end tests that mock complex interactive flows.
- Run `yarn test:coverage` in a project directory to verify coverage.

## When in doubt

- Check the project-specific instructions in `.github/instructions/`.
- Check the project-level `AGENTS.md` if one exists.
- Review existing code patterns in the relevant `src/` directory.