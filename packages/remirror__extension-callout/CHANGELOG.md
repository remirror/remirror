# @remirror/extension-callout

## 3.0.0-beta.6

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/messages@3.0.0-beta.4
  - @remirror/theme@3.0.0-beta.4
  - @remirror/core@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.4

## 3.0.0-beta.5

> 2023-11-20

### Patch Changes

- Updated dependencies [469d7ce8f]
- Updated dependencies [9549c8f88]
- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
  - @remirror/core@3.0.0-beta.5
  - @remirror/theme@3.0.0-beta.3
  - @remirror/pm@3.0.0-beta.3
  - @remirror/messages@3.0.0-beta.3

## 3.0.0-beta.4

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/messages@3.0.0-beta.2
  - @remirror/theme@3.0.0-beta.2
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
  - @remirror/theme@3.0.0-beta.1

## 3.0.0-beta.0

> 2023-10-06

### Major Changes

- 3f76519f3: Based on community feedback, we have decided to decouple the core of Remirror from Lingui, an internationalisation (a.k.a. i18n) library.

  Thereby making it possible to use _any_ i18n solution with Remirror 🙌🙌🙌.

  **N.B.** To use the translatable strings provided by Remirror, the i18n library you use needs to support [ICU message formatting](https://formatjs.io/docs/core-concepts/icu-syntax/).

  This change aims to make it **easier to use Remirror in existing applications**, by not imposing _our_ architectural decisions on to you.

  There are example integrations with many different i18n libraries [in our Storybook](https://pr2128-remirror-ocavue.vercel.app/?path=/story/i18n-format-js--basic).

  ### NOTE: "Out-of-the-box" editors unaffected

  If you are using editors provided by the `@remirror/react-editors` package, you are unaffected by these changes. These editors have been updated to keep existing behaviour.

  ## 💥 BREAKING CHANGES! 💥

  ## `i18n` prop removed from the `<Remirror />` root component

  In previous versions of Remirror, the `i18n` prop of the root Remirror component allowed you to pass a customised **Lingui** instance.

  With this version, we want to allow _**any**_ i18n library to be used with Remirror, so the `i18n` prop has been removed, and **replaced with an `i18nFormat` _function_**.

  This allows users to plug in _any_ i18n library, by implementing a definition for this function.

  This function is described by the TypeScript type [`I18nFormatter`](https://github.com/remirror/remirror/blob/32d8d00587f2f0bce8c1fa59164e15b3569a7e96/packages/remirror__core-types/src/core-types.ts#L417-L453).

  #### Example: Using `react-i18next`

  ```tsx
  import { useTranslation } from 'react-i18next';
  import { Remirror, useRemirror } from '@remirror/react';

  const Editor: React.FC = () => {
    const { t } = useTranslation();

    const i18nFormat: I18nFormatter = useCallback(
      (message, values) => {
        // Note only using the message ID here, more on this later
        return t(message.id, values);
      },
      [t],
    );

    const { manager } = useRemirror({
      extensions: () => [
        // Some extensions here
      ],
    });

    return <Remirror manager={manager} i18nFormat={i18nFormat} />;
  };
  ```

  `react-i18next`, like many i18n solutions, requires you define your translatable strings up front, via key-value pairs.

  To facilitate this, the `@remirror/messages` package **now exposes the translatable strings as JSON files**.

  These messages are provided as key value pairs, so they can be loaded into your chosen i18n library.

  Currently, only English locale (`en`) messages are provided.

  ```ts
  import i18n from 'i18next';
  import ICU from 'i18next-icu';
  import { initReactI18next } from 'react-i18next';
  import type { I18nFormatter } from 'remirror';
  import allMessages from '@remirror/messages/en/all-messages.json';

  // or messages for specific extension(s)
  // import boldMessages from '@remirror/messages/en/extension-bold-messages.json';
  // import italicMessages from '@remirror/messages/en/extension-italic-messages.json';

  i18n
    .use(ICU) // Required if using the provided messages from @remirror/messages
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: allMessages,
        },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  ```

  You do not _have_ to use the messages in these key value pairs, you could replace them with your own. They are provided for convenience, and to expose the message IDs Remirror uses.

  ### Restoring the previous behaviour

  If you wish to carry on using Remirror's default i18n solution (powered by Lingui), **you will need to install the `@remirror/i18n` package, as this is now an optional package**.

  #### Example: Continue using `@remirror/i18n`

  Install the i18n package, as it is now optional, and not installed by default.

  ```sh
  npm add @remirror/i18n
  ```

  ```tsx
  import { i18nFormat } from '@remirror/i18n';
  import { Remirror, useRemirror } from '@remirror/react';

  const Editor: React.FC = () => {
    const { manager } = useRemirror({
      extensions: () => [
        // Some extensions here
      ],
    });

    return <Remirror manager={manager} i18nFormat={i18nFormat} />;
  };
  ```

  ## The `useI18n` hook has a different return value

  As a consequence of the above, the `useI18n` no longer returns an _object_ containing the Lingui `i18n` instance.

  It now returns the `i18nFormat` _function_ that was passed to the root `<Remirror />` component.

  #### Before

  ```tsx
  const { t, i18n } = useI18n();
  ```

  #### After

  ```tsx
  const t = useI18n();

  // Where "t" is the same function that was passed via `i18nFormat`
  ```

  ## Feedback

  As always, we value your feedback on how we can improve Remirror. Please raise your proposals via [issues on GitHub](https://github.com/remirror/remirror/issues) or via our [Discord server](https://remirror.io/chat).

- 8f5467ae6: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- Updated dependencies [3f76519f3]
- Updated dependencies [8f5467ae6]
  - @remirror/core@3.0.0-beta.0
  - @remirror/messages@3.0.0-beta.0
  - @remirror/theme@3.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0

## 2.0.16

> 2024-07-17

### Patch Changes

- 7caff8388: Add a validate property to each of the Node or Mark attributes used in Remirror
- Updated dependencies [7caff8388]
- Updated dependencies [7caff8388]
  - @remirror/pm@2.0.9

## 2.0.15

> 2023-07-03

### Patch Changes

- 2d3fdc511: Update lingui to latest version
- Updated dependencies [2d3fdc511]
  - @remirror/messages@2.0.5

## 2.0.14

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
- Updated dependencies [e88cf35bb]
  - @remirror/messages@2.0.3
  - @remirror/theme@2.0.7
  - @remirror/core@2.0.13
  - @remirror/pm@2.0.5

## 2.0.13

> 2023-03-10

### Patch Changes

- Updated dependencies [7a6811d96]
  - @remirror/pm@2.0.4
  - @remirror/core@2.0.12
  - @remirror/theme@2.0.6

## 2.0.12

> 2022-12-29

### Patch Changes

- @remirror/core@2.0.11
- @remirror/messages@2.0.2
- @remirror/pm@2.0.3
- @remirror/theme@2.0.5

## 2.0.11

> 2022-12-26

### Patch Changes

- Updated dependencies [2d9ac815b]
  - @remirror/core@2.0.10

## 2.0.10

> 2022-12-10

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/pm@2.0.2
  - @remirror/core@2.0.9
  - @remirror/theme@2.0.4

## 2.0.9

> 2022-11-25

### Patch Changes

- @remirror/core@2.0.8

## 2.0.8

> 2022-11-21

### Patch Changes

- Updated dependencies [d395a8a11]
  - @remirror/theme@2.0.3

## 2.0.7

> 2022-10-27

### Patch Changes

- Updated dependencies [b637f9f3e]
  - @remirror/pm@2.0.1
  - @remirror/core@2.0.7
  - @remirror/theme@2.0.2

## 2.0.6

> 2022-10-11

### Patch Changes

- Expose the ability to split and merge cells in the default React tables menu
- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.1
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

### Patch Changes

- Improve the calculation of changed ranges by utilising mapping
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes `domino` from the codebase.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0
  - @remirror/pm@2.0.0
  - @remirror/messages@2.0.0
  - @remirror/theme@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- SSR features are removed.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Expose the return type of the throttle and debounce helpers
- Improve the calculation of changed ranges by utilising mapping
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.19
  - @remirror/messages@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19
  - @remirror/theme@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.0-beta.18
  - @remirror/core@2.0.0-beta.18
  - @remirror/messages@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- SSR features are removed.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.17
  - @remirror/core@2.0.0-beta.17
  - @remirror/messages@2.0.0-beta.17
  - @remirror/theme@2.0.0-beta.17

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.16
  - @remirror/core@2.0.0-beta.16
  - @remirror/theme@2.0.0-beta.16
  - @remirror/messages@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Expose the return type of the throttle and debounce helpers
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Support both ESM and CJS.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.15
  - @remirror/core@2.0.0-beta.15
  - @remirror/messages@2.0.0-beta.15
  - @remirror/theme@2.0.0-beta.15

## 2.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
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
- Updated dependencies
  - @remirror/theme@2.0.0-beta.14
  - @remirror/core@2.0.0-beta.14
  - @remirror/pm@2.0.0-beta.14
  - @remirror/messages@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

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
  - @remirror/pm@2.0.0-beta.13
  - @remirror/theme@2.0.0-beta.13
  - @remirror/core@2.0.0-beta.13
  - @remirror/messages@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

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
  - @remirror/core@2.0.0-beta.12
  - @remirror/messages@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12
  - @remirror/theme@2.0.0-beta.12

## 2.0.0-beta.11

> 2022-07-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
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
  - @remirror/theme@2.0.0-beta.11
  - @remirror/core@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11
  - @remirror/messages@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- SSR features are removed.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

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
  - @remirror/pm@2.0.0-beta.10
  - @remirror/core@2.0.0-beta.10
  - @remirror/messages@2.0.0-beta.10
  - @remirror/theme@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
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
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9
  - @remirror/messages@2.0.0-beta.9
  - @remirror/theme@2.0.0-beta.9

## 2.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
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
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.0-beta.8
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
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

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
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.7
  - @remirror/pm@2.0.0-beta.7
  - @remirror/theme@2.0.0-beta.7
  - @remirror/messages@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.0-beta.6
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
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Updated dependencies
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
  - @remirror/theme@2.0.0-beta.5

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
  - @remirror/theme@2.0.0-beta.4

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
  - @remirror/theme@2.0.0-beta.3

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
  - @remirror/theme@2.0.0-beta.2

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
  - @remirror/theme@2.0.0-beta.1

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0
  - @remirror/messages@2.0.0-beta.0
  - @remirror/theme@2.0.0-beta.0

## 1.0.26

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

* Updated dependencies []:
  - @remirror/core@1.4.6

## 1.0.25

> 2022-05-24

### Patch Changes

- Add a built in extension allowing external code to subscribe to document changes.

  ```ts
  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);
  ```

- Updated dependencies []:
  - @remirror/core@1.4.5

## 1.0.24

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core@1.4.4

## 1.0.23

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3

## 1.0.22

> 2022-04-20

### Patch Changes

- Fix an error with auto link preventing input rules at the end of a document

- Updated dependencies []:
  - @remirror/core@1.4.2

## 1.0.21

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1

## 1.0.20

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0

## 1.0.19

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core@1.3.6

## 1.0.18

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/theme@1.2.1

## 1.0.17

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

## 1.0.16

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core@1.3.4

## 1.0.15

> 2022-01-11

### Patch Changes

- Deprecate `getTheme` and `getThemeProps` in favour of new methods `getThemeVar` and `getThemeVarName`.

  This removes a code path that used an ES6 Proxy, which cannot be polyfilled.

  ```
  getTheme((t) => t.color.primary.text) => `var(--rmr-color-primary-text)`

  getThemeProps((t) => t.color.primary.text) => `--rmr-color-primary-text`
  ```

  ```
  getThemeVar('color', 'primary', 'text') => `var(--rmr-color-primary-text)`

  getThemeVarName('color', 'primary', 'text') => `--rmr-color-primary-text`
  ```

- Updated dependencies []:
  - @remirror/theme@1.2.0

## 1.0.14

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/pm@1.0.10
  - @remirror/messages@1.0.6
  - @remirror/theme@1.1.5

## 1.0.13

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/pm@1.0.8
  - @remirror/core@1.3.2

## 1.0.12

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/pm@1.0.7

## 1.0.11

> 2021-11-10

### Patch Changes

- Add new method `hasHandlers` to extensions.

- Updated dependencies []:
  - @remirror/core@1.3.0

## 1.0.10

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core@1.2.2
  - @remirror/messages@1.0.5
  - @remirror/pm@1.0.6

## 1.0.9

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/messages@1.0.4
  - @remirror/pm@1.0.4
  - @remirror/theme@1.1.4

## 1.0.8

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
    const { manager } = useRemirror({ builtin: { persistentSelectionClass: 'selection' } });
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

## 1.0.7

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/messages@1.0.3
  - @remirror/core@1.1.3
  - @remirror/pm@1.0.3
  - @remirror/theme@1.1.3

## 1.0.6

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2

## 1.0.5

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1

## 1.0.4

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/theme@1.1.2

## 1.0.3

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Don't install `@remirror/theme` as a dependency of `@remirror/core`.

- Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

- Updated dependencies []:
  - @remirror/theme@1.1.1
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
  - @remirror/theme@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Minor Changes

- [#980](https://github.com/remirror/remirror/pull/980) [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418) Thanks [@Gaaaga](https://github.com/Gaaaga)! - - Added configurable emoji to the start of the `CalloutExtension`.
  - Added a new type 'blank' to the `CalloutExtension`.

* [#991](https://github.com/remirror/remirror/pull/991) [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c) Thanks [@Gaaaga](https://github.com/Gaaaga)! - Improved the behavior of setting emoji in callout.

### Patch Changes

- [#948](https://github.com/remirror/remirror/pull/948) [`5c981d96d`](https://github.com/remirror/remirror/commit/5c981d96d9344f2507f32a4213bd55c17bfcd92f) Thanks [@whawker](https://github.com/whawker)! - - Add `toBeValidNode` matcher to assert valid marks and content
  - Fix callout extension input rule followed by enter key

* [#937](https://github.com/remirror/remirror/pull/937) [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa) Thanks [@whawker](https://github.com/whawker)! - Prevents callouts and blockquotes containing zero blocks

  Prevent callouts of invalid types being created via parseDOM

  Fixes messages for the callouts commands

* Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0), [`f52405b4b`](https://github.com/remirror/remirror/commit/f52405b4b27c579cec8c59b6657e6fb66bcf0e7d)]:
  - @remirror/core@1.0.0
  - @remirror/messages@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/theme@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`3d3da227`](https://github.com/remirror/remirror/commit/3d3da227fd582d388ed2587f0ccd0ac6e5b6ae73)]:
  - @remirror/core@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3)]:
  - @remirror/core@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764)]:
  - @remirror/core@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Minor Changes

- [`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655) [#775](https://github.com/remirror/remirror/pull/775) Thanks [@whawker](https://github.com/whawker)! - Fixes extensions that were erroneously adding extra attributes to the DOM twice.

  Attributes were correctly added using their toDOM handler, but also incorrectly in their raw form.

  Example

  ```ts
  const linkExtension = new LinkExtension({
    extraAttributes: {
      custom: {
        default: 'my default',
        parseDOM: (dom) => dom.getAttribute('data-custom'),
        toDOM: (attrs) => ['data-custom', attrs.custom],
      },
    },
  });
  ```

  Resulted in

  ```html
  <a data-custom="my default" custom="my default" <!-- extra attribute rendered in raw form -->
    href="https://remirror.io" rel="noopener noreferrer nofollow"></a
  >
  ```

* [`5fd944c6`](https://github.com/remirror/remirror/commit/5fd944c64880ec3e7c60a954d22770ff1c613aee) [#770](https://github.com/remirror/remirror/pull/770) Thanks [@whawker](https://github.com/whawker)! - Prevent callouts being merged when removing content in between callout nodes

### Patch Changes

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655)]:
  - @remirror/core@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Major Changes

- [`bdaa6af7`](https://github.com/remirror/remirror/commit/bdaa6af7d4daf365bd13c491420ce3e04add571e) [#767](https://github.com/remirror/remirror/pull/767) Thanks [@whawker](https://github.com/whawker)! - 🎉 New extension `@remirror/extension-callout`

  This extension adds support for a new callout node.

  These can be used to add `info`, `warning`, `error` or `success` banners to your document.

  The default callout type is `info`, but this can be changed by using the `defaultType` option of `CalloutExtension`.

  ```ts
  import { RemirrorManager } from 'remirror/core';
  import { CalloutExtension } from 'remirror/extension/callout';
  import { CorePreset } from 'remirror/preset/core';

  // Create the callout extension
  const calloutExtension = new CalloutExtension();
  const corePreset = new CorePreset();

  // Create the Editor Manager with the callout extension passed through.
  const manager = RemirrorManager.create([calloutExtension, corePreset]);

  // Pass the dom element to the editor. If you are using `@remirror/react` or
  // other framework wrappers then this is handled for you.
  const element = document.createElement('div');
  document.body.append(element);

  // Add the view to the editor manager.
  manager.addView(element);

  // Wrap with an error callout at the current selection
  manager.store.commands.toggleCallout({ type: 'error' });
  ```

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52
