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
   - If a dep name matches a workspace package → replace the version, preserving the original prefix:
     - `"^1.2.3"` → `"workspace:^"`
     - `"~1.2.3"` → `"workspace:~"`
     - `"1.2.3"` (exact, no prefix) → `"workspace:*"`
     - `">=1.2.3"` or other ranges → `"workspace:*"` (fallback)
3. Writes modified JSON back preserving formatting

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

The workspace specifier is derived from the original version string's prefix:

| Original version | Workspace specifier | At publish time becomes |
|---|---|---|
| `"3.0.0"` (exact) | `workspace:*` | `3.0.0` |
| `"^3.0.0"` (caret) | `workspace:^` | `^3.0.0` |
| `"~3.0.0"` (tilde) | `workspace:~` | `~3.0.0` |

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
  "@remirror/icons": "3.0.0",
  "nanoevents": "^5.1.13"
},
"devDependencies": {
  "@remirror/cli": "1.1.0",
  "@remirror/pm": "3.0.1"
},
"peerDependencies": {
  "@remirror/pm": "^3.0.1"
}
```

**After**:
```json
"dependencies": {
  "@babel/runtime": "^7.27.0",
  "@remirror/core-constants": "workspace:*",
  "@remirror/core-helpers": "workspace:*",
  "@remirror/icons": "workspace:*",
  "nanoevents": "^5.1.13"
},
"devDependencies": {
  "@remirror/cli": "workspace:*",
  "@remirror/pm": "workspace:*"
},
"peerDependencies": {
  "@remirror/pm": "workspace:^"
}
```

- Exact versions (`"3.0.0"`) → `workspace:*` (publishes as exact version)
- Caret versions (`"^3.0.1"`) → `workspace:^` (publishes as `^x.y.z`)
- External deps like `@babel/runtime` stay as-is

---

## TODO

### Phase 1: Write migration script

- [ ] Create `migrate-to-workspace.mjs` in the repo root
- [ ] Collect all workspace package names by running `pnpm ls -r --json --depth 0` and parsing output
- [ ] Build a `Set<string>` of workspace package names for fast lookup
- [ ] For each workspace package directory, read `package.json`
- [ ] Implement `toWorkspaceSpecifier(version)` helper:
  - `"^x.y.z"` → `"workspace:^"`
  - `"~x.y.z"` → `"workspace:~"`
  - `"x.y.z"` (no prefix) → `"workspace:*"`
  - any other range (e.g. `">=x.y.z"`, `"*"`) → `"workspace:*"`
- [ ] Iterate over `dependencies`, `devDependencies`, `peerDependencies` in each `package.json`
  - For each entry where the dep name is in the workspace set → replace version using `toWorkspaceSpecifier`
  - Skip entries where the dep name is NOT a workspace package
- [ ] Write modified JSON back with `JSON.stringify(json, null, 2) + '\n'` to match existing formatting
- [ ] Handle the root `package.json` the same way (it follows the same prefix-preserving logic)

### Phase 2: Run migration and regenerate lockfile

- [ ] Run `node migrate-to-workspace.mjs`
- [ ] Spot-check 3-5 `package.json` files to confirm correct replacement:
  - `packages/remirror__core/package.json` — has exact versions in deps, exact in devDeps, caret in peerDeps
  - `packages/remirror/package.json` — has 50+ internal deps, all exact
  - `packages/remirror__react/package.json` — has exact deps and caret peerDeps
  - Root `package.json` — has a few internal deps with mixed prefixes
  - `support/scripts/package.json` — support workspace package
- [ ] Verify no external deps were accidentally changed (grep for `workspace:` and confirm all matches are workspace package names)
- [ ] Run `pnpm install` to regenerate `pnpm-lock.yaml`

### Phase 3: Verify builds and tooling

- [ ] Run `pnpm build` — confirm the full build succeeds
- [ ] Run `pnpm lint:repo` (`manypkg check`) — confirm monorepo validation passes
- [ ] Run `pnpm typecheck` — confirm TypeScript still resolves all types
- [ ] Run `pnpm test` — confirm tests pass

### Phase 4: Clean up and commit

- [ ] Delete `migrate-to-workspace.mjs`
- [ ] Commit all changes
