# @remirror/extension-base-keymap

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

## 1.0.0-next.14

> 2020-08-01

### Major Changes

- be9a9c17: Deprecated - this functionality is now one of the `builtin` extensions. Everything should work as before if you're on the latest version of `remirror`.

## 1.0.0-next.15

> 2020-07-31

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [44516da4]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [6c3b278b]
  - @remirror/core@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- d877adb3: Switch to using method signatures for extension class methods as discussed in #360. The following methods have been affected:

  ```
  createKeymap
  createInputRules
  createPasteRules
  ```

- Updated dependencies [d877adb3]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [e45706e5]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [d8aa2432]
  - @remirror/core@1.0.0-next.12

## 1.0.0-next.11

> 2020-07-26

### Patch Changes

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

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [9f495078]
- Updated dependencies [5d5970ae]
  - @remirror/core@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4

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

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
  - @remirror/core@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
