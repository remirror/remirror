# @remirror/extension-markdown

## 3.0.2

> 2025-04-24

### Patch Changes

- Updated dependencies [98710d923]
  - @remirror/pm@3.0.1
  - @remirror/extension-react-tables@3.0.2

## 3.0.1

> 2024-08-01

### Patch Changes

- Updated dependencies [38f997dbb]
  - @remirror/core@3.0.1
  - @remirror/extension-react-tables@3.0.1

## 3.0.0

> 2024-07-30

### Major Changes

- f6185b950: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- f6185b950: Forward-port the removal of the validate property from `main`
- f6185b950: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- f6185b950: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
  - @remirror/core@3.0.0
  - @remirror/pm@3.0.0
  - @remirror/extension-react-tables@3.0.0
  - @remirror/messages@3.0.0

## 3.0.0-beta.8

> 2024-07-22

### Patch Changes

- Updated dependencies [bffe2fd61]
  - @remirror/core@3.0.0-beta.8
  - @remirror/messages@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.6
  - @remirror/extension-react-tables@3.0.0-beta.8

## 3.0.0-beta.7

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/messages@3.0.0-beta.5
  - @remirror/core@3.0.0-beta.7
  - @remirror/pm@3.0.0-beta.5

## 3.0.0-beta.6

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/messages@3.0.0-beta.4
  - @remirror/core@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.4

## 3.0.0-beta.5

> 2023-11-20

### Patch Changes

- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
  - @remirror/core@3.0.0-beta.5
  - @remirror/pm@3.0.0-beta.3
  - @remirror/messages@3.0.0-beta.3

## 3.0.0-beta.4

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/messages@3.0.0-beta.2
  - @remirror/core@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.2

## 3.0.0-beta.3

> 2023-11-08

### Patch Changes

- Updated dependencies [46e903ed9]
  - @remirror/core@3.0.0-beta.3

## 3.0.0-beta.2

> 2023-11-07

### Patch Changes

- Updated dependencies [47bda7aab]
  - @remirror/core@3.0.0-beta.2

## 3.0.0-beta.1

> 2023-11-06

### Patch Changes

- Updated dependencies [b1d683fdb]
- Updated dependencies [d3954076f]
- Updated dependencies [0e4abae1b]
  - @remirror/pm@3.0.0-beta.1
  - @remirror/core@3.0.0-beta.1
  - @remirror/messages@3.0.0-beta.1

## 3.0.0-beta.0

> 2023-10-06

### Major Changes

- 8f5467ae6: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- Updated dependencies [3f76519f3]
- Updated dependencies [8f5467ae6]
  - @remirror/core@3.0.0-beta.0
  - @remirror/messages@3.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0

## 2.0.14

> 2024-02-21

### Patch Changes

- 00a41e38f: Fix the html sanitizing on HTML output from markdown. Removed the default html sanitizer because it doesn't provide any security guarantees and it's not been called due to a bug in the markdown extension.

## 2.0.13

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
- Updated dependencies [e88cf35bb]
  - @remirror/messages@2.0.3
  - @remirror/core@2.0.13
  - @remirror/pm@2.0.5

## 2.0.12

> 2023-03-10

### Patch Changes

- Updated dependencies [7a6811d96]
  - @remirror/pm@2.0.4
  - @remirror/core@2.0.12

## 2.0.11

> 2022-12-29

### Patch Changes

- @remirror/core@2.0.11
- @remirror/messages@2.0.2
- @remirror/pm@2.0.3

## 2.0.10

> 2022-12-26

### Patch Changes

- Updated dependencies [2d9ac815b]
  - @remirror/core@2.0.10

## 2.0.9

> 2022-12-10

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/pm@2.0.2
  - @remirror/core@2.0.9

## 2.0.8

> 2022-11-25

### Patch Changes

- @remirror/core@2.0.8

## 2.0.7

> 2022-10-27

### Patch Changes

- Updated dependencies [b637f9f3e]
  - @remirror/pm@2.0.1
  - @remirror/core@2.0.7

## 2.0.6

> 2022-10-11

### Patch Changes

- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.
- Updated dependencies
  - @remirror/core@2.0.6

## 2.0.5

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
- Updated dependencies
  - @remirror/core@2.0.5

## 2.0.4

> 2022-09-23

### Patch Changes

- Update dependencies.
- Fix the default import for `turndown`.
- Updated dependencies
  - @remirror/core@2.0.4

## 2.0.3

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

- Updated dependencies
  - @remirror/core@2.0.3

## 2.0.2

> 2022-09-21

### Patch Changes

- Decorate the `insertHorizontalRule` command
- Make the task list button in `ListButtonGroup` optional

  Add a new hook `useHasExtension` which checks for the presence of an extension in the manager

- Updated dependencies
- Updated dependencies
  - @remirror/messages@2.0.1
  - @remirror/core@2.0.2

## 2.0.1

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.
- Updated dependencies
  - @remirror/core@2.0.1

## 2.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

- Improve the calculation of changed ranges by utilising mapping
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
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
  - @remirror/messages@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- Try to require JSDOM implicitly in node environment.
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
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
  - @remirror/messages@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

- SSR features are removed.
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.18
  - @remirror/messages@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

- Support both ESM and CJS.
- SSR features are removed.
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
  - @remirror/messages@2.0.0-beta.17

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

- Removes `domino` from the codebase.
- Improve the calculation of changed ranges by utilising mapping
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
  - @remirror/messages@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

- Removes `domino` from the codebase.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Support both ESM and CJS.
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
  - @remirror/messages@2.0.0-beta.15

## 2.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
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
  - @remirror/messages@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

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
  - @remirror/messages@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

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
  - @remirror/core@2.0.0-beta.12
  - @remirror/messages@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12

## 2.0.0-beta.11

> 2022-07-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

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
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11
  - @remirror/messages@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

### Patch Changes

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
  - @remirror/pm@2.0.0-beta.10
  - @remirror/core@2.0.0-beta.10
  - @remirror/messages@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

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
  - @remirror/messages@2.0.0-beta.9

## 2.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

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
  - @remirror/pm@2.0.0-beta.8
  - @remirror/core@2.0.0-beta.8
  - @remirror/messages@2.0.0-beta.8

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

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
  - @remirror/messages@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

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
  - @remirror/pm@2.0.0-beta.6
  - @remirror/core@2.0.0-beta.6
  - @remirror/messages@2.0.0-beta.6

## 2.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

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
  - @remirror/messages@2.0.0-beta.5
  - @remirror/pm@2.0.0-beta.5

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

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
  - @remirror/messages@2.0.0-beta.4

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.3
  - @remirror/core@2.0.0-beta.3
  - @remirror/messages@2.0.0-beta.3

## 2.0.0-beta.2

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
  - @remirror/messages@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2

## 2.0.0-beta.1

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
  - @remirror/messages@2.0.0-beta.1
  - @remirror/pm@2.0.0-beta.1

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0
  - @remirror/messages@2.0.0-beta.0

## 1.0.24

> 2022-05-31

### Patch Changes

- Fix rendering and parsing of tasklists in markdown

- Updated dependencies []:
  - @remirror/pm@1.0.20

## 1.0.23

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

* Updated dependencies []:
  - @remirror/core@1.4.6

## 1.0.22

> 2022-05-24

### Patch Changes

- Add a built in extension allowing external code to subscribe to document changes.

  ```ts
  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);
  ```

- Updated dependencies []:
  - @remirror/core@1.4.5

## 1.0.21

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core@1.4.4

## 1.0.20

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3

## 1.0.19

> 2022-04-20

### Patch Changes

- Fix an error with auto link preventing input rules at the end of a document

- Updated dependencies []:
  - @remirror/core@1.4.2

## 1.0.18

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1

## 1.0.17

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0

## 1.0.16

> 2022-02-22

### Patch Changes

- Updated marked to v4 to resolve vunerable dependency alert

* Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

* Updated dependencies []:
  - @remirror/core@1.3.6

## 1.0.15

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

## 1.0.14

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core@1.3.4

## 1.0.13

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/pm@1.0.10
  - @remirror/messages@1.0.6

## 1.0.12

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/pm@1.0.8
  - @remirror/core@1.3.2

## 1.0.11

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/pm@1.0.7

## 1.0.10

> 2021-11-10

### Patch Changes

- Add new method `hasHandlers` to extensions.

- Updated dependencies []:
  - @remirror/core@1.3.0

## 1.0.9

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core@1.2.2
  - @remirror/messages@1.0.5
  - @remirror/pm@1.0.6

## 1.0.8

> 2021-10-23

### Patch Changes

- Update dependency `marked` to v3.

* ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

* Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/messages@1.0.4
  - @remirror/pm@1.0.4

## 1.0.7

> 2021-10-20

### Patch Changes

- Exposes a function `hasUploadingFile` to determine if file uploads are currently taking place.

  When a user drops a file, a file node is created without a href attribute - this attribute is set once the file has uploaded.

  However if a user saves content, before uploads are complete we can be left with "broken" file nodes. This exposed function allows us to check if file uploads are still in progress.

  Addtionally file nodes now render valid DOM attributes. Rather than `href` and `error`, they now render `data-url` and `data-error`.

* **BREAKING CHANGE**: The option `persistentSelectionClass` for `DecorationsExtension` is now `undefined` by default. It needs to be explicitly configured to enable persistent selection. You can set it as `'selection'` to match the default styles provided by `@remirror/styles`.

  If you are using `@remirror/react`, you can enable it like this:

  ```tsx
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

  function Editor(): JSX.Element {
    const { manager } = useRemirror({
      builtin: { persistentSelectionClass: 'selection' },
    });
    return (
      <ThemeProvider>
        <Remirror manager={manager} />
      </ThemeProvider>
    );
  }
  ```

  In the interest of performance, the persistent selection will only be displayed if the editor loses focus.

* Updated dependencies []:
  - @remirror/core@1.2.0

## 1.0.6

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/messages@1.0.3
  - @remirror/core@1.1.3
  - @remirror/pm@1.0.3

## 1.0.5

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2

## 1.0.4

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1

## 1.0.3

> 2021-08-29

### Patch Changes

- Don't install `@remirror/theme` as a dependency of `@remirror/core`.

* Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

* Updated dependencies []:
  - @remirror/core@1.1.0

## 1.0.2

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/core@1.0.3

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1
  - @remirror/messages@1.0.1
  - @remirror/pm@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Minor Changes

- [#706](https://github.com/remirror/remirror/pull/706) [`2214e6054`](https://github.com/remirror/remirror/commit/2214e6054c345a265bfdba6f2004c3047d69901e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `copyAsMarkdown: boolean` option to `MarkdownExtension` which makes transformed the plain copied text into markdown. The option defaults to `false`.

- [#965](https://github.com/remirror/remirror/pull/965) [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new `insertMarkdown` command.

  ```ts
  commands.insertMarkdown('# Heading\nAnd content');
  // => <h1 id="heading">Heading</h1><p>And content</p>
  ```

  The content will be inlined by default if not a block node.

  ```ts
  commands.insertMarkdown('**is bold.**');
  // => <strong>is bold.</strong>
  ```

  To always wrap the content in a block you can pass the following option.

  ```ts
  commands.insertMarkdown('**is bold.**', { alwaysWrapInBlock: true });
  // => <p><strong>is bold.</strong></p>
  ```

### Patch Changes

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0)]:
  - @remirror/core@1.0.0
  - @remirror/messages@1.0.0
  - @remirror/pm@1.0.0
