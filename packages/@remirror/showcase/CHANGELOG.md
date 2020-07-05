# @remirror/showcase

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
