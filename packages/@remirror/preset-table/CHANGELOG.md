# @remirror/extension-tables

## 1.0.0-next.11

> 2020-07-26

### Patch Changes

- 54461006: Remove the first parameter `extensions` from the lifecycle methods `onCreate`, `onView`
  and `onDestroy`.

  Switch to using method signatures for extension class methods as discussed in #360. The following
  methods have been affected:

  ```
  onCreate
  onView
  onStateUpdate
  onDestroy
  createAttributes
  createCommands
  createPlugin
  createExternalPlugins
  createSuggestions
  createHelpers
  fromObject
  onSetOptions
  ```

- Updated dependencies [54461006]
  - @remirror/core@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Patch Changes

- Updated dependencies [6468058a]
  - @remirror/core@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Patch Changes

- Updated dependencies [02fdafff]
  - @remirror/core@1.0.0-next.9

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 2d74596b: Rename class name from `TableHeaderCell` to `TableHeaderCellExtension`. Raname node name
  from `tableHeader` to `tableHeaderCell`.
- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [9f495078]
- Updated dependencies [5d5970ae]
  - @remirror/core@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - @remirror/theme@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Patch Changes

- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - @remirror/theme@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking
  change across all packages. The best way to know what's changed is to read the documentaion on the
  new documentation site `https://remirror.io`.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
  - @remirror/core@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - @remirror/theme@1.0.0-next.0

## 0.11.0

### Minor Changes

- 20ad210e: This version add a minimal implementation for tables. Based on
  [prosemirror-tables](https://github.com/ProseMirror/prosemirror-tables).

  Ses #49 and #254 for more information.

### Patch Changes

- Updated dependencies [c2237aa0]
  - @remirror/core@0.11.0
