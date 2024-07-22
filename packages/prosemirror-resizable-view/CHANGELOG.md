# prosemirror-resizable-view

## 3.0.0-beta.6

> 2024-07-22

### Patch Changes

- Updated dependencies [bffe2fd61]
  - @remirror/core-helpers@4.0.0-beta.5
  - @remirror/core-utils@3.0.0-beta.6

## 3.0.0-beta.5

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/core-helpers@4.0.0-beta.4
  - @remirror/core-utils@3.0.0-beta.5

## 3.0.0-beta.4

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/core-helpers@4.0.0-beta.3
  - @remirror/core-utils@3.0.0-beta.4

## 3.0.0-beta.3

> 2023-11-20

### Patch Changes

- @remirror/core-helpers@4.0.0-beta.2
- @remirror/core-utils@3.0.0-beta.3

## 3.0.0-beta.2

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/core-helpers@4.0.0-beta.1
  - @remirror/core-utils@3.0.0-beta.2

## 3.0.0-beta.1

> 2023-11-06

### Patch Changes

- b1d683fdb: Update ProseMirror packages to latest versions.

  Use newly provided `Transform.setDocAttribute` to update doc node attributes, rather than custom step type.

  - @remirror/core-utils@3.0.0-beta.1

## 3.0.0-beta.0

> 2023-10-06

### Major Changes

- 8f5467ae6: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- Updated dependencies [3f76519f3]
- Updated dependencies [8f5467ae6]
  - @remirror/core-utils@3.0.0-beta.0
  - @remirror/core-helpers@4.0.0-beta.0

## 2.0.15

> 2024-07-17

### Patch Changes

- 7caff8388: Add a validate property to each of the Node or Mark attributes used in Remirror
- 7caff8388: Bump ProseMirror to latest versions to address potential XSS vulnerability found in ProseMirror's DOMSerializer

  See: https://discuss.prosemirror.net/t/heads-up-xss-risk-in-domserializer/6572

## 2.0.14

> 2023-07-31

### Patch Changes

- d50dadf27: Update dependencies.

## 2.0.13

> 2023-07-30

### Patch Changes

- Updated dependencies [2f542ccb0]
  - @remirror/core-helpers@3.0.0
  - @remirror/core-utils@2.0.13

## 2.0.12

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
  - @remirror/core-helpers@2.0.2
  - @remirror/core-utils@2.0.12

## 2.0.11

> 2023-03-10

### Patch Changes

- @remirror/core-utils@2.0.11

## 2.0.10

> 2022-12-29

### Patch Changes

- Updated dependencies [6a93233e2]
  - @remirror/core-helpers@2.0.1
  - @remirror/core-utils@2.0.10

## 2.0.9

> 2022-12-10

### Patch Changes

- f62c04ad3: Update all `prosemirror` dependencies to latest version.
  - @remirror/core-utils@2.0.9

## 2.0.8

> 2022-11-25

### Patch Changes

- Updated dependencies [8bd49f599]
  - @remirror/core-utils@2.0.8

## 2.0.7

> 2022-10-27

### Patch Changes

- b637f9f3e: Update dependencies.
- Updated dependencies [3fa267878]
- Updated dependencies [b637f9f3e]
  - @remirror/core-utils@2.0.7

## 2.0.6

> 2022-10-11

### Patch Changes

- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.
- Updated dependencies
  - @remirror/core-utils@2.0.6

## 2.0.5

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
- Updated dependencies
  - @remirror/core-utils@2.0.5

## 2.0.4

> 2022-09-23

### Patch Changes

- Update dependencies.
- Updated dependencies
  - @remirror/core-utils@2.0.4

## 2.0.3

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

- Updated dependencies
  - @remirror/core-utils@2.0.3

## 2.0.2

> 2022-09-21

### Patch Changes

- Decorate the `insertHorizontalRule` command
- Updated dependencies
  - @remirror/core-utils@2.0.2

## 2.0.1

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.
- Updated dependencies
  - @remirror/core-utils@2.0.1

## 2.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Improve the calculation of changed ranges by utilising mapping
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages to latest versions.
- Removes `domino` from the codebase.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-utils@2.0.0
  - @remirror/core-helpers@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Improve the calculation of changed ranges by utilising mapping
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-utils@2.0.0-beta.19
  - @remirror/core-helpers@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Improve the calculation of changed ranges by utilising mapping
- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.18
  - @remirror/core-utils@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- Improve the calculation of changed ranges by utilising mapping
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.17
  - @remirror/core-utils@2.0.0-beta.17

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Update ProseMirror packages to latest versions.
- Improve the calculation of changed ranges by utilising mapping
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-utils@2.0.0-beta.16
  - @remirror/core-helpers@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Support both ESM and CJS.
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-utils@2.0.0-beta.15
  - @remirror/core-helpers@2.0.0-beta.15

## 2.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-utils@2.0.0-beta.14
  - @remirror/core-helpers@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.13
  - @remirror/core-utils@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.12
  - @remirror/core-utils@2.0.0-beta.12

## 2.0.0-beta.11

> 2022-07-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.11
  - @remirror/core-utils@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.10
  - @remirror/core-utils@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.9
  - @remirror/core-utils@2.0.0-beta.9

## 2.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages to latest versions.
- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.8
  - @remirror/core-utils@2.0.0-beta.8

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Update ProseMirror packages to latest versions.
- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.7
  - @remirror/core-utils@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.6
  - @remirror/core-utils@2.0.0-beta.6

## 2.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-utils@2.0.0-beta.5
  - @remirror/core-helpers@2.0.0-beta.5

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.4
  - @remirror/core-utils@2.0.0-beta.4

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.3
  - @remirror/core-utils@2.0.0-beta.3

## 2.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.2
  - @remirror/core-utils@2.0.0-beta.2

## 2.0.0-beta.1

> 2022-06-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.1
  - @remirror/core-utils@2.0.0-beta.1

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.0
  - @remirror/core-utils@2.0.0-beta.0

## 1.1.18

> 2022-05-31

### Patch Changes

- Lock ProseMirror pacakges to lower versions.

  The latest ProseMirror includes the buit-in TypeScript declaration, which is incompatible with the TypeScript definition in Remirror v1.

  See also: https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624

## 1.1.17

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

* Updated dependencies []:
  - @remirror/core-utils@1.1.10

## 1.1.16

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core-utils@1.1.9

## 1.1.15

> 2022-05-05

### Patch Changes

- Update ProseMirror packages.

## 1.1.14

> 2022-04-20

### Patch Changes

- Fix an error with auto link preventing input rules at the end of a document

- Updated dependencies []:
  - @remirror/core-utils@1.1.8

## 1.1.13

> 2022-04-06

### Patch Changes

- Fix a RangeError when the document is updated during the resizing.

## 1.1.12

> 2022-04-04

### Patch Changes

- Update dependency prosemirror-view.

## 1.1.11

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core-utils@1.1.7

## 1.1.10

> 2022-02-08

### Patch Changes

- Add support for attribute filtering for `useActive` and `useAttrs` hooks when used with marks.

  This provides consistent behaviour for the hook, aligning with functionality provided for node types.

  ```tsx
  const active = useActive();

  // Previously this ignored passed attributes and only checked the mark's type
  //
  // Now this will only return true if mark type is active AND its color attribute is red
  const isActive = active.textColor({ color: 'red' });
  ```

- Updated dependencies []:
  - @remirror/core-utils@1.1.6

## 1.1.9

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core-utils@1.1.5

## 1.1.8

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

## 1.1.7

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.5
  - @remirror/core-utils@1.1.4

## 1.1.6

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4
  - @remirror/core-utils@1.1.3

## 1.1.5

> 2021-11-04

### Patch Changes

- Fix an issue where the resizable view is too tall on a small viewpoint.

## 1.1.4

> 2021-10-24

### Patch Changes

- Fix a bug that causes initial size CSS in resizable view not be set.

## 1.1.3

> 2021-10-24

### Patch Changes

- Make sure that the `width` and `height` attribute of `<img>` and `<iframe>` HTML elements is an integer without a unit.

## 1.1.2

> 2021-10-23

### Patch Changes

- Fixed an issue that causes resizable image's height can't be updated during resizing.

* ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

* Updated dependencies []:
  - @remirror/core-helpers@1.0.3
  - @remirror/core-utils@1.1.2

## 1.1.1

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/core-utils@1.1.1
  - @remirror/core-helpers@1.0.2

## 1.1.0

> 2021-09-13

### Minor Changes

- Add a white border to the handle to make it more recognizable.

## 1.0.1

> 2021-09-04

### Patch Changes

- Don't discard node attributes when resizing.

## 1.0.0

> 2021-07-24

### Major Changes

- [#1023](https://github.com/remirror/remirror/pull/1023) [`0423ce7a8`](https://github.com/remirror/remirror/commit/0423ce7a8d63aaeb2baa4bfd4e7a54647730cab5) Thanks [@ocavue](https://github.com/ocavue)! - Make `ResizableNodeView` as an abstract class.

### Patch Changes

- Updated dependencies [[`0423ce7a8`](https://github.com/remirror/remirror/commit/0423ce7a8d63aaeb2baa4bfd4e7a54647730cab5)]:
  - @remirror/core-utils@1.1.0

## 0.1.1

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies.

## 0.1.0

> 2021-07-17

### Minor Changes

- [#927](https://github.com/remirror/remirror/pull/927) [`e0f1bec4a`](https://github.com/remirror/remirror/commit/e0f1bec4a1e8073ce8f5500d62193e52321155b9) Thanks [@ocavue](https://github.com/ocavue)! - New `prosemirror-resizable-view` package.

### Patch Changes

- Updated dependencies [[`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8)]:
  - @remirror/core-helpers@1.0.0
