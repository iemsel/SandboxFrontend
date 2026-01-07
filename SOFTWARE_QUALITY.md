# Software Quality Guide — Frontend

This document explains the linting and formatting tools configured for the frontend (SvelteKit) project.

## Overview

We use **ESLint** for code quality and **Prettier** for code formatting. Both run on every file change during development and in CI/CD pipelines.

## Tools

### ESLint (Code Quality)

- **Purpose:** Catches bugs, enforces best practices, and ensures code consistency
- **Config file:** `eslint.config.js`
- **Rules enforced:**
  - Single quotes for strings (`'single'`)
  - Semicolons at end of statements (`'always'`)
  - Cyclomatic complexity limit of 8
  - No unused variables
  - Svelte component best practices
  - Proper Prettier integration

### Prettier (Code Formatting)

- **Purpose:** Auto-formats code for consistency (whitespace, line breaks, quotes)
- **Config file:** `.prettierrc`
- **Plugins:**
  - `prettier-plugin-svelte` — formats `.svelte` files
  - `prettier-plugin-tailwindcss` — sorts Tailwind CSS classes
- **Settings:**
  - Single quotes
  - Semicolons
  - Print width: 100 characters
  - Tab width: 2 spaces

## Running Quality Checks

### Lint (Check for issues)

```bash
npm run lint
```

Runs Prettier check followed by ESLint. Reports formatting and code issues.

### Lint + Fix (Auto-fix issues)

```bash
npm run lint:fix
```

Automatically fixes ESLint issues (formatting, unused variables, etc.).

### Format with Prettier

```bash
npm run format
```

Formats all files including `.svelte` and applies Tailwind class sorting.

## How It Works

1. **Development:** Write code in `.js`, `.svelte`, or `.svelte.js` files
2. **Auto-format:** Run `npm run format` before committing
3. **Check:** Run `npm run lint` to verify no issues remain
4. **Review:** Fix any remaining errors manually
5. **CI/CD:** GitHub Actions (if configured) runs lint on every push/PR

## Common Issues & Solutions

| Issue                           | Solution                                    |
| ------------------------------- | ------------------------------------------- |
| Double quotes instead of single | Run `npm run format`                        |
| Tailwind classes out of order   | Run `npm run format` (plugin auto-sorts)    |
| Missing semicolons              | Run `npm run format`                        |
| Unused imports in `.svelte`     | Remove manually or use ESLint auto-fix      |
| Svelte syntax errors            | ESLint will report; fix syntax in component |
| Lines too long (>100 chars)     | Run `npm run format` (Prettier will wrap)   |

## ESLint Config Breakdown

The `eslint.config.js` includes:

- **Base rules** from `@eslint/js` (recommended)
- **Svelte plugin** (`eslint-plugin-svelte`) — Svelte-specific rules and parser
- **Prettier config** (`eslint-config-prettier`) — disables formatting conflicts
- **Prettier plugin** — enables `prettier/prettier` rule
- **Browser & Node globals** — recognizes browser and Node.js globals
- **File-specific overrides:**
  - `.svelte` files use Svelte parser with custom options
  - `.js` and `.svelte.js` files use standard ESLint rules + team rules

## Prettier Config Breakdown

The `.prettierrc` includes:

- Standard formatting options (quotes, semicolons, width, tab size)
- **Svelte plugin** — handles `.svelte` file formatting
- **Tailwind plugin** — automatically sorts utility classes for consistency

Example: `class="flex items-center text-lg"` → `class="text-lg flex items-center"`

## Svelte-Specific Notes

- ESLint understands Svelte syntax (reactive declarations, stores, etc.)
- Prettier preserves Svelte semantics while formatting markup
- Team rule for complexity is stricter (8 vs backend's 10) for component simplicity

## For Maintainers

To update ESLint, Prettier, or plugins:

1. Update `package.json` devDependencies
2. Run `npm install`
3. Test with `npm run lint` and `npm run format`
4. Commit changes

## Questions?

Refer to:

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [ESLint Svelte Plugin](https://sveltejs.github.io/eslint-plugin-svelte/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
