# @remirror/preset-core

## 1.0.0-next.15

> 2020-07-31

### Minor Changes

- f91dcab1: 🎉 New extension `@remirror/extension-events`.

  This extension adds handlers for the events happening within the remirror editor. The extension is
  part of the `CorePreset` but it doesn't make it's handlers available to the preset. In order to
  use the handlers you will need direct access to the `EventsExtension`.

  ```ts
  import { EventsExtension } from 'remirror/extension-events';
  import { useExtension } from 'remirror/react';

  const Editor = () => {
    useExtension(
      EventsExtension,
      ({ addHandler }) => {
        addHandler('focus', () => log('focused'));
      },
      [],
    );
  };
  ```

  To begin with the only events added are `focus` and `blur`.

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [44516da4]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [6c3b278b]
- Updated dependencies [7477b935]
- Updated dependencies [f91dcab1]
  - @remirror/core@1.0.0-next.15
  - @remirror/extension-paragraph@1.0.0-next.15
  - @remirror/extension-history@1.0.0-next.15
  - @remirror/extension-events@1.0.0-next.15
  - @remirror/extension-base-keymap@1.0.0-next.15
  - @remirror/extension-doc@1.0.0-next.15
  - @remirror/extension-gap-cursor@1.0.0-next.15
  - @remirror/extension-positioner@1.0.0-next.15
  - @remirror/extension-text@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Minor Changes

- 02704d42: Add `GapCursorExtension` to the `CorePreset`.

### Patch Changes

- 38941404: Switch from static properties to using the `@extensionDecorator` and `@presetDecorator`
  instead.
- Updated dependencies [d877adb3]
- Updated dependencies [38941404]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [e45706e5]
- Updated dependencies [38941404]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13
  - @remirror/extension-base-keymap@1.0.0-next.13
  - @remirror/extension-history@1.0.0-next.13
  - @remirror/extension-doc@1.0.0-next.13
  - @remirror/extension-gap-cursor@1.0.0-next.13
  - @remirror/extension-paragraph@1.0.0-next.13
  - @remirror/extension-positioner@1.0.0-next.13
  - @remirror/extension-text@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [d8aa2432]
  - @remirror/core@1.0.0-next.12
  - @remirror/extension-base-keymap@1.0.0-next.12
  - @remirror/extension-doc@1.0.0-next.12
  - @remirror/extension-history@1.0.0-next.12
  - @remirror/extension-paragraph@1.0.0-next.12
  - @remirror/extension-positioner@1.0.0-next.12
  - @remirror/extension-text@1.0.0-next.12

## 1.0.0-next.11

> 2020-07-26

### Patch Changes

- Updated dependencies [54461006]
  - @remirror/core@1.0.0-next.11
  - @remirror/extension-history@1.0.0-next.11
  - @remirror/extension-paragraph@1.0.0-next.11
  - @remirror/extension-positioner@1.0.0-next.11
  - @remirror/extension-base-keymap@1.0.0-next.11
  - @remirror/extension-doc@1.0.0-next.11
  - @remirror/extension-text@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Minor Changes

- 3702a83a: Remove requirement for `readonly` arrays when passing a list of extensions / presets to
  manager creators.

  - **`@remirror/react`** - Add support for a function as the first parameter to the `useManager`
    hook and `createReactManager` function.
  - **`@remirror/preset-core`** - Add support for a function as the first parameter to the
    `createCoreManager` function.

### Patch Changes

- Updated dependencies [6468058a]
  - @remirror/core@1.0.0-next.10
  - @remirror/extension-base-keymap@1.0.0-next.10
  - @remirror/extension-doc@1.0.0-next.10
  - @remirror/extension-history@1.0.0-next.10
  - @remirror/extension-paragraph@1.0.0-next.10
  - @remirror/extension-positioner@1.0.0-next.10
  - @remirror/extension-text@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Patch Changes

- Updated dependencies [02fdafff]
  - @remirror/core@1.0.0-next.9
  - @remirror/extension-base-keymap@1.0.0-next.9
  - @remirror/extension-doc@1.0.0-next.9
  - @remirror/extension-history@1.0.0-next.9
  - @remirror/extension-paragraph@1.0.0-next.9
  - @remirror/extension-positioner@1.0.0-next.9
  - @remirror/extension-text@1.0.0-next.9

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [9f495078]
- Updated dependencies [5d5970ae]
  - @remirror/core@1.0.0-next.4
  - @remirror/extension-base-keymap@1.0.0-next.4
  - @remirror/extension-doc@1.0.0-next.4
  - @remirror/extension-history@1.0.0-next.4
  - @remirror/extension-paragraph@1.0.0-next.4
  - @remirror/extension-positioner@1.0.0-next.4
  - @remirror/extension-text@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3
  - @remirror/extension-base-keymap@1.0.0-next.3
  - @remirror/extension-doc@1.0.0-next.3
  - @remirror/extension-history@1.0.0-next.3
  - @remirror/extension-paragraph@1.0.0-next.3
  - @remirror/extension-positioner@1.0.0-next.3
  - @remirror/extension-text@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Patch Changes

- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.2
  - @remirror/extension-base-keymap@1.0.0-next.2
  - @remirror/extension-doc@1.0.0-next.2
  - @remirror/extension-history@1.0.0-next.2
  - @remirror/extension-paragraph@1.0.0-next.2
  - @remirror/extension-positioner@1.0.0-next.2
  - @remirror/extension-text@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/extension-base-keymap@1.0.0-next.1
  - @remirror/extension-doc@1.0.0-next.1
  - @remirror/extension-history@1.0.0-next.1
  - @remirror/extension-paragraph@1.0.0-next.1
  - @remirror/extension-positioner@1.0.0-next.1
  - @remirror/extension-text@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking
  change across all packages. The best way to know what's changed is to read the documentaion on the
  new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from
    '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
  - @remirror/core@1.0.0-next.0
  - @remirror/extension-base-keymap@1.0.0-next.0
  - @remirror/extension-doc@1.0.0-next.0
  - @remirror/extension-history@1.0.0-next.0
  - @remirror/extension-paragraph@1.0.0-next.0
  - @remirror/extension-positioner@1.0.0-next.0
  - @remirror/extension-text@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
