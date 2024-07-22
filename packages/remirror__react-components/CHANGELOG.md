# @remirror/react-components

## 3.0.0-beta.8

> 2024-07-22

### Patch Changes

- Updated dependencies [bffe2fd61]
  - @remirror/core@3.0.0-beta.8
  - multishift@2.0.10-beta.6
  - @remirror/icons@3.0.0-beta.5
  - @remirror/messages@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.6
  - @remirror/react-hooks@3.0.0-beta.8
  - @remirror/react-utils@3.0.0-beta.6
  - @remirror/extension-positioner@3.0.0-beta.8
  - @remirror/react-core@3.0.0-beta.8

## 3.0.0-beta.7

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/extension-positioner@3.0.0-beta.7
  - @remirror/react-hooks@3.0.0-beta.7
  - @remirror/react-utils@3.0.0-beta.5
  - create-context-state@2.0.3-beta.1
  - @remirror/react-core@3.0.0-beta.7
  - @remirror/messages@3.0.0-beta.5
  - @remirror/icons@3.0.0-beta.4
  - @remirror/theme@3.0.0-beta.5
  - @remirror/core@3.0.0-beta.7
  - @remirror/pm@3.0.0-beta.5
  - multishift@2.0.10-beta.5

## 3.0.0-beta.6

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/extension-positioner@3.0.0-beta.6
  - @remirror/react-hooks@3.0.0-beta.6
  - @remirror/react-utils@3.0.0-beta.4
  - create-context-state@2.0.3-beta.0
  - @remirror/react-core@3.0.0-beta.6
  - @remirror/messages@3.0.0-beta.4
  - @remirror/icons@3.0.0-beta.3
  - @remirror/theme@3.0.0-beta.4
  - @remirror/core@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.4
  - multishift@2.0.10-beta.4

## 3.0.0-beta.5

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

- Updated dependencies [469d7ce8f]
- Updated dependencies [ae349d806]
- Updated dependencies [469d7ce8f]
- Updated dependencies [9549c8f88]
- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
  - @remirror/react-hooks@3.0.0-beta.5
  - @remirror/extension-positioner@3.0.0-beta.5
  - @remirror/icons@3.0.0-beta.2
  - @remirror/core@3.0.0-beta.5
  - @remirror/theme@3.0.0-beta.3
  - @remirror/react-core@3.0.0-beta.5
  - @remirror/pm@3.0.0-beta.3
  - @remirror/react-utils@3.0.0-beta.3
  - multishift@2.0.10-beta.3
  - @remirror/messages@3.0.0-beta.3

## 3.0.0-beta.4

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/extension-positioner@3.0.0-beta.4
  - @remirror/react-hooks@3.0.0-beta.4
  - @remirror/react-utils@3.0.0-beta.2
  - @remirror/react-core@3.0.0-beta.4
  - @remirror/messages@3.0.0-beta.2
  - @remirror/icons@3.0.0-beta.1
  - @remirror/theme@3.0.0-beta.2
  - @remirror/core@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.2
  - multishift@2.0.10-beta.2

## 3.0.0-beta.3

> 2023-11-08

### Patch Changes

- Updated dependencies [46e903ed9]
  - @remirror/core@3.0.0-beta.3
  - @remirror/extension-positioner@3.0.0-beta.3
  - @remirror/react-core@3.0.0-beta.3
  - @remirror/react-hooks@3.0.0-beta.3

## 3.0.0-beta.2

> 2023-11-07

### Patch Changes

- Updated dependencies [47bda7aab]
  - @remirror/core@3.0.0-beta.2
  - @remirror/extension-positioner@3.0.0-beta.2
  - @remirror/react-core@3.0.0-beta.2
  - @remirror/react-hooks@3.0.0-beta.2

## 3.0.0-beta.1

> 2023-11-06

### Patch Changes

- 60a3796b0: Based on community feedback, we have decided to decouple the React core of Remirror from MUI, a popular React component library (but you probably already knew that).

  This means installing `@remirror/react` will no longer bundle `@mui/material` too. The MUI components exposed by `@remirror/react` have been moved to a new _optional_ package - `@remirror/react-ui`.

  This change aims to make it **easier to use Remirror in existing applications**, by not imposing _our_ architectural decisions on to you.

  ### NOTE: "Out-of-the-box" editors unaffected

  If you are using editors provided by the `@remirror/react-editors` package, you are unaffected by these changes. These editors have been updated to keep existing behaviour.

  ## 💥 BREAKING CHANGES! 💥

  ## MUI based components no longer exposed via `@remirror/react`, moved to new _optional_ package.

  In previous versions of Remirror, menus/toolbar/buttons and "find and replace" components were exposed from `@remirror/react`.

  As `@remirror/react` is a required module for Remirror, it meant `@mui/material` was bundled regardless of whether you used these components or not.

  With this version, **these components have been moved to a new _optional_ package** - `@remirror/react-ui`.

  Other than the change in import path, **there should be no changes to the MUI components themselves**. The full list of affected components is included below.

  #### Before: Remirror v2 example

  ```tsx
  import React from 'react';
  import { BoldExtension } from 'remirror/extensions';
  import { Remirror, ThemeProvider, ToggleBoldButton, Toolbar, useRemirror } from '@remirror/react';

  const extensions = () => [new BoldExtension()];

  const ToggleBold = (): JSX.Element => {
    const { manager, state, onChange } = useRemirror({
      extensions: extensions,
      content: '<p>Text in <b>bold</b></p>',
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
            <ToggleBoldButton />
          </Toolbar>
        </Remirror>
      </ThemeProvider>
    );
  };

  export default ToggleBold;
  ```

  #### After: Diff for Remirror v3 example

  ```diff
  import React from 'react';
  import { BoldExtension } from 'remirror/extensions';
  - import { Remirror, ThemeProvider, ToggleBoldButton, Toolbar, useRemirror } from '@remirror/react';
  + import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
  + import { ToggleBoldButton, Toolbar } from '@remirror/react-ui';

  const extensions = () => [new BoldExtension()];

  const ToggleBold = (): JSX.Element => {
    const { manager, state, onChange } = useRemirror({
      extensions: extensions,
      content: '<p>Text in <b>bold</b></p>',
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
            <ToggleBoldButton />
          </Toolbar>
        </Remirror>
      </ThemeProvider>
    );
  };

  export default ToggleBold;
  ```

  ## Features

  As part of our initiative to "play nicer" with existing applications, the MUI components provided by `@remirror/react-ui` **should now utilise any _existing_ MUI theme** (assuming a MUI `ThemeProvider` is present), rather than imposing our _own_ MUI theme.

  If you need access to Remirror's _default_ MUI theme, this is available via the `useRemirrorDefaultMuiTheme` hook.

  ### Full list of affected components

  These components have been moved from `@remirror/react` to the new _optional_ packages `@remirror/react-ui`.

  - `Toolbar`
  - `FloatingToolbar`
  - `MarkdownToolbar`
  - `WysiwygToolbar`
  - `VerticalDivider`
  - `CenterAlignButton`
  - `CommandButton`
  - `CopyButton`
  - `CreateTableButton`
  - `CutButton`
  - `DecreaseFontSizeButton`
  - `DecreaseIndentButton`
  - `DropdownButton`
  - `IncreaseFontSizeButton`
  - `IncreaseIndentButton`
  - `InsertHorizontalRuleButton`
  - `JustifyAlignButton`
  - `LeftAlignButton`
  - `PasteButton`
  - `RedoButton`
  - `RightAlignButton`
  - `ToggleBlockquoteButton`
  - `ToggleBoldButton`
  - `ToggleBulletListButton`
  - `ToggleCalloutButton`
  - `ToggleCodeBlockButton`
  - `ToggleCodeButton`
  - `ToggleColumnsButton`
  - `ToggleHeadingButton`
  - `ToggleItalicButton`
  - `ToggleOrderedListButton`
  - `ToggleStrikeButton`
  - `ToggleSubscriptButton`
  - `ToggleSuperscriptButton`
  - `ToggleTaskListButton`
  - `ToggleUnderlineButton`
  - `ToggleWhitespaceButton`
  - `UndoButton`
  - `BaselineButtonGroup`
  - `BasicFormattingButtonGroup`
  - `CalloutTypeButtonGroup`
  - `CommandButtonGroup`
  - `DataTransferButtonGroup`
  - `FormattingButtonGroup`
  - `HeadingLevelButtonGroup`
  - `HistoryButtonGroup`
  - `IndentationButtonGroup`
  - `ListButtonGroup`
  - `TextAlignmentButtonGroup`
  - `FindReplaceComponent`
  - `CommandMenuItem`
  - `ToggleCalloutMenuItem`
  - `ToggleHeadingMenuItem`

  ## Feedback

  As always, we value your feedback on how we can improve Remirror. Please raise your proposals via [issues on GitHub](https://github.com/remirror/remirror/issues) or via our [Discord server](https://remirror.io/chat).

- Updated dependencies [b1d683fdb]
- Updated dependencies [d3954076f]
- Updated dependencies [0e4abae1b]
  - @remirror/pm@3.0.0-beta.1
  - @remirror/core@3.0.0-beta.1
  - @remirror/extension-positioner@3.0.0-beta.1
  - @remirror/react-core@3.0.0-beta.1
  - @remirror/react-hooks@3.0.0-beta.1
  - multishift@2.0.10-beta.1
  - @remirror/messages@3.0.0-beta.1
  - @remirror/react-utils@3.0.0-beta.1
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
  - @remirror/extension-callout@3.0.0-beta.0
  - @remirror/extension-columns@3.0.0-beta.0
  - @remirror/extension-heading@3.0.0-beta.0
  - @remirror/extension-text-color@3.0.0-beta.0
  - @remirror/messages@3.0.0-beta.0
  - @remirror/react-core@3.0.0-beta.0
  - @remirror/react-hooks@3.0.0-beta.0
  - @remirror/extension-horizontal-rule@3.0.0-beta.0
  - @remirror/extension-node-formatting@3.0.0-beta.0
  - @remirror/extension-blockquote@3.0.0-beta.0
  - @remirror/extension-code-block@3.0.0-beta.0
  - @remirror/extension-positioner@3.0.0-beta.0
  - @remirror/extension-whitespace@3.0.0-beta.0
  - @remirror/extension-font-size@3.0.0-beta.0
  - @remirror/extension-underline@3.0.0-beta.0
  - @remirror/extension-history@3.0.0-beta.0
  - @remirror/extension-italic@3.0.0-beta.0
  - @remirror/extension-strike@3.0.0-beta.0
  - @remirror/extension-tables@3.0.0-beta.0
  - @remirror/extension-bold@3.0.0-beta.0
  - @remirror/extension-code@3.0.0-beta.0
  - @remirror/extension-list@3.0.0-beta.0
  - @remirror/extension-sub@3.0.0-beta.0
  - @remirror/extension-sup@3.0.0-beta.0
  - @remirror/react-utils@3.0.0-beta.0
  - @remirror/icons@3.0.0-beta.0
  - @remirror/theme@3.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0
  - @remirror/extension-find@1.0.0-beta.0
  - multishift@2.0.10-beta.0

## 2.1.17

> 2023-07-13

### Patch Changes

- c0de2e190: Respect floating-ui placement prop.

## 2.1.16

> 2023-07-06

### Patch Changes

- 28b3b3dc8: Fix the lingui runtime crash `Cannot read properties of undefined (reading "messages")`.
- Updated dependencies [28b3b3dc8]
  - @remirror/react-core@2.0.20
  - @remirror/react-hooks@2.0.25

## 2.1.15

> 2023-07-04

### Patch Changes

- ac118c32b: Add `@floating-ui/react` into `dependencies`.

## 2.1.14

> 2023-07-03

### Patch Changes

- 2d3fdc511: Update lingui to latest version
- f1f992510: Replace [Popper](https://popper.js.org/) with [Floating UI](https://floating-ui.com/).
- Updated dependencies [2d3fdc511]
  - @remirror/extension-text-color@2.0.15
  - @remirror/extension-callout@2.0.15
  - @remirror/extension-columns@2.0.14
  - @remirror/extension-heading@2.0.14
  - @remirror/react-core@2.0.19
  - @remirror/messages@2.0.5
  - @remirror/i18n@2.0.4

## 2.1.13

> 2023-06-09

### Patch Changes

- 68f40117d: Prevent `FloatingWrapper` with `renderOutsideEditor` being immediately closed on click.
- Updated dependencies [68f40117d]
  - @remirror/react-hooks@2.0.24

## 2.1.12

> 2023-04-26

### Patch Changes

- e63437575: Increase active index after replace
- 7b2c3928d: Rollup `.d.ts` file.
- 157fd132a: Fixed MUI tooltip error for buttons
- Updated dependencies [7b2c3928d]
- Updated dependencies [e88cf35bb]
  - @remirror/extension-horizontal-rule@2.0.13
  - @remirror/extension-node-formatting@2.0.13
  - @remirror/extension-blockquote@2.0.14
  - @remirror/extension-code-block@2.0.14
  - @remirror/extension-positioner@2.1.8
  - @remirror/extension-text-color@2.0.14
  - @remirror/extension-whitespace@2.0.13
  - @remirror/extension-font-size@2.0.13
  - @remirror/extension-underline@2.0.13
  - @remirror/extension-callout@2.0.14
  - @remirror/extension-columns@2.0.13
  - @remirror/extension-heading@2.0.13
  - @remirror/extension-history@2.0.13
  - @remirror/extension-italic@2.0.13
  - @remirror/extension-strike@2.0.13
  - @remirror/extension-tables@2.2.10
  - @remirror/extension-bold@2.0.13
  - @remirror/extension-code@2.0.13
  - @remirror/extension-find@0.1.6
  - @remirror/extension-list@2.0.16
  - @remirror/extension-sub@2.0.13
  - @remirror/extension-sup@2.0.13
  - @remirror/react-hooks@2.0.22
  - @remirror/react-utils@2.0.5
  - create-context-state@2.0.1
  - @remirror/react-core@2.0.17
  - @remirror/messages@2.0.3
  - @remirror/icons@2.0.2
  - @remirror/theme@2.0.7
  - @remirror/core@2.0.13
  - @remirror/i18n@2.0.3
  - @remirror/pm@2.0.5
  - multishift@2.0.8

## 2.1.11

> 2023-03-10

### Patch Changes

- Updated dependencies [48ee2c2cb]
  - multishift@2.0.7
  - @remirror/react-hooks@2.0.21

## 2.1.10

> 2023-03-10

### Patch Changes

- Updated dependencies [7a6811d96]
  - @remirror/pm@2.0.4
  - @remirror/core@2.0.12
  - @remirror/extension-blockquote@2.0.13
  - @remirror/extension-bold@2.0.12
  - @remirror/extension-callout@2.0.13
  - @remirror/extension-code@2.0.12
  - @remirror/extension-code-block@2.0.13
  - @remirror/extension-columns@2.0.12
  - @remirror/extension-find@0.1.5
  - @remirror/extension-font-size@2.0.12
  - @remirror/extension-heading@2.0.12
  - @remirror/extension-history@2.0.12
  - @remirror/extension-horizontal-rule@2.0.12
  - @remirror/extension-italic@2.0.12
  - @remirror/extension-list@2.0.15
  - @remirror/extension-node-formatting@2.0.12
  - @remirror/extension-positioner@2.1.7
  - @remirror/extension-strike@2.0.12
  - @remirror/extension-sub@2.0.12
  - @remirror/extension-sup@2.0.12
  - @remirror/extension-tables@2.2.9
  - @remirror/extension-text-color@2.0.13
  - @remirror/extension-underline@2.0.12
  - @remirror/extension-whitespace@2.0.12
  - @remirror/react-core@2.0.16
  - @remirror/react-hooks@2.0.20
  - multishift@2.0.6
  - @remirror/react-utils@2.0.4
  - @remirror/theme@2.0.6

## 2.1.9

> 2023-01-15

### Patch Changes

- remirror@2.0.24
- @remirror/extension-positioner@2.1.6
- @remirror/react-hooks@2.0.19
- @remirror/react-core@2.0.15

## 2.1.8

> 2022-12-29

### Patch Changes

- multishift@2.0.5
- remirror@2.0.23
- @remirror/core@2.0.11
- @remirror/i18n@2.0.2
- @remirror/icons@2.0.1
- @remirror/messages@2.0.2
- @remirror/pm@2.0.3
- @remirror/react-utils@2.0.3
- @remirror/react-hooks@2.0.18
- @remirror/extension-find@0.1.4
- @remirror/extension-positioner@2.1.5
- @remirror/extension-text-color@2.0.12
- @remirror/react-core@2.0.14
- @remirror/theme@2.0.5

## 2.1.7

> 2022-12-26

### Patch Changes

- Updated dependencies [2d9ac815b]
  - @remirror/core@2.0.10
  - remirror@2.0.22
  - @remirror/extension-find@0.1.3
  - @remirror/extension-positioner@2.1.4
  - @remirror/extension-text-color@2.0.11
  - @remirror/react-core@2.0.13
  - @remirror/react-hooks@2.0.17

## 2.1.6

> 2022-12-14

### Patch Changes

- remirror@2.0.21

## 2.1.5

> 2022-12-12

### Patch Changes

- Updated dependencies [977838001]
  - @remirror/react-core@2.0.12
  - remirror@2.0.20
  - @remirror/react-hooks@2.0.16

## 2.1.4

> 2022-12-10

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/pm@2.0.2
  - remirror@2.0.19
  - @remirror/core@2.0.9
  - @remirror/extension-find@0.1.2
  - @remirror/extension-positioner@2.1.3
  - @remirror/extension-text-color@2.0.10
  - @remirror/react-core@2.0.11
  - @remirror/react-hooks@2.0.15
  - multishift@2.0.4
  - @remirror/react-utils@2.0.2
  - @remirror/theme@2.0.4

## 2.1.3

> 2022-11-25

### Patch Changes

- remirror@2.0.18
- @remirror/core@2.0.8
- @remirror/react-core@2.0.10
- @remirror/extension-find@0.1.1
- @remirror/extension-positioner@2.1.2
- @remirror/extension-text-color@2.0.9
- @remirror/react-hooks@2.0.14

## 2.1.2

> 2022-11-21

### Patch Changes

- Updated dependencies [d395a8a11]
  - @remirror/theme@2.0.3
  - remirror@2.0.17
  - @remirror/extension-positioner@2.1.1
  - @remirror/extension-text-color@2.0.8
  - @remirror/react-core@2.0.9
  - @remirror/react-hooks@2.0.13

## 2.1.1

> 2022-11-15

### Patch Changes

- Updated dependencies [96422dd3d]
  - multishift@2.0.3
  - @remirror/react-hooks@2.0.12
  - remirror@2.0.16

## 2.1.0

> 2022-11-02

### Minor Changes

- 8843920bb: Add new `<FindReplaceComponent/>` that addes find and replace functionality to your editor.

### Patch Changes

- Updated dependencies [8843920bb]
  - @remirror/extension-find@0.1.0
  - remirror@2.0.15

## 2.0.13

> 2022-10-28

### Patch Changes

- remirror@2.0.14

## 2.0.12

> 2022-10-27

### Patch Changes

- remirror@2.0.13

## 2.0.11

> 2022-10-27

### Patch Changes

- Updated dependencies [3fa267878]
- Updated dependencies [b637f9f3e]
  - @remirror/extension-positioner@2.1.0
  - @remirror/react-hooks@2.0.11
  - @remirror/pm@2.0.1
  - remirror@2.0.12
  - @remirror/react-core@2.0.8
  - @remirror/core@2.0.7
  - @remirror/extension-text-color@2.0.7
  - multishift@2.0.2
  - @remirror/react-utils@2.0.1
  - @remirror/theme@2.0.2

## 2.0.10

> 2022-10-11

### Patch Changes

- Expose the ability to split and merge cells in the default React tables menu
- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.
- Catch when `posFromDom` returns -1, which causes a thrown error when attempting to resolve the pos
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.1
  - remirror@2.0.10
  - @remirror/extension-positioner@2.0.7
  - @remirror/extension-text-color@2.0.6
  - @remirror/react-core@2.0.7
  - @remirror/react-hooks@2.0.10
  - @remirror/core@2.0.6

## 2.0.9

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
- Updated dependencies
  - multishift@2.0.1
  - @remirror/react-hooks@2.0.9
  - remirror@2.0.9
  - @remirror/core@2.0.5
  - @remirror/extension-positioner@2.0.6
  - @remirror/extension-text-color@2.0.5
  - @remirror/react-core@2.0.6

## 2.0.8

> 2022-09-28

### Patch Changes

- Workarounds the import error for `@remirror/extension-emoji` when using `react-scripts start` by not using `.cjs` file extension.
- Updated dependencies
  - remirror@2.0.8
  - @remirror/react-hooks@2.0.8

## 2.0.7

> 2022-09-28

### Patch Changes

- Fixes the import error for `@remirror/extension-emoji` when using `vite dev`.
- Updated dependencies
  - remirror@2.0.7
  - @remirror/react-hooks@2.0.7

## 2.0.6

> 2022-09-27

### Patch Changes

- Fixes the CJS build of `@remirror/extension-emoji`.
- Updated dependencies
  - remirror@2.0.6
  - @remirror/react-hooks@2.0.6

## 2.0.5

> 2022-09-23

### Patch Changes

- Update dependencies.
- Enable display of `sup` and `sub` icon decorations on `CommandButton` via MUI badge

  Add button components for toggling columns, and increase/decreasing font size

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.5
  - @remirror/core@2.0.4
  - @remirror/extension-positioner@2.0.5
  - @remirror/extension-text-color@2.0.4
  - @remirror/react-core@2.0.5
  - @remirror/react-hooks@2.0.5

## 2.0.4

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

- Updated dependencies
  - remirror@2.0.4
  - @remirror/core@2.0.3
  - @remirror/extension-positioner@2.0.4
  - @remirror/extension-text-color@2.0.3
  - @remirror/react-core@2.0.4
  - @remirror/react-hooks@2.0.4

## 2.0.3

> 2022-09-21

### Patch Changes

- Decorate the `insertHorizontalRule` command
- Make the task list button in `ListButtonGroup` optional

  Add a new hook `useHasExtension` which checks for the presence of an extension in the manager

- Add toolbar buttons for text alignment, subscript and superscript, display whitespace, and insert horizontal rule
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.3
  - @remirror/i18n@2.0.1
  - @remirror/messages@2.0.1
  - @remirror/core@2.0.2
  - @remirror/extension-positioner@2.0.3
  - @remirror/extension-text-color@2.0.2
  - @remirror/react-core@2.0.3
  - @remirror/react-hooks@2.0.3

## 2.0.2

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.
- Updated dependencies
  - @remirror/core@2.0.1
  - remirror@2.0.2
  - @remirror/extension-positioner@2.0.2
  - @remirror/extension-text-color@2.0.1
  - @remirror/react-core@2.0.2
  - @remirror/react-hooks@2.0.2

## 2.0.1

> 2022-09-19

### Patch Changes

- Adds four new events `doubleClick`, `doubleClickMark`, `tripleClick` and `tripleClickMark`. They have the same interface as the existing `click` and `clickMark` event, but are triggered when the user double or triple clicks.
- fix emoji popup can't be closed via esc key
- Updated dependencies
- Updated dependencies
  - remirror@2.0.1
  - @remirror/extension-positioner@2.0.1
  - @remirror/react-core@2.0.1
  - @remirror/react-hooks@2.0.1

## 2.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Rewrite React components using MUI.

### Patch Changes

- Improve the calculation of changed ranges by utilising mapping
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Support both ESM and CJS.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Correct a bad import.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- option for supported characters in emoji suggester.
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
  - remirror@2.0.0
  - @remirror/core@2.0.0
  - @remirror/extension-positioner@2.0.0
  - @remirror/extension-text-color@2.0.0
  - @remirror/react-core@2.0.0
  - @remirror/react-hooks@2.0.0
  - @remirror/pm@2.0.0
  - @remirror/i18n@2.0.0
  - @remirror/icons@2.0.0
  - @remirror/messages@2.0.0
  - @remirror/react-utils@2.0.0
  - @remirror/theme@2.0.0
  - multishift@2.0.0
  - create-context-state@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Rewrite React components using MUI.

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- option for supported characters in emoji suggester.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- SSR features are removed.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Correct a bad import.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
  - remirror@2.0.0-beta.19
  - @remirror/core@2.0.0-beta.19
  - @remirror/extension-positioner@2.0.0-beta.19
  - @remirror/extension-text-color@2.0.0-beta.19
  - @remirror/react-core@2.0.0-beta.19
  - @remirror/react-hooks@2.0.0-beta.19
  - create-context-state@2.0.0-beta.18
  - multishift@2.0.0-beta.19
  - @remirror/i18n@2.0.0-beta.19
  - @remirror/icons@2.0.0-beta.19
  - @remirror/messages@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19
  - @remirror/react-utils@2.0.0-beta.19
  - @remirror/theme@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Rewrite React components using MUI.

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
- option for supported characters in emoji suggester.
- Support both ESM and CJS.
- Correct a bad import.
- Expose the return type of the throttle and debounce helpers
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
  - remirror@2.0.0-beta.18
  - @remirror/extension-positioner@2.0.0-beta.18
  - @remirror/extension-text-color@2.0.0-beta.18
  - @remirror/react-core@2.0.0-beta.18
  - @remirror/react-hooks@2.0.0-beta.18
  - @remirror/core@2.0.0-beta.18
  - create-context-state@2.0.0-beta.17
  - multishift@2.0.0-beta.18
  - @remirror/i18n@2.0.0-beta.18
  - @remirror/icons@2.0.0-beta.18
  - @remirror/messages@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18
  - @remirror/react-utils@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Rewrite React components using MUI.

### Patch Changes

- option for supported characters in emoji suggester.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
  - remirror@2.0.0-beta.17
  - @remirror/react-hooks@2.0.0-beta.17
  - @remirror/react-core@2.0.0-beta.17
  - @remirror/core@2.0.0-beta.17
  - @remirror/extension-text-color@2.0.0-beta.17
  - @remirror/extension-positioner@2.0.0-beta.17
  - @remirror/i18n@2.0.0-beta.17
  - @remirror/icons@2.0.0-beta.17
  - @remirror/messages@2.0.0-beta.17
  - @remirror/react-utils@2.0.0-beta.17
  - @remirror/theme@2.0.0-beta.17
  - multishift@2.0.0-beta.17
  - create-context-state@2.0.0-beta.16

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.16
  - @remirror/core@2.0.0-beta.16
  - @remirror/extension-positioner@2.0.0-beta.16
  - @remirror/extension-text-color@2.0.0-beta.16
  - @remirror/react-core@2.0.0-beta.16
  - @remirror/react-hooks@2.0.0-beta.16
  - @remirror/theme@2.0.0-beta.16
  - create-context-state@2.0.0-beta.15
  - multishift@2.0.0-beta.16
  - @remirror/i18n@2.0.0-beta.16
  - @remirror/icons@2.0.0-beta.16
  - @remirror/messages@2.0.0-beta.16
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.15
  - @remirror/react-core@2.0.0-beta.15
  - @remirror/react-hooks@2.0.0-beta.15
  - @remirror/pm@2.0.0-beta.15
  - @remirror/core@2.0.0-beta.15
  - @remirror/extension-text-color@2.0.0-beta.15
  - multishift@2.0.0-beta.15
  - @remirror/i18n@2.0.0-beta.15
  - @remirror/icons@2.0.0-beta.15
  - @remirror/messages@2.0.0-beta.15
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

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.0-beta.14
  - @remirror/extension-positioner@2.0.0-beta.14
  - @remirror/extension-text-color@2.0.0-beta.14
  - @remirror/react-core@2.0.0-beta.14
  - @remirror/react-hooks@2.0.0-beta.14
  - @remirror/core@2.0.0-beta.14
  - @remirror/pm@2.0.0-beta.14
  - @remirror/i18n@2.0.0-beta.14
  - @remirror/icons@2.0.0-beta.14
  - @remirror/messages@2.0.0-beta.14
  - @remirror/react-utils@2.0.0-beta.14
  - multishift@2.0.0-beta.14
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.13
  - @remirror/extension-positioner@2.0.0-beta.13
  - @remirror/react-core@2.0.0-beta.13
  - @remirror/react-hooks@2.0.0-beta.13
  - @remirror/theme@2.0.0-beta.13
  - @remirror/extension-text-color@2.0.0-beta.13
  - multishift@2.0.0-beta.13
  - @remirror/core@2.0.0-beta.13
  - @remirror/i18n@2.0.0-beta.13
  - @remirror/icons@2.0.0-beta.13
  - @remirror/messages@2.0.0-beta.13
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
  - create-context-state@2.0.0-beta.11
  - multishift@2.0.0-beta.12
  - @remirror/core@2.0.0-beta.12
  - @remirror/extension-positioner@2.0.0-beta.12
  - @remirror/extension-text-color@2.0.0-beta.12
  - @remirror/i18n@2.0.0-beta.12
  - @remirror/icons@2.0.0-beta.12
  - @remirror/messages@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12
  - @remirror/react-core@2.0.0-beta.12
  - @remirror/react-hooks@2.0.0-beta.12
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
  - @remirror/theme@2.0.0-beta.11
  - @remirror/extension-positioner@2.0.0-beta.11
  - @remirror/extension-text-color@2.0.0-beta.11
  - @remirror/react-core@2.0.0-beta.11
  - @remirror/react-hooks@2.0.0-beta.11
  - @remirror/core@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11
  - @remirror/i18n@2.0.0-beta.11
  - @remirror/icons@2.0.0-beta.11
  - @remirror/messages@2.0.0-beta.11
  - @remirror/react-utils@2.0.0-beta.11
  - multishift@2.0.0-beta.11
  - create-context-state@2.0.0-beta.10

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.10
  - multishift@2.0.0-beta.10
  - @remirror/core@2.0.0-beta.10
  - @remirror/extension-positioner@2.0.0-beta.10
  - @remirror/extension-text-color@2.0.0-beta.10
  - @remirror/i18n@2.0.0-beta.10
  - @remirror/icons@2.0.0-beta.10
  - @remirror/messages@2.0.0-beta.10
  - @remirror/react-core@2.0.0-beta.10
  - @remirror/react-hooks@2.0.0-beta.10
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
  - @remirror/core@2.0.0-beta.9
  - @remirror/extension-text-color@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9
  - @remirror/react-core@2.0.0-beta.9
  - @remirror/react-hooks@2.0.0-beta.9
  - @remirror/extension-positioner@2.0.0-beta.9
  - @remirror/i18n@2.0.0-beta.9
  - @remirror/icons@2.0.0-beta.9
  - @remirror/messages@2.0.0-beta.9
  - @remirror/react-utils@2.0.0-beta.9
  - @remirror/theme@2.0.0-beta.9
  - multishift@2.0.0-beta.9
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.0-beta.8
  - @remirror/extension-positioner@2.0.0-beta.8
  - @remirror/extension-text-color@2.0.0-beta.8
  - @remirror/react-core@2.0.0-beta.8
  - @remirror/react-hooks@2.0.0-beta.8
  - @remirror/pm@2.0.0-beta.8
  - @remirror/core@2.0.0-beta.8
  - @remirror/i18n@2.0.0-beta.8
  - @remirror/icons@2.0.0-beta.8
  - @remirror/messages@2.0.0-beta.8
  - @remirror/react-utils@2.0.0-beta.8
  - multishift@2.0.0-beta.8
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

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.7
  - @remirror/extension-positioner@2.0.0-beta.7
  - @remirror/extension-text-color@2.0.0-beta.7
  - @remirror/react-core@2.0.0-beta.7
  - @remirror/react-hooks@2.0.0-beta.7
  - @remirror/pm@2.0.0-beta.7
  - @remirror/theme@2.0.0-beta.7
  - create-context-state@2.0.0-beta.6
  - multishift@2.0.0-beta.7
  - @remirror/i18n@2.0.0-beta.7
  - @remirror/icons@2.0.0-beta.7
  - @remirror/messages@2.0.0-beta.7
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.0-beta.6
  - @remirror/extension-positioner@2.0.0-beta.6
  - @remirror/extension-text-color@2.0.0-beta.6
  - @remirror/react-core@2.0.0-beta.6
  - @remirror/react-hooks@2.0.0-beta.6
  - @remirror/pm@2.0.0-beta.6
  - multishift@2.0.0-beta.6
  - @remirror/core@2.0.0-beta.6
  - @remirror/i18n@2.0.0-beta.6
  - @remirror/icons@2.0.0-beta.6
  - @remirror/messages@2.0.0-beta.6
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

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
  - @remirror/core@2.0.0-beta.5
  - @remirror/extension-positioner@2.0.0-beta.5
  - @remirror/extension-text-color@2.0.0-beta.5
  - @remirror/react-core@2.0.0-beta.5
  - @remirror/react-hooks@2.0.0-beta.5
  - multishift@2.0.0-beta.5
  - @remirror/i18n@2.0.0-beta.5
  - @remirror/icons@2.0.0-beta.5
  - @remirror/messages@2.0.0-beta.5
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
  - @remirror/pm@2.0.0-beta.4
  - @remirror/core@2.0.0-beta.4
  - @remirror/extension-positioner@2.0.0-beta.4
  - @remirror/extension-text-color@2.0.0-beta.4
  - @remirror/react-core@2.0.0-beta.4
  - @remirror/react-hooks@2.0.0-beta.4
  - multishift@2.0.0-beta.4
  - @remirror/i18n@2.0.0-beta.4
  - @remirror/icons@2.0.0-beta.4
  - @remirror/messages@2.0.0-beta.4
  - @remirror/react-utils@2.0.0-beta.4
  - @remirror/theme@2.0.0-beta.4
  - create-context-state@2.0.0-beta.3

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
  - @remirror/pm@2.0.0-beta.3
  - @remirror/core@2.0.0-beta.3
  - @remirror/extension-text-color@2.0.0-beta.3
  - @remirror/react-core@2.0.0-beta.3
  - @remirror/react-hooks@2.0.0-beta.3
  - @remirror/extension-positioner@2.0.0-beta.3
  - @remirror/i18n@2.0.0-beta.3
  - @remirror/icons@2.0.0-beta.3
  - @remirror/messages@2.0.0-beta.3
  - @remirror/react-utils@2.0.0-beta.3
  - @remirror/theme@2.0.0-beta.3
  - multishift@2.0.0-beta.3
  - create-context-state@2.0.0-beta.2

## 2.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

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
- Updated dependencies
  - @remirror/react-hooks@2.0.0-beta.2
  - create-context-state@2.0.0-beta.1
  - multishift@2.0.0-beta.2
  - @remirror/core@2.0.0-beta.2
  - @remirror/extension-positioner@2.0.0-beta.2
  - @remirror/extension-text-color@2.0.0-beta.2
  - @remirror/i18n@2.0.0-beta.2
  - @remirror/icons@2.0.0-beta.2
  - @remirror/messages@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2
  - @remirror/react-core@2.0.0-beta.2
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
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-positioner@2.0.0-beta.1
  - @remirror/react-core@2.0.0-beta.1
  - @remirror/react-hooks@2.0.0-beta.1
  - @remirror/core@2.0.0-beta.1
  - @remirror/extension-text-color@2.0.0-beta.1
  - multishift@2.0.0-beta.1
  - @remirror/i18n@2.0.0-beta.1
  - @remirror/icons@2.0.0-beta.1
  - @remirror/messages@2.0.0-beta.1
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
  - @remirror/extension-text-color@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0
  - @remirror/react-core@2.0.0-beta.0
  - @remirror/react-hooks@2.0.0-beta.0
  - @remirror/extension-positioner@2.0.0-beta.0
  - @remirror/i18n@2.0.0-beta.0
  - @remirror/icons@2.0.0-beta.0
  - @remirror/messages@2.0.0-beta.0
  - @remirror/react-utils@2.0.0-beta.0
  - @remirror/theme@2.0.0-beta.0
  - multishift@1.0.9-beta.0

## 1.0.36

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

* Updated dependencies []:
  - @remirror/core@1.4.6
  - @remirror/extension-positioner@1.2.7
  - @remirror/extension-text-color@1.0.26
  - @remirror/react-core@1.2.3
  - @remirror/react-hooks@1.0.36

## 1.0.35

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
  - @remirror/extension-text-color@1.0.25
  - @remirror/react-core@1.2.2
  - @remirror/react-hooks@1.0.35

## 1.0.34

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core@1.4.4
  - @remirror/extension-positioner@1.2.5
  - @remirror/extension-text-color@1.0.24
  - @remirror/react-core@1.2.1
  - @remirror/react-hooks@1.0.34

## 1.0.33

> 2022-05-03

### Patch Changes

- Insert emoticons when hitting the Enter key (rather than requiring a space)

- Updated dependencies []:
  - @remirror/react-hooks@1.0.33
  - @remirror/pm@1.0.17

## 1.0.32

> 2022-04-26

### Patch Changes

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

* Update dependencies.

- Fix a crash with React v18 in development mode.

- Updated dependencies []:
  - @remirror/react-core@1.2.0
  - @remirror/react-hooks@1.0.32
  - multishift@1.0.8

## 1.0.31

> 2022-04-25

### Patch Changes

- Fix a potential out of range error.

- Updated dependencies []:
  - multishift@1.0.7
  - @remirror/react-hooks@1.0.31

## 1.0.30

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3
  - @remirror/extension-positioner@1.2.4
  - @remirror/extension-text-color@1.0.23
  - @remirror/react-core@1.1.3
  - @remirror/react-hooks@1.0.30

## 1.0.29

> 2022-04-20

### Patch Changes

- Prevent marks in MentionAtom, to prevent input rules being triggered within the node

* Fix an error with auto link preventing input rules at the end of a document

- Create a "stepping stone" for future standardisation of useEvent types

  Add a second parameter to handlers for `hover` and `contextmenu` types, so we can eventually standarise the hook to pass event as the first argument.

  ```tsx
  const handleHover = useCallback(({ event: MouseEvent }, props: HoverEventHandlerState) => {
    const { getNode, hovering, ...rest } = props;
    console.log('node', getNode(), 'is hovering', hovering, 'rest', rest);

    return false;
  }, []);

  useEvent('hover', handleHover);
  ```

- Updated dependencies []:
  - @remirror/react-hooks@1.0.29
  - @remirror/core@1.4.2
  - @remirror/extension-positioner@1.2.3
  - @remirror/extension-text-color@1.0.22
  - @remirror/react-core@1.1.2

## 1.0.28

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/extension-positioner@1.2.2
  - @remirror/extension-text-color@1.0.21
  - @remirror/react-core@1.1.1
  - @remirror/react-hooks@1.0.28

## 1.0.27

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/react-core@1.1.0
  - @remirror/extension-positioner@1.2.1
  - @remirror/extension-text-color@1.0.20
  - @remirror/react-hooks@1.0.27

## 1.0.26

> 2022-03-06

### Patch Changes

- `onChange` shouldn't be called if the transaction is canceled by `filterTransaction`.

- Updated dependencies []:
  - @remirror/react-core@1.0.25
  - @remirror/react-hooks@1.0.26

## 1.0.25

> 2022-03-04

### Patch Changes

- Add the ability to force update positioners with a new command `forceUpdatePositioners`.

  This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.

- Updated dependencies []:
  - @remirror/extension-positioner@1.2.0
  - @remirror/react-core@1.0.24
  - @remirror/react-hooks@1.0.25

## 1.0.24

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core@1.3.6
  - @remirror/extension-positioner@1.1.18
  - @remirror/extension-text-color@1.0.19
  - @remirror/react-core@1.0.23
  - @remirror/react-hooks@1.0.24

## 1.0.23

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/theme@1.2.1
  - @remirror/extension-positioner@1.1.17
  - @remirror/extension-text-color@1.0.18
  - @remirror/react-core@1.0.22
  - @remirror/react-hooks@1.0.23

## 1.0.22

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
  - @remirror/extension-text-color@1.0.17
  - @remirror/react-core@1.0.21
  - @remirror/react-hooks@1.0.22

## 1.0.21

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core@1.3.4
  - @remirror/extension-positioner@1.1.15
  - @remirror/extension-text-color@1.0.16
  - @remirror/react-core@1.0.20
  - @remirror/react-hooks@1.0.21

## 1.0.20

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
  - @remirror/extension-text-color@1.0.15
  - @remirror/extension-positioner@1.1.14
  - @remirror/react-core@1.0.19
  - @remirror/react-hooks@1.0.20

## 1.0.19

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/pm@1.0.10
  - @remirror/extension-positioner@1.1.13
  - @remirror/extension-text-color@1.0.14
  - @remirror/react-core@1.0.18
  - @remirror/react-hooks@1.0.19
  - multishift@1.0.6
  - @remirror/i18n@1.0.8
  - @remirror/icons@1.0.7
  - @remirror/messages@1.0.6
  - @remirror/react-utils@1.0.6
  - @remirror/theme@1.1.5

## 1.0.18

> 2021-12-17

### Patch Changes

- Fix types of copy and paste event handlers

- Updated dependencies []:
  - @remirror/extension-positioner@1.1.12
  - @remirror/react-core@1.0.17
  - @remirror/react-hooks@1.0.18

## 1.0.17

> 2021-12-06

### Patch Changes

- Fix an issue that cause `draggable` React node views unable to be draged.

- Updated dependencies []:
  - @remirror/react-core@1.0.16
  - @remirror/react-hooks@1.0.17

## 1.0.16

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/i18n@1.0.7
  - @remirror/icons@1.0.6
  - @remirror/pm@1.0.8
  - @remirror/react-hooks@1.0.16
  - @remirror/core@1.3.2
  - @remirror/extension-positioner@1.1.11
  - @remirror/extension-text-color@1.0.13
  - @remirror/react-core@1.0.15

## 1.0.15

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/extension-positioner@1.1.10
  - @remirror/extension-text-color@1.0.12
  - @remirror/react-core@1.0.14
  - @remirror/react-hooks@1.0.15
  - @remirror/pm@1.0.7

## 1.0.14

> 2021-11-10

### Patch Changes

- Implement the `stopEvent` method in `ReactNodeView`.

* Add new method `hasHandlers` to extensions.

* Updated dependencies []:
  - @remirror/react-core@1.0.13
  - @remirror/react-hooks@1.0.14
  - @remirror/core@1.3.0
  - @remirror/extension-positioner@1.1.9
  - @remirror/extension-text-color@1.0.11

## 1.0.13

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - multishift@1.0.5
  - @remirror/core@1.2.2
  - @remirror/extension-positioner@1.1.8
  - @remirror/extension-text-color@1.0.10
  - @remirror/i18n@1.0.6
  - @remirror/icons@1.0.5
  - @remirror/messages@1.0.5
  - @remirror/pm@1.0.6
  - @remirror/react-core@1.0.12
  - @remirror/react-hooks@1.0.13
  - @remirror/react-utils@1.0.5

## 1.0.12

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/extension-positioner@1.1.7
  - @remirror/extension-text-color@1.0.9
  - @remirror/react-core@1.0.11
  - @remirror/react-hooks@1.0.12
  - multishift@1.0.4
  - @remirror/i18n@1.0.5
  - @remirror/icons@1.0.4
  - @remirror/messages@1.0.4
  - @remirror/pm@1.0.4
  - @remirror/react-utils@1.0.4
  - @remirror/theme@1.1.4

## 1.0.11

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
  - @remirror/extension-text-color@1.0.8
  - @remirror/react-core@1.0.10
  - @remirror/react-hooks@1.0.11

## 1.0.10

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/i18n@1.0.4
  - @remirror/messages@1.0.3
  - @remirror/core@1.1.3
  - @remirror/extension-positioner@1.1.5
  - @remirror/extension-text-color@1.0.7
  - @remirror/react-core@1.0.9
  - @remirror/react-hooks@1.0.10
  - multishift@1.0.3
  - @remirror/icons@1.0.3
  - @remirror/pm@1.0.3
  - @remirror/react-utils@1.0.3
  - @remirror/theme@1.1.3

## 1.0.9

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/extension-positioner@1.1.4
  - @remirror/extension-text-color@1.0.6
  - @remirror/react-core@1.0.8
  - @remirror/react-hooks@1.0.9

## 1.0.8

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/extension-positioner@1.1.3
  - @remirror/extension-text-color@1.0.5
  - @remirror/react-core@1.0.7
  - @remirror/react-hooks@1.0.8

## 1.0.7

> 2021-09-02

### Patch Changes

- Fix an out of range error when there is nothing in the dropdown menu.

- Updated dependencies []:
  - @remirror/react-hooks@1.0.7

## 1.0.6

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/theme@1.1.2
  - @remirror/extension-positioner@1.1.2
  - @remirror/extension-text-color@1.0.4
  - @remirror/react-core@1.0.6
  - @remirror/react-hooks@1.0.6

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
  - @remirror/extension-text-color@1.0.3
  - @remirror/react-core@1.0.5
  - @remirror/react-hooks@1.0.5
  - @remirror/core@1.1.0

## 1.0.4

> 2021-08-26

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - @remirror/extension-positioner@1.1.0
  - @remirror/react-core@1.0.4
  - @remirror/react-hooks@1.0.4

## 1.0.3

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/i18n@1.0.3
  - @remirror/core@1.0.3
  - @remirror/extension-positioner@1.0.2
  - @remirror/extension-text-color@1.0.2
  - @remirror/react-core@1.0.3
  - @remirror/react-hooks@1.0.3

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1014](https://github.com/remirror/remirror/pull/1014) [`22115ea9e`](https://github.com/remirror/remirror/commit/22115ea9ed1977d20b7019d065d6a31d39b359eb) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by removing `@remirror/icons/all` and `@remirror/react-icons/all-icons` from the package `@remirror/react-tables-extension`.

* [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for `react@18` in peer dependencies.

* Updated dependencies [[`22115ea9e`](https://github.com/remirror/remirror/commit/22115ea9ed1977d20b7019d065d6a31d39b359eb), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b)]:
  - @remirror/icons@1.0.2
  - create-context-state@1.0.1
  - @remirror/react-core@1.0.2
  - @remirror/react-hooks@1.0.2
  - @remirror/react-utils@1.0.2
  - multishift@1.0.2

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - multishift@1.0.1
  - @remirror/core@1.0.1
  - @remirror/extension-positioner@1.0.1
  - @remirror/extension-text-color@1.0.1
  - @remirror/i18n@1.0.1
  - @remirror/icons@1.0.1
  - @remirror/messages@1.0.1
  - @remirror/pm@1.0.1
  - @remirror/react-core@1.0.1
  - @remirror/react-hooks@1.0.1
  - @remirror/react-utils@1.0.1
  - @remirror/theme@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Minor Changes

- [#905](https://github.com/remirror/remirror/pull/905) [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Refactor `FloatingMenu` component so that it can now support inputs within the editor via the `renderOutsideEditor` prop.

* [#905](https://github.com/remirror/remirror/pull/905) [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new `MentionAtomPopupComponent`.

### Patch Changes

- [#969](https://github.com/remirror/remirror/pull/969) [`3df15a8a2`](https://github.com/remirror/remirror/commit/3df15a8a2a9f594b48ba2abc755109eaf3ee0999) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Show the `EmojiPopupComponent` immediately after typing `:`.

* [#972](https://github.com/remirror/remirror/pull/972) [`63268b8eb`](https://github.com/remirror/remirror/commit/63268b8ebc03bd9b6d410516abb794f872e571c8) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix the situation where passing an array with zero items to `multishift` caused the editor to crash. This was raised in [#971](https://github.com/remirror/remirror/issues/971).

* Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`3feb9188a`](https://github.com/remirror/remirror/commit/3feb9188a6747f496ea4ed224357d268cf1da8cc), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`6568794ad`](https://github.com/remirror/remirror/commit/6568794ad49328dea88fe06ceb1565cc14ae5eb0), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`b1fc65313`](https://github.com/remirror/remirror/commit/b1fc65313f5be376bb1128c90f54cd1fa168c5c0), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0), [`63268b8eb`](https://github.com/remirror/remirror/commit/63268b8ebc03bd9b6d410516abb794f872e571c8), [`f52405b4b`](https://github.com/remirror/remirror/commit/f52405b4b27c579cec8c59b6657e6fb66bcf0e7d)]:
  - @remirror/core@1.0.0
  - @remirror/react-hooks@1.0.0
  - @remirror/react-core@1.0.0
  - @remirror/extension-positioner@1.0.0
  - create-context-state@1.0.0
  - multishift@1.0.0
  - @remirror/extension-text-color@1.0.0
  - @remirror/i18n@1.0.0
  - @remirror/icons@1.0.0
  - @remirror/messages@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/react-utils@1.0.0
  - @remirror/theme@1.0.0

## 1.0.0-next.40

> 2020-12-17

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60
  - @remirror/react@1.0.0-next.60
  - multishift@1.0.0-next.60

## 1.0.0-next.39

> 2020-12-12

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59
  - @remirror/react@1.0.0-next.59
  - multishift@1.0.0-next.59

## 1.0.0-next.38

> 2020-11-29

### Patch Changes

- Updated dependencies [[`3d3da227`](https://github.com/remirror/remirror/commit/3d3da227fd582d388ed2587f0ccd0ac6e5b6ae73)]:
  - @remirror/core@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58
  - @remirror/react@1.0.0-next.58
  - multishift@1.0.0-next.58

## 1.0.0-next.37

> 2020-11-25

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57
  - @remirror/react@1.0.0-next.57
  - multishift@1.0.0-next.57

## 1.0.0-next.36

> 2020-11-24

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56
  - @remirror/react@1.0.0-next.56
  - multishift@1.0.0-next.56

## 1.0.0-next.35

> 2020-11-20

### Patch Changes

- Updated dependencies [[`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3)]:
  - @remirror/core@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55
  - @remirror/react@1.0.0-next.55
  - multishift@1.0.0-next.55

## 1.0.0-next.34

> 2020-11-19

### Patch Changes

- Updated dependencies [[`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764)]:
  - @remirror/core@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54
  - @remirror/react@1.0.0-next.54
  - multishift@1.0.0-next.54

## 1.0.0-next.33

> 2020-11-12

### Patch Changes

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655)]:
  - @remirror/core@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53
  - @remirror/react@1.0.0-next.53
  - multishift@1.0.0-next.53

## 1.0.0-next.32

> 2020-11-06

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52
  - @remirror/react@1.0.0-next.52
  - multishift@1.0.0-next.52

## 1.0.0-next.31

> 2020-10-27

### Patch Changes

- Updated dependencies [[`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/core@1.0.0-next.51
  - @remirror/react@1.0.0-next.51
  - multishift@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.30

> 2020-10-15

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455)]:
  - @remirror/core@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50
  - @remirror/react@1.0.0-next.50
  - multishift@1.0.0-next.50

## 1.0.0-next.29

> 2020-10-10

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49
  - @remirror/react@1.0.0-next.49
  - multishift@1.0.0-next.49

## 1.0.0-next.28

> 2020-10-08

### Patch Changes

- Updated dependencies [[`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e)]:
  - @remirror/core@1.0.0-next.48
  - @remirror/react@1.0.0-next.48

## 1.0.0-next.27

> 2020-10-08

### Patch Changes

- [`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update external dependencies.

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e)]:
  - @remirror/core@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47
  - @remirror/react@1.0.0-next.47
  - multishift@1.0.0-next.47

## 1.0.0-next.26

> 2020-10-01

### Patch Changes

- Updated dependencies [[`2175be1d`](https://github.com/remirror/remirror/commit/2175be1d4b3fb1d4d1ec7edd8f6054e4e1873fc0)]:
  - @remirror/core@1.0.0-next.45
  - @remirror/react@1.0.0-next.45

## 1.0.0-next.25

> 2020-09-30

### Patch Changes

- Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/core@1.0.0-next.44
  - @remirror/react@1.0.0-next.44
  - multishift@1.0.0-next.44

## 1.0.0-next.24

> 2020-09-28

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.43
  - @remirror/react@1.0.0-next.43

## 1.0.0-next.23

> 2020-09-26

### Patch Changes

- Updated dependencies [[`d33f43bf`](https://github.com/remirror/remirror/commit/d33f43bfcb8d7f578f05434b42c938b4132b544a)]:
  - multishift@1.0.0-next.42
  - @remirror/core@1.0.0-next.42
  - @remirror/react@1.0.0-next.42

## 1.0.0-next.22

> 2020-09-26

### Patch Changes

- Updated dependencies [[`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`83217437`](https://github.com/remirror/remirror/commit/8321743733d1aa794c5b5f5b2f07a9e1065d9ac9), [`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`182b0aac`](https://github.com/remirror/remirror/commit/182b0aac665a8d9a38e7dc88837ae66d005c05a4)]:
  - @remirror/core@1.0.0-next.41
  - @remirror/react@1.0.0-next.41
  - multishift@1.0.0-next.41

## 1.0.0-next.21

> 2020-09-24

### Patch Changes

- Updated dependencies [[`7c5778ed`](https://github.com/remirror/remirror/commit/7c5778edf123e6a812c77b1fd6181d16887b0fa1), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e), [`643555cc`](https://github.com/remirror/remirror/commit/643555cc7ba22ee0a8ba3cb1333ea488830fce30)]:
  - @remirror/core@1.0.0-next.40
  - @remirror/react@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - multishift@1.0.0-next.40

## 1.0.0-next.20

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core@1.0.0-next.39
  - @remirror/react@1.0.0-next.39
  - multishift@1.0.0-next.39

## 1.0.0-next.19

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671), [`efd2e537`](https://github.com/remirror/remirror/commit/efd2e53779666876bb2d9bdcb917923c0a3a6295), [`54ae06d4`](https://github.com/remirror/remirror/commit/54ae06d488cf127116b5be75e93261f23c4fb4a2)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core@1.0.0-next.38
  - @remirror/react@1.0.0-next.38
  - multishift@1.0.0-next.38

## 1.0.0-next.18

> 2020-09-14

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405), [`a3383ca4`](https://github.com/remirror/remirror/commit/a3383ca4958712ebaf735f5fb25c039e6295d137), [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/core@1.0.0-next.37
  - @remirror/react@1.0.0-next.37
  - @remirror/pm@1.0.0-next.37
  - multishift@1.0.0-next.37

## 1.0.0-next.17

> 2020-09-13

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

* [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade linaria and other dependencies

* Updated dependencies [[`34b0f0b3`](https://github.com/remirror/remirror/commit/34b0f0b3c502e5c43712085b9d0da4f4168797aa), [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec), [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3)]:
  - @remirror/core@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35
  - @remirror/react@1.0.0-next.35
  - multishift@1.0.0-next.35

## 1.0.0-next.16

> 2020-09-10

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0)]:
  - @remirror/core@1.0.0-next.34
  - @remirror/react@1.0.0-next.34
  - multishift@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.15

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
- Updated dependencies [92ed4135]
  - @remirror/core@1.0.0-next.33
  - @remirror/react@1.0.0-next.33
  - multishift@1.0.0-next.33

## 1.0.0-next.14

> 2020-09-05

### Patch Changes

- Updated dependencies [[`28d1fd48`](https://github.com/remirror/remirror/commit/28d1fd486f1c73d66d6c678821cfa744751250b8), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`bed5a9e3`](https://github.com/remirror/remirror/commit/bed5a9e37026dcbdee323c921f5c05e15d49c93d), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3)]:
  - @remirror/react@1.0.0-next.32
  - @remirror/core@1.0.0-next.32
  - multishift@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.13

> 2020-09-03

### Patch Changes

- Updated dependencies [[`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6)]:
  - @remirror/core@1.0.0-next.31
  - @remirror/react@1.0.0-next.31
  - multishift@1.0.0-next.31

## 1.0.0-next.12

> 2020-08-28

### Patch Changes

- Updated dependencies [[`de0ba243`](https://github.com/remirror/remirror/commit/de0ba2436729f2fbd3bc8531b0e5fd01d3f34210)]:
  - @remirror/react@1.0.0-next.30

## 1.0.0-next.11

> 2020-08-28

### Patch Changes

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core@1.0.0-next.29
  - @remirror/react@1.0.0-next.29

## 1.0.0-next.10

> 2020-08-27

### Patch Changes

- [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448) [#585](https://github.com/remirror/remirror/pull/585) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies and `linaria`.

- Updated dependencies [[`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d), [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a)]:
  - @remirror/core@1.0.0-next.28
  - @remirror/pm@1.0.0-next.28
  - @remirror/react@1.0.0-next.28
  - multishift@1.0.0-next.28

## 1.0.0-next.9

> 2020-08-25

### Patch Changes

- @remirror/react@1.0.0-next.27

## 1.0.0-next.8

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core@1.0.0-next.26
  - @remirror/react@1.0.0-next.26
  - multishift@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.7

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25
  - @remirror/react@1.0.0-next.25

## 1.0.0-next.6

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
  - @remirror/core@1.0.0-next.24
  - @remirror/react@1.0.0-next.24

## 1.0.0-next.5

> 2020-08-18

### Patch Changes

- Updated dependencies [d505ebc1]
  - @remirror/react@1.0.0-next.23

## 1.0.0-next.4

> 2020-08-17

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
- Updated dependencies [d300c5f0]
- Updated dependencies [113560bb]
  - @remirror/core@1.0.0-next.22
  - @remirror/react@1.0.0-next.22
  - multishift@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.3

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/core@1.0.0-next.21
  - @remirror/react@1.0.0-next.21
  - multishift@0.7.8-next.5
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.2

> 2020-08-14

### Patch Changes

- Updated dependencies [95697fbd]
- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/react@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20
  - @remirror/core@1.0.0-next.20
  - multishift@0.7.8-next.4

## 1.0.0-next.1

> 2020-08-02

### Patch Changes

- Updated dependencies [4498814f]
- Updated dependencies [898c62e0]
  - @remirror/react@1.0.0-next.17
  - @remirror/core@1.0.0-next.17

## 1.0.0-next.0

> 2020-08-01

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [f032db7e]
- Updated dependencies [a7037832]
- Updated dependencies [6e8b749a]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [982a6b15]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
- Updated dependencies [e518ef1d]
- Updated dependencies [be9a9c17]
- Updated dependencies [720c9b43]
  - @remirror/react@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - multishift@1.0.0-next.3
