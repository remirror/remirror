# @remirror/react-ui

## 0.1.0-beta.4

> 2023-11-08

### Patch Changes

- Updated dependencies [93f4ebdc2]
  - @remirror/extension-horizontal-rule@3.0.0-beta.4
  - @remirror/extension-node-formatting@3.0.0-beta.4
  - @remirror/extension-blockquote@3.0.0-beta.4
  - @remirror/extension-code-block@3.0.0-beta.4
  - @remirror/extension-positioner@3.0.0-beta.4
  - @remirror/extension-text-color@3.0.0-beta.4
  - @remirror/extension-whitespace@3.0.0-beta.4
  - @remirror/extension-font-size@3.0.0-beta.4
  - @remirror/extension-underline@3.0.0-beta.4
  - @remirror/extension-callout@3.0.0-beta.4
  - @remirror/extension-columns@3.0.0-beta.4
  - @remirror/extension-heading@3.0.0-beta.4
  - @remirror/extension-history@3.0.0-beta.4
  - @remirror/extension-italic@3.0.0-beta.4
  - @remirror/extension-strike@3.0.0-beta.4
  - @remirror/extension-tables@3.0.0-beta.4
  - @remirror/react-components@3.0.0-beta.4
  - @remirror/extension-bold@3.0.0-beta.4
  - @remirror/extension-code@3.0.0-beta.4
  - @remirror/extension-list@3.0.0-beta.4
  - @remirror/extension-sub@3.0.0-beta.4
  - @remirror/extension-sup@3.0.0-beta.4
  - @remirror/react-hooks@3.0.0-beta.4
  - @remirror/react-core@3.0.0-beta.4
  - @remirror/messages@3.0.0-beta.2
  - @remirror/icons@3.0.0-beta.1
  - @remirror/theme@3.0.0-beta.2
  - @remirror/core@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.2
  - @remirror/extension-find@1.0.0-beta.4

## 0.1.0-beta.3

> 2023-11-08

### Patch Changes

- Updated dependencies [46e903ed9]
  - @remirror/core@3.0.0-beta.3
  - @remirror/extension-blockquote@3.0.0-beta.3
  - @remirror/extension-bold@3.0.0-beta.3
  - @remirror/extension-callout@3.0.0-beta.3
  - @remirror/extension-code@3.0.0-beta.3
  - @remirror/extension-code-block@3.0.0-beta.3
  - @remirror/extension-columns@3.0.0-beta.3
  - @remirror/extension-find@1.0.0-beta.3
  - @remirror/extension-font-size@3.0.0-beta.3
  - @remirror/extension-heading@3.0.0-beta.3
  - @remirror/extension-history@3.0.0-beta.3
  - @remirror/extension-horizontal-rule@3.0.0-beta.3
  - @remirror/extension-italic@3.0.0-beta.3
  - @remirror/extension-list@3.0.0-beta.3
  - @remirror/extension-node-formatting@3.0.0-beta.3
  - @remirror/extension-positioner@3.0.0-beta.3
  - @remirror/extension-strike@3.0.0-beta.3
  - @remirror/extension-sub@3.0.0-beta.3
  - @remirror/extension-sup@3.0.0-beta.3
  - @remirror/extension-tables@3.0.0-beta.3
  - @remirror/extension-text-color@3.0.0-beta.3
  - @remirror/extension-underline@3.0.0-beta.3
  - @remirror/extension-whitespace@3.0.0-beta.3
  - @remirror/react-components@3.0.0-beta.3
  - @remirror/react-core@3.0.0-beta.3
  - @remirror/react-hooks@3.0.0-beta.3

## 0.1.0-beta.2

> 2023-11-07

### Patch Changes

- Updated dependencies [47bda7aab]
  - @remirror/core@3.0.0-beta.2
  - @remirror/extension-blockquote@3.0.0-beta.2
  - @remirror/extension-bold@3.0.0-beta.2
  - @remirror/extension-callout@3.0.0-beta.2
  - @remirror/extension-code@3.0.0-beta.2
  - @remirror/extension-code-block@3.0.0-beta.2
  - @remirror/extension-columns@3.0.0-beta.2
  - @remirror/extension-find@1.0.0-beta.2
  - @remirror/extension-font-size@3.0.0-beta.2
  - @remirror/extension-heading@3.0.0-beta.2
  - @remirror/extension-history@3.0.0-beta.2
  - @remirror/extension-horizontal-rule@3.0.0-beta.2
  - @remirror/extension-italic@3.0.0-beta.2
  - @remirror/extension-list@3.0.0-beta.2
  - @remirror/extension-node-formatting@3.0.0-beta.2
  - @remirror/extension-positioner@3.0.0-beta.2
  - @remirror/extension-strike@3.0.0-beta.2
  - @remirror/extension-sub@3.0.0-beta.2
  - @remirror/extension-sup@3.0.0-beta.2
  - @remirror/extension-tables@3.0.0-beta.2
  - @remirror/extension-text-color@3.0.0-beta.2
  - @remirror/extension-underline@3.0.0-beta.2
  - @remirror/extension-whitespace@3.0.0-beta.2
  - @remirror/react-components@3.0.0-beta.2
  - @remirror/react-core@3.0.0-beta.2
  - @remirror/react-hooks@3.0.0-beta.2

## 0.1.0-beta.1

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
- Updated dependencies [60a3796b0]
  - @remirror/pm@3.0.0-beta.1
  - @remirror/core@3.0.0-beta.1
  - @remirror/react-components@3.0.0-beta.1
  - @remirror/extension-blockquote@3.0.0-beta.1
  - @remirror/extension-bold@3.0.0-beta.1
  - @remirror/extension-callout@3.0.0-beta.1
  - @remirror/extension-code@3.0.0-beta.1
  - @remirror/extension-code-block@3.0.0-beta.1
  - @remirror/extension-columns@3.0.0-beta.1
  - @remirror/extension-find@1.0.0-beta.1
  - @remirror/extension-font-size@3.0.0-beta.1
  - @remirror/extension-heading@3.0.0-beta.1
  - @remirror/extension-history@3.0.0-beta.1
  - @remirror/extension-horizontal-rule@3.0.0-beta.1
  - @remirror/extension-italic@3.0.0-beta.1
  - @remirror/extension-list@3.0.0-beta.1
  - @remirror/extension-node-formatting@3.0.0-beta.1
  - @remirror/extension-positioner@3.0.0-beta.1
  - @remirror/extension-strike@3.0.0-beta.1
  - @remirror/extension-sub@3.0.0-beta.1
  - @remirror/extension-sup@3.0.0-beta.1
  - @remirror/extension-tables@3.0.0-beta.1
  - @remirror/extension-text-color@3.0.0-beta.1
  - @remirror/extension-underline@3.0.0-beta.1
  - @remirror/extension-whitespace@3.0.0-beta.1
  - @remirror/react-core@3.0.0-beta.1
  - @remirror/react-hooks@3.0.0-beta.1
  - @remirror/messages@3.0.0-beta.1
  - @remirror/theme@3.0.0-beta.1
