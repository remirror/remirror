# Plan: Migrate to `workspace:` Protocol

## Background

This monorepo has 105 workspace packages. All internal dependencies currently use **exact versions** (e.g., `"@remirror/core": "3.0.2"`). The `.npmrc` explicitly disables workspace protocol with `save-workspace-protocol=false`.

The `workspace:` protocol tells pnpm to always resolve matching dependencies to local workspace packages. At publish time, pnpm automatically replaces `workspace:` references with real version ranges so published packages work correctly on npm.

## Scope

### Files to modify

1. **`.npmrc`** — change `save-workspace-protocol=false` to `save-workspace-protocol=rolling`
2. **~90 `package.json` files** — replace internal dependency versions with `workspace:^` in `dependencies` and `devDependencies`
3. **`peerDependencies`** — replace internal peer dependency versions with `workspace:^` (pnpm replaces this with `^x.y.z` at publish time, matching the current `^3.0.1` pattern already used)
4. **Root `package.json`** — replace internal dependency versions (like `remirror`, `jest-remirror`, `jest-prosemirror`) with `workspace:*`
5. **`support/scripts/src/mutatate-packages.ts`** — no changes needed (the `mutateDependencies` function overwrites values by package name, so it works regardless of whether the current value is `"3.0.2"` or `"workspace:^"`)
6. **Remove `update:workspace` script** from root `package.json` — this script (`pnpm up -r --workspace ...`) manually syncs internal dependency versions, which becomes unnecessary with `workspace:` protocol since deps always resolve locally
7. **Update `version:ci` script** — remove the `update:workspace` step from the pipeline
8. **`pnpm-lock.yaml`** — regenerated automatically by `pnpm install`

### What does NOT need to change

- **Preconstruct** — reads from `node_modules`, unaffected by how deps are specified in `package.json`
- **Turborepo** (`turbo.json`) — task graph based on workspace structure, not version specifiers
- **Changesets** (`.changeset/config.json`) — `updateInternalDependencies: "patch"` still works; changesets updates version fields, which are separate from dependency specifiers
- **`changeset-forced-update.ts`** — operates on changeset metadata, not dependency versions
- **`deprecate-version.ts`** — runs post-publish, unaffected
- **CI workflows** (`.github/workflows/*.yml`) — no changes needed
- **`mutatate-packages.ts`** (PR release script) — already works correctly; it replaces dependency values by name regardless of the existing value format

## Version specifier choice

| Dep type | Specifier | At publish time becomes | Rationale |
|---|---|---|---|
| `dependencies` | `workspace:^` | `^3.0.2` | Standard for regular deps; allows compatible versions |
| `devDependencies` | `workspace:^` | `^3.0.2` | Same as deps; devDeps aren't published anyway |
| `peerDependencies` | `workspace:^` | `^3.0.2` | Matches the existing `^3.0.1` pattern already used for peer deps |
| Root `dependencies` | `workspace:*` | `3.0.2` | Root is private, never published; `*` is simplest |

## Step-by-step implementation

### Step 1: Update `.npmrc`

Change:
```
save-workspace-protocol=false
```
To:
```
save-workspace-protocol=rolling
```

`rolling` means when adding new deps via `pnpm add`, pnpm will automatically use `workspace:^` (or `workspace:~` depending on the default range).

### Step 2: Write a migration script

Write a Node.js script that:
1. Lists all workspace package names using `@manypkg/get-packages` or `pnpm ls -r --json`
2. For each workspace `package.json`:
   - For each entry in `dependencies`, `devDependencies`, `peerDependencies`:
     - If the dep name matches a workspace package name → replace the version with `workspace:^`
   - For the root `package.json` (private): use `workspace:*` instead
3. Write the modified JSON back preserving formatting (using `detect-indent` or similar)

### Step 3: Run the migration

```bash
node migrate-to-workspace.mjs
```

### Step 4: Update root `package.json` scripts

- Remove or comment out the `update:workspace` script
- Update `version:ci` to remove the `update:workspace` step:
  ```
  "version:ci": "run-s version:changeset version:date fix:repo fix:prettier"
  ```

### Step 5: Regenerate lockfile

```bash
pnpm install
```

### Step 6: Verify

- Run `pnpm build` to confirm builds still work
- Run `pnpm lint:repo` (`manypkg check`) to confirm monorepo validation passes
- Spot-check a few `package.json` files to confirm correct `workspace:^` values
- Verify `pnpm publish --dry-run` on a package to confirm workspace: is replaced with real versions

### Step 7: Clean up

- Delete the migration script
- Commit all changes

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `manypkg check` rejects `workspace:` values | `@manypkg/cli@0.20.0` supports workspace protocol. If issues arise, update manypkg or adjust its config |
| Changesets doesn't update `workspace:` deps correctly | `@changesets/cli@^2.26.1` has full workspace protocol support (added in v2.22.0) |
| PR release script breaks | `mutateDependencies()` overwrites by name — already works. The values are simply replaced with `0.0.0-pr{N}` |
| External tools choke on `workspace:` syntax | Only pnpm reads these values; all other tools (TypeScript, esbuild, etc.) read from `node_modules` which pnpm populates normally |

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

Only `@remirror/*` and other workspace packages are changed; external deps like `@babel/runtime` stay as-is.
