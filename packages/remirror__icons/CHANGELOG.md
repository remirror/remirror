# @remirror/icons

## 3.0.0-beta.4

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/core-helpers@4.0.0-beta.4

## 3.0.0-beta.3

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/core-helpers@4.0.0-beta.3

## 3.0.0-beta.2

> 2023-11-20

### Minor Changes

- ae349d806: ## 💥 BREAKING CHANGES! 💥

  ## Removed deprecated `SearchExtension` in favour of `FindExtension`

  TLDR: `SearchExtension` has been removed from Remirror v3 completely, please use `FindExtension` instead.

  `SearchExtension` has been deprecated since we released `FindExtension`, as `FindExtension` offers more features and is more performant.

  Furthermore, as `SearchExtension` was previously exposed directly via `remirror/extensions`, and configurable via `presetWysiwyg` - we have updated both of these access points to expose `FindExtension` instead.

  If using `presetWysiwyg`, the config options for `SearchExtension` will need updating to their `FindExtension` equivalents.

  #### Before: Remirror v2 example

  ```tsx
  import React from 'react';
  import { wysiwygPreset } from 'remirror/extensions';
  import { Remirror, ThemeProvider, ToggleBoldButton, Toolbar, useRemirror } from '@remirror/react';

  const extensions = () =>
    wysiwygPreset({
      alwaysSearch: true,
    });

  const UsingWysiwygPreset = (): JSX.Element => {
    const { manager, state, onChange } = useRemirror({
      extensions: extensions,
      content: '<p>Text to search</p>',
      stringHandler: 'html',
    });

    return (
      <ThemeProvider>
        <Remirror
          manager={manager}
          autoFocus
          onChange={onChange}
          initialContent={state}
          autoRender='end'
        />
      </ThemeProvider>
    );
  };

  export default UsingWysiwygPreset;
  ```

  #### After: Diff for Remirror v3 example

  ```diff
  import React from 'react';
  import { wysiwygPreset } from "remirror/extensions";
  import { Remirror, ThemeProvider, ToggleBoldButton, Toolbar, useRemirror } from '@remirror/react';

  const extensions = () => wysiwygPreset({
  -  alwaysSearch: true,
  +  alwaysFind: true,
  });

  // Rest as above
  ```

  ## Features

  To make the find functionality easy to use "out-of-the-box" we have added a new `<FindButton />` component to the _optional_ `@remirror/react-ui` package.

  This button can be used within a `Toolbar` (also exposed via `@remirror/react-ui`) to present a find and replace popup in the top right of your editor.

  ![A screenshot of the find and replace popup from the FindButton](https://github.com/remirror/remirror/assets/2003804/eaada9b5-fc85-4705-876a-e994d82c5fa8)

  ### Example usage of `FindButton`

  This following example is taken from our [Storybook](https://remirror.vercel.app/?path=/story/extensions-find--basic).

  ```tsx
  import 'remirror/styles/all.css';

  import React from 'react';
  import { wysiwygPreset } from 'remirror/extensions';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
  import { FindButton, Toolbar } from '@remirror/react-ui';

  const FindButtonExample: React.FC = () => {
    const { manager, state, onChange } = useRemirror({
      extensions: wysiwygPreset,
      content:
        '<p>Using the <code>&lt;FindButton /&gt;</code> from <code>@remirror/react-ui</code>.',
      stringHandler: 'html',
    });

    return (
      <ThemeProvider>
        <Remirror
          manager={manager}
          autoFocus
          onChange={onChange}
          initialContent={state}
          autoRender='end'
        >
          <Toolbar>
            <FindButton />
          </Toolbar>
        </Remirror>
      </ThemeProvider>
    );
  };

  export default FindButtonExample;
  ```

### Patch Changes

- @remirror/core-helpers@4.0.0-beta.2

## 3.0.0-beta.1

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/core-helpers@4.0.0-beta.1

## 3.0.0-beta.0

> 2023-10-06

### Major Changes

- 8f5467ae6: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- Updated dependencies [8f5467ae6]
  - @remirror/core-helpers@4.0.0-beta.0

## 2.0.3

> 2023-07-30

### Patch Changes

- Updated dependencies [2f542ccb0]
  - @remirror/core-helpers@3.0.0

## 2.0.2

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
  - @remirror/core-helpers@2.0.2

## 2.0.1

> 2022-12-29

### Patch Changes

- Updated dependencies [6a93233e2]
  - @remirror/core-helpers@2.0.1

## 2.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.17

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.15

## 2.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.12

## 2.0.0-beta.11

> 2022-07-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.9

## 2.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.8

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.6

## 2.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.5

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.4

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.3

## 2.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.2

## 2.0.0-beta.1

> 2022-06-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.1

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.0

## 1.0.7

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.5

## 1.0.6

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

## 1.0.5

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4

## 1.0.4

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core-helpers@1.0.3

## 1.0.3

> 2021-10-01

### Patch Changes

- Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

* Stop hiding error details in production.

* Updated dependencies []:
  - @remirror/core-helpers@1.0.2

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1014](https://github.com/remirror/remirror/pull/1014) [`22115ea9e`](https://github.com/remirror/remirror/commit/22115ea9ed1977d20b7019d065d6a31d39b359eb) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by removing `@remirror/icons/all` and `@remirror/react-icons/all-icons` from the package `@remirror/react-tables-extension`.

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core-helpers@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Patch Changes

- Updated dependencies [[`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8)]:
  - @remirror/core-helpers@1.0.0
