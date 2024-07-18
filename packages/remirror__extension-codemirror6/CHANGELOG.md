# @remirror/extension-codemirror6

## 2.0.0-beta.6

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/core@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.4

## 2.0.0-beta.5

> 2023-11-20

### Major Changes

- 469d7ce8f: Remove deprecated command dry run function `isEnabled`, use `enabled` instead.

  ```tsx
  const { toggleBold } = useCommands();

  const handleClick = useCallback(() => {
    if (toggleBold.isEnabled()) {
      toggleBold();
    }
  }, [toggleBold]);
  ```

  ```diff
  const { toggleBold } = useCommands();

  const handleClick = useCallback(() => {
  -  if (toggleBold.isEnabled()) {
  +  if (toggleBold.enabled()) {
      toggleBold();
    }
  }, [toggleBold]);
  ```

### Patch Changes

- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
  - @remirror/core@3.0.0-beta.5
  - @remirror/pm@3.0.0-beta.3

## 2.0.0-beta.4

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/core@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.2

## 2.0.0-beta.3

> 2023-11-08

### Patch Changes

- Updated dependencies [46e903ed9]
  - @remirror/core@3.0.0-beta.3

## 2.0.0-beta.2

> 2023-11-07

### Patch Changes

- Updated dependencies [47bda7aab]
  - @remirror/core@3.0.0-beta.2

## 2.0.0-beta.1

> 2023-11-06

### Patch Changes

- Updated dependencies [b1d683fdb]
- Updated dependencies [d3954076f]
- Updated dependencies [0e4abae1b]
  - @remirror/pm@3.0.0-beta.1
  - @remirror/core@3.0.0-beta.1

## 2.0.0-beta.0

> 2023-10-06

### Major Changes

- 8f5467ae6: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- Updated dependencies [3f76519f3]
- Updated dependencies [8f5467ae6]
  - @remirror/core@3.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0

## 1.0.14

> 2024-07-17

### Patch Changes

- 7caff8388: Add a validate property to each of the Node or Mark attributes used in Remirror
- Updated dependencies [7caff8388]
- Updated dependencies [7caff8388]
  - @remirror/pm@2.0.9

## 1.0.13

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
- Updated dependencies [e88cf35bb]
  - @remirror/core@2.0.13
  - @remirror/pm@2.0.5

## 1.0.12

> 2023-03-10

### Patch Changes

- Updated dependencies [7a6811d96]
  - @remirror/pm@2.0.4
  - @remirror/core@2.0.12

## 1.0.11

> 2022-12-29

### Patch Changes

- @remirror/core@2.0.11
- @remirror/pm@2.0.3

## 1.0.10

> 2022-12-26

### Patch Changes

- Updated dependencies [2d9ac815b]
  - @remirror/core@2.0.10

## 1.0.9

> 2022-12-10

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/pm@2.0.2
  - @remirror/core@2.0.9

## 1.0.8

> 2022-11-25

### Patch Changes

- @remirror/core@2.0.8

## 1.0.7

> 2022-10-27

### Patch Changes

- Updated dependencies [b637f9f3e]
  - @remirror/pm@2.0.1
  - @remirror/core@2.0.7

## 1.0.6

> 2022-10-11

### Patch Changes

- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.
- Updated dependencies
  - @remirror/core@2.0.6

## 1.0.5

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
- Updated dependencies
  - @remirror/core@2.0.5

## 1.0.4

> 2022-09-23

### Patch Changes

- Update dependencies.
- Updated dependencies
  - @remirror/core@2.0.4

## 1.0.3

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

- Updated dependencies
  - @remirror/core@2.0.3

## 1.0.2

> 2022-09-21

### Patch Changes

- Decorate the `insertHorizontalRule` command
- Make the task list button in `ListButtonGroup` optional

  Add a new hook `useHasExtension` which checks for the presence of an extension in the manager

- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.2

## 1.0.1

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.
- Updated dependencies
  - @remirror/core@2.0.1

## 1.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Improve the calculation of changed ranges by utilising mapping
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Update codemirror to v6.
- Try to require JSDOM implicitly in node environment.
- SSR features are removed.
- Removes `domino` from the codebase.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0
  - @remirror/pm@2.0.0

## 1.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- Try to require JSDOM implicitly in node environment.
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Update codemirror to v6.
- Improve the calculation of changed ranges by utilising mapping
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19

## 1.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- SSR features are removed.
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Improve the calculation of changed ranges by utilising mapping
- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Update codemirror to v6.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18

## 1.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Support both ESM and CJS.
- SSR features are removed.
- Update codemirror to v6.
- Improve the calculation of changed ranges by utilising mapping
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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.17
  - @remirror/core@2.0.0-beta.17

## 1.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Removes `domino` from the codebase.
- Improve the calculation of changed ranges by utilising mapping
- Update codemirror to v6.
- Support both ESM and CJS.
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.16
  - @remirror/core@2.0.0-beta.16

## 1.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Removes `domino` from the codebase.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Support both ESM and CJS.
- Update codemirror to v6.
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.15
  - @remirror/core@2.0.0-beta.15

## 1.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- Update codemirror to v6.
- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.14
  - @remirror/pm@2.0.0-beta.14

## 1.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Update codemirror to v6.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.13
  - @remirror/core@2.0.0-beta.13

## 1.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Update codemirror to v6.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12

## 1.0.0-beta.11

> 2022-07-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Update codemirror to v6.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11

## 1.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Update codemirror to v6.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.10
  - @remirror/core@2.0.0-beta.10

## 1.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Update codemirror to v6.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9

## 1.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- SSR features are removed.
- Update codemirror to v6.
- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.8
  - @remirror/core@2.0.0-beta.8

## 1.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Update codemirror to v6.
- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.7
  - @remirror/pm@2.0.0-beta.7

## 1.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Update codemirror to v6.
- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.6
  - @remirror/core@2.0.0-beta.6

## 1.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- `@remirror/extension-codemirror6` now includes two new commands: `createCodeMirror` and `updateCodeMirror`, which allows you to create and update a CodeMirror block.

### Patch Changes

- Update codemirror to v6.
- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.5
  - @remirror/pm@2.0.0-beta.5

## 1.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update codemirror to v6.
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.4
  - @remirror/core@2.0.0-beta.4

## 1.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Update codemirror to v6.
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.3
  - @remirror/core@2.0.0-beta.3

## 1.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2

## 1.0.0-beta.1

> 2022-06-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.1
  - @remirror/pm@2.0.0-beta.1

## 1.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0

## 0.2.12

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

* Updated dependencies []:
  - @remirror/core@1.4.6

## 0.2.11

> 2022-05-24

### Patch Changes

- Add a built in extension allowing external code to subscribe to document changes.

  ```ts
  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);
  ```

- Updated dependencies []:
  - @remirror/core@1.4.5

## 0.2.10

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core@1.4.4

## 0.2.9

> 2022-04-22

### Patch Changes

- Update dependencies.

## 0.2.8

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3

## 0.2.7

> 2022-04-20

### Patch Changes

- Fix an error with auto link preventing input rules at the end of a document

- Updated dependencies []:
  - @remirror/core@1.4.2

## 0.2.6

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1

## 0.2.5

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0

## 0.2.4

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core@1.3.6

## 0.2.3

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
  - @remirror/core@1.3.5

## 0.2.2

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core@1.3.4

## 0.2.1

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/pm@1.0.10

## 0.2.0

> 2021-12-30

### Minor Changes

- Add a new keybinging `Backspace` to the `codeMirror` node.

  Add a new option `toggleName` to `CodeMirrorExtension`, which is the name of the node that the codeMirror block should toggle back and forth from when pressing `Backspace`.

## 0.1.1

> 2021-12-28

### Patch Changes

- Fixed an input rules issue.

## 0.1.0

> 2021-12-24

### Minor Changes

- First version of `@remirror/extension-codemirror6`.
