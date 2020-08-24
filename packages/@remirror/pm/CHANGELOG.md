# @remirror/pm

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- prosemirror-suggest@1.0.0-next.26

## 1.0.0-next.22

> 2020-08-17

### Patch Changes

- Updated dependencies [113560bb]
  - prosemirror-suggest@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- prosemirror-suggest@0.7.7-next.6

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- 770e3d4a: Update package dependencies.
- 92653907: Upgrade package dependencies.
- Updated dependencies [48cce3a0]
- Updated dependencies [770e3d4a]
  - prosemirror-suggest@1.0.0-next.5

## 1.0.0-next.16

> 2020-08-01

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [a7037832]
- Updated dependencies [068d2e07]
- Updated dependencies [4463d117]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [4eb56ecd]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
  - prosemirror-suggest@1.0.0-next.4

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - prosemirror-suggest@1.0.0-next.2

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- e90bc748: Update prosemirror dependencies to latest versions.

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - prosemirror-suggest@1.0.0-next.1

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
- Updated dependencies [968cdc4d]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [f212b90a]
  - prosemirror-suggest@1.0.0-next.0
