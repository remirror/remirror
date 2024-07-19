# @remirror/core-utils

## 3.0.0-beta.5

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/core-constants@3.0.0-beta.4
  - @remirror/core-helpers@4.0.0-beta.4
  - @remirror/core-types@3.0.0-beta.5
  - @remirror/messages@3.0.0-beta.5
  - @remirror/pm@3.0.0-beta.5

## 3.0.0-beta.4

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/core-constants@3.0.0-beta.3
  - @remirror/core-helpers@4.0.0-beta.3
  - @remirror/core-types@3.0.0-beta.4
  - @remirror/messages@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.4

## 3.0.0-beta.3

> 2023-11-20

### Patch Changes

- Updated dependencies [469d7ce8f]
  - @remirror/core-constants@3.0.0-beta.2
  - @remirror/core-helpers@4.0.0-beta.2
  - @remirror/core-types@3.0.0-beta.3
  - @remirror/pm@3.0.0-beta.3
  - @remirror/messages@3.0.0-beta.3

## 3.0.0-beta.2

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/core-constants@3.0.0-beta.1
  - @remirror/core-helpers@4.0.0-beta.1
  - @remirror/core-types@3.0.0-beta.2
  - @remirror/messages@3.0.0-beta.2
  - @remirror/pm@3.0.0-beta.2

## 3.0.0-beta.1

> 2023-11-06

### Patch Changes

- Updated dependencies [b1d683fdb]
- Updated dependencies [d3954076f]
  - @remirror/pm@3.0.0-beta.1
  - @remirror/core-types@3.0.0-beta.1
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
  - @remirror/core-types@3.0.0-beta.0
  - @remirror/messages@3.0.0-beta.0
  - @remirror/core-constants@3.0.0-beta.0
  - @remirror/core-helpers@4.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0

## 2.0.13

> 2023-07-30

### Patch Changes

- Updated dependencies [2f542ccb0]
  - @remirror/core-helpers@3.0.0
  - @remirror/messages@2.0.6
  - @remirror/pm@2.0.7

## 2.0.12

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
  - @remirror/core-constants@2.0.1
  - @remirror/core-helpers@2.0.2
  - @remirror/core-types@2.0.5
  - @remirror/messages@2.0.3
  - @remirror/pm@2.0.5

## 2.0.11

> 2023-03-10

### Patch Changes

- Updated dependencies [7a6811d96]
  - @remirror/pm@2.0.4
  - @remirror/core-types@2.0.4

## 2.0.10

> 2022-12-29

### Patch Changes

- Updated dependencies [6a93233e2]
  - @remirror/core-helpers@2.0.1
  - @remirror/messages@2.0.2
  - @remirror/pm@2.0.3
  - @remirror/core-types@2.0.3

## 2.0.9

> 2022-12-10

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/pm@2.0.2
  - @remirror/core-types@2.0.2

## 2.0.8

> 2022-11-25

### Patch Changes

- 8bd49f599: Expose a helper for detecting doc changes from the default

## 2.0.7

> 2022-10-27

### Patch Changes

- 3fa267878: Expose the `mergeDOMRects` helper from core utils
- b637f9f3e: Update dependencies.
- Updated dependencies [b637f9f3e]
  - @remirror/pm@2.0.1
  - @remirror/core-types@2.0.1

## 2.0.6

> 2022-10-11

### Patch Changes

- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.

## 2.0.5

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.

## 2.0.4

> 2022-09-23

### Patch Changes

- Update dependencies.

## 2.0.3

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

## 2.0.2

> 2022-09-21

### Patch Changes

- Decorate the `insertHorizontalRule` command
- Updated dependencies
  - @remirror/messages@2.0.1

## 2.0.1

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.

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
  - @remirror/core-helpers@2.0.0
  - @remirror/core-types@2.0.0
  - @remirror/pm@2.0.0
  - @remirror/core-constants@2.0.0
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
  - @remirror/core-constants@2.0.0-beta.19
  - @remirror/core-helpers@2.0.0-beta.19
  - @remirror/core-types@2.0.0-beta.19
  - @remirror/messages@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

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
  - @remirror/core-constants@2.0.0-beta.18
  - @remirror/core-helpers@2.0.0-beta.18
  - @remirror/core-types@2.0.0-beta.18
  - @remirror/messages@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
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
  - @remirror/pm@2.0.0-beta.17
  - @remirror/core-helpers@2.0.0-beta.17
  - @remirror/core-types@2.0.0-beta.17
  - @remirror/core-constants@2.0.0-beta.17
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
  - @remirror/pm@2.0.0-beta.16
  - @remirror/core-constants@2.0.0-beta.16
  - @remirror/core-helpers@2.0.0-beta.16
  - @remirror/core-types@2.0.0-beta.16
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
  - @remirror/core-helpers@2.0.0-beta.15
  - @remirror/messages@2.0.0-beta.15
  - @remirror/core-types@2.0.0-beta.15
  - @remirror/core-constants@2.0.0-beta.15

## 2.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

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
  - @remirror/pm@2.0.0-beta.14
  - @remirror/core-helpers@2.0.0-beta.14
  - @remirror/core-types@2.0.0-beta.14
  - @remirror/core-constants@2.0.0-beta.14
  - @remirror/messages@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

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
  - @remirror/pm@2.0.0-beta.13
  - @remirror/core-helpers@2.0.0-beta.13
  - @remirror/messages@2.0.0-beta.13
  - @remirror/core-constants@2.0.0-beta.13
  - @remirror/core-types@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

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
  - @remirror/core-constants@2.0.0-beta.12
  - @remirror/core-helpers@2.0.0-beta.12
  - @remirror/core-types@2.0.0-beta.12
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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.11
  - @remirror/core-types@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11
  - @remirror/core-constants@2.0.0-beta.11
  - @remirror/messages@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.10
  - @remirror/core-helpers@2.0.0-beta.10
  - @remirror/messages@2.0.0-beta.10
  - @remirror/core-types@2.0.0-beta.10
  - @remirror/core-constants@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.9
  - @remirror/core-types@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9
  - @remirror/core-constants@2.0.0-beta.9
  - @remirror/messages@2.0.0-beta.9

## 2.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.8
  - @remirror/core-helpers@2.0.0-beta.8
  - @remirror/core-types@2.0.0-beta.8
  - @remirror/core-constants@2.0.0-beta.8
  - @remirror/messages@2.0.0-beta.8

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.7
  - @remirror/core-constants@2.0.0-beta.7
  - @remirror/core-helpers@2.0.0-beta.7
  - @remirror/core-types@2.0.0-beta.7
  - @remirror/messages@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.6
  - @remirror/core-helpers@2.0.0-beta.6
  - @remirror/messages@2.0.0-beta.6
  - @remirror/core-constants@2.0.0-beta.6
  - @remirror/core-types@2.0.0-beta.6

## 2.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.5
  - @remirror/messages@2.0.0-beta.5
  - @remirror/pm@2.0.0-beta.5
  - @remirror/core-constants@2.0.0-beta.5
  - @remirror/core-types@2.0.0-beta.5

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.4
  - @remirror/core-helpers@2.0.0-beta.4
  - @remirror/messages@2.0.0-beta.4
  - @remirror/core-types@2.0.0-beta.4
  - @remirror/core-constants@2.0.0-beta.4

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
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.3
  - @remirror/core-helpers@2.0.0-beta.3
  - @remirror/core-types@2.0.0-beta.3
  - @remirror/core-constants@2.0.0-beta.3
  - @remirror/messages@2.0.0-beta.3

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
- Updated dependencies
- Updated dependencies
  - @remirror/core-constants@2.0.0-beta.2
  - @remirror/core-helpers@2.0.0-beta.2
  - @remirror/core-types@2.0.0-beta.2
  - @remirror/messages@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2

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
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.1
  - @remirror/messages@2.0.0-beta.1
  - @remirror/pm@2.0.0-beta.1
  - @remirror/core-types@2.0.0-beta.1
  - @remirror/core-constants@2.0.0-beta.1

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.0
  - @remirror/core-types@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0
  - @remirror/core-constants@2.0.0-beta.0
  - @remirror/messages@2.0.0-beta.0

## 1.1.10

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

## 1.1.9

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

## 1.1.8

> 2022-04-20

### Patch Changes

- Fix an error with auto link preventing input rules at the end of a document

## 1.1.7

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

## 1.1.6

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

## 1.1.5

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

## 1.1.4

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core-constants@1.0.2
  - @remirror/core-helpers@1.0.5
  - @remirror/core-types@1.0.4
  - @remirror/pm@1.0.10
  - @remirror/messages@1.0.6

## 1.1.3

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4
  - @remirror/messages@1.0.5
  - @remirror/pm@1.0.6

## 1.1.2

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core-helpers@1.0.3
  - @remirror/core-types@1.0.3
  - @remirror/messages@1.0.4
  - @remirror/pm@1.0.4

## 1.1.1

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/messages@1.0.3
  - @remirror/core-helpers@1.0.2
  - @remirror/pm@1.0.3
  - @remirror/core-constants@1.0.1
  - @remirror/core-types@1.0.2

## 1.1.0

> 2021-07-24

### Minor Changes

- [#1023](https://github.com/remirror/remirror/pull/1023) [`0423ce7a8`](https://github.com/remirror/remirror/commit/0423ce7a8d63aaeb2baa4bfd4e7a54647730cab5) Thanks [@ocavue](https://github.com/ocavue)! - Add `setStyle` to add styles to a HTML element.

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - `isDomNode` returns false when `document` is not defined.

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core-helpers@1.0.1
  - @remirror/core-types@1.0.1
  - @remirror/messages@1.0.1
  - @remirror/pm@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Minor Changes

- [#891](https://github.com/remirror/remirror/pull/891) [`ac37ea7f4`](https://github.com/remirror/remirror/commit/ac37ea7f4f332d1129b7aeb0a80e19fae6bd2b1c) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for either `jsdom@^16` or `domino@^2` when parsing HTML content in a node environment.

  Both of these are added as peer dependencies and you should install the library you prefer.

* [#965](https://github.com/remirror/remirror/pull/965) [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for the ProseMirror `Fragment` to the `StringHandlerOptions` in `@remirror/core-utils`. Now passing the option `fragment: true` to any string handler will return a `Fragment` rather than a `Node`.

### Patch Changes

- [#934](https://github.com/remirror/remirror/pull/934) [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339) Thanks [@whawker](https://github.com/whawker)! - Expose useMarkRange React hook

* [#905](https://github.com/remirror/remirror/pull/905) [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix `getSelectedWord` to only accept letters and numbers.

- [#920](https://github.com/remirror/remirror/pull/920) [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0) Thanks [@ocavue](https://github.com/ocavue)! - Use `tr.replaceRangeWith` instead of `tr.replaceWith` in inputRule.

* [#917](https://github.com/remirror/remirror/pull/917) [`62a494c14`](https://github.com/remirror/remirror/commit/62a494c143157d2fe0483c010845a4c377e8524c) Thanks [@ocavue](https://github.com/ocavue)! - Use `createAndFill` when creating nodes in a inputRule.

* Updated dependencies [[`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`b6f29f0e3`](https://github.com/remirror/remirror/commit/b6f29f0e3dfa2806023d13e68f34ee57ba5c1ae9)]:
  - @remirror/core-constants@1.0.0
  - @remirror/core-helpers@1.0.0
  - @remirror/core-types@1.0.0
  - @remirror/messages@1.0.0
  - @remirror/pm@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Minor Changes

- [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0) [#830](https://github.com/remirror/remirror/pull/830) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `getActiveNode` function which returns the information for an active node of the provided type.

* [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0) [#830](https://github.com/remirror/remirror/pull/830) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `getMarkRanges` which supports retrieving all the mark ranges from within the provided selection.

### Patch Changes

- [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0) [#830](https://github.com/remirror/remirror/pull/830) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Preserve attributes when toggling a block node. This allows for better support when using `extraAttributes` and fixes [#819](https://github.com/remirror/remirror/issues/819).

- Updated dependencies [[`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0)]:
  - @remirror/core-constants@1.0.0-next.60
  - @remirror/core-helpers@1.0.0-next.60
  - @remirror/core-types@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- [`e69115f1`](https://github.com/remirror/remirror/commit/e69115f141c12c7dd21bd89c716b12b279414364) [#825](https://github.com/remirror/remirror/pull/825) Thanks [@tommoor](https://github.com/tommoor)! - Fix `getMarkRange` not returning the entire mark length, instead stopping at the first change in mark. This fix also resolves the infinite loop described in #823.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.59
  - @remirror/core-helpers@1.0.0-next.59
  - @remirror/core-types@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.58
  - @remirror/core-helpers@1.0.0-next.58
  - @remirror/core-types@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.57
  - @remirror/core-helpers@1.0.0-next.57
  - @remirror/core-types@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.56
  - @remirror/core-helpers@1.0.0-next.56
  - @remirror/core-types@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Minor Changes

- [`ee1ab4f3`](https://github.com/remirror/remirror/commit/ee1ab4f38bc1a169821b66017d5d24eb00275f0f) [#805](https://github.com/remirror/remirror/pull/805) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `GetMarkRange` interface to exports from `@remirror/core-utils`.

* [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3) [#801](https://github.com/remirror/remirror/pull/801) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Improve type signatures of command utility functions to also include an optional range.

### Patch Changes

- [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3) [#801](https://github.com/remirror/remirror/pull/801) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix `getChangedNodeRanges` when resolving content that may no longer be within the range of the full document. This addresses the issues raised in [#797](https://github.com/remirror/remirror/issues/797) and [#764](https://github.com/remirror/remirror/issues/764).

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.55
  - @remirror/core-helpers@1.0.0-next.55
  - @remirror/core-types@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- [`1a0348e7`](https://github.com/remirror/remirror/commit/1a0348e795e1bef83ef31489e0aa3c256da9e434) [#789](https://github.com/remirror/remirror/pull/789) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix `removeMark` when called with `dispatch = undefined`. This means that `command.<NAME>.isEnabled()` checks should all be fixed if they are using `removeMark` as mentioned in [#784](https://github.com/remirror/remirror/issues/784).

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.54
  - @remirror/core-helpers@1.0.0-next.54
  - @remirror/core-types@1.0.0-next.54
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

### Patch Changes

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.53
  - @remirror/core-helpers@1.0.0-next.53
  - @remirror/core-types@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.52
  - @remirror/core-helpers@1.0.0-next.52
  - @remirror/core-types@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/core-constants@1.0.0-next.51
  - @remirror/core-helpers@1.0.0-next.51
  - @remirror/core-types@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Minor Changes

- [`d27c6e1a`](https://github.com/remirror/remirror/commit/d27c6e1aa83bfd59bde0f1659f0989deb66dad24) [#758](https://github.com/remirror/remirror/pull/758) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Support `EditorState | Selection | ResolvedPos` for the `findParentNodeOfType` function.

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455)]:
  - @remirror/core-constants@1.0.0-next.50
  - @remirror/core-helpers@1.0.0-next.50
  - @remirror/core-types@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.49
  - @remirror/core-helpers@1.0.0-next.49
  - @remirror/core-types@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49

## 1.0.0-next.48

> 2020-10-08

### Minor Changes

- [`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e) [#745](https://github.com/remirror/remirror/pull/745) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `isIos` environment flag.

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- [`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update external dependencies.

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e)]:
  - @remirror/core-helpers@1.0.0-next.47
  - @remirror/core-types@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/core-types@1.0.0-next.44
  - @remirror/core-helpers@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Minor Changes

- [`b030cb6e`](https://github.com/remirror/remirror/commit/b030cb6e50cb6fdc045a4680f4861ad145609197) [#728](https://github.com/remirror/remirror/pull/728) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `text` property to the return value from `getMarkRange`. It's a common use case when getting the range of the mark to also extract the text content.

## 1.0.0-next.42

> 2020-09-26

### Minor Changes

- [`9fa07878`](https://github.com/remirror/remirror/commit/9fa078780504bff81d28183ee8cda3b599412cf0) [#721](https://github.com/remirror/remirror/pull/721) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new helpers `getChangedRanges`, `getChangedNodeRanges` and `getChangedNodes` which take a transaction and return a list of changed ranges, node ranges or nodes with positions.

  This is useful for increasing the performance and only checking the parts of the document that have changed between updates.

## 1.0.0-next.40

> 2020-09-24

### Major Changes

- [`add65c90`](https://github.com/remirror/remirror/commit/add65c90162612037e1bf9abd98b6436db9ba6ef) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING:** 💥 Remove exports for `flatten` and `emptyCommandFunction` which are unused in the codebase and not very practical.

  Update API for `findChildrenByAttribute` to only support an object of attributeNames and literal value or predicate value.

  ```ts
  const mergedCells = findChildrenByAttribute({
    node: table,
    attrs: { colspan: 2, id: (_, exists) => exists },
  });
  ```

### Patch Changes

- Updated dependencies [[`4b1d99a6`](https://github.com/remirror/remirror/commit/4b1d99a60c9cf7c652b69967179be39ae5db3ff4), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e)]:
  - @remirror/core-types@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - @remirror/core-helpers@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core-types@1.0.0-next.39
  - @remirror/core-helpers@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`6855ee77`](https://github.com/remirror/remirror/commit/6855ee773bf25a4b30d45a7e09eeab78d6b3f67a)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core-helpers@1.0.0-next.38
  - @remirror/core-types@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/pm@1.0.0-next.37
  - @remirror/core-types@1.0.0-next.37
  - @remirror/core-helpers@1.0.0-next.37

## 1.0.0-next.35

> 2020-09-13

### Minor Changes

- [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `chainableEditorState` which makes the `EditorState` chainable with a shared transaction. Also set the `@remirror/pm` entry point to export types and utility methods. This is now used in the core libraries.

### Patch Changes

- [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9) [#670](https://github.com/remirror/remirror/pull/670) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fixes `toggleList` command to only update the transaction when dispatch is provided \[[#669](https://github.com/remirror/remirror/issues/669)].

* [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

* Updated dependencies [[`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec)]:
  - @remirror/core-constants@1.0.0-next.35
  - @remirror/core-helpers@1.0.0-next.35
  - @remirror/core-types@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0)]:
  - @remirror/core-constants@1.0.0-next.34
  - @remirror/core-helpers@1.0.0-next.34
  - @remirror/core-types@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Minor Changes

- 7a34e15d: Update return signature of `getMarkRange` from `@remirror/core-utils` to also include the `mark` found. Additionally, to better support optional chaining it now returns `undefined` instead of `false` when no range can be found.
- 7a34e15d: Add `invalidMarks` support.

  - Add the ability to disable all input rules if a certain mark is active.
  - Fix the `ItalicExtension` regex which was over eager.
  - Expose `decorationSet` for the `prosemirror-suggest` state.
  - Export `markActiveInRange`, `rangeHasMarks`, `positionHasMarks` from `prosemirror-suggest`.
  - Add helpers `getMarksByTags` and `getNodesByTags` to the `TagsExtension`.

- 7a34e15d: Enable disabling input rules with a `shouldSkip` method. This is now available as a handler for the `InputRulesExtension` via `shouldSkipInputRule`.

  Consuming this API looks something like this.

  ```ts
  import { Dispose, PlainExtension } from 'remirror/core';

  class CoolExtension extends PlainExtension {
    get name() {
      return 'cool';
    }

    onCreate(): Dispose {
      // Add the `shouldSkip` predicate check to this extension.
      return this.store.getExtension(InputRulesExtension).addHandler('shouldSkipInputRule', () => {
        if (something) {
          return true;
        }

        return false;
      });
    }
  }
  ```

### Patch Changes

- 92ed4135: Fix editable mentions support for exiting when text is selected. Also update `getSelection` to support `anchor` and `head` selections.
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [92ed4135]
  - @remirror/core-constants@1.0.0-next.33
  - @remirror/core-types@1.0.0-next.33
  - @remirror/core-helpers@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Minor Changes

- [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847) [#641](https://github.com/remirror/remirror/pull/641) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Move `isEmptyBlockNode` function from `@remirror/extension-positioner` to `@remirror/core-utils`. Re-export to prevent breaking change.

* [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044) [#635](https://github.com/remirror/remirror/pull/635) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `onError` and `stringHandler` methods to the `Remirror.ManagerSettings`.

### Patch Changes

- Updated dependencies [[`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3)]:
  - @remirror/core-constants@1.0.0-next.32
  - @remirror/core-helpers@1.0.0-next.32
  - @remirror/core-types@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.31

> 2020-09-03

### Major Changes

- [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d) [#608](https://github.com/remirror/remirror/pull/608) Thanks [@ifiokjr](https://github.com/ifiokjr)! - 🚀 Update the `onError` handler with a new improved type signature for better management of errors. See the following example.

  ```tsx
  import React from 'react';
  import { InvalidContentHandler, RemirrorProvider } from 'remirror/core';
  import { WysiwygPreset } from 'remirror/preset/wysiwyg';
  import { RemirrorProvider, useManager } from '@remirror/react';

  const EditorWrapper = () => {
    const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
      // Automatically remove all invalid nodes and marks.
      return transformers.remove(json, invalidContent);
    }, []);

    const manager = useManager([new WysiwygPreset()]);

    return (
      <RemirrorProvider manager={manager} onError={onError}>
        <div />
      </RemirrorProvider>
    );
  };
  ```

  - 🚀 Add `set` and `unset` methods to `@remirror/core-helpers`.
  - 🚀 Add `getInvalidContent` export from `@remirror/core-utils`.
  - 🚀 Add logging support for `RemirrorError` for better readability.
  - 🚀 Add new `ErrorConstant.INVALID_CONTENT` constant for content related errors.
  - 🚀 Add `Manager.createEmptyDoc()` instance method for creating any empty doc (with default content) for the current schema.
  - 💥 Remove `Fallback`, `CreateDocumentErrorHandler`, `getLineHeight`, `getPluginMeta`, `getPluginState`, `nodeNameMatchesList` and `setPluginMeta` exports from `@remirror/core-utils`.
  - 💥 Rename `getNearestNonTextNode` function to `getNearestNonTextElement`.
  - 💥 Rename `getNearestNonTextNode` function to `getNearestNonTextElement`.
  - 💥 Rename `StateOrTransactionParameter` interface to `TrStateParameter`.

  General refactor of types to use the `EditorSchema` rather than `any`. If you notice any downstream issues please open an issue.

### Patch Changes

- Updated dependencies [[`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d)]:
  - @remirror/core-helpers@1.0.0-next.31

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- [`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf) [#598](https://github.com/remirror/remirror/pull/598) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix the broken build in production caused by comparing the mangled `Constructor.name` to an expected value.

  - Make `@types/node` an optional peer dependency of `@remirror/core-utils`.

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- Updated dependencies [[`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448)]:
  - @remirror/pm@1.0.0-next.28
  - @remirror/core-helpers@1.0.0-next.28
  - @remirror/core-types@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Minor Changes

- 147d0f2a: 🚀 Now featuring support for `DynamicExtraAttributes` as mentioned in [#387](https://github.com/remirror/remirror/issues/387).

  - Also add support for `action` method being passed to `findChildren`, `findTextNodes`, `findInlineNodes`, `findBlockNodes`, `findChildrenByAttribute`, `findChildrenByNode`, `findChildrenByMark` and `containsNodesOfType`.
  - Deprecate `flattenNodeDescendants`. `findChildren` is now the preferred method and automatically flattens the returned output.

### Patch Changes

- a2bc3bfb: Support for extending the `ExtensionTag` with your own custom types and names to close #465. Deprecates `NodeGroup` and `MarkGroup` which will be removed in a future version.

  - A small breaking change removes some related type exports from `@remirror/core`.
  - Add the ability to `mutateTag` for creating custom tags in custom extensions.
  - Update several to use `tags` as a replacement for the spec group.

- Updated dependencies [a2bc3bfb]
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/core-helpers@1.0.0-next.26
  - @remirror/core-types@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Minor Changes

- 3f2625bf: Add a new mark input rule parameter property, `updateCaptured` which allows the developer to tweak the details of the captured detail rule. This provides a workaround for the a lack of support for the `lookbehind` regex in **Safari** and other browsers.

  Fixes #574.

## 1.0.0-next.22

> 2020-08-17

### Minor Changes

- 45d82746: 💥 Remove `AttributesWithClass`.

  🚀 Add `NodeAttributes` and `MarkAttributes` exports which can be extended in the `Remirror.ExtraNodeAttributes` and `Remirror.ExtraMarkAttributes`.

  🚀 Add `isAllSelection` which checks if the user has selected everything in the active editor.

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/core-types@1.0.0-next.22
  - @remirror/core-helpers@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Major Changes

- 8c34030e: 💥 Remove property `updateSelection` from the `nodeInputRule`, `markInputRule` and `plainInputRule` functions. You should use the new `beforeDispatch` method instead.

  Add new `beforeDispatch` method to the `nodeInputRule`, `markInputRule` and `plainInputRule` parameter. This method allows users to add extra steps to the transaction after a matching input rule has been run and just before it is dispatched.

  ```ts
  import { nodeInputRule } from 'remirror/core';

  nodeInputRule({
    type,
    regexp: /abc/,
    beforeDispatch: ({ tr }) => tr.insertText('hello'),
  });
  ```

### Minor Changes

- baf3f56d: Add `ignoreWhitespace` option to `markInputRule` for ignoring a matching input rule if the capture groups is only whitespace. Apply to all wrapping input rules for `MarkExtension`'s in the `project`.

  Fix #506 `ItalicExtension` issue with input rule being greedy and capturing one preceding character when activated within a text block.

### Patch Changes

- Updated dependencies [3673a0f0]
  - @remirror/core-types@1.0.0-next.21
  - @remirror/core-helpers@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Major Changes

- 6d7edc85: Rename `areSchemaCompatible` to `areSchemasCompatible`.

  Closes #500

### Minor Changes

- 8f9eb16c: Enable `all` selection when setting initial content and focusing on the editor.

  ```tsx
  import React from 'react';
  import { useRemirror } from '@remirror/react';

  const EditorButton = () => {
    const { focus } = useRemirror();

    return <button onClick={() => focus('all')} />;
  };
  ```

### Patch Changes

- 7c603a5e: Ensure the `markInputRule` doesn't reactivate previous marks when rules are nested and activated consecutively. Closes #505
- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- f032db7e: Remove `isEmptyParagraphNode` and `absoluteCoordinates` exports from `@remirror/core-utils`.
- 6e8b749a: Rename `nodeEqualsType` to `isNodeOfType`.
- 6c6d524e: **Breaking Changes** 💥

  Rename `contains` to `containsNodesOfType`.

  Make `isValidPresetConstructor` internal only.

  Remove `EMPTY_CSS_VALUE`, `CSS_ROTATE_PATTERN` from `@remirror/core-constants`.

  Remove method: `clean() | coerce() | fragment() | markFactory() | nodeFactory() | offsetTags() | sequence() | slice() | text() | isTaggedNode() | replaceSelection()` and type: `BaseFactoryParameter | MarkWithAttributes | MarkWithoutAttributes | NodeWithAttributes | NodeWithoutAttributes | TagTracker | TaggedContent | TaggedContentItem | TaggedContentWithText | Tags` exports from `jest-remirror`.

  Remove `SPECIAL_INPUT_KEYS | SPECIAL_KEYS | SPECIAL_MENU_KEYS | SPECIAL_TOGGLE_BUTTON_KEYS` from `multishift`.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [a7037832]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
  - @remirror/core-types@1.0.0-next.16
  - @remirror/core-constants@1.0.0-next.16
  - @remirror/core-helpers@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Major Changes

- cdc5b801: Add three new helpers to `@remirror/core-utils` / `@remirror/core`: `isStateEqual`, `areSchemaCompatible` and `getRemirrorJSON`.

  BREAKING: 💥 Rename `getObjectNode` to `getRemirrorJSON`.

### Minor Changes

- 44516da4: Support `chained` commands and multiple command updates in controlled editors.

  Fixes #418

## 1.0.0-next.12

> 2020-07-28

### Minor Changes

- 19b3595f: `isNodeActive` now matches partial attribute objects. Fixes #385.

### Patch Changes

- Updated dependencies [d8aa2432]
  - @remirror/core-helpers@1.0.0-next.12

## 1.0.0-next.8

> 2020-07-21

### Minor Changes

- a93c83bd: - Add `keepSelection` property to the `replaceText` command function.
  - Prevent mentions from trapping the cursor when arrowing left and right through the mention.
  - Set low priority for `AutoLinkExtension` to prevent `appendTransaction` interfering with mentions.
  - Update extension order in the `SocialPreset`
  - `prosemirror-suggest` - New export `isSelectionExitReason` which let's the user know if the exit was due to a selection change or a character entry.

## 1.0.0-next.6

> 2020-07-20

### Patch Changes

- e06a3623: Upgrade package dependencies.
- Updated dependencies [e06a3623]
  - @remirror/core-constants@1.0.0-next.6
  - @remirror/core-helpers@1.0.0-next.6
  - @remirror/core-types@1.0.0-next.6

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core-types@1.0.0-next.3

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.
- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0

## 0.8.0

### Minor Changes

- c4645570: - Allow toggling between bullet and ordered list and vice versa.
  - Add depth to findParentNode(), findPositionOfNodeBefore(), findPositionOfNodeAfter().
  - Fix findPositionOfNodeBefore(), findPositionOfNodeAfter() returning incorrect start position.

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core-types@0.9.0
  - @remirror/core-helpers@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core-helpers@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/core-helpers@0.7.4
  - @remirror/core-types@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-helpers@0.7.3
  - @remirror/core-constants@0.7.3
  - @remirror/core-types@0.7.3
