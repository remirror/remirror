# Plan: Migrate to `workspace:` Protocol

## Background

This monorepo has 105 workspace packages. All internal dependencies currently use **exact versions** (e.g., `"@remirror/core": "3.0.2"`). The goal is to switch them to pnpm's `workspace:` protocol.

The `workspace:` protocol tells pnpm to always resolve matching dependencies to local workspace packages. At publish time, pnpm automatically replaces `workspace:` references with real version ranges so published packages work correctly on npm.

## Already done (on `main`)

The following changes have already been merged:

- `.npmrc` deleted — removed `save-workspace-protocol=false` and all other settings
- `update:workspace` script removed from root `package.json`
- `version:ci` updated to remove the `update:workspace` step
- `ignoreWorkspaceRootCheck: true` added to `pnpm-workspace.yaml`

## Remaining work

### Step 1: Write a migration script

Write a Node.js script (`migrate-to-workspace.mjs`) that:

1. Reads all workspace package names (via `pnpm ls -r --json` or by scanning `packages/*/package.json`)
2. For each workspace `package.json`, in `dependencies`, `devDependencies`, and `peerDependencies`:
   - If a dep name matches a workspace package → replace the version with `workspace:^`
3. For the root `package.json` (private, never published) → use `workspace:*` instead
4. Writes modified JSON back preserving formatting

### Step 2: Run the migration

```bash
node migrate-to-workspace.mjs
```

### Step 3: Regenerate lockfile

```bash
pnpm install
```

### Step 4: Verify

- `pnpm build` — confirm builds still work
- `pnpm lint:repo` (`manypkg check`) — confirm monorepo validation passes
- Spot-check a few `package.json` files

### Step 5: Clean up

- Delete the migration script
- Commit all changes

## Version specifier choice

| Dep type | Specifier | At publish time becomes | Rationale |
|---|---|---|---|
| `dependencies` | `workspace:^` | `^3.0.2` | Standard for regular deps; allows compatible versions |
| `devDependencies` | `workspace:^` | `^3.0.2` | Same as deps; devDeps aren't published anyway |
| `peerDependencies` | `workspace:^` | `^3.0.2` | Matches the existing `^3.0.1` pattern already used |
| Root `dependencies` | `workspace:*` | `3.0.2` | Root is private, never published; `*` is simplest |

## What does NOT need to change

- **Preconstruct** — reads from `node_modules`, unaffected
- **Turborepo** (`turbo.json`) — task graph based on workspace structure, not version specifiers
- **Changesets** (`.changeset/config.json`) — `updateInternalDependencies: "patch"` still works; `@changesets/cli@^2.26.1` has full workspace protocol support (added in v2.22.0)
- **CI workflows** (`.github/workflows/*.yml`) — no changes needed
- **`support/scripts/src/mutatate-packages.ts`** (PR release script) — the `mutateDependencies()` function overwrites values by package name regardless of existing format, so `workspace:^` is simply replaced with `0.0.0-pr{N}` at PR release time

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `manypkg check` rejects `workspace:` values | `@manypkg/cli@0.20.0` supports workspace protocol |
| Changesets doesn't update `workspace:` deps correctly | `@changesets/cli@^2.26.1` has full support |
| PR release script breaks | `mutateDependencies()` overwrites by name — already works |
| External tools choke on `workspace:` syntax | Only pnpm reads these values; all other tools read from `node_modules` |

## Example: before and after

**Before** (`packages/remirror__core/package.json`):
```json
"dependencies": {
  "@babel/runtime": "^7.27.0",
  "@remirror/core-constants": "3.0.0",
  "@remirror/core-helpers": "4.0.0",
  "@remirror/core-types": "3.0.0",
  "@remirror/core-utils": "3.0.0",
  "@remirror/icons": "3.0.0",
  "@remirror/messages": "3.0.0",
  "nanoevents": "^5.1.13",
  "tiny-warning": "^1.0.3"
}
```

**After**:
```json
"dependencies": {
  "@babel/runtime": "^7.27.0",
  "@remirror/core-constants": "workspace:^",
  "@remirror/core-helpers": "workspace:^",
  "@remirror/core-types": "workspace:^",
  "@remirror/core-utils": "workspace:^",
  "@remirror/icons": "workspace:^",
  "@remirror/messages": "workspace:^",
  "nanoevents": "^5.1.13",
  "tiny-warning": "^1.0.3"
}
```

Only workspace packages are changed; external deps like `@babel/runtime` stay as-is.
