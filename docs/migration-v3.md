---
hide_title: true
title: Migration to v3
---

# Migration to Remirror v3

This guide lays out the required steps to migrate from Remirror v2 to Remirror v3.

Consult the [announcement post](/blog/announcement-v3) to learn more about the v3 release, and what we're trying to achieve.

## Installing

```bash
npm add --save remirror@latest @remirror/react@latest @remirror/pm@latest
```

## Stage 3 decorators

Remirror v3 has been updated to use [Stage 3 decorators](https://github.com/tc39/proposal-decorators), now they have reached candidate status, and [esbuild supports them](https://github.com/evanw/esbuild/releases/tag/v0.21.0). Previously Remirror used TypeScript's experimental decorators, which use an older version of the spec.

If you use Remirror's decorators (`@extension`, `@command`, `@helper` and `@keyBinding`) in your custom extensions, you may find they no longer work. Here are a few things to try

### TypeScript

Set `experimentalDecorators` to **false** in your `tsconfig`. This ensures you don't use the older version of the decorator spec.

### Vite

If you are using Vite with the SWC plugin, see Next.js below, otherwise:

Ensure the `esbuild` version you use is _at least_ `0.21.0`, and update the `target` your Vite config

```json
{
  "esbuild": {
    "target": "ES2020"
  }
}
```

### Babel

Update your Babel config to use the latest version of the decorator spec.

```json
{
  "plugins": [["@babel/plugin-proposal-decorators", { "version": "2023-11" }]]
}
```

### Next.js

At time of writing [Next.js does not support Stage 3 decorators](https://github.com/vercel/next.js/issues/48360).

We recommend using our _legacy_ decorators (see below).

### Help! None of the above worked

If all else fails, you can revert to using the legacy decorators. Please update your imports so that

| Old name     | New name           |
| ------------ | ------------------ |
| `command`    | `legacyCommand`    |
| `helper`     | `legacyHelper`     |
| `keyBinding` | `legacyKeyBinding` |

i.e.

```ts
import { legacyCommand as command } from 'remirror';
```

The `extension` decorator is backwards compatible, so does not need updating.

Please bear in mind that these legacy decorators **are considered deprecated**, and will be removed in a future release of Remirror.

## `i18n` prop removed from `<Remirror />`

In previous versions of Remirror, the `i18n` prop of the root `<Remirror />` component allowed you to pass a customised **Lingui** instance.

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

## The `useI18n` hook return value

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

## MUI based components in `@remirror/react`, moved to new package.

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

## Removed deprecated command dry run function `isEnabled`, use `enabled` instead.

When using commands or chained commands, you can "dry run" the command to see if it can be executed against the current editor state.

For instance, you can check if `toggleBold` is enabled by running `toggleBold.enabled()` which returns a boolean indicating whether it is possible, without actually changing the editor's state.

`.isEnabled()` was an alias of `.enabled()`, but this alias has now been removed. Please use `.enabled()` instead.

```tsx
const { toggleBold } = useCommands();

const handleClick = useCallback(() => {
  if (toggleBold.isEnabled()) {
    toggleBold();
  }
}, [toggleBold]);
```

```diff
const { toggleBold } = useCommands();

const handleClick = useCallback(() => {
-  if (toggleBold.isEnabled()) {
+  if (toggleBold.enabled()) {
    toggleBold();
  }
}, [toggleBold]);
```

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

## Removed CodeMirror and Yjs extensions from default `remirror` bundle

The CodeMirror (v5) and Yjs extensions are no longer bundled with Remirror by default. If you require these extensions, Remirror v3 requires you to install these extensions directly.

#### Before: Remirror v2 example

```ts
import React from 'react';
import { BlockquoteExtension, CodeMirrorExtension, YjsExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, ToggleBoldButton, Toolbar, useRemirror } from '@remirror/react';

const extensions = () => [
  // Extension options omitted for brevity
  new BlockquoteExtension(),
  new CodeMirrorExtension(),
  new YjsExtension(),
];

/*
 Then load your extensions into Remirror

 const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Hello Remirror!</p>',
    stringHandler: 'html',
  });
 */
```

### After Remirror v3 example

```diff
import React from 'react';
- import { BlockquoteExtension, CodeMirrorExtension, YjsExtension } from 'remirror/extensions';
+ import { BlockquoteExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, ToggleBoldButton, Toolbar, useRemirror } from '@remirror/react';
+ import { CodeMirrorExtension } from '@remirror/extension-codemirror5';
+ import { YjsExtension } from '@remirror/extension-yjs';

const extensions = () => [
  // Extension options omitted for brevity (unchanged from v2)
  new BlockquoteExtension(),
  new CodeMirrorExtension(),
  new YjsExtension(),
];

/*
 Then load your extensions into Remirror

 const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Hello Remirror!</p>',
    stringHandler: 'html',
  });
 */
```

## Removed React Tables extension from default `@remirror/react` bundle

The **_React_** Tables extension is no longer bundled with Remirror by default. If you require this extension, Remirror v3 requires you to install the extension directly.

#### Before: Remirror v2 example

```tsx
import React from 'react';
import { BoldExtension } from 'remirror/extensions';
import {
  Remirror,
  TableComponents,
  TableExtension,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';

const extensions = () => [
  // Extension options omitted for brevity
  new BoldExtension(),
  new TableExtension(),
];

const content = '<p>Hello Remirror!</p>';

const EditorWithReactTables = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <TableComponents />
      </Remirror>
    </ThemeProvider>
  );
};

export default EditorWithReactTables;
```

### After Remirror v3 example

```diff
import React from 'react';
import { BoldExtension } from 'remirror/extensions';
+ import { TableComponents, TableExtension } from '@remirror/extension-react-tables';
import {
  Remirror,
-  TableComponents,
-  TableExtension,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';

const extensions = () => [
  // Extension options omitted for brevity (unchanged from v2)
  new BoldExtension(),
  new TableExtension(),
];

const content = '<p>Hello Remirror!</p>';

const EditorWithReactTables = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <TableComponents />
      </Remirror>
    </ThemeProvider>
  );
};

export default EditorWithReactTables;
```

## Update any usages of `extensionDecorator` to `extension`

The `extensionDecorator` decorator was deprecated alias and has now been removed. Please use `extension` instead

## Update any usages of `useSuggester` to `useSuggest`

The `useSuggester` React hook was deprecated alias and has now been removed. Please use the `useSuggest` hook instead.

Similarly, the type of this function has been renamed, please update any usages of `UseSuggesterProps` to `UseSuggestProps`.

## Update any usages of `getRemirrorJSON` to `getJSON`

The `getRemirrorJSON` helper function was deprecated alias and has now been removed. Please use the `getJSON` helper instead.

## `jest-prosemirror`'s `jumpTo` has been removed

Please use `selectText` instead.

## `jest-remirror` updates

We have removed the deprecated properties `start` and `end`, use `from` and `to` respectively instead.

Additionally, we have removed the deprecated function `jsdomExtras`, please use `jsdomPolyfills` instead.

## `@remirror/theme` updates

We have removed the deprecated functions `getTheme` and `getThemeProps`, please use `getThemeVar` and `getThemeVarName` respectively.

## Removed type definitions

We have removed the following types, please use the alternative suggested below.

| Old name            | New name                |
| ------------------- | ----------------------- |
| `ClickHandler`      | `ClickEventHandler`     |
| `ClickMarkHandler`  | `ClickMarkEventHandler` |
| `PromiseValue`      | `Awaited` (built in)    |
| `Mutable`           | `Writable`              |
| `UseSuggesterProps` | `UseSuggestProps`       |

## Feedback

If you spot anything we have missed in this guide, or if you run into any issues, please reach out to us on [Discord](https://remirror.io/chat).
