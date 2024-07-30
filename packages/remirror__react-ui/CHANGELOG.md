# @remirror/react-ui

## 1.0.0

> 2024-07-30

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

- c4c4fa512: Forward-port the removal of the validate property from `main`
- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- 5c686c3f3: ## 💥 BREAKING CHANGES! 💥

  The `CodeBlockLanguageSelect` component needs to wrapped within a `CodeBlockTools` component to be position correctly with a code block.

  ```tsx
  import { CodeBlockLanguageSelect, CodeBlockTools } from '@remirror/react-ui';

  const MyComponent = (): JSX.Element => (
    <CodeBlockTools>
      <CodeBlockLanguageSelect />
    </CodeBlockTools>
  );
  ```

  ## Updates

  A `CodeBlockFormatButton` component has been added to `@remirror/react-ui`, this allows you to format code blocks with the formatter of your choice.

  You can supply your own formatter or use the default formatter from `@remirror/extension-code-block/formatter` which is based on Prettier.

  ### Usage example 1: Use the formatter extension

  ```tsx
  import React from 'react';
  import json from 'refractor/lang/json.js';
  import typescript from 'refractor/lang/typescript.js';
  import { CodeBlockExtension } from 'remirror/extensions';
  import { formatter } from '@remirror/extension-code-block/formatter';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
  import { CodeBlockFormatButton, CodeBlockTools } from '@remirror/react-ui';

  const extensions = () => [
    new CodeBlockExtension({
      supportedLanguages: [json, typescript],
      formatter,
    }),
  ];

  export default function FormatterCodeBlock(): JSX.Element {
    const { manager, state } = useRemirror({
      extensions,
      content: '',
      stringHandler: 'html',
    });

    return (
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <CodeBlockTools>
            <CodeBlockFormatButton />
          </CodeBlockTools>
        </Remirror>
      </ThemeProvider>
    );
  }
  ```

  ### Usage example 2: Supply your own formatter

  ```tsx
  import babelPlugin from 'prettier/plugins/babel';
  import estreePlugin from 'prettier/plugins/estree';
  import { formatWithCursor } from 'prettier/standalone';
  import React from 'react';
  import json from 'refractor/lang/json.js';
  import typescript from 'refractor/lang/typescript.js';
  import type { CodeBlockFormatter } from 'remirror/extensions';
  import { CodeBlockExtension } from 'remirror/extensions';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
  import { CodeBlockFormatButton, CodeBlockTools } from '@remirror/react-ui';

  const myCustomFormatter: CodeBlockFormatter = ({ source, language, cursorOffset }) => {
    const parser =
      language === 'typescript' ? 'babel-ts' : language === 'json' ? 'json' : undefined;

    if (!parser) {
      throw new Error('Unsupported language');
    }

    // Prettier standalone documentation: https://prettier.io/docs/en/browser
    return formatWithCursor(source, {
      cursorOffset,
      parser,
      plugins: [estreePlugin, babelPlugin],
      experimentalTernaries: true,
    });
  };

  const extensions = () => [
    new CodeBlockExtension({
      supportedLanguages: [json, typescript],
      formatter: myCustomFormatter,
    }),
  ];

  export default function FormatterCodeBlock(): JSX.Element {
    const { manager, state } = useRemirror({
      extensions,
      content: '',
      stringHandler: 'html',
    });

    return (
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <CodeBlockTools>
            <CodeBlockFormatButton />
          </CodeBlockTools>
        </Remirror>
      </ThemeProvider>
    );
  }
  ```

- 9549c8f88: ## 💥 BREAKING CHANGES! 💥

  ## `CodeBlockLanguageSelector` component moved to `@remirror/react-ui` package

  The `CodeBlockLanguageSelector` component has been moved from `@remirror/extension-react-language-select` to `@remirror/react-ui`.

  While it was originally named as an "extension", upon closer examination, we've realised that its role aligns more with that of a component, rather than a true extension.

  To maintain the integrity of our [definition of an extension](https://remirror.io/docs/concepts/extension), we believe this move is necessary. This is to help provide a more accurate representation of functionality, and enhance overall understanding and usage of the library.

  Additionally `CodeBlockLanguageSelector` now renders a MUI `Select` component, rather than a native `select` element. This enables us to utilise the "auto width" behaviour, rather than implementing this behaviour ourselves.

  Furthermore, it will now render in the top _right_ corner of the code block by default, rather than the top left. Passing `position='left'` will revert to rendering in the top left corner as before.

  #### Before: Remirror v2 example

  ```tsx
  import 'remirror/styles/all.css';

  import React from 'react';
  import css from 'refractor/lang/css.js';
  import javascript from 'refractor/lang/javascript.js';
  import typescript from 'refractor/lang/typescript.js';
  import { CodeBlockExtension } from 'remirror/extensions';
  import { CodeBlockLanguageSelect } from '@remirror/extension-react-language-select';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

  const extensions = () => [
    new CodeBlockExtension({
      supportedLanguages: [css, javascript, json, markdown, typescript],
    }),
  ];

  const content = `
  <pre><code data-code-block-language="typescript">function sayHello {
    console.log('Hello world, TypeScript!')
  }</code></pre>
  `;

  const EditorWithCodeBlocks = (): JSX.Element => {
    const { manager, state } = useRemirror({
      extensions,
      content,
      stringHandler: 'html',
    });

    return (
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <CodeBlockLanguageSelect />
        </Remirror>
      </ThemeProvider>
    );
  };

  export default EditorWithCodeBlocks;
  ```

  #### After: Diff for Remirror v3 example

  ```diff
  import 'remirror/styles/all.css';

  import React from 'react';
  import css from 'refractor/lang/css.js';
  import javascript from 'refractor/lang/javascript.js';
  import typescript from 'refractor/lang/typescript.js';
  import { CodeBlockExtension } from 'remirror/extensions';
  - import { CodeBlockLanguageSelect } from '@remirror/extension-react-language-select';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
  + import { CodeBlockLanguageSelect } from '@remirror/react-ui';

  const extensions = () => [
    new CodeBlockExtension({
      supportedLanguages: [css, javascript, json, markdown, typescript],
    }),
  ];

  const content = `
  <pre><code data-code-block-language="typescript">function sayHello {
    console.log('Hello world, TypeScript!')
  }</code></pre>
  `;

  const EditorWithCodeBlocks = (): JSX.Element => {
    const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

    return (
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <CodeBlockLanguageSelect />
        </Remirror>
      </ThemeProvider>
    );
  };

  export default EditorWithCodeBlocks;
  ```

  ## Feedback

  As always, we value your feedback on how we can improve Remirror. Please raise your proposals via [issues on GitHub](https://github.com/remirror/remirror/issues) or via our [Discord server](https://remirror.io/chat).

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

- Updated dependencies [b23f87320]
- Updated dependencies [46e903ed9]
- Updated dependencies [b1d683fdb]
- Updated dependencies [c4c4fa512]
- Updated dependencies [469d7ce8f]
- Updated dependencies [bffe2fd61]
- Updated dependencies [d3954076f]
- Updated dependencies [ae349d806]
- Updated dependencies [760d9739d]
- Updated dependencies [93f4ebdc2]
- Updated dependencies [469d7ce8f]
- Updated dependencies [3f76519f3]
- Updated dependencies [47bda7aab]
- Updated dependencies [5c686c3f3]
- Updated dependencies [0e4abae1b]
- Updated dependencies [9549c8f88]
- Updated dependencies [60a3796b0]
- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
- Updated dependencies [8f5467ae6]
  - @remirror/extension-code-block@3.0.0
  - @remirror/core@3.0.0
  - @remirror/pm@3.0.0
  - @remirror/extension-horizontal-rule@3.0.0
  - @remirror/extension-node-formatting@3.0.0
  - @remirror/extension-blockquote@3.0.0
  - @remirror/extension-positioner@3.0.0
  - @remirror/extension-text-color@3.0.0
  - @remirror/extension-whitespace@3.0.0
  - @remirror/extension-font-size@3.0.0
  - @remirror/extension-underline@3.0.0
  - @remirror/extension-callout@3.0.0
  - @remirror/extension-columns@3.0.0
  - @remirror/extension-heading@3.0.0
  - @remirror/extension-history@3.0.0
  - @remirror/extension-italic@3.0.0
  - @remirror/extension-strike@3.0.0
  - @remirror/extension-tables@3.0.0
  - @remirror/react-components@3.0.0
  - @remirror/extension-bold@3.0.0
  - @remirror/extension-code@3.0.0
  - @remirror/extension-find@1.0.0
  - @remirror/extension-list@3.0.0
  - @remirror/extension-sub@3.0.0
  - @remirror/extension-sup@3.0.0
  - @remirror/react-hooks@3.0.0
  - @remirror/react-core@3.0.0
  - @remirror/messages@3.0.0
  - @remirror/icons@3.0.0
  - @remirror/theme@3.0.0

## 0.1.0-rc.9

> 2024-07-25

### Patch Changes

- 5c686c3f3: ## 💥 BREAKING CHANGES! 💥

  The `CodeBlockLanguageSelect` component needs to wrapped within a `CodeBlockTools` component to be position correctly with a code block.

  ```tsx
  import { CodeBlockLanguageSelect, CodeBlockTools } from '@remirror/react-ui';

  const MyComponent = (): JSX.Element => (
    <CodeBlockTools>
      <CodeBlockLanguageSelect />
    </CodeBlockTools>
  );
  ```

  ## Updates

  A `CodeBlockFormatButton` component has been added to `@remirror/react-ui`, this allows you to format code blocks with the formatter of your choice.

  You can supply your own formatter or use the default formatter from `@remirror/extension-code-block/formatter` which is based on Prettier.

  ### Usage example 1: Use the formatter extension

  ```tsx
  import React from 'react';
  import json from 'refractor/lang/json.js';
  import typescript from 'refractor/lang/typescript.js';
  import { CodeBlockExtension } from 'remirror/extensions';
  import { formatter } from '@remirror/extension-code-block/formatter';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
  import { CodeBlockFormatButton, CodeBlockTools } from '@remirror/react-ui';

  const extensions = () => [
    new CodeBlockExtension({
      supportedLanguages: [json, typescript],
      formatter,
    }),
  ];

  export default function FormatterCodeBlock(): JSX.Element {
    const { manager, state } = useRemirror({
      extensions,
      content: '',
      stringHandler: 'html',
    });

    return (
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <CodeBlockTools>
            <CodeBlockFormatButton />
          </CodeBlockTools>
        </Remirror>
      </ThemeProvider>
    );
  }
  ```

  ### Usage example 2: Supply your own formatter

  ```tsx
  import babelPlugin from 'prettier/plugins/babel';
  import estreePlugin from 'prettier/plugins/estree';
  import { formatWithCursor } from 'prettier/standalone';
  import React from 'react';
  import json from 'refractor/lang/json.js';
  import typescript from 'refractor/lang/typescript.js';
  import type { CodeBlockFormatter } from 'remirror/extensions';
  import { CodeBlockExtension } from 'remirror/extensions';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
  import { CodeBlockFormatButton, CodeBlockTools } from '@remirror/react-ui';

  const myCustomFormatter: CodeBlockFormatter = ({ source, language, cursorOffset }) => {
    const parser =
      language === 'typescript' ? 'babel-ts' : language === 'json' ? 'json' : undefined;

    if (!parser) {
      throw new Error('Unsupported language');
    }

    // Prettier standalone documentation: https://prettier.io/docs/en/browser
    return formatWithCursor(source, {
      cursorOffset,
      parser,
      plugins: [estreePlugin, babelPlugin],
      experimentalTernaries: true,
    });
  };

  const extensions = () => [
    new CodeBlockExtension({
      supportedLanguages: [json, typescript],
      formatter: myCustomFormatter,
    }),
  ];

  export default function FormatterCodeBlock(): JSX.Element {
    const { manager, state } = useRemirror({
      extensions,
      content: '',
      stringHandler: 'html',
    });

    return (
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <CodeBlockTools>
            <CodeBlockFormatButton />
          </CodeBlockTools>
        </Remirror>
      </ThemeProvider>
    );
  }
  ```

- Updated dependencies [b23f87320]
- Updated dependencies [5c686c3f3]
  - @remirror/extension-code-block@3.0.0-rc.9

## 0.1.0-beta.8

> 2024-07-22

### Patch Changes

- Updated dependencies [bffe2fd61]
  - @remirror/core@3.0.0-beta.8
  - @remirror/icons@3.0.0-beta.5
  - @remirror/messages@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.6
  - @remirror/react-hooks@3.0.0-beta.8
  - @remirror/extension-blockquote@3.0.0-beta.8
  - @remirror/extension-bold@3.0.0-beta.8
  - @remirror/extension-callout@3.0.0-beta.8
  - @remirror/extension-code@3.0.0-beta.8
  - @remirror/extension-code-block@3.0.0-beta.8
  - @remirror/extension-columns@3.0.0-beta.8
  - @remirror/extension-find@1.0.0-beta.8
  - @remirror/extension-font-size@3.0.0-beta.8
  - @remirror/extension-heading@3.0.0-beta.8
  - @remirror/extension-history@3.0.0-beta.8
  - @remirror/extension-horizontal-rule@3.0.0-beta.8
  - @remirror/extension-italic@3.0.0-beta.8
  - @remirror/extension-list@3.0.0-beta.8
  - @remirror/extension-node-formatting@3.0.0-beta.8
  - @remirror/extension-positioner@3.0.0-beta.8
  - @remirror/extension-strike@3.0.0-beta.8
  - @remirror/extension-sub@3.0.0-beta.8
  - @remirror/extension-sup@3.0.0-beta.8
  - @remirror/extension-tables@3.0.0-beta.8
  - @remirror/extension-text-color@3.0.0-beta.8
  - @remirror/extension-underline@3.0.0-beta.8
  - @remirror/extension-whitespace@3.0.0-beta.8
  - @remirror/react-components@3.0.0-beta.8
  - @remirror/react-core@3.0.0-beta.8

## 0.1.0-beta.7

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/extension-horizontal-rule@3.0.0-beta.7
  - @remirror/extension-node-formatting@3.0.0-beta.7
  - @remirror/extension-blockquote@3.0.0-beta.7
  - @remirror/extension-code-block@3.0.0-beta.7
  - @remirror/extension-positioner@3.0.0-beta.7
  - @remirror/extension-text-color@3.0.0-beta.7
  - @remirror/extension-whitespace@3.0.0-beta.7
  - @remirror/extension-font-size@3.0.0-beta.7
  - @remirror/extension-underline@3.0.0-beta.7
  - @remirror/extension-callout@3.0.0-beta.7
  - @remirror/extension-columns@3.0.0-beta.7
  - @remirror/extension-heading@3.0.0-beta.7
  - @remirror/extension-history@3.0.0-beta.7
  - @remirror/extension-italic@3.0.0-beta.7
  - @remirror/extension-strike@3.0.0-beta.7
  - @remirror/extension-tables@3.0.0-beta.7
  - @remirror/react-components@3.0.0-beta.7
  - @remirror/extension-bold@3.0.0-beta.7
  - @remirror/extension-code@3.0.0-beta.7
  - @remirror/extension-find@1.0.0-beta.7
  - @remirror/extension-list@3.0.0-beta.7
  - @remirror/extension-sub@3.0.0-beta.7
  - @remirror/extension-sup@3.0.0-beta.7
  - @remirror/react-hooks@3.0.0-beta.7
  - @remirror/react-core@3.0.0-beta.7
  - @remirror/messages@3.0.0-beta.5
  - @remirror/icons@3.0.0-beta.4
  - @remirror/theme@3.0.0-beta.5
  - @remirror/core@3.0.0-beta.7
  - @remirror/pm@3.0.0-beta.5

## 0.1.0-beta.6

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/extension-horizontal-rule@3.0.0-beta.6
  - @remirror/extension-node-formatting@3.0.0-beta.6
  - @remirror/extension-blockquote@3.0.0-beta.6
  - @remirror/extension-code-block@3.0.0-beta.6
  - @remirror/extension-positioner@3.0.0-beta.6
  - @remirror/extension-text-color@3.0.0-beta.6
  - @remirror/extension-whitespace@3.0.0-beta.6
  - @remirror/extension-font-size@3.0.0-beta.6
  - @remirror/extension-underline@3.0.0-beta.6
  - @remirror/extension-callout@3.0.0-beta.6
  - @remirror/extension-columns@3.0.0-beta.6
  - @remirror/extension-heading@3.0.0-beta.6
  - @remirror/extension-history@3.0.0-beta.6
  - @remirror/extension-italic@3.0.0-beta.6
  - @remirror/extension-strike@3.0.0-beta.6
  - @remirror/extension-tables@3.0.0-beta.6
  - @remirror/react-components@3.0.0-beta.6
  - @remirror/extension-bold@3.0.0-beta.6
  - @remirror/extension-code@3.0.0-beta.6
  - @remirror/extension-find@1.0.0-beta.6
  - @remirror/extension-list@3.0.0-beta.6
  - @remirror/extension-sub@3.0.0-beta.6
  - @remirror/extension-sup@3.0.0-beta.6
  - @remirror/react-hooks@3.0.0-beta.6
  - @remirror/react-core@3.0.0-beta.6
  - @remirror/messages@3.0.0-beta.4
  - @remirror/icons@3.0.0-beta.3
  - @remirror/theme@3.0.0-beta.4
  - @remirror/core@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.4

## 0.1.0-beta.5

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

- 9549c8f88: ## 💥 BREAKING CHANGES! 💥

  ## `CodeBlockLanguageSelector` component moved to `@remirror/react-ui` package

  The `CodeBlockLanguageSelector` component has been moved from `@remirror/extension-react-language-select` to `@remirror/react-ui`.

  While it was originally named as an "extension", upon closer examination, we've realised that its role aligns more with that of a component, rather than a true extension.

  To maintain the integrity of our [definition of an extension](https://remirror.io/docs/concepts/extension), we believe this move is necessary. This is to help provide a more accurate representation of functionality, and enhance overall understanding and usage of the library.

  Additionally `CodeBlockLanguageSelector` now renders a MUI `Select` component, rather than a native `select` element. This enables us to utilise the "auto width" behaviour, rather than implementing this behaviour ourselves.

  Furthermore, it will now render in the top _right_ corner of the code block by default, rather than the top left. Passing `position='left'` will revert to rendering in the top left corner as before.

  #### Before: Remirror v2 example

  ```tsx
  import 'remirror/styles/all.css';

  import React from 'react';
  import css from 'refractor/lang/css.js';
  import javascript from 'refractor/lang/javascript.js';
  import typescript from 'refractor/lang/typescript.js';
  import { CodeBlockExtension } from 'remirror/extensions';
  import { CodeBlockLanguageSelect } from '@remirror/extension-react-language-select';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

  const extensions = () => [
    new CodeBlockExtension({
      supportedLanguages: [css, javascript, json, markdown, typescript],
    }),
  ];

  const content = `
  <pre><code data-code-block-language="typescript">function sayHello {
    console.log('Hello world, TypeScript!')
  }</code></pre>
  `;

  const EditorWithCodeBlocks = (): JSX.Element => {
    const { manager, state } = useRemirror({
      extensions,
      content,
      stringHandler: 'html',
    });

    return (
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <CodeBlockLanguageSelect />
        </Remirror>
      </ThemeProvider>
    );
  };

  export default EditorWithCodeBlocks;
  ```

  #### After: Diff for Remirror v3 example

  ```diff
  import 'remirror/styles/all.css';

  import React from 'react';
  import css from 'refractor/lang/css.js';
  import javascript from 'refractor/lang/javascript.js';
  import typescript from 'refractor/lang/typescript.js';
  import { CodeBlockExtension } from 'remirror/extensions';
  - import { CodeBlockLanguageSelect } from '@remirror/extension-react-language-select';
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
  + import { CodeBlockLanguageSelect } from '@remirror/react-ui';

  const extensions = () => [
    new CodeBlockExtension({
      supportedLanguages: [css, javascript, json, markdown, typescript],
    }),
  ];

  const content = `
  <pre><code data-code-block-language="typescript">function sayHello {
    console.log('Hello world, TypeScript!')
  }</code></pre>
  `;

  const EditorWithCodeBlocks = (): JSX.Element => {
    const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

    return (
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <CodeBlockLanguageSelect />
        </Remirror>
      </ThemeProvider>
    );
  };

  export default EditorWithCodeBlocks;
  ```

  ## Feedback

  As always, we value your feedback on how we can improve Remirror. Please raise your proposals via [issues on GitHub](https://github.com/remirror/remirror/issues) or via our [Discord server](https://remirror.io/chat).

- Updated dependencies [469d7ce8f]
- Updated dependencies [ae349d806]
- Updated dependencies [469d7ce8f]
- Updated dependencies [9549c8f88]
- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
  - @remirror/react-hooks@3.0.0-beta.5
  - @remirror/extension-positioner@3.0.0-beta.5
  - @remirror/react-components@3.0.0-beta.5
  - @remirror/icons@3.0.0-beta.2
  - @remirror/extension-find@1.0.0-beta.5
  - @remirror/extension-code-block@3.0.0-beta.5
  - @remirror/core@3.0.0-beta.5
  - @remirror/theme@3.0.0-beta.3
  - @remirror/extension-tables@3.0.0-beta.5
  - @remirror/react-core@3.0.0-beta.5
  - @remirror/pm@3.0.0-beta.3
  - @remirror/extension-blockquote@3.0.0-beta.5
  - @remirror/extension-bold@3.0.0-beta.5
  - @remirror/extension-callout@3.0.0-beta.5
  - @remirror/extension-code@3.0.0-beta.5
  - @remirror/extension-columns@3.0.0-beta.5
  - @remirror/extension-font-size@3.0.0-beta.5
  - @remirror/extension-heading@3.0.0-beta.5
  - @remirror/extension-history@3.0.0-beta.5
  - @remirror/extension-horizontal-rule@3.0.0-beta.5
  - @remirror/extension-italic@3.0.0-beta.5
  - @remirror/extension-list@3.0.0-beta.5
  - @remirror/extension-node-formatting@3.0.0-beta.5
  - @remirror/extension-strike@3.0.0-beta.5
  - @remirror/extension-sub@3.0.0-beta.5
  - @remirror/extension-sup@3.0.0-beta.5
  - @remirror/extension-text-color@3.0.0-beta.5
  - @remirror/extension-underline@3.0.0-beta.5
  - @remirror/extension-whitespace@3.0.0-beta.5
  - @remirror/messages@3.0.0-beta.3

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
