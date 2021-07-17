# @remirror/extension-enhanced-link

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
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.
- 141c7864: Rename `@remirror/extension-enhanced-link` to `@remirror/extension-auto-link` and deprecate the old name.

## 0.11.0

### Patch Changes

- Updated dependencies [c2237aa0]
  - @remirror/core@0.11.0

## 0.7.6

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
