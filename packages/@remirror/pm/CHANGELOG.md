# @remirror/pm

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- [`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68) [#731](https://github.com/remirror/remirror/pull/731) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Bump dependencies with minor and patch updates.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.0-next.44
  - prosemirror-suggest@1.0.0-next.44

## 1.0.0-next.40

> 2020-09-24

### Patch Changes

- [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade external dependencies.

- Updated dependencies [[`499eb047`](https://github.com/remirror/remirror/commit/499eb047b90e74dfcdd9bc24a2dde303a48bb721)]:
  - prosemirror-suggest@1.0.0-next.40
  - @remirror/core-helpers@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- [`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c) [#691](https://github.com/remirror/remirror/pull/691) Thanks [@ocavue](https://github.com/ocavue)! - Use ranges version for Prosemirror dependencies.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.0-next.39
  - prosemirror-suggest@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- [`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update the `selection`, `storedMarks` and `doc` from the `chainableEditorState` whenever the `state.tr` property is accessed. This better mimics the behavior expected within commands where the `Transaction` is created once at the start and the state is used as a reference point.

- Updated dependencies [[`6855ee77`](https://github.com/remirror/remirror/commit/6855ee773bf25a4b30d45a7e09eeab78d6b3f67a)]:
  - @remirror/core-helpers@1.0.0-next.38
  - prosemirror-suggest@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Patch Changes

- [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405) [#686](https://github.com/remirror/remirror/pull/686) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix `chainableEditorState` so that `storeMarks`, `selection` and `doc` are immutable.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.0-next.37
  - prosemirror-suggest@1.0.0-next.37

## 1.0.0-next.35

> 2020-09-13

### Minor Changes

- [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `chainableEditorState` which makes the `EditorState` chainable with a shared transaction. Also set the `@remirror/pm` entry point to export types and utility methods. This is now used in the core libraries.

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- Updated dependencies [[`175c9461`](https://github.com/remirror/remirror/commit/175c946130c3de366f2946f6a2e5be5ee9b9234c), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813)]:
  - prosemirror-suggest@1.0.0-next.35
  - @remirror/core-constants@1.0.0-next.35
  - @remirror/core-helpers@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- Updated dependencies []:
  - prosemirror-suggest@1.0.0-next.34

## 1.0.0-next.32

> 2020-09-05

### Patch Changes

- Updated dependencies []:
  - prosemirror-suggest@1.0.0-next.32

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448) [#585](https://github.com/remirror/remirror/pull/585) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies and `linaria`.

- Updated dependencies []:
  - prosemirror-suggest@1.0.0-next.28

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

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from '@remirror/core/lib/custom'
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
