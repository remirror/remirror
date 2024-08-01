# @remirror/extension-find

## 1.0.1

> 2024-08-01

### Patch Changes

- Updated dependencies [38f997dbb]
  - @remirror/core@3.0.1

## 1.0.0

> 2024-07-30

### Minor Changes

- f6185b950: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- f6185b950: Forward-port the removal of the validate property from `main`
- f6185b950: ## 💥 BREAKING CHANGES! 💥

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

## 1.0.0-beta.8

> 2024-07-22

### Patch Changes

- Updated dependencies [bffe2fd61]
  - @remirror/core@3.0.0-beta.8
  - @remirror/pm@3.0.0-beta.6

## 1.0.0-beta.7

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/core@3.0.0-beta.7
  - @remirror/pm@3.0.0-beta.5

## 1.0.0-beta.6

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/core@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.4

## 1.0.0-beta.5

> 2023-11-20

### Patch Changes

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

- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
  - @remirror/core@3.0.0-beta.5
  - @remirror/pm@3.0.0-beta.3

## 1.0.0-beta.4

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/core@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.2

## 1.0.0-beta.3

> 2023-11-08

### Patch Changes

- Updated dependencies [46e903ed9]
  - @remirror/core@3.0.0-beta.3

## 1.0.0-beta.2

> 2023-11-07

### Patch Changes

- Updated dependencies [47bda7aab]
  - @remirror/core@3.0.0-beta.2

## 1.0.0-beta.1

> 2023-11-06

### Patch Changes

- Updated dependencies [b1d683fdb]
- Updated dependencies [d3954076f]
- Updated dependencies [0e4abae1b]
  - @remirror/pm@3.0.0-beta.1
  - @remirror/core@3.0.0-beta.1

## 1.0.0-beta.0

> 2023-10-06

### Minor Changes

- 8f5467ae6: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- Updated dependencies [3f76519f3]
- Updated dependencies [8f5467ae6]
  - @remirror/core@3.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0

## 0.1.6

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
- Updated dependencies [e88cf35bb]
  - @remirror/core@2.0.13
  - @remirror/pm@2.0.5

## 0.1.5

> 2023-03-10

### Patch Changes

- Updated dependencies [7a6811d96]
  - @remirror/pm@2.0.4
  - @remirror/core@2.0.12

## 0.1.4

> 2022-12-29

### Patch Changes

- @remirror/core@2.0.11
- @remirror/pm@2.0.3

## 0.1.3

> 2022-12-26

### Patch Changes

- Updated dependencies [2d9ac815b]
  - @remirror/core@2.0.10

## 0.1.2

> 2022-12-10

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/pm@2.0.2
  - @remirror/core@2.0.9

## 0.1.1

> 2022-11-25

### Patch Changes

- @remirror/core@2.0.8

## 0.1.0

> 2022-11-02

### Minor Changes

- 8843920bb: Release `@extension/extension-find`.
