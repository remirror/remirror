# @remirror/core-extensions

## 1.0.0

> 2021-07-17

### Major Changes

- [#706](https://github.com/remirror/remirror/pull/706) [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Deprecate the following packages:

  - `@remirror/core-extensions`
  - `@remirror/editor-markdown`
  - `@remirror/editor-social`
  - `@remirror/editor-wysiwyg`
  - `@remirror/extension-auto-link`
  - `@remirror/extension-base-keymap`
  - `@remirror/extension-enhanced-link`
  - `@remirror/preset-social`
  - `@remirror/react-node-view`
  - `@remirror/react-portals`
  - `@remirror/react-social`
  - `@remirror/react-wysiwyg`
  - `@remirror/showcase`
  - `@remirror/ui`
  - `@remirror/ui-a11y-status`
  - `@remirror/ui-buttons`
  - `@remirror/ui-dropdown`
  - `@remirror/ui-icons`
  - `@remirror/ui-menus`
  - `@remirror/ui-modal`
  - `@remirror/ui-text`

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
- 0bbe7270: Deprecate `@remirror/core-extensions` and remove the simple code block extension from the repo.
- b3153b4c: Deprecate unused packages in the latest version.
- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.

## 0.13.1

### Patch Changes

- 4dbb7461: Prevent the link selection from selecting word on click if there is already a selection. Fixes #278.

## 0.11.1

### Patch Changes

- 5888a7aa: Fix code-extension interactions with hard-break and other editor leaf nodes.

## 0.11.0

### Patch Changes

- Updated dependencies [c2237aa0]
  - @remirror/core@0.11.0

## 0.7.6

### Patch Changes

- 0300d01c: - Auto defined `isEnabled` via commands with `dispatch=undefined`.
  - `HistoryExtension` now checks that whether `dispatch=undefined`.
  - Remove `CommandStatusCheck`.
  - Add new type `ExtensionIsActiveFunction` which doesn't take the command name.
  - Remove `isEnabled` from `Extension` interface.
- Updated dependencies [c4645570]
- Updated dependencies [0300d01c]
  - @remirror/core-utils@0.8.0
  - @remirror/core-types@0.9.0
  - @remirror/core@0.9.0
  - @remirror/core-helpers@0.7.6
  - @remirror/react-utils@0.7.6
  - @remirror/ui@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core@0.8.0
  - @remirror/core-helpers@0.7.5
  - @remirror/core-utils@0.7.5
  - @remirror/react-utils@0.7.5
  - @remirror/ui@0.7.5

## 0.7.4

### Patch Changes

- 10419145: Make all built-in extensions' `keys()` return a `KeyboardBindings` object instead of a specific object (#206)
- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/core-helpers@0.7.4
  - @remirror/core-types@0.7.4
  - @remirror/core-utils@0.7.4
  - @remirror/core@0.7.4
  - @remirror/react-portals@0.7.4
  - @remirror/react-utils@0.7.4
  - @remirror/ui@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-helpers@0.7.3
  - @remirror/core@0.7.3
  - @remirror/core-constants@0.7.3
  - @remirror/core-types@0.7.3
  - @remirror/core-utils@0.7.3
  - @remirror/react-portals@0.7.3
  - @remirror/react-utils@0.7.3
  - @remirror/ui@0.7.3
