# @remirror/react-core

## 3.0.0-beta.4

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/extension-react-component@3.0.0-beta.4
  - @remirror/extension-positioner@3.0.0-beta.4
  - @remirror/react-renderer@3.0.0-beta.4
  - @remirror/preset-react@3.0.0-beta.4
  - @remirror/preset-core@3.0.0-beta.4
  - @remirror/react-utils@3.0.0-beta.2
  - @remirror/theme@3.0.0-beta.2
  - @remirror/core@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.2

## 3.0.0-beta.3

> 2023-11-08

### Patch Changes

- Updated dependencies [46e903ed9]
  - @remirror/core@3.0.0-beta.3
  - @remirror/extension-positioner@3.0.0-beta.3
  - @remirror/extension-react-component@3.0.0-beta.3
  - @remirror/preset-core@3.0.0-beta.3
  - @remirror/preset-react@3.0.0-beta.3
  - @remirror/react-renderer@3.0.0-beta.3

## 3.0.0-beta.2

> 2023-11-07

### Patch Changes

- Updated dependencies [47bda7aab]
  - @remirror/core@3.0.0-beta.2
  - @remirror/extension-positioner@3.0.0-beta.2
  - @remirror/extension-react-component@3.0.0-beta.2
  - @remirror/preset-core@3.0.0-beta.2
  - @remirror/preset-react@3.0.0-beta.2
  - @remirror/react-renderer@3.0.0-beta.2

## 3.0.0-beta.1

> 2023-11-06

### Patch Changes

- Updated dependencies [b1d683fdb]
- Updated dependencies [d3954076f]
- Updated dependencies [0e4abae1b]
  - @remirror/pm@3.0.0-beta.1
  - @remirror/core@3.0.0-beta.1
  - @remirror/preset-core@3.0.0-beta.1
  - @remirror/extension-positioner@3.0.0-beta.1
  - @remirror/extension-react-component@3.0.0-beta.1
  - @remirror/preset-react@3.0.0-beta.1
  - @remirror/react-utils@3.0.0-beta.1
  - @remirror/theme@3.0.0-beta.1
  - @remirror/react-renderer@3.0.0-beta.1

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
  - @remirror/extension-react-component@3.0.0-beta.0
  - @remirror/extension-positioner@3.0.0-beta.0
  - @remirror/react-renderer@3.0.0-beta.0
  - @remirror/preset-react@3.0.0-beta.0
  - @remirror/preset-core@3.0.0-beta.0
  - @remirror/react-utils@3.0.0-beta.0
  - @remirror/theme@3.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0

## 2.0.21

> 2023-07-13

### Patch Changes

- 1b377164c: Add the ability to reset a command chain with `.new()`.

  ```ts
  chain.toggleBold();
  chain.new().toggleItalic().run(); // Only toggleItalic would be run
  ```

  This is automatically executed for you when using the `useChainedCommands()` hook.

  This ensures that when calling the hook multiple times, each command chain is independent of the other.

- Updated dependencies [1b377164c]
  - @remirror/core@2.0.18

## 2.0.20

> 2023-07-06

### Patch Changes

- 28b3b3dc8: Fix the lingui runtime crash `Cannot read properties of undefined (reading "messages")`.

## 2.0.19

> 2023-07-03

### Patch Changes

- 2d3fdc511: Update lingui to latest version
- Updated dependencies [2d3fdc511]
  - @remirror/i18n@2.0.4

## 2.0.18

> 2023-05-24

### Patch Changes

- 60d0a8fd7: Fix the bundled `.d.ts` file for `create-context-hook`.
- Updated dependencies [60d0a8fd7]
  - create-context-state@2.0.2

## 2.0.17

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
- Updated dependencies [e88cf35bb]
  - @remirror/extension-react-component@2.0.13
  - @remirror/extension-positioner@2.1.8
  - @remirror/react-renderer@2.0.13
  - @remirror/preset-react@2.0.14
  - @remirror/preset-core@2.0.16
  - @remirror/react-utils@2.0.5
  - create-context-state@2.0.1
  - @remirror/theme@2.0.7
  - @remirror/core@2.0.13
  - @remirror/i18n@2.0.3
  - @remirror/pm@2.0.5

## 2.0.16

> 2023-03-10

### Patch Changes

- Updated dependencies [7a6811d96]
  - @remirror/pm@2.0.4
  - @remirror/core@2.0.12
  - @remirror/extension-positioner@2.1.7
  - @remirror/extension-react-component@2.0.12
  - @remirror/preset-core@2.0.15
  - @remirror/preset-react@2.0.13
  - @remirror/react-renderer@2.0.12
  - @remirror/react-utils@2.0.4
  - @remirror/theme@2.0.6

## 2.0.15

> 2023-01-15

### Patch Changes

- @remirror/extension-positioner@2.1.6
- @remirror/preset-core@2.0.14

## 2.0.14

> 2022-12-29

### Patch Changes

- @remirror/core@2.0.11
- @remirror/i18n@2.0.2
- @remirror/pm@2.0.3
- @remirror/react-utils@2.0.3
- @remirror/extension-positioner@2.1.5
- @remirror/extension-react-component@2.0.11
- @remirror/preset-core@2.0.13
- @remirror/preset-react@2.0.12
- @remirror/react-renderer@2.0.11
- @remirror/theme@2.0.5

## 2.0.13

> 2022-12-26

### Patch Changes

- Updated dependencies [2d9ac815b]
  - @remirror/core@2.0.10
  - @remirror/extension-positioner@2.1.4
  - @remirror/extension-react-component@2.0.10
  - @remirror/preset-core@2.0.12
  - @remirror/preset-react@2.0.11
  - @remirror/react-renderer@2.0.10

## 2.0.12

> 2022-12-12

### Patch Changes

- 977838001: Expose `useDocChanged` hook

## 2.0.11

> 2022-12-10

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/pm@2.0.2
  - @remirror/core@2.0.9
  - @remirror/extension-positioner@2.1.3
  - @remirror/extension-react-component@2.0.9
  - @remirror/preset-core@2.0.11
  - @remirror/preset-react@2.0.10
  - @remirror/react-renderer@2.0.9
  - @remirror/react-utils@2.0.2
  - @remirror/theme@2.0.4

## 2.0.10

> 2022-11-25

### Patch Changes

- @remirror/preset-core@2.0.10
- @remirror/core@2.0.8
- @remirror/extension-positioner@2.1.2
- @remirror/extension-react-component@2.0.8
- @remirror/preset-react@2.0.9
- @remirror/react-renderer@2.0.8

## 2.0.9

> 2022-11-21

### Patch Changes

- Updated dependencies [d395a8a11]
  - @remirror/theme@2.0.3
  - @remirror/extension-positioner@2.1.1
  - @remirror/preset-react@2.0.8
  - @remirror/preset-core@2.0.9

## 2.0.8

> 2022-10-27

### Patch Changes

- Updated dependencies [3fa267878]
- Updated dependencies [b637f9f3e]
  - @remirror/extension-positioner@2.1.0
  - @remirror/pm@2.0.1
  - @remirror/preset-core@2.0.8
  - @remirror/core@2.0.7
  - @remirror/extension-react-component@2.0.7
  - @remirror/preset-react@2.0.7
  - @remirror/react-renderer@2.0.7
  - @remirror/react-utils@2.0.1
  - @remirror/theme@2.0.2

## 2.0.7

> 2022-10-11

### Patch Changes

- Expose the ability to split and merge cells in the default React tables menu
- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.
- Catch when `posFromDom` returns -1, which causes a thrown error when attempting to resolve the pos
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.1
  - @remirror/extension-positioner@2.0.7
  - @remirror/preset-core@2.0.7
  - @remirror/preset-react@2.0.6
  - @remirror/core@2.0.6
  - @remirror/extension-react-component@2.0.6
  - @remirror/react-renderer@2.0.6

## 2.0.6

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
- Updated dependencies
  - @remirror/core@2.0.5
  - @remirror/extension-positioner@2.0.6
  - @remirror/extension-react-component@2.0.5
  - @remirror/preset-core@2.0.6
  - @remirror/preset-react@2.0.5
  - @remirror/react-renderer@2.0.5

## 2.0.5

> 2022-09-23

### Patch Changes

- Update dependencies.
- Updated dependencies
  - @remirror/core@2.0.4
  - @remirror/extension-positioner@2.0.5
  - @remirror/extension-react-component@2.0.4
  - @remirror/preset-core@2.0.5
  - @remirror/preset-react@2.0.4
  - @remirror/react-renderer@2.0.4

## 2.0.4

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

- Updated dependencies
  - @remirror/core@2.0.3
  - @remirror/extension-positioner@2.0.4
  - @remirror/extension-react-component@2.0.3
  - @remirror/preset-core@2.0.4
  - @remirror/preset-react@2.0.3
  - @remirror/react-renderer@2.0.3

## 2.0.3

> 2022-09-21

### Patch Changes

- Decorate the `insertHorizontalRule` command
- Make the task list button in `ListButtonGroup` optional

  Add a new hook `useHasExtension` which checks for the presence of an extension in the manager

- Updated dependencies
- Updated dependencies
  - @remirror/i18n@2.0.1
  - @remirror/core@2.0.2
  - @remirror/extension-positioner@2.0.3
  - @remirror/extension-react-component@2.0.2
  - @remirror/preset-core@2.0.3
  - @remirror/preset-react@2.0.2
  - @remirror/react-renderer@2.0.2

## 2.0.2

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.
- Updated dependencies
  - @remirror/core@2.0.1
  - @remirror/extension-positioner@2.0.2
  - @remirror/extension-react-component@2.0.1
  - @remirror/preset-core@2.0.2
  - @remirror/preset-react@2.0.1
  - @remirror/react-renderer@2.0.1

## 2.0.1

> 2022-09-19

### Patch Changes

- Adds four new events `doubleClick`, `doubleClickMark`, `tripleClick` and `tripleClickMark`. They have the same interface as the existing `click` and `clickMark` event, but are triggered when the user double or triple clicks.
- Updated dependencies
  - @remirror/extension-positioner@2.0.1
  - @remirror/preset-core@2.0.1

## 2.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Improve the calculation of changed ranges by utilising mapping
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Support both ESM and CJS.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Standardize the `contextmenu` and `hover` events to return event as first parameter
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

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
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
- Updated dependencies
  - @remirror/core@2.0.0
  - @remirror/extension-positioner@2.0.0
  - @remirror/extension-react-component@2.0.0
  - @remirror/preset-core@2.0.0
  - @remirror/preset-react@2.0.0
  - @remirror/react-renderer@2.0.0
  - @remirror/pm@2.0.0
  - @remirror/i18n@2.0.0
  - @remirror/react-utils@2.0.0
  - @remirror/theme@2.0.0
  - create-context-state@2.0.0

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

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- SSR features are removed.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
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
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
- Updated dependencies
  - @remirror/core@2.0.0-beta.19
  - @remirror/extension-positioner@2.0.0-beta.19
  - @remirror/extension-react-component@2.0.0-beta.19
  - @remirror/preset-core@2.0.0-beta.19
  - @remirror/preset-react@2.0.0-beta.19
  - @remirror/react-renderer@2.0.0-beta.19
  - create-context-state@2.0.0-beta.18
  - @remirror/i18n@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19
  - @remirror/react-utils@2.0.0-beta.19
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

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- SSR features are removed.
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

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
- Updated dependencies
  - @remirror/theme@2.0.0-beta.18
  - @remirror/extension-positioner@2.0.0-beta.18
  - @remirror/preset-core@2.0.0-beta.18
  - @remirror/preset-react@2.0.0-beta.18
  - @remirror/core@2.0.0-beta.18
  - @remirror/extension-react-component@2.0.0-beta.18
  - @remirror/react-renderer@2.0.0-beta.18
  - create-context-state@2.0.0-beta.17
  - @remirror/i18n@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18
  - @remirror/react-utils@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- SSR features are removed.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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

- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
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
- Updated dependencies
  - @remirror/pm@2.0.0-beta.17
  - @remirror/core@2.0.0-beta.17
  - @remirror/extension-react-component@2.0.0-beta.17
  - @remirror/extension-positioner@2.0.0-beta.17
  - @remirror/i18n@2.0.0-beta.17
  - @remirror/preset-core@2.0.0-beta.17
  - @remirror/preset-react@2.0.0-beta.17
  - @remirror/react-renderer@2.0.0-beta.17
  - @remirror/react-utils@2.0.0-beta.17
  - @remirror/theme@2.0.0-beta.17
  - create-context-state@2.0.0-beta.16

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

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

- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
- Updated dependencies
  - @remirror/pm@2.0.0-beta.16
  - @remirror/core@2.0.0-beta.16
  - @remirror/extension-positioner@2.0.0-beta.16
  - @remirror/extension-react-component@2.0.0-beta.16
  - @remirror/preset-core@2.0.0-beta.16
  - @remirror/preset-react@2.0.0-beta.16
  - @remirror/react-renderer@2.0.0-beta.16
  - @remirror/theme@2.0.0-beta.16
  - create-context-state@2.0.0-beta.15
  - @remirror/i18n@2.0.0-beta.16
  - @remirror/react-utils@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes `domino` from the codebase.
- Expose the return type of the throttle and debounce helpers
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Support both ESM and CJS.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
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
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.15
  - @remirror/preset-core@2.0.0-beta.15
  - @remirror/pm@2.0.0-beta.15
  - @remirror/core@2.0.0-beta.15
  - @remirror/extension-react-component@2.0.0-beta.15
  - @remirror/preset-react@2.0.0-beta.15
  - @remirror/react-renderer@2.0.0-beta.15
  - @remirror/i18n@2.0.0-beta.15
  - @remirror/react-utils@2.0.0-beta.15
  - @remirror/theme@2.0.0-beta.15
  - create-context-state@2.0.0-beta.14

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

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- SSR features are removed.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
- Updated dependencies
  - @remirror/theme@2.0.0-beta.14
  - @remirror/extension-positioner@2.0.0-beta.14
  - @remirror/preset-core@2.0.0-beta.14
  - @remirror/preset-react@2.0.0-beta.14
  - @remirror/core@2.0.0-beta.14
  - @remirror/extension-react-component@2.0.0-beta.14
  - @remirror/react-renderer@2.0.0-beta.14
  - @remirror/pm@2.0.0-beta.14
  - @remirror/i18n@2.0.0-beta.14
  - @remirror/react-utils@2.0.0-beta.14
  - create-context-state@2.0.0-beta.13

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
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
  - @remirror/pm@2.0.0-beta.13
  - @remirror/extension-positioner@2.0.0-beta.13
  - @remirror/preset-core@2.0.0-beta.13
  - @remirror/theme@2.0.0-beta.13
  - @remirror/preset-react@2.0.0-beta.13
  - @remirror/core@2.0.0-beta.13
  - @remirror/extension-react-component@2.0.0-beta.13
  - @remirror/i18n@2.0.0-beta.13
  - @remirror/react-renderer@2.0.0-beta.13
  - @remirror/react-utils@2.0.0-beta.13
  - create-context-state@2.0.0-beta.12

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
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
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
  - create-context-state@2.0.0-beta.11
  - @remirror/core@2.0.0-beta.12
  - @remirror/extension-positioner@2.0.0-beta.12
  - @remirror/extension-react-component@2.0.0-beta.12
  - @remirror/i18n@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12
  - @remirror/preset-core@2.0.0-beta.12
  - @remirror/preset-react@2.0.0-beta.12
  - @remirror/react-renderer@2.0.0-beta.12
  - @remirror/react-utils@2.0.0-beta.12
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
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- SSR features are removed.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
  - @remirror/theme@2.0.0-beta.11
  - @remirror/extension-positioner@2.0.0-beta.11
  - @remirror/preset-core@2.0.0-beta.11
  - @remirror/preset-react@2.0.0-beta.11
  - @remirror/core@2.0.0-beta.11
  - @remirror/extension-react-component@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11
  - @remirror/i18n@2.0.0-beta.11
  - @remirror/react-renderer@2.0.0-beta.11
  - @remirror/react-utils@2.0.0-beta.11
  - create-context-state@2.0.0-beta.10

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
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
- Updated dependencies
  - @remirror/pm@2.0.0-beta.10
  - @remirror/core@2.0.0-beta.10
  - @remirror/extension-positioner@2.0.0-beta.10
  - @remirror/extension-react-component@2.0.0-beta.10
  - @remirror/i18n@2.0.0-beta.10
  - @remirror/preset-core@2.0.0-beta.10
  - @remirror/preset-react@2.0.0-beta.10
  - @remirror/react-renderer@2.0.0-beta.10
  - @remirror/react-utils@2.0.0-beta.10
  - @remirror/theme@2.0.0-beta.10
  - create-context-state@2.0.0-beta.9

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
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
- Updated dependencies
  - @remirror/core@2.0.0-beta.9
  - @remirror/extension-react-component@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9
  - @remirror/extension-positioner@2.0.0-beta.9
  - @remirror/i18n@2.0.0-beta.9
  - @remirror/preset-core@2.0.0-beta.9
  - @remirror/preset-react@2.0.0-beta.9
  - @remirror/react-renderer@2.0.0-beta.9
  - @remirror/react-utils@2.0.0-beta.9
  - @remirror/theme@2.0.0-beta.9
  - create-context-state@2.0.0-beta.8

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

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- SSR features are removed.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
- Updated dependencies
  - @remirror/theme@2.0.0-beta.8
  - @remirror/extension-positioner@2.0.0-beta.8
  - @remirror/preset-core@2.0.0-beta.8
  - @remirror/preset-react@2.0.0-beta.8
  - @remirror/pm@2.0.0-beta.8
  - @remirror/core@2.0.0-beta.8
  - @remirror/extension-react-component@2.0.0-beta.8
  - @remirror/react-renderer@2.0.0-beta.8
  - @remirror/i18n@2.0.0-beta.8
  - @remirror/react-utils@2.0.0-beta.8
  - create-context-state@2.0.0-beta.7

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- SSR features are removed.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
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
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
- Updated dependencies
  - @remirror/core@2.0.0-beta.7
  - @remirror/extension-positioner@2.0.0-beta.7
  - @remirror/extension-react-component@2.0.0-beta.7
  - @remirror/preset-core@2.0.0-beta.7
  - @remirror/preset-react@2.0.0-beta.7
  - @remirror/react-renderer@2.0.0-beta.7
  - @remirror/pm@2.0.0-beta.7
  - @remirror/theme@2.0.0-beta.7
  - create-context-state@2.0.0-beta.6
  - @remirror/i18n@2.0.0-beta.7
  - @remirror/react-utils@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Expose the return type of the throttle and debounce helpers
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- SSR features are removed.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
  - @remirror/theme@2.0.0-beta.6
  - @remirror/extension-positioner@2.0.0-beta.6
  - @remirror/preset-core@2.0.0-beta.6
  - @remirror/preset-react@2.0.0-beta.6
  - @remirror/pm@2.0.0-beta.6
  - @remirror/core@2.0.0-beta.6
  - @remirror/extension-react-component@2.0.0-beta.6
  - @remirror/i18n@2.0.0-beta.6
  - @remirror/react-renderer@2.0.0-beta.6
  - @remirror/react-utils@2.0.0-beta.6
  - create-context-state@2.0.0-beta.5

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
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.5
  - @remirror/extension-positioner@2.0.0-beta.5
  - @remirror/extension-react-component@2.0.0-beta.5
  - @remirror/preset-core@2.0.0-beta.5
  - @remirror/preset-react@2.0.0-beta.5
  - @remirror/react-renderer@2.0.0-beta.5
  - @remirror/i18n@2.0.0-beta.5
  - @remirror/pm@2.0.0-beta.5
  - @remirror/react-utils@2.0.0-beta.5
  - @remirror/theme@2.0.0-beta.5
  - create-context-state@2.0.0-beta.4

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- SSR features are removed.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
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
  - @remirror/pm@2.0.0-beta.4
  - @remirror/core@2.0.0-beta.4
  - @remirror/extension-positioner@2.0.0-beta.4
  - @remirror/extension-react-component@2.0.0-beta.4
  - @remirror/preset-core@2.0.0-beta.4
  - @remirror/preset-react@2.0.0-beta.4
  - @remirror/react-renderer@2.0.0-beta.4
  - @remirror/i18n@2.0.0-beta.4
  - @remirror/react-utils@2.0.0-beta.4
  - @remirror/theme@2.0.0-beta.4
  - create-context-state@2.0.0-beta.3

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.3
  - @remirror/core@2.0.0-beta.3
  - @remirror/extension-react-component@2.0.0-beta.3
  - @remirror/extension-positioner@2.0.0-beta.3
  - @remirror/i18n@2.0.0-beta.3
  - @remirror/preset-core@2.0.0-beta.3
  - @remirror/preset-react@2.0.0-beta.3
  - @remirror/react-renderer@2.0.0-beta.3
  - @remirror/react-utils@2.0.0-beta.3
  - @remirror/theme@2.0.0-beta.3
  - create-context-state@2.0.0-beta.2

## 2.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - create-context-state@2.0.0-beta.1
  - @remirror/core@2.0.0-beta.2
  - @remirror/extension-positioner@2.0.0-beta.2
  - @remirror/extension-react-component@2.0.0-beta.2
  - @remirror/i18n@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2
  - @remirror/preset-core@2.0.0-beta.2
  - @remirror/preset-react@2.0.0-beta.2
  - @remirror/react-renderer@2.0.0-beta.2
  - @remirror/react-utils@2.0.0-beta.2
  - @remirror/theme@2.0.0-beta.2

## 2.0.0-beta.1

> 2022-06-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.1
  - @remirror/preset-core@2.0.0-beta.1
  - @remirror/core@2.0.0-beta.1
  - @remirror/extension-react-component@2.0.0-beta.1
  - @remirror/preset-react@2.0.0-beta.1
  - @remirror/react-renderer@2.0.0-beta.1
  - @remirror/i18n@2.0.0-beta.1
  - @remirror/pm@2.0.0-beta.1
  - @remirror/react-utils@2.0.0-beta.1
  - @remirror/theme@2.0.0-beta.1
  - create-context-state@2.0.0-beta.0

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core@2.0.0-beta.0
  - @remirror/extension-react-component@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0
  - @remirror/react-ssr@2.0.0-beta.0
  - @remirror/extension-positioner@2.0.0-beta.0
  - @remirror/extension-react-ssr@2.0.0-beta.0
  - @remirror/i18n@2.0.0-beta.0
  - @remirror/preset-core@2.0.0-beta.0
  - @remirror/preset-react@2.0.0-beta.0
  - @remirror/react-renderer@2.0.0-beta.0
  - @remirror/react-utils@2.0.0-beta.0
  - @remirror/theme@2.0.0-beta.0

## 1.2.3

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

* Updated dependencies []:
  - @remirror/core@1.4.6
  - @remirror/extension-positioner@1.2.7
  - @remirror/extension-react-component@1.1.14
  - @remirror/extension-react-ssr@1.0.26
  - @remirror/preset-core@1.0.29
  - @remirror/preset-react@1.0.28
  - @remirror/react-renderer@1.0.26
  - @remirror/react-ssr@1.0.26

## 1.2.2

> 2022-05-24

### Patch Changes

- Add a built in extension allowing external code to subscribe to document changes.

  ```ts
  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);
  ```

* Add a hook, and 2 React components to simplify subscribing to document changes.

  Adds a `useDocChanged` hook, which when given a handler function, calls it with the transactions and state when document is changed.

  ```js
  import { useCallback } from 'react';
  import { useDocChanged } from '@remirror/react';

  useDocChanged(
    useCallback(({ tr, transactions, state }) => {
      console.log('Transaction', tr);
      console.log('Transactions', transactions);
      console.log('EditorState', state);
    }, []),
  );
  ```

  Also adds two React components, `OnChangeJSON` and `OnChangeHTML` which accept a handler function, which is called with the JSON or HTML serialisation of doc state, whenever the document is changed.

  ```jsx
  import { useCallback } from 'react';
  import { OnChangeJSON, OnChangeHTML } from '@remirror/react';

  const handleChangeJSON = useCallback((json) => {
    console.log('JSON serialised state', json);
  }, []);

  const handleChangeHTML = useCallback((html) => {
    console.log('HTML serialised state', html);
  }, []);

  return (
    <Remirror manager={manager} autoRender>
      <OnChangeJSON onChange={handleChangeJSON} />
      <OnChangeHTML onChange={handleChangeHTML} />
    </Remirror>
  );
  ```

* Updated dependencies []:
  - @remirror/core@1.4.5
  - @remirror/extension-positioner@1.2.6
  - @remirror/extension-react-component@1.1.13
  - @remirror/extension-react-ssr@1.0.25
  - @remirror/preset-core@1.0.28
  - @remirror/preset-react@1.0.27
  - @remirror/react-renderer@1.0.25
  - @remirror/react-ssr@1.0.25

## 1.2.1

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core@1.4.4
  - @remirror/extension-positioner@1.2.5
  - @remirror/extension-react-component@1.1.12
  - @remirror/extension-react-ssr@1.0.24
  - @remirror/preset-core@1.0.27
  - @remirror/preset-react@1.0.26
  - @remirror/react-renderer@1.0.24
  - @remirror/react-ssr@1.0.24

## 1.2.0

> 2022-04-26

### Minor Changes

- Add a new hook `useExtensionEvent`. You can use it to add event handlers to your extension. It's simpler and easier to use than the existed `useExtension` hook.

  It accepts an extension class, an event name and a memoized handler. It's important to make sure that the handler is memoized to avoid needless updates.

  Here is an example of using `useExtensionEvent`:

  ```ts
  import { useCallback } from 'react';
  import { HistoryExtension } from 'remirror/extensions';
  import { useExtensionEvent } from '@remirror/react';

  const RedoLogger = () => {
    useExtensionEvent(
      HistoryExtension,
      'onRedo',
      useCallback(() => log('a redo just happened'), []),
    );

    return null;
  };
  ```

### Patch Changes

- Update dependencies.

* Fix a crash with React v18 in development mode.

* Updated dependencies []:
  - @remirror/extension-react-ssr@1.0.23
  - @remirror/react-renderer@1.0.23
  - @remirror/preset-react@1.0.25
  - @remirror/react-ssr@1.0.23

## 1.1.3

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3
  - @remirror/extension-positioner@1.2.4
  - @remirror/extension-react-component@1.1.11
  - @remirror/extension-react-ssr@1.0.22
  - @remirror/preset-core@1.0.26
  - @remirror/preset-react@1.0.24
  - @remirror/react-renderer@1.0.22
  - @remirror/react-ssr@1.0.22

## 1.1.2

> 2022-04-20

### Patch Changes

- Fix an error with auto link preventing input rules at the end of a document

* Create a "stepping stone" for future standardisation of useEvent types

  Add a second parameter to handlers for `hover` and `contextmenu` types, so we can eventually standarise the hook to pass event as the first argument.

  ```tsx
  const handleHover = useCallback(({ event: MouseEvent }, props: HoverEventHandlerState) => {
    const { getNode, hovering, ...rest } = props;
    console.log('node', getNode(), 'is hovering', hovering, 'rest', rest);

    return false;
  }, []);

  useEvent('hover', handleHover);
  ```

* Updated dependencies []:
  - @remirror/core@1.4.2
  - @remirror/extension-positioner@1.2.3
  - @remirror/extension-react-component@1.1.10
  - @remirror/extension-react-ssr@1.0.21
  - @remirror/preset-core@1.0.25
  - @remirror/preset-react@1.0.23
  - @remirror/react-renderer@1.0.21
  - @remirror/react-ssr@1.0.21

## 1.1.1

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/extension-positioner@1.2.2
  - @remirror/extension-react-component@1.1.9
  - @remirror/extension-react-ssr@1.0.20
  - @remirror/preset-core@1.0.24
  - @remirror/preset-react@1.0.22
  - @remirror/react-renderer@1.0.20
  - @remirror/react-ssr@1.0.20

## 1.1.0

> 2022-03-17

### Minor Changes

- Expose appended transactions via the onChange handler

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/extension-positioner@1.2.1
  - @remirror/extension-react-component@1.1.8
  - @remirror/extension-react-ssr@1.0.19
  - @remirror/preset-core@1.0.23
  - @remirror/preset-react@1.0.21
  - @remirror/react-renderer@1.0.19
  - @remirror/react-ssr@1.0.19

## 1.0.25

> 2022-03-06

### Patch Changes

- `onChange` shouldn't be called if the transaction is canceled by `filterTransaction`.

## 1.0.24

> 2022-03-04

### Patch Changes

- Add the ability to force update positioners with a new command `forceUpdatePositioners`.

  This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.

- Updated dependencies []:
  - @remirror/extension-positioner@1.2.0
  - @remirror/preset-core@1.0.22

## 1.0.23

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core@1.3.6
  - @remirror/extension-positioner@1.1.18
  - @remirror/extension-react-component@1.1.7
  - @remirror/extension-react-ssr@1.0.18
  - @remirror/preset-core@1.0.21
  - @remirror/preset-react@1.0.20
  - @remirror/react-renderer@1.0.18
  - @remirror/react-ssr@1.0.18

## 1.0.22

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/theme@1.2.1
  - @remirror/extension-positioner@1.1.17
  - @remirror/preset-core@1.0.20
  - @remirror/preset-react@1.0.19

## 1.0.21

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
  - @remirror/extension-positioner@1.1.16
  - @remirror/extension-react-component@1.1.6
  - @remirror/extension-react-ssr@1.0.17
  - @remirror/preset-core@1.0.19
  - @remirror/preset-react@1.0.18
  - @remirror/react-renderer@1.0.17
  - @remirror/react-ssr@1.0.17

## 1.0.20

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core@1.3.4
  - @remirror/extension-positioner@1.1.15
  - @remirror/extension-react-component@1.1.5
  - @remirror/extension-react-ssr@1.0.16
  - @remirror/preset-core@1.0.18
  - @remirror/preset-react@1.0.17
  - @remirror/react-renderer@1.0.16
  - @remirror/react-ssr@1.0.16

## 1.0.19

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
  - @remirror/extension-positioner@1.1.14
  - @remirror/preset-core@1.0.17
  - @remirror/preset-react@1.0.16

## 1.0.18

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/pm@1.0.10
  - @remirror/extension-positioner@1.1.13
  - @remirror/extension-react-component@1.1.4
  - @remirror/extension-react-ssr@1.0.15
  - @remirror/preset-core@1.0.16
  - @remirror/preset-react@1.0.15
  - @remirror/react-renderer@1.0.15
  - @remirror/react-ssr@1.0.15
  - @remirror/i18n@1.0.8
  - @remirror/react-utils@1.0.6
  - @remirror/theme@1.1.5

## 1.0.17

> 2021-12-17

### Patch Changes

- Fix types of copy and paste event handlers

- Updated dependencies []:
  - @remirror/extension-positioner@1.1.12
  - @remirror/preset-core@1.0.15

## 1.0.16

> 2021-12-06

### Patch Changes

- Fix an issue that cause `draggable` React node views unable to be draged.

- Updated dependencies []:
  - @remirror/extension-react-component@1.1.3
  - @remirror/extension-react-ssr@1.0.14
  - @remirror/preset-react@1.0.14
  - @remirror/react-ssr@1.0.14

## 1.0.15

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/i18n@1.0.7
  - @remirror/pm@1.0.8
  - @remirror/core@1.3.2
  - @remirror/extension-positioner@1.1.11
  - @remirror/extension-react-component@1.1.2
  - @remirror/extension-react-ssr@1.0.13
  - @remirror/preset-core@1.0.14
  - @remirror/preset-react@1.0.13
  - @remirror/react-renderer@1.0.14
  - @remirror/react-ssr@1.0.13

## 1.0.14

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/extension-positioner@1.1.10
  - @remirror/extension-react-component@1.1.1
  - @remirror/extension-react-ssr@1.0.12
  - @remirror/preset-core@1.0.13
  - @remirror/preset-react@1.0.12
  - @remirror/react-renderer@1.0.13
  - @remirror/react-ssr@1.0.12
  - @remirror/pm@1.0.7

## 1.0.13

> 2021-11-10

### Patch Changes

- Implement the `stopEvent` method in `ReactNodeView`.

* Add new method `hasHandlers` to extensions.

* Updated dependencies []:
  - @remirror/extension-react-component@1.1.0
  - @remirror/extension-react-ssr@1.0.11
  - @remirror/preset-react@1.0.11
  - @remirror/react-ssr@1.0.11
  - @remirror/core@1.3.0
  - @remirror/extension-positioner@1.1.9
  - @remirror/preset-core@1.0.12
  - @remirror/react-renderer@1.0.12

## 1.0.12

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core@1.2.2
  - @remirror/extension-positioner@1.1.8
  - @remirror/extension-react-component@1.0.11
  - @remirror/extension-react-ssr@1.0.10
  - @remirror/i18n@1.0.6
  - @remirror/pm@1.0.6
  - @remirror/preset-core@1.0.11
  - @remirror/preset-react@1.0.10
  - @remirror/react-renderer@1.0.11
  - @remirror/react-ssr@1.0.10
  - @remirror/react-utils@1.0.5

## 1.0.11

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/extension-positioner@1.1.7
  - @remirror/extension-react-component@1.0.10
  - @remirror/extension-react-ssr@1.0.9
  - @remirror/preset-core@1.0.10
  - @remirror/preset-react@1.0.9
  - @remirror/react-renderer@1.0.10
  - @remirror/react-ssr@1.0.9
  - @remirror/i18n@1.0.5
  - @remirror/pm@1.0.4
  - @remirror/react-utils@1.0.4
  - @remirror/theme@1.1.4

## 1.0.10

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
  - @remirror/extension-positioner@1.1.6
  - @remirror/extension-react-component@1.0.9
  - @remirror/extension-react-ssr@1.0.8
  - @remirror/preset-core@1.0.9
  - @remirror/preset-react@1.0.8
  - @remirror/react-renderer@1.0.9
  - @remirror/react-ssr@1.0.8

## 1.0.9

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/i18n@1.0.4
  - @remirror/core@1.1.3
  - @remirror/extension-positioner@1.1.5
  - @remirror/extension-react-component@1.0.8
  - @remirror/extension-react-ssr@1.0.7
  - @remirror/preset-core@1.0.8
  - @remirror/preset-react@1.0.7
  - @remirror/react-renderer@1.0.8
  - @remirror/react-ssr@1.0.7
  - @remirror/pm@1.0.3
  - @remirror/react-utils@1.0.3
  - @remirror/theme@1.1.3

## 1.0.8

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/extension-positioner@1.1.4
  - @remirror/extension-react-component@1.0.7
  - @remirror/extension-react-ssr@1.0.6
  - @remirror/preset-core@1.0.7
  - @remirror/preset-react@1.0.6
  - @remirror/react-renderer@1.0.7
  - @remirror/react-ssr@1.0.6

## 1.0.7

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/extension-positioner@1.1.3
  - @remirror/extension-react-component@1.0.6
  - @remirror/extension-react-ssr@1.0.5
  - @remirror/preset-core@1.0.6
  - @remirror/preset-react@1.0.5
  - @remirror/react-renderer@1.0.6
  - @remirror/react-ssr@1.0.5

## 1.0.6

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/theme@1.1.2
  - @remirror/extension-positioner@1.1.2
  - @remirror/preset-core@1.0.5
  - @remirror/preset-react@1.0.4

## 1.0.5

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Don't install `@remirror/theme` as a dependency of `@remirror/core`.

- Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

- Updated dependencies []:
  - @remirror/theme@1.1.1
  - @remirror/extension-positioner@1.1.1
  - @remirror/preset-core@1.0.4
  - @remirror/preset-react@1.0.3
  - @remirror/core@1.1.0
  - @remirror/extension-react-component@1.0.5
  - @remirror/extension-react-ssr@1.0.4
  - @remirror/react-renderer@1.0.5
  - @remirror/react-ssr@1.0.4

## 1.0.4

> 2021-08-26

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - @remirror/extension-positioner@1.1.0
  - @remirror/preset-core@1.0.3

## 1.0.3

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/i18n@1.0.3
  - @remirror/core@1.0.3
  - @remirror/extension-positioner@1.0.2
  - @remirror/extension-react-component@1.0.4
  - @remirror/extension-react-ssr@1.0.3
  - @remirror/preset-core@1.0.2
  - @remirror/preset-react@1.0.2
  - @remirror/react-renderer@1.0.4
  - @remirror/react-ssr@1.0.3

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for `react@18` in peer dependencies.

- Updated dependencies [[`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b)]:
  - create-context-state@1.0.1
  - @remirror/extension-react-component@1.0.2
  - @remirror/extension-react-ssr@1.0.2
  - @remirror/react-renderer@1.0.2
  - @remirror/react-ssr@1.0.2
  - @remirror/react-utils@1.0.2

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1
  - @remirror/extension-positioner@1.0.1
  - @remirror/extension-react-component@1.0.1
  - @remirror/extension-react-ssr@1.0.1
  - @remirror/i18n@1.0.1
  - @remirror/pm@1.0.1
  - @remirror/preset-core@1.0.1
  - @remirror/preset-react@1.0.1
  - @remirror/react-renderer@1.0.1
  - @remirror/react-ssr@1.0.1
  - @remirror/react-utils@1.0.1
  - @remirror/theme@1.0.1

## 1.0.0

> 2021-07-17

### Major Changes

- [#975](https://github.com/remirror/remirror/pull/975) [`3feb9188a`](https://github.com/remirror/remirror/commit/3feb9188a6747f496ea4ed224357d268cf1da8cc) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Change `onUpdate` method signature in the `ReactFramework` class.

  This has been done to fix the update issues for controlled editors.

- [#706](https://github.com/remirror/remirror/pull/706) [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Here's what's changed in the beta release.

  - [x] Improved `react` API
  - [x] Full `markdown` support with the `@remirror/extension-markdown` package.
  - [x] Full formatting support
  - [x] i18n support
  - [x] A11y support for react via `reakit`
  - [ ] Component Library (work in progress)
  - [ ] Start adding experimental react native support (mostly done)
  - [ ] Todo list extension (not started)
  - [ ] New math extension (not started)
  - [ ] New pagination extension (not started)
  - [ ] New text wrap extension (not started)

  ### Delayed

  - ~Experimental svelte support~ - This will be added later in the year.

  ## Breaking

  - Upgrade minimum TypeScript version to `4.1`.
  - Editor selection now defaults to the `end` of the document.
  - Rename all `*Parameter` interfaces to `*Props`. With the exception of \[React\]FrameworkParameter which is now \[React\]FrameworkOptions.
  - Remove `Presets` completely. In their place a function that returns a list of `Extension`s should be used. They were clunky, difficult to use and provided little to no value.
  - Add core exports to `remirror` package
  - Add all Extensions and Preset package exports to the `remirror/extensions` subdirectory. It doesn't include framework specific exports which are made available from `@remirror/react`
  - Remove `remirror/react` which has been replaced by `@remirror/react`
  - `@remirror/react` includes which includes all the react exports from all the react packages which can be used with remirror.
  - Remove `@remirror/showcase` - examples have been provided on how to achieve the same effect.
  - Remove `@remirror/react-social`
  - Remove `@remirror/react-wysiwyg`
  - Rename `useRemirror` -> `useRemirrorContext`
  - Replace `useManager` with better `useRemirror` which provides a lot more functionality.
  - Rename `preset-table` to `extension-tables`
  - Rename `preset-list` to `extension-lists`. `ListPreset` is now `BulletListExtension` and `OrderListExtension`.
  - New `createDecorations` extension method for adding decorations to the prosemirror view.
  - Create new decorator pattern for adding `@commands`, `@helper` functions and `@keyBindings`.
  - Deprecate `tags` property on extension and encourage the use of `createTags` which is a method instead.
  - Add `onApplyState` and `onInitState` lifecycle methods.
  - Add `onApplyTransaction` method.
  - Rename interface `CreatePluginReturn` to `CreateExtensionPlugin`.
  - Rewrite the `DropCursor` to support animations and interactions with media.
  - Add support updating the doc attributes.
  - Deprecate top level context methods `focus` and `blur`. They should now be consumed as commands
  - Remove package `@remirror/extension-auto-link`.

  ### `ExtensionStore`

  - Rename `addOrReplacePlugins` to `updatePlugins` in `ExtensionStore`.
  - Remove `reconfigureStatePlugins` and auto apply it for all plugin updating methods.

  One of the big changes is a hugely improved API for `@remirror/react`.

  ### `@remirror/extension-positioner`

  - New `Rect` interface returned by the positioner `x: number; y: number; width: number; height: number;`
  - Added `visible` property which shows if the position currently visible within the editor viewport.
  - Improved scrolling when using the positioner.
  - Fixed a lot of bugs in the positioner API.
  - This DOMRect represents an absolute position within the document. It is up to your consuming component to consume the rect.
  - `@remirror/react-components` exports `PositionerComponent` which internally
  - Renamed the positioners in line with the new functionality.

  ```tsx
  import React from 'react';
  import { fromHtml, toHtml } from 'remirror';
  import { BoldExtension, CorePreset, ItalicExtension } from 'remirror/extension';
  import { Remirror, useRemirror, useRemirrorContext } from '@remirror/react';

  const Editor = () => {
    const { manager, onChange, state } = useRemirror({
      extensions: () => [new BoldExtension(), new ItalicExtension()],
      content: 'asdfasdf',
      stringHandler: '',
    });

    return <Remirror manager={manager} onChange={onChange} state={state} />;
  };
  ```

  When no children are provided to the

  The previous `useRemirror` is now called `useRemirrorContext` since it plucks the context from the outer `Remirror` Component. The `<RemirrorProvider />` has been renamed to `<Remirror />` and automatically renders an editor.

  `useManager` has been marked as `@internal` (although it is still exported) and going forward you should be using `useRemirror` as shown in the above example.

  Per library expected changes.

  ### `@remirror/extension-tables`

  With the new support for extensions which act as parents to other extensions the table extension has now become a preset extension. It is no longer needed and has been renamed to it's initial name

  ### UI Commands

  - Add commands with UI configuration and i18n text descriptions
  - `@command`, `@keyBinding`, `@helper` decorators for more typesafe configuration of extensions.
  - `NameShortcut` keybindings which can be set in the keymap extension
  - `overrides` property

  ### Accessibility as a priority

  Actively test for the following

  - [ ] Screen Readers
  - [ ] Braille display
  - [ ] Zoom functionality
  - [ ] High contrast for the default theme

  ### Caveats around inference

  - Make sure all your commands in an extension are annotated with a return type of `CommandFunction`. Failure to do so will break all type inference wherever the extension is used.

    ```ts
    import { CommandFunction } from 'remirror';
    ```

  - When setting the name of the extension make sure to use `as const` otherwise it will be a string and ruin autocompletion for extension names, nodes and marks.

    ```ts
    class MyExtension extends PlainExtension {
      get name() {
        return 'makeItConst' as const;
      }
    }
    ```

  ### `@remirror/react-hooks`

  - Rename `useKeymap` to `useKeymaps`. The original `useKeymap` now has a different signature.

  ```tsx
  import { useCallback } from 'react';
  import { BoldExtension } from 'remirror/extensions';
  import {
    Remirror,
    useHelpers,
    useKeymap,
    useRemirror,
    useRemirrorContext,
  } from '@remirror/react';

  const hooks = [
    () => {
      const active = useActive();
      const { insertText } = useCommands();
      const boldActive = active.bold();
      const handler = useCallback(() => {
        if (!boldActive) {
          return false;
        }

        return insertText.original('\n\nWoah there!')(props);
      }, [boldActive, insertText]);

      useKeymap('Shift-Enter', handler); // Add the handler to the keypress pattern.
    },
  ];

  const Editor = () => {
    const { manager } = useRemirror({ extensions: () => [new BoldExtension()] });

    return <Remirror manager={manager} hooks={hooks} />;
  };
  ```

  - The `Remirror` component now has a convenient hooks props. The hooks prop takes an array of zero parameter hook functions which are rendered into the `RemirrorContext`. It's a shorthand to writing out your own components. You can see the pattern in use above.

  ### Commands

  There are new hooks for working with commands.

  - Each command has an `original` method attached for using the original command that was used to create the command. The original command has the same type signature as the `(...args: any[]) => CommandFunction`. So you would call it with the command arguments and then also provide the CommandProps. This is useful when composing commands together or using commands within keyBindings which need to return a boolean.

    - You can see the `insertText.original` being used in the `useKeymap` example above.

  - `useCommands()` provides all the commands as hook. `useChainedCommands` provides all the chainable commands.

    ```tsx
    import { useCallback } from 'react';
    import { useChainedCommands, useKeymap } from '@remirror/react';

    function useLetItGo() {
      const chain = useChainedCommands();
      const handler = useCallback(() => {
        chain.selectText('all').insertText('Let it goo 🤫').run();
      }, [chain]);

      // Whenever the user types `a` they let it all go
      useKeymap('a', handler);
    }
    ```

  ### Dependencies

  - Upgrade React to require minimum versions of ^16.14.0 || ^17. This is because of the codebase now using the [new jsx transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).
  - Upgrade TypeScript to a minimum of `4.1`. Several of the new features make use of the new types and it is a requirement to upgrade.
  - General upgrades across all dependencies to using the latest versions.
    - All `prosemirror-*` packages.

  ### Issues addressed

  - Fixes #569
  - Fixes #452
  - Fixes #407
  - Fixes #533
  - Fixes #652
  - Fixes #654
  - Fixes #480
  - Fixes #566
  - Fixes #453
  - Fixes #508
  - Fixes #715
  - Fixes #531
  - Fixes #535
  - Fixes #536
  - Fixes #537
  - Fixes #538
  - Fixes #541
  - Fixes #542
  - Fixes #709
  - Fixes #532
  - Fixes #836
  - Fixes #834
  - Fixes #823
  - Fixes #820
  - Fixes #695
  - Fixes #793
  - Fixes #800
  - Fixes #453
  - Fixes #778
  - Fixes #757
  - Fixes #804
  - Fixes #504
  - Fixes #566
  - Fixes #714
  - Fixes #37

### Minor Changes

- [#706](https://github.com/remirror/remirror/pull/706) [`6568794ad`](https://github.com/remirror/remirror/commit/6568794ad49328dea88fe06ceb1565cc14ae5eb0) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new hook `useSelectedText`. This is always updated to the currently selected text value. `undefined` when the selection is empty, or a non-text selection.

- [#934](https://github.com/remirror/remirror/pull/934) [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339) Thanks [@whawker](https://github.com/whawker)! - Expose useMarkRange React hook

- [#880](https://github.com/remirror/remirror/pull/880) [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `useEditorView` hook for retrieving the `EditorView`.

- [#706](https://github.com/remirror/remirror/pull/706) [`b1fc65313`](https://github.com/remirror/remirror/commit/b1fc65313f5be376bb1128c90f54cd1fa168c5c0) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `useAttrs` hook.

### Patch Changes

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`ce3bd9b06`](https://github.com/remirror/remirror/commit/ce3bd9b069f9d587958c0fc73c8a1d02109e4677), [`0ba71790f`](https://github.com/remirror/remirror/commit/0ba71790fcd0b69fb835e744c6dccace120e6ee7), [`f848ba64b`](https://github.com/remirror/remirror/commit/f848ba64ba686c868c651e004cbbe25e2d405957), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`838a2942d`](https://github.com/remirror/remirror/commit/838a2942df854be80bc74dfdae39786a8bae863b), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0), [`1982aa447`](https://github.com/remirror/remirror/commit/1982aa447706850093d1d544db2c6de2aefa478b), [`f52405b4b`](https://github.com/remirror/remirror/commit/f52405b4b27c579cec8c59b6657e6fb66bcf0e7d)]:
  - @remirror/core@1.0.0
  - @remirror/react-renderer@1.0.0
  - @remirror/extension-positioner@1.0.0
  - create-context-state@1.0.0
  - @remirror/extension-react-component@1.0.0
  - @remirror/extension-react-ssr@1.0.0
  - @remirror/i18n@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/preset-core@1.0.0
  - @remirror/preset-react@1.0.0
  - @remirror/react-ssr@1.0.0
  - @remirror/react-utils@1.0.0
  - @remirror/theme@1.0.0
