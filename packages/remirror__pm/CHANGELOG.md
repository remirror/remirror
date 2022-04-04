# @remirror/pm

## 1.0.16

> 2022-04-04

### Patch Changes

- Update dependency prosemirror-view.

- Updated dependencies []:
  - prosemirror-paste-rules@1.0.10
  - prosemirror-suggest@1.1.1
  - prosemirror-trailing-node@1.0.8

## 1.0.15

> 2022-03-31

### Patch Changes

- Add support for Unicode Regexp in suggestion matching.

  The change was required to support matching non-latin characters in `MentionAtomExtension` and `MentionExtension` i.e. by using `supportedCharacters: /\p{Letter}+/u` in `matchers` definition.

  There is no need to update the code: changes are backwards compatible with no behavior change at all.

- Updated dependencies []:
  - prosemirror-suggest@1.1.0

## 1.0.14

> 2022-03-08

### Patch Changes

- When using `prosemirror-suggest`, if `appendTransaction` is `true`, make sure the match state will be updated after every transaction.

- Updated dependencies []:
  - prosemirror-suggest@1.0.8

## 1.0.13

> 2022-03-01

### Patch Changes

- Fix an issue that causes the selected text being deleted when pasting.

- Updated dependencies []:
  - prosemirror-paste-rules@1.0.9

## 1.0.12

> 2022-02-25

### Patch Changes

- Fixes an issue that causes invalid duplicate marks when using `pasteRules` plugin.

* Fixes an issue that causes some text nodes to be deleted when using `replaceSelection`.

* Updated dependencies []:
  - prosemirror-paste-rules@1.0.8

## 1.0.11

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

- Updated dependencies []:
  - prosemirror-paste-rules@1.0.7
  - prosemirror-suggest@1.0.7
  - prosemirror-trailing-node@1.0.7

## 1.0.10

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - prosemirror-paste-rules@1.0.6
  - prosemirror-suggest@1.0.6
  - prosemirror-trailing-node@1.0.6
  - @remirror/core-constants@1.0.2
  - @remirror/core-helpers@1.0.5

## 1.0.9

> 2021-12-06

### Patch Changes

- Update ProseMirror dependencies.

## 1.0.8

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

## 1.0.7

> 2021-11-23

### Patch Changes

- Update ProseMirror dependencies.

## 1.0.6

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4
  - prosemirror-paste-rules@1.0.5
  - prosemirror-suggest@1.0.5
  - prosemirror-trailing-node@1.0.5

## 1.0.5

> 2021-10-29

### Patch Changes

- Update prosemirror packages.

## 1.0.4

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core-helpers@1.0.3
  - prosemirror-paste-rules@1.0.4
  - prosemirror-suggest@1.0.4
  - prosemirror-trailing-node@1.0.4

## 1.0.3

> 2021-10-01

### Patch Changes

- Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

* Stop hiding error details in production.

* Updated dependencies []:
  - @remirror/core-helpers@1.0.2
  - prosemirror-paste-rules@1.0.3
  - prosemirror-suggest@1.0.3
  - prosemirror-trailing-node@1.0.3
  - @remirror/core-constants@1.0.1

## 1.0.2

> 2021-08-18

### Patch Changes

- Update dependency `prosemirror-gapcursor` to `^1.1.5`.

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - prosemirror-paste-rules@1.0.1
  - prosemirror-suggest@1.0.1
  - prosemirror-trailing-node@1.0.1
  - @remirror/core-helpers@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Minor Changes

- [#706](https://github.com/remirror/remirror/pull/706) [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `@remirror/pm/collab` entrypoint.

* [#706](https://github.com/remirror/remirror/pull/706) [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make ProseMirror dependencies less exact in `@remirror/pm`. This reduces the chances of multiple versions of ProseMirror libraries being used in your codebase and causing errors.

### Patch Changes

- Updated dependencies [[`9680a3612`](https://github.com/remirror/remirror/commit/9680a36127448c963453993fc9b6dd1f05abb911), [`494551041`](https://github.com/remirror/remirror/commit/494551041b5453dba16ac6fbc3fa77103c61b1f7), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`a88440788`](https://github.com/remirror/remirror/commit/a88440788736e157278f4f81ce5eeec19f55703c)]:
  - prosemirror-paste-rules@1.0.0
  - prosemirror-suggest@1.0.0
  - prosemirror-trailing-node@1.0.0
  - @remirror/core-constants@1.0.0
  - @remirror/core-helpers@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0)]:
  - @remirror/core-constants@1.0.0-next.60
  - @remirror/core-helpers@1.0.0-next.60
  - prosemirror-suggest@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.59
  - @remirror/core-helpers@1.0.0-next.59
  - prosemirror-suggest@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.58
  - @remirror/core-helpers@1.0.0-next.58
  - prosemirror-suggest@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.57
  - @remirror/core-helpers@1.0.0-next.57
  - prosemirror-suggest@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.56
  - @remirror/core-helpers@1.0.0-next.56
  - prosemirror-suggest@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.55
  - @remirror/core-helpers@1.0.0-next.55
  - prosemirror-suggest@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.54
  - @remirror/core-helpers@1.0.0-next.54
  - prosemirror-suggest@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.53
  - @remirror/core-helpers@1.0.0-next.53
  - prosemirror-suggest@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.52
  - @remirror/core-helpers@1.0.0-next.52
  - prosemirror-suggest@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- [`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Minor dependency updates.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.51
  - @remirror/core-helpers@1.0.0-next.51
  - prosemirror-suggest@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455)]:
  - @remirror/core-constants@1.0.0-next.50
  - @remirror/core-helpers@1.0.0-next.50
  - prosemirror-suggest@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.49
  - @remirror/core-helpers@1.0.0-next.49
  - prosemirror-suggest@1.0.0-next.49

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- [`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update external dependencies.

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e)]:
  - @remirror/core-helpers@1.0.0-next.47
  - prosemirror-suggest@1.0.0-next.47

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
