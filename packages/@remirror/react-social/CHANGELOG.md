# @remirror/react-social

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- Updated dependencies [95697fbd]
- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/react@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20
  - @remirror/core@1.0.0-next.20
  - @remirror/react-utils@1.0.0-next.20
  - @remirror/theme@1.0.0-next.20
  - multishift@0.7.8-next.4
  - @remirror/i18n@1.0.0-next.20
  - @remirror/extension-auto-link@1.0.0-next.20
  - @remirror/extension-emoji@1.0.0-next.20
  - @remirror/extension-events@1.0.0-next.20
  - @remirror/extension-mention@1.0.0-next.20
  - @remirror/preset-social@1.0.0-next.20

## 1.0.0-next.17

> 2020-08-02

### Patch Changes

- 4498814f: Rename `UsePositionerHookReturn` and `UseMultiPositionerHookReturn` to
  `UsePositionerReturn` and `UseMultiPositionerReturn`.

  - Add `active: boolean` property to `UsePositionerHookReturn`.
  - Fix the floating emoji menu for the social editor and showcase. Now hidden when text selection
    spans multiple characters.

- Updated dependencies [4498814f]
- Updated dependencies [898c62e0]
  - @remirror/react@1.0.0-next.17
  - @remirror/core@1.0.0-next.17
  - @remirror/extension-auto-link@1.0.0-next.17
  - @remirror/extension-emoji@1.0.0-next.17
  - @remirror/extension-events@1.0.0-next.17
  - @remirror/extension-mention@1.0.0-next.17
  - @remirror/preset-social@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- 6528323e: **Breaking:** `@remirror/preset-core` -`CreateCoreManagerOptions` now extends
  `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/preset-wysiwyg` - Rename `CreateWysiwygPresetListParameter` to
  **`CreateWysiwygPresetListOptions`**. Also it now extends `Remirror.ManagerSettings`.
  **Breaking:**`@remirror/react` - `CreateReactManagerOptions` now extends
  `Remirror.ManagerSettings`. **Breaking:** `@remirror/react-social` - `CreateSocialManagerOptions`
  now extends `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/react`, `@remirror/react-social`, `@remirror/react-wysiwyg` now uses a
  `settings` property for manager settings.

  `@remirror/core-types` - Add `GetStaticAndDynamic<Options>` helper for extracting options from
  extension. Apply it to the packages mentioned above.

  - `@remirror/react-wysiwyg` - Update imports from `@remirror/preset-wysiwyg`.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [f032db7e]
- Updated dependencies [a7037832]
- Updated dependencies [6e8b749a]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [982a6b15]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
- Updated dependencies [e518ef1d]
- Updated dependencies [be9a9c17]
- Updated dependencies [720c9b43]
  - @remirror/react@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/extension-auto-link@1.0.0-next.16
  - @remirror/extension-emoji@1.0.0-next.16
  - @remirror/extension-events@1.0.0-next.16
  - @remirror/extension-mention@1.0.0-next.16
  - @remirror/i18n@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - @remirror/preset-social@1.0.0-next.16
  - @remirror/react-utils@1.0.0-next.16
  - @remirror/theme@1.0.0-next.16
  - multishift@1.0.0-next.3

## 1.0.0-next.15

> 2020-07-31

### Minor Changes

- 273d0a71: Hide social popups when the editor is blurred.

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [0dd4d621]
- Updated dependencies [44516da4]
- Updated dependencies [9d708c03]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [6c3b278b]
- Updated dependencies [f91dcab1]
  - @remirror/core@1.0.0-next.15
  - @remirror/extension-emoji@1.0.0-next.15
  - @remirror/preset-social@1.0.0-next.15
  - @remirror/extension-events@1.0.0-next.15
  - @remirror/extension-auto-link@1.0.0-next.15
  - @remirror/extension-mention@1.0.0-next.15
  - @remirror/react@1.0.0-next.15

## 1.0.0-next.14

> 2020-07-29

### Patch Changes

- 90f64408: Show immediate suggestions for the emoji picker in the social editor. Also add the
  character indicator default and update the value for each state update.

  Closes #403

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- Updated dependencies [d877adb3]
- Updated dependencies [38941404]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [e45706e5]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13
  - @remirror/extension-auto-link@1.0.0-next.13
  - @remirror/extension-emoji@1.0.0-next.13
  - @remirror/extension-mention@1.0.0-next.13
  - @remirror/preset-social@1.0.0-next.13
  - @remirror/react@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [d8aa2432]
  - @remirror/core@1.0.0-next.12
  - @remirror/extension-auto-link@1.0.0-next.12
  - @remirror/extension-emoji@1.0.0-next.12
  - @remirror/extension-mention@1.0.0-next.12
  - @remirror/preset-social@1.0.0-next.12
  - @remirror/react@1.0.0-next.12

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
