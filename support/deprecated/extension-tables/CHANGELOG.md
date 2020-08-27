# @remirror/extension-tables

## 1.0.0-next.2

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.
- 304db6ba: This package is now deprecated. It has been replaced with [`@remirror/preset-table`](https://www.npmjs.com/package/@remirror/preset-table).

  You can still install older versions, but no new releases are planned.

## 0.11.0

### Minor Changes

- 20ad210e: This version add a minimal implementation for tables. Based on [prosemirror-tables](https://github.com/ProseMirror/prosemirror-tables).

  Ses #49 and #254 for more information.

### Patch Changes

- Updated dependencies [c2237aa0]
  - @remirror/core@0.11.0
