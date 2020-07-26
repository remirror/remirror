# @remirror/react-social

## 1.0.0-next.11

> 2020-07-26

### Patch Changes

- 21a9650c: Rename `getArray` to `getLazyArray`. Also bump the version of `@remirror/core-helpers`
  to make sure it is released.
- Updated dependencies [54461006]
- Updated dependencies [21a9650c]
  - @remirror/core@1.0.0-next.11
  - @remirror/extension-auto-link@1.0.0-next.11
  - @remirror/extension-emoji@1.0.0-next.11
  - @remirror/extension-mention@1.0.0-next.11
  - @remirror/preset-social@1.0.0-next.11
  - @remirror/react@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Major Changes

- 16a683f3: Reduce the number of rerenders for the social manager.

  BREAKING CHANGE: The package no longer exports a `createSocialManager` and instead provides a
  `socialManagerArgs` which can be passed into the `useManager` hook.

### Patch Changes

- Updated dependencies [6468058a]
- Updated dependencies [76d1df83]
- Updated dependencies [3702a83a]
- Updated dependencies [e554ce8c]
  - @remirror/core@1.0.0-next.10
  - @remirror/react@1.0.0-next.10
  - @remirror/extension-auto-link@1.0.0-next.10
  - @remirror/extension-emoji@1.0.0-next.10
  - @remirror/extension-mention@1.0.0-next.10
  - @remirror/preset-social@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Patch Changes

- Updated dependencies [02fdafff]
- Updated dependencies [b332942b]
  - @remirror/react@1.0.0-next.9
  - @remirror/core@1.0.0-next.9
  - @remirror/extension-auto-link@1.0.0-next.9
  - @remirror/extension-emoji@1.0.0-next.9
  - @remirror/extension-mention@1.0.0-next.9
  - @remirror/preset-social@1.0.0-next.9

## 1.0.0-next.8

> 2020-07-21

### Patch Changes

- a93c83bd: - Add `keepSelection` property to the `replaceText` command function.
  - Prevent mentions from trapping the cursor when arrowing left and right through the mention.
  - Set low priority for `AutoLinkExtension` to prevent `appendTransaction` interfering with
    mentions.
  - Update extension order in the `SocialPreset`
  - `prosemirror-suggest` - New export `isSelectionExitReason` which let's the user know if the exit
    was due to a selection change or a character entry.
- Updated dependencies [a93c83bd]
  - @remirror/extension-auto-link@1.0.0-next.8
  - @remirror/extension-mention@1.0.0-next.8
  - @remirror/preset-social@1.0.0-next.8

## 1.0.0-next.7

> 2020-07-21

### Patch Changes

- Updated dependencies [6c5a93c8]
  - @remirror/react@1.0.0-next.7

## 1.0.0-next.5

> 2020-07-17

### Patch Changes

- Updated dependencies [4628d342]
  - @remirror/react@1.0.0-next.5

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [e1a1b6ec]
- Updated dependencies [9f495078]
- Updated dependencies [5d5970ae]
- Updated dependencies [64edeec2]
  - @remirror/core@1.0.0-next.4
  - @remirror/react@1.0.0-next.4
  - @remirror/extension-auto-link@1.0.0-next.4
  - @remirror/extension-emoji@1.0.0-next.4
  - @remirror/extension-mention@1.0.0-next.4
  - @remirror/i18n@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - @remirror/preset-social@1.0.0-next.4
  - @remirror/react-utils@1.0.0-next.4
  - @remirror/theme@1.0.0-next.4
  - multishift@1.0.0-next.2

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3
  - @remirror/extension-auto-link@1.0.0-next.3
  - @remirror/extension-emoji@1.0.0-next.3
  - @remirror/extension-mention@1.0.0-next.3
  - @remirror/i18n@1.0.0-next.3
  - @remirror/preset-social@1.0.0-next.3
  - @remirror/react@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Minor Changes

- Add support for `React.StrictMode`.

  Previously, activating `StrictMode` would cause the components to render twice and break
  functionality of `RemirrorProvider` due to an outdated check on whether `getRootProps` had been
  called. This check has been removed since it isn't needed anymore.

### Patch Changes

- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.2
  - @remirror/react@1.0.0-next.2
  - @remirror/react-utils@1.0.0-next.2
  - @remirror/extension-auto-link@1.0.0-next.2
  - @remirror/extension-emoji@1.0.0-next.2
  - @remirror/extension-mention@1.0.0-next.2
  - @remirror/preset-social@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/extension-auto-link@1.0.0-next.1
  - @remirror/extension-emoji@1.0.0-next.1
  - @remirror/extension-mention@1.0.0-next.1
  - @remirror/i18n@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - @remirror/preset-social@1.0.0-next.1
  - @remirror/react@1.0.0-next.1
  - @remirror/react-utils@1.0.0-next.1
  - @remirror/theme@1.0.0-next.1
  - multishift@1.0.0-next.1

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
- Updated dependencies [141c7864]
  - @remirror/core@1.0.0-next.0
  - @remirror/extension-auto-link@1.0.0-next.0
  - @remirror/extension-emoji@1.0.0-next.0
  - @remirror/extension-mention@1.0.0-next.0
  - @remirror/i18n@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - @remirror/preset-social@1.0.0-next.0
  - @remirror/react@1.0.0-next.0
  - @remirror/react-utils@1.0.0-next.0
  - @remirror/theme@1.0.0-next.0
  - multishift@1.0.0-next.0
