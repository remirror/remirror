# @remirror/extension-bidi

## 3.0.0-beta.8

> 2024-07-22

### Patch Changes

- Updated dependencies [bffe2fd61]
  - @remirror/core@3.0.0-beta.8
  - @remirror/messages@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.6

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
  - @remirror/pm@3.0.0-beta.0

## 2.0.17

> 2024-07-19

### Patch Changes

- f160fbac1: Drop the explicit `validate` property, added to attributes in 2.0.39

  Some users have reported issues with legacy JSON data in JavaScript repos where attribute types have not been strictly checked (i.e. calling a command with a string attribute value instead of a number).

  The XSS issue in ProseMirror has been largely resolved since the changes added in prosemirror-model 1.22.1, which actively guards against corrupted-attribute XSS attacks in DOMSerializer. This makes the additional protection of an explicit `validate` attribute largely redundant.

## 2.0.16

> 2024-07-17

### Patch Changes

- 7caff8388: Add a validate property to each of the Node or Mark attributes used in Remirror
- Updated dependencies [7caff8388]
- Updated dependencies [7caff8388]
  - @remirror/pm@2.0.9

## 2.0.15

> 2024-07-17

### Patch Changes

- 7caff8388: Add a validate property to each of the Node or Mark attributes used in Remirror
- Updated dependencies [7caff8388]
- Updated dependencies [7caff8388]
  - @remirror/pm@2.0.9

## 2.0.14

> 2023-07-03

### Patch Changes

- 2d3fdc511: Update lingui to latest version
- Updated dependencies [2d3fdc511]
  - @remirror/messages@2.0.5

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

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
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

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
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

### Patch Changes

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0)]:
  - @remirror/core@1.0.0
  - @remirror/messages@1.0.0
  - @remirror/pm@1.0.0

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

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655)]:
  - @remirror/core@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/core@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455)]:
  - @remirror/core@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49

## 1.0.0-next.48

> 2020-10-08

### Patch Changes

- Updated dependencies [[`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e)]:
  - @remirror/core@1.0.0-next.48

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e)]:
  - @remirror/core@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47

## 1.0.0-next.45

> 2020-10-01

### Patch Changes

- Updated dependencies [[`2175be1d`](https://github.com/remirror/remirror/commit/2175be1d4b3fb1d4d1ec7edd8f6054e4e1873fc0)]:
  - @remirror/core@1.0.0-next.45

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/core@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.43

## 1.0.0-next.42

> 2020-09-26

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.42

## 1.0.0-next.41

> 2020-09-26

### Patch Changes

- Updated dependencies [[`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`83217437`](https://github.com/remirror/remirror/commit/8321743733d1aa794c5b5f5b2f07a9e1065d9ac9)]:
  - @remirror/core@1.0.0-next.41

## 1.0.0-next.40

> 2020-09-24

### Patch Changes

- Updated dependencies [[`7c5778ed`](https://github.com/remirror/remirror/commit/7c5778edf123e6a812c77b1fd6181d16887b0fa1), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e)]:
  - @remirror/core@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671), [`efd2e537`](https://github.com/remirror/remirror/commit/efd2e53779666876bb2d9bdcb917923c0a3a6295)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Minor Changes

- [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405) [#686](https://github.com/remirror/remirror/pull/686) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add all extensions to the `Remirror.AllExtensions` interface to support automatic TypeScript inference for every installed extension package.

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405), [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/core@1.0.0-next.37
  - @remirror/pm@1.0.0-next.37

## 1.0.0-next.35

> 2020-09-13

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- Updated dependencies [[`34b0f0b3`](https://github.com/remirror/remirror/commit/34b0f0b3c502e5c43712085b9d0da4f4168797aa), [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec), [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3)]:
  - @remirror/core@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be)]:
  - @remirror/core@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Patch Changes

- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [d47bd78f]
  - @remirror/core@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Patch Changes

- Updated dependencies [[`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`bed5a9e3`](https://github.com/remirror/remirror/commit/bed5a9e37026dcbdee323c921f5c05e15d49c93d)]:
  - @remirror/core@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.31

> 2020-09-03

### Patch Changes

- Updated dependencies [[`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6)]:
  - @remirror/core@1.0.0-next.31

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core@1.0.0-next.29

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- Updated dependencies [[`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d), [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a)]:
  - @remirror/core@1.0.0-next.28
  - @remirror/pm@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
  - @remirror/core@1.0.0-next.24

## 1.0.0-next.22

> 2020-08-17

### Patch Changes

- 45d82746: 💥 Remove `AttributesWithClass`.

  🚀 Add `NodeAttributes` and `MarkAttributes` exports which can be extended in the `Remirror.ExtraNodeAttributes` and `Remirror.ExtraMarkAttributes`.

  🚀 Add `isAllSelection` which checks if the user has selected everything in the active editor.

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
  - @remirror/core@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/core@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/pm@1.0.0-next.20
  - @remirror/core@1.0.0-next.20

## 1.0.0-next.17

> 2020-08-02

### Patch Changes

- Updated dependencies [898c62e0]
  - @remirror/core@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [f032db7e]
- Updated dependencies [a7037832]
- Updated dependencies [6e8b749a]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [982a6b15]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
- Updated dependencies [be9a9c17]
- Updated dependencies [720c9b43]
  - @remirror/core@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [44516da4]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [6c3b278b]
  - @remirror/core@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- 38941404: Switch from static properties to using the `@extensionDecorator` and `@presetDecorator` instead.
- Updated dependencies [d877adb3]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [e45706e5]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [d8aa2432]
  - @remirror/core@1.0.0-next.12

## 1.0.0-next.11

> 2020-07-26

### Patch Changes

- 54461006: Remove the first parameter `extensions` from the lifecycle methods `onCreate`, `onView` and `onDestroy`.

  Switch to using method signatures for extension class methods as discussed in #360. The following methods have been affected:

  ```
  onCreate
  onView
  onStateUpdate
  onDestroy
  createAttributes
  createCommands
  createPlugin
  createExternalPlugins
  createSuggestions
  createHelpers
  fromObject
  onSetOptions
  ```

- Updated dependencies [54461006]
  - @remirror/core@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Patch Changes

- Updated dependencies [6468058a]
  - @remirror/core@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Patch Changes

- Updated dependencies [02fdafff]
  - @remirror/core@1.0.0-next.9

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [9f495078]
- Updated dependencies [5d5970ae]
  - @remirror/core@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Patch Changes

- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
  - @remirror/core@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
