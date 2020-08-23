# @remirror/showcase

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25
  - @remirror/extension-code-block@1.0.0-next.25
  - @remirror/react-social@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
  - @remirror/core@1.0.0-next.24
  - @remirror/extension-code-block@1.0.0-next.24
  - @remirror/react-social@1.0.0-next.24

## 1.0.0-next.23

> 2020-08-18

### Patch Changes

- @remirror/react-social@1.0.0-next.23

## 1.0.0-next.22

> 2020-08-17

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
- Updated dependencies [d300c5f0]
- Updated dependencies [f0377808]
  - @remirror/core@1.0.0-next.22
  - @remirror/react-social@1.0.0-next.22
  - @remirror/extension-code-block@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/core@1.0.0-next.21
  - @remirror/extension-code-block@1.0.0-next.21
  - @remirror/react-social@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- Updated dependencies [770e3d4a]
  - @remirror/extension-code-block@1.0.0-next.20
  - @remirror/react-social@1.0.0-next.20
  - @remirror/core@1.0.0-next.20

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
  - @remirror/react-social@1.0.0-next.17
  - @remirror/core@1.0.0-next.17
  - @remirror/extension-code-block@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

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
- Updated dependencies [be9a9c17]
- Updated dependencies [720c9b43]
  - @remirror/react-social@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/extension-code-block@1.0.0-next.16

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [9f495078]
- Updated dependencies [5d5970ae]
  - @remirror/core@1.0.0-next.4
  - @remirror/extension-code-block@1.0.0-next.4
  - @remirror/react-social@1.0.0-next.4

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/extension-code-block@1.0.0-next.1
  - @remirror/react-social@1.0.0-next.1

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

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`.
  If your code was importing any matching interface you will need to update the name.

### Patch Changes

- 43cadbc8: Use `parser-babel` instead of `parser-babylon`.
- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
  - @remirror/core@1.0.0-next.0
  - @remirror/extension-code-block@1.0.0-next.0
  - @remirror/react-social@1.0.0-next.0

## 0.13.1

### Patch Changes

- Updated dependencies [4dbb7461]
  - @remirror/core-extensions@0.13.1
  - @remirror/editor-markdown@0.13.1
  - @remirror/editor-wysiwyg@0.13.1
  - @remirror/editor-social@0.13.1
  - @remirror/react@0.13.1
  - @remirror/dev@0.13.1

## 0.13.0

### Patch Changes

- Updated dependencies [70ab69c8]
  - @remirror/editor-wysiwyg@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies [a43b0fd5]
- Updated dependencies [44f85e79]
  - @remirror/extension-code-block@0.12.0
  - @remirror/editor-markdown@0.12.0
  - @remirror/editor-wysiwyg@0.12.0

## 0.11.0

### Patch Changes

- Updated dependencies [026d4238]
- Updated dependencies [69d00c62]
- Updated dependencies [c2237aa0]
  - @remirror/react@0.11.0
  - @remirror/core@0.11.0
  - @remirror/dev@0.11.0
  - @remirror/editor-markdown@0.11.0
  - @remirror/editor-social@0.11.0
  - @remirror/editor-wysiwyg@0.11.0
  - @remirror/core-extensions@0.11.0
  - @remirror/extension-code-block@0.11.0
  - @remirror/extension-epic-mode@0.11.0
  - @remirror/ui-buttons@0.7.7

## 0.7.7

### Patch Changes

- Updated dependencies [23d599fc]
- Updated dependencies [0300d01c]
  - @remirror/editor-social@0.10.0
  - @remirror/core@0.9.0
  - @remirror/core-extensions@0.7.6
  - @remirror/editor-markdown@0.7.6
  - @remirror/editor-wysiwyg@0.8.2
  - @remirror/extension-code-block@0.7.6
  - @remirror/extension-epic-mode@0.7.6
  - @remirror/react@0.7.7
  - @remirror/ui-buttons@0.7.6

## 0.7.6

### Patch Changes

- f7969a67: - Update a username in exported showcase data to reflect a failing scenario.
- Updated dependencies [f7969a67]
- Updated dependencies [24f83413]
- Updated dependencies [db20a731]
- Updated dependencies [24f83413]
- Updated dependencies [47493cc2]
  - @remirror/editor-social@0.9.0
  - @remirror/core@0.8.0
  - @remirror/editor-wysiwyg@0.8.1
  - @remirror/extension-code-block@0.7.5
  - @remirror/core-extensions@0.7.5
  - @remirror/editor-markdown@0.7.5
  - @remirror/extension-epic-mode@0.7.5
  - @remirror/react@0.7.6
  - @remirror/ui-buttons@0.7.5

## 0.7.5

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
- Updated dependencies [9e66324a]
- Updated dependencies [10419145]
- Updated dependencies [7380e18f]
  - @remirror/editor-wysiwyg@0.8.0
  - @remirror/core-extensions@0.7.4
  - @remirror/core@0.7.4
  - @remirror/dev@0.7.4
  - @remirror/editor-markdown@0.7.4
  - @remirror/editor-social@0.8.1
  - @remirror/extension-code-block@0.7.4
  - @remirror/extension-epic-mode@0.7.4
  - @remirror/react@0.7.5
  - @remirror/ui-buttons@0.7.4

## 0.7.4

### Patch Changes

- Updated dependencies [416d65da]
- Updated dependencies [416d65da]
  - @remirror/editor-social@0.8.0
  - @remirror/react@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/core-extensions@0.7.3
  - @remirror/dev@0.7.3
  - @remirror/editor-markdown@0.7.3
  - @remirror/editor-social@0.7.3
  - @remirror/editor-wysiwyg@0.7.3
  - @remirror/extension-code-block@0.7.3
  - @remirror/extension-epic-mode@0.7.3
  - @remirror/react@0.7.3
  - @remirror/ui-buttons@0.7.3
