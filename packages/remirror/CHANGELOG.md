# remirror

## 3.0.1

> 2024-08-01

### Patch Changes

- 38f997dbb: Expose the previous versions of Remirror's decorators with a _legacy_ prefix, so users who are unable to use Stage 3 decorators are not blocked updating to Remirror v3.
- Updated dependencies [38f997dbb]
  - @remirror/core@3.0.1
  - @remirror/dom@3.0.1
  - @remirror/extension-annotation@3.0.1
  - @remirror/extension-bidi@3.0.1
  - @remirror/extension-blockquote@3.0.1
  - @remirror/extension-bold@3.0.1
  - @remirror/extension-callout@3.0.1
  - @remirror/extension-code@3.0.1
  - @remirror/extension-code-block@3.0.1
  - @remirror/extension-collaboration@3.0.1
  - @remirror/extension-columns@3.0.1
  - @remirror/extension-diff@3.0.1
  - @remirror/extension-doc@3.0.1
  - @remirror/extension-drop-cursor@3.0.1
  - @remirror/extension-embed@3.0.1
  - @remirror/extension-emoji@3.0.1
  - @remirror/extension-entity-reference@3.0.1
  - @remirror/extension-epic-mode@3.0.1
  - @remirror/extension-events@3.0.1
  - @remirror/extension-find@1.0.1
  - @remirror/extension-font-family@3.0.1
  - @remirror/extension-font-size@3.0.1
  - @remirror/extension-gap-cursor@3.0.1
  - @remirror/extension-hard-break@3.0.1
  - @remirror/extension-heading@3.0.1
  - @remirror/extension-history@3.0.1
  - @remirror/extension-horizontal-rule@3.0.1
  - @remirror/extension-image@3.0.1
  - @remirror/extension-italic@3.0.1
  - @remirror/extension-link@3.0.1
  - @remirror/extension-list@3.0.1
  - @remirror/extension-markdown@3.0.1
  - @remirror/extension-mention@3.0.1
  - @remirror/extension-mention-atom@3.0.1
  - @remirror/extension-node-formatting@3.0.1
  - @remirror/extension-paragraph@3.0.1
  - @remirror/extension-placeholder@3.0.1
  - @remirror/extension-positioner@3.0.1
  - @remirror/extension-shortcuts@3.0.1
  - @remirror/extension-strike@3.0.1
  - @remirror/extension-sub@3.0.1
  - @remirror/extension-sup@3.0.1
  - @remirror/extension-tables@3.0.1
  - @remirror/extension-text@3.0.1
  - @remirror/extension-text-case@3.0.1
  - @remirror/extension-text-color@3.0.1
  - @remirror/extension-text-highlight@3.0.1
  - @remirror/extension-trailing-node@3.0.1
  - @remirror/extension-underline@3.0.1
  - @remirror/extension-whitespace@3.0.1
  - @remirror/preset-core@3.0.1
  - @remirror/preset-formatting@3.0.1
  - @remirror/preset-wysiwyg@3.0.1

## 3.0.0

> 2024-07-30

### Major Changes

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

- f6185b950: Based on community feedback, we have decided to decouple the core of Remirror from Lingui, an internationalisation (a.k.a. i18n) library.

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

- f6185b950: 💥 BREAKING 💥: Remove deprecated decorator `extensionDecorator`. Please use `extension` instead

  Make `extension` decorator backwards compatible when called directly as a function.

- f6185b950: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- f6185b950: ## Updates

  Update dependency prettier to v3.2.5.

  ## 💥 BREAKING CHANGES! 💥

  The `formatter` prop for extension `@remirror/extension-code-block` now expects an asynchronous function.

  ```ts
  new CodeBlockExtension({
    formatter: async ({ source, language, cursorOffset }) => {
      /* format source */
    },
  });
  ```

  This change was made to support prettier v3 which no longer provides a synchronous `formatWithCursor()` function. The formatter available from `@remirror/extension-code-block/formatter` has been updated to use prettier v3 and satisfies the updated `formatter` signature.

  As a consequence, the command `formatCodeBlock` must also be asynchronous, and hence **is no longer chainable**.

- f6185b950: Update ProseMirror packages to latest versions.

  Use newly provided `Transform.setDocAttribute` to update doc node attributes, rather than custom step type.

- f6185b950: Forward-port the removal of the validate property from `main`
- f6185b950: ## 💥 BREAKING CHANGES! 💥

  ### CodemirrorExtension is no longer bundled with `remirror`

  In an effort to slim down the number of dependencies required when installing Remirror, the `CodemirrorExtension` (version 5) has been removed, from the main entry point `remirror`.

  If you still need the functionality provided by this extension, simply add `@remirror/extension-codemirror5` as a direct dependency to your application.

  #### Before: Remirror v2 example

  ```tsx
  import { CodemirrorExtension } from 'remirror/extensions';
  ```

  #### After: Remirror v3 example

  ```tsx
  import { CodemirrorExtension } from '@remirror/extension-codemirror5';
  ```

- f6185b950: Return a mention atom' label via leaf text, so it is returned in the plain text of a document.

  Allow this to be overriden via the `nodeOverrides` API

- f6185b950: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- f6185b950: Bump all packages to rebuild for browsers since 2017
- f6185b950: ## 💥 BREAKING CHANGES! 💥

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

- f6185b950: ## 💥 BREAKING CHANGES! 💥

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

- f6185b950: ## 💥 BREAKING CHANGES! 💥

  ### YjsExtension is no longer bundled with `remirror`

  In an effort to slim down the number of dependencies required when installing Remirror, the `YjsExtension` has been removed, from the main entry point `remirror`.

  If you still need the functionality provided by this extension, simply add `@remirror/extension-yjs` as a direct dependency to your application.

  #### Before: Remirror v2 example

  ```tsx
  import { YjsExtension } from 'remirror/extensions';
  ```

  #### After: Remirror v3 example

  ```tsx
  import { YjsExtension } from '@remirror/extension-yjs';
  ```

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
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
- Updated dependencies [f6185b950]
  - @remirror/extension-code-block@3.0.0
  - @remirror/core@3.0.0
  - @remirror/extension-doc@3.0.0
  - @remirror/pm@3.0.0
  - @remirror/extension-entity-reference@3.0.0
  - @remirror/extension-horizontal-rule@3.0.0
  - @remirror/extension-node-formatting@3.0.0
  - @remirror/extension-text-highlight@3.0.0
  - @remirror/extension-collaboration@3.0.0
  - @remirror/extension-trailing-node@3.0.0
  - @remirror/extension-mention-atom@3.0.0
  - @remirror/extension-drop-cursor@3.0.0
  - @remirror/extension-font-family@3.0.0
  - @remirror/extension-placeholder@3.0.0
  - @remirror/extension-annotation@3.0.0
  - @remirror/extension-blockquote@3.0.0
  - @remirror/extension-gap-cursor@3.0.0
  - @remirror/extension-hard-break@3.0.0
  - @remirror/extension-positioner@3.0.0
  - @remirror/extension-text-color@3.0.0
  - @remirror/extension-whitespace@3.0.0
  - @remirror/extension-epic-mode@3.0.0
  - @remirror/extension-font-size@3.0.0
  - @remirror/extension-paragraph@3.0.0
  - @remirror/extension-shortcuts@3.0.0
  - @remirror/extension-text-case@3.0.0
  - @remirror/extension-underline@3.0.0
  - @remirror/extension-markdown@3.0.0
  - @remirror/extension-callout@3.0.0
  - @remirror/extension-columns@3.0.0
  - @remirror/extension-heading@3.0.0
  - @remirror/extension-history@3.0.0
  - @remirror/extension-mention@3.0.0
  - @remirror/preset-formatting@3.0.0
  - @remirror/extension-events@3.0.0
  - @remirror/extension-italic@3.0.0
  - @remirror/extension-strike@3.0.0
  - @remirror/extension-tables@3.0.0
  - @remirror/extension-embed@3.0.0
  - @remirror/extension-emoji@3.0.0
  - @remirror/extension-image@3.0.0
  - @remirror/core-constants@3.0.0
  - @remirror/extension-bidi@3.0.0
  - @remirror/extension-bold@3.0.0
  - @remirror/extension-code@3.0.0
  - @remirror/extension-diff@3.0.0
  - @remirror/extension-find@1.0.0
  - @remirror/extension-link@3.0.0
  - @remirror/extension-list@3.0.0
  - @remirror/extension-text@3.0.0
  - @remirror/preset-wysiwyg@3.0.0
  - @remirror/extension-sub@3.0.0
  - @remirror/extension-sup@3.0.0
  - @remirror/core-helpers@4.0.0
  - @remirror/preset-core@3.0.0
  - @remirror/core-types@3.0.0
  - @remirror/core-utils@3.0.0
  - @remirror/icons@3.0.0
  - @remirror/theme@3.0.0
  - @remirror/dom@3.0.0

## 3.0.0-rc.9

> 2024-07-25

### Patch Changes

- b23f87320: ## Updates

  Update dependency prettier to v3.2.5.

  ## 💥 BREAKING CHANGES! 💥

  The `formatter` prop for extension `@remirror/extension-code-block` now expects an asynchronous function.

  ```ts
  new CodeBlockExtension({
    formatter: async ({ source, language, cursorOffset }) => {
      /* format source */
    },
  });
  ```

  This change was made to support prettier v3 which no longer provides a synchronous `formatWithCursor()` function. The formatter available from `@remirror/extension-code-block/formatter` has been updated to use prettier v3 and satisfies the updated `formatter` signature.

  As a consequence, the command `formatCodeBlock` must also be asynchronous, and hence **is no longer chainable**.

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
  - @remirror/preset-wysiwyg@3.0.0-rc.9

## 3.0.0-beta.8

> 2024-07-22

### Patch Changes

- f2425a391: ## 💥 BREAKING CHANGES! 💥

  ### CodemirrorExtension is no longer bundled with `remirror`

  In an effort to slim down the number of dependencies required when installing Remirror, the `CodemirrorExtension` (version 5) has been removed, from the main entry point `remirror`.

  If you still need the functionality provided by this extension, simply add `@remirror/extension-codemirror5` as a direct dependency to your application.

  #### Before: Remirror v2 example

  ```tsx
  import { CodemirrorExtension } from 'remirror/extensions';
  ```

  #### After: Remirror v3 example

  ```tsx
  import { CodemirrorExtension } from '@remirror/extension-codemirror5';
  ```

- 16660dded: ## 💥 BREAKING CHANGES! 💥

  ### YjsExtension is no longer bundled with `remirror`

  In an effort to slim down the number of dependencies required when installing Remirror, the `YjsExtension` has been removed, from the main entry point `remirror`.

  If you still need the functionality provided by this extension, simply add `@remirror/extension-yjs` as a direct dependency to your application.

  #### Before: Remirror v2 example

  ```tsx
  import { YjsExtension } from 'remirror/extensions';
  ```

  #### After: Remirror v3 example

  ```tsx
  import { YjsExtension } from '@remirror/extension-yjs';
  ```

- Updated dependencies [bffe2fd61]
  - @remirror/core-helpers@4.0.0-beta.5
  - @remirror/core@3.0.0-beta.8
  - @remirror/core-utils@3.0.0-beta.6
  - @remirror/icons@3.0.0-beta.5
  - @remirror/pm@3.0.0-beta.6
  - @remirror/dom@3.0.0-beta.8
  - @remirror/extension-annotation@3.0.0-beta.8
  - @remirror/extension-bidi@3.0.0-beta.8
  - @remirror/extension-blockquote@3.0.0-beta.8
  - @remirror/extension-bold@3.0.0-beta.8
  - @remirror/extension-callout@3.0.0-beta.8
  - @remirror/extension-code@3.0.0-beta.8
  - @remirror/extension-code-block@3.0.0-beta.8
  - @remirror/extension-collaboration@3.0.0-beta.8
  - @remirror/extension-columns@3.0.0-beta.8
  - @remirror/extension-diff@3.0.0-beta.8
  - @remirror/extension-doc@3.0.0-beta.8
  - @remirror/extension-drop-cursor@3.0.0-beta.8
  - @remirror/extension-embed@3.0.0-beta.8
  - @remirror/extension-emoji@3.0.0-beta.8
  - @remirror/extension-entity-reference@3.0.0-beta.8
  - @remirror/extension-epic-mode@3.0.0-beta.8
  - @remirror/extension-events@3.0.0-beta.8
  - @remirror/extension-find@1.0.0-beta.8
  - @remirror/extension-font-family@3.0.0-beta.8
  - @remirror/extension-font-size@3.0.0-beta.8
  - @remirror/extension-gap-cursor@3.0.0-beta.8
  - @remirror/extension-hard-break@3.0.0-beta.8
  - @remirror/extension-heading@3.0.0-beta.8
  - @remirror/extension-history@3.0.0-beta.8
  - @remirror/extension-horizontal-rule@3.0.0-beta.8
  - @remirror/extension-image@3.0.0-beta.8
  - @remirror/extension-italic@3.0.0-beta.8
  - @remirror/extension-link@3.0.0-beta.8
  - @remirror/extension-list@3.0.0-beta.8
  - @remirror/extension-markdown@3.0.0-beta.8
  - @remirror/extension-mention@3.0.0-beta.8
  - @remirror/extension-mention-atom@3.0.0-beta.8
  - @remirror/extension-node-formatting@3.0.0-beta.8
  - @remirror/extension-paragraph@3.0.0-beta.8
  - @remirror/extension-placeholder@3.0.0-beta.8
  - @remirror/extension-positioner@3.0.0-beta.8
  - @remirror/extension-shortcuts@3.0.0-beta.8
  - @remirror/extension-strike@3.0.0-beta.8
  - @remirror/extension-sub@3.0.0-beta.8
  - @remirror/extension-sup@3.0.0-beta.8
  - @remirror/extension-tables@3.0.0-beta.8
  - @remirror/extension-text@3.0.0-beta.8
  - @remirror/extension-text-case@3.0.0-beta.8
  - @remirror/extension-text-color@3.0.0-beta.8
  - @remirror/extension-text-highlight@3.0.0-beta.8
  - @remirror/extension-trailing-node@3.0.0-beta.8
  - @remirror/extension-underline@3.0.0-beta.8
  - @remirror/extension-whitespace@3.0.0-beta.8
  - @remirror/preset-core@3.0.0-beta.8
  - @remirror/preset-formatting@3.0.0-beta.8
  - @remirror/preset-wysiwyg@3.0.0-beta.8

## 3.0.0-beta.7

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/extension-entity-reference@3.0.0-beta.7
  - @remirror/extension-horizontal-rule@3.0.0-beta.7
  - @remirror/extension-node-formatting@3.0.0-beta.7
  - @remirror/extension-text-highlight@3.0.0-beta.7
  - @remirror/extension-collaboration@3.0.0-beta.7
  - @remirror/extension-trailing-node@3.0.0-beta.7
  - @remirror/extension-mention-atom@3.0.0-beta.7
  - @remirror/extension-codemirror5@3.0.0-beta.7
  - @remirror/extension-drop-cursor@3.0.0-beta.7
  - @remirror/extension-font-family@3.0.0-beta.7
  - @remirror/extension-placeholder@3.0.0-beta.7
  - @remirror/extension-annotation@3.0.0-beta.7
  - @remirror/extension-blockquote@3.0.0-beta.7
  - @remirror/extension-code-block@3.0.0-beta.7
  - @remirror/extension-gap-cursor@3.0.0-beta.7
  - @remirror/extension-hard-break@3.0.0-beta.7
  - @remirror/extension-positioner@3.0.0-beta.7
  - @remirror/extension-text-color@3.0.0-beta.7
  - @remirror/extension-whitespace@3.0.0-beta.7
  - @remirror/extension-epic-mode@3.0.0-beta.7
  - @remirror/extension-font-size@3.0.0-beta.7
  - @remirror/extension-paragraph@3.0.0-beta.7
  - @remirror/extension-shortcuts@3.0.0-beta.7
  - @remirror/extension-text-case@3.0.0-beta.7
  - @remirror/extension-underline@3.0.0-beta.7
  - @remirror/extension-markdown@3.0.0-beta.7
  - @remirror/extension-callout@3.0.0-beta.7
  - @remirror/extension-columns@3.0.0-beta.7
  - @remirror/extension-heading@3.0.0-beta.7
  - @remirror/extension-history@3.0.0-beta.7
  - @remirror/extension-mention@3.0.0-beta.7
  - @remirror/preset-formatting@3.0.0-beta.7
  - @remirror/extension-events@3.0.0-beta.7
  - @remirror/extension-italic@3.0.0-beta.7
  - @remirror/extension-strike@3.0.0-beta.7
  - @remirror/extension-tables@3.0.0-beta.7
  - @remirror/extension-embed@3.0.0-beta.7
  - @remirror/extension-emoji@3.0.0-beta.7
  - @remirror/extension-image@3.0.0-beta.7
  - @remirror/core-constants@3.0.0-beta.4
  - @remirror/extension-bidi@3.0.0-beta.7
  - @remirror/extension-bold@3.0.0-beta.7
  - @remirror/extension-code@3.0.0-beta.7
  - @remirror/extension-diff@3.0.0-beta.7
  - @remirror/extension-find@1.0.0-beta.7
  - @remirror/extension-link@3.0.0-beta.7
  - @remirror/extension-list@3.0.0-beta.7
  - @remirror/extension-text@3.0.0-beta.7
  - @remirror/preset-wysiwyg@3.0.0-beta.7
  - @remirror/extension-doc@3.0.0-beta.7
  - @remirror/extension-sub@3.0.0-beta.7
  - @remirror/extension-sup@3.0.0-beta.7
  - @remirror/extension-yjs@4.0.0-beta.7
  - @remirror/core-helpers@4.0.0-beta.4
  - @remirror/preset-core@3.0.0-beta.7
  - @remirror/core-types@3.0.0-beta.5
  - @remirror/core-utils@3.0.0-beta.5
  - @remirror/icons@3.0.0-beta.4
  - @remirror/theme@3.0.0-beta.5
  - @remirror/core@3.0.0-beta.7
  - @remirror/dom@3.0.0-beta.7
  - @remirror/pm@3.0.0-beta.5

## 3.0.0-beta.6

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/extension-entity-reference@3.0.0-beta.6
  - @remirror/extension-horizontal-rule@3.0.0-beta.6
  - @remirror/extension-node-formatting@3.0.0-beta.6
  - @remirror/extension-text-highlight@3.0.0-beta.6
  - @remirror/extension-collaboration@3.0.0-beta.6
  - @remirror/extension-trailing-node@3.0.0-beta.6
  - @remirror/extension-mention-atom@3.0.0-beta.6
  - @remirror/extension-codemirror5@3.0.0-beta.6
  - @remirror/extension-drop-cursor@3.0.0-beta.6
  - @remirror/extension-font-family@3.0.0-beta.6
  - @remirror/extension-placeholder@3.0.0-beta.6
  - @remirror/extension-annotation@3.0.0-beta.6
  - @remirror/extension-blockquote@3.0.0-beta.6
  - @remirror/extension-code-block@3.0.0-beta.6
  - @remirror/extension-gap-cursor@3.0.0-beta.6
  - @remirror/extension-hard-break@3.0.0-beta.6
  - @remirror/extension-positioner@3.0.0-beta.6
  - @remirror/extension-text-color@3.0.0-beta.6
  - @remirror/extension-whitespace@3.0.0-beta.6
  - @remirror/extension-epic-mode@3.0.0-beta.6
  - @remirror/extension-font-size@3.0.0-beta.6
  - @remirror/extension-paragraph@3.0.0-beta.6
  - @remirror/extension-shortcuts@3.0.0-beta.6
  - @remirror/extension-text-case@3.0.0-beta.6
  - @remirror/extension-underline@3.0.0-beta.6
  - @remirror/extension-markdown@3.0.0-beta.6
  - @remirror/extension-callout@3.0.0-beta.6
  - @remirror/extension-columns@3.0.0-beta.6
  - @remirror/extension-heading@3.0.0-beta.6
  - @remirror/extension-history@3.0.0-beta.6
  - @remirror/extension-mention@3.0.0-beta.6
  - @remirror/preset-formatting@3.0.0-beta.6
  - @remirror/extension-events@3.0.0-beta.6
  - @remirror/extension-italic@3.0.0-beta.6
  - @remirror/extension-strike@3.0.0-beta.6
  - @remirror/extension-tables@3.0.0-beta.6
  - @remirror/extension-embed@3.0.0-beta.6
  - @remirror/extension-emoji@3.0.0-beta.6
  - @remirror/extension-image@3.0.0-beta.6
  - @remirror/core-constants@3.0.0-beta.3
  - @remirror/extension-bidi@3.0.0-beta.6
  - @remirror/extension-bold@3.0.0-beta.6
  - @remirror/extension-code@3.0.0-beta.6
  - @remirror/extension-diff@3.0.0-beta.6
  - @remirror/extension-find@1.0.0-beta.6
  - @remirror/extension-link@3.0.0-beta.6
  - @remirror/extension-list@3.0.0-beta.6
  - @remirror/extension-text@3.0.0-beta.6
  - @remirror/preset-wysiwyg@3.0.0-beta.6
  - @remirror/extension-doc@3.0.0-beta.6
  - @remirror/extension-sub@3.0.0-beta.6
  - @remirror/extension-sup@3.0.0-beta.6
  - @remirror/extension-yjs@4.0.0-beta.6
  - @remirror/core-helpers@4.0.0-beta.3
  - @remirror/preset-core@3.0.0-beta.6
  - @remirror/core-types@3.0.0-beta.4
  - @remirror/core-utils@3.0.0-beta.4
  - @remirror/icons@3.0.0-beta.3
  - @remirror/theme@3.0.0-beta.4
  - @remirror/core@3.0.0-beta.6
  - @remirror/dom@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.4

## 3.0.0-beta.5

> 2023-11-20

### Major Changes

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

- Updated dependencies [ae349d806]
- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
- Updated dependencies [9549c8f88]
- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
  - @remirror/preset-wysiwyg@3.0.0-beta.5
  - @remirror/extension-positioner@3.0.0-beta.5
  - @remirror/icons@3.0.0-beta.2
  - @remirror/extension-find@1.0.0-beta.5
  - @remirror/core-constants@3.0.0-beta.2
  - @remirror/extension-codemirror5@3.0.0-beta.5
  - @remirror/extension-code-block@3.0.0-beta.5
  - @remirror/core@3.0.0-beta.5
  - @remirror/theme@3.0.0-beta.3
  - @remirror/extension-events@3.0.0-beta.5
  - @remirror/extension-annotation@3.0.0-beta.5
  - @remirror/extension-entity-reference@3.0.0-beta.5
  - @remirror/extension-tables@3.0.0-beta.5
  - @remirror/preset-core@3.0.0-beta.5
  - @remirror/core-helpers@4.0.0-beta.2
  - @remirror/core-types@3.0.0-beta.3
  - @remirror/core-utils@3.0.0-beta.3
  - @remirror/pm@3.0.0-beta.3
  - @remirror/dom@3.0.0-beta.5
  - @remirror/extension-bidi@3.0.0-beta.5
  - @remirror/extension-blockquote@3.0.0-beta.5
  - @remirror/extension-bold@3.0.0-beta.5
  - @remirror/extension-callout@3.0.0-beta.5
  - @remirror/extension-code@3.0.0-beta.5
  - @remirror/extension-collaboration@3.0.0-beta.5
  - @remirror/extension-columns@3.0.0-beta.5
  - @remirror/extension-diff@3.0.0-beta.5
  - @remirror/extension-doc@3.0.0-beta.5
  - @remirror/extension-drop-cursor@3.0.0-beta.5
  - @remirror/extension-embed@3.0.0-beta.5
  - @remirror/extension-emoji@3.0.0-beta.5
  - @remirror/extension-epic-mode@3.0.0-beta.5
  - @remirror/extension-font-family@3.0.0-beta.5
  - @remirror/extension-font-size@3.0.0-beta.5
  - @remirror/extension-gap-cursor@3.0.0-beta.5
  - @remirror/extension-hard-break@3.0.0-beta.5
  - @remirror/extension-heading@3.0.0-beta.5
  - @remirror/extension-history@3.0.0-beta.5
  - @remirror/extension-horizontal-rule@3.0.0-beta.5
  - @remirror/extension-image@3.0.0-beta.5
  - @remirror/extension-italic@3.0.0-beta.5
  - @remirror/extension-link@3.0.0-beta.5
  - @remirror/extension-list@3.0.0-beta.5
  - @remirror/extension-markdown@3.0.0-beta.5
  - @remirror/extension-mention@3.0.0-beta.5
  - @remirror/extension-mention-atom@3.0.0-beta.5
  - @remirror/extension-node-formatting@3.0.0-beta.5
  - @remirror/extension-paragraph@3.0.0-beta.5
  - @remirror/extension-placeholder@3.0.0-beta.5
  - @remirror/extension-shortcuts@3.0.0-beta.5
  - @remirror/extension-strike@3.0.0-beta.5
  - @remirror/extension-sub@3.0.0-beta.5
  - @remirror/extension-sup@3.0.0-beta.5
  - @remirror/extension-text@3.0.0-beta.5
  - @remirror/extension-text-case@3.0.0-beta.5
  - @remirror/extension-text-color@3.0.0-beta.5
  - @remirror/extension-text-highlight@3.0.0-beta.5
  - @remirror/extension-trailing-node@3.0.0-beta.5
  - @remirror/extension-underline@3.0.0-beta.5
  - @remirror/extension-whitespace@3.0.0-beta.5
  - @remirror/extension-yjs@4.0.0-beta.5
  - @remirror/preset-formatting@3.0.0-beta.5

## 3.0.0-beta.4

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/extension-entity-reference@3.0.0-beta.4
  - @remirror/extension-horizontal-rule@3.0.0-beta.4
  - @remirror/extension-node-formatting@3.0.0-beta.4
  - @remirror/extension-text-highlight@3.0.0-beta.4
  - @remirror/extension-collaboration@3.0.0-beta.4
  - @remirror/extension-trailing-node@3.0.0-beta.4
  - @remirror/extension-mention-atom@3.0.0-beta.4
  - @remirror/extension-codemirror5@3.0.0-beta.4
  - @remirror/extension-drop-cursor@3.0.0-beta.4
  - @remirror/extension-font-family@3.0.0-beta.4
  - @remirror/extension-placeholder@3.0.0-beta.4
  - @remirror/extension-annotation@3.0.0-beta.4
  - @remirror/extension-blockquote@3.0.0-beta.4
  - @remirror/extension-code-block@3.0.0-beta.4
  - @remirror/extension-gap-cursor@3.0.0-beta.4
  - @remirror/extension-hard-break@3.0.0-beta.4
  - @remirror/extension-positioner@3.0.0-beta.4
  - @remirror/extension-text-color@3.0.0-beta.4
  - @remirror/extension-whitespace@3.0.0-beta.4
  - @remirror/extension-epic-mode@3.0.0-beta.4
  - @remirror/extension-font-size@3.0.0-beta.4
  - @remirror/extension-paragraph@3.0.0-beta.4
  - @remirror/extension-shortcuts@3.0.0-beta.4
  - @remirror/extension-text-case@3.0.0-beta.4
  - @remirror/extension-underline@3.0.0-beta.4
  - @remirror/extension-markdown@3.0.0-beta.4
  - @remirror/extension-callout@3.0.0-beta.4
  - @remirror/extension-columns@3.0.0-beta.4
  - @remirror/extension-heading@3.0.0-beta.4
  - @remirror/extension-history@3.0.0-beta.4
  - @remirror/extension-mention@3.0.0-beta.4
  - @remirror/preset-formatting@3.0.0-beta.4
  - @remirror/extension-events@3.0.0-beta.4
  - @remirror/extension-italic@3.0.0-beta.4
  - @remirror/extension-search@3.0.0-beta.4
  - @remirror/extension-strike@3.0.0-beta.4
  - @remirror/extension-tables@3.0.0-beta.4
  - @remirror/extension-embed@3.0.0-beta.4
  - @remirror/extension-emoji@3.0.0-beta.4
  - @remirror/extension-image@3.0.0-beta.4
  - @remirror/core-constants@3.0.0-beta.1
  - @remirror/extension-bidi@3.0.0-beta.4
  - @remirror/extension-bold@3.0.0-beta.4
  - @remirror/extension-code@3.0.0-beta.4
  - @remirror/extension-diff@3.0.0-beta.4
  - @remirror/extension-link@3.0.0-beta.4
  - @remirror/extension-list@3.0.0-beta.4
  - @remirror/extension-text@3.0.0-beta.4
  - @remirror/preset-wysiwyg@3.0.0-beta.4
  - @remirror/extension-doc@3.0.0-beta.4
  - @remirror/extension-sub@3.0.0-beta.4
  - @remirror/extension-sup@3.0.0-beta.4
  - @remirror/extension-yjs@4.0.0-beta.4
  - @remirror/core-helpers@4.0.0-beta.1
  - @remirror/preset-core@3.0.0-beta.4
  - @remirror/core-types@3.0.0-beta.2
  - @remirror/core-utils@3.0.0-beta.2
  - @remirror/icons@3.0.0-beta.1
  - @remirror/theme@3.0.0-beta.2
  - @remirror/core@3.0.0-beta.4
  - @remirror/dom@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.2

## 3.0.0-beta.3

> 2023-11-08

### Patch Changes

- Updated dependencies [46e903ed9]
  - @remirror/core@3.0.0-beta.3
  - @remirror/dom@3.0.0-beta.3
  - @remirror/extension-annotation@3.0.0-beta.3
  - @remirror/extension-bidi@3.0.0-beta.3
  - @remirror/extension-blockquote@3.0.0-beta.3
  - @remirror/extension-bold@3.0.0-beta.3
  - @remirror/extension-callout@3.0.0-beta.3
  - @remirror/extension-code@3.0.0-beta.3
  - @remirror/extension-code-block@3.0.0-beta.3
  - @remirror/extension-codemirror5@3.0.0-beta.3
  - @remirror/extension-collaboration@3.0.0-beta.3
  - @remirror/extension-columns@3.0.0-beta.3
  - @remirror/extension-diff@3.0.0-beta.3
  - @remirror/extension-doc@3.0.0-beta.3
  - @remirror/extension-drop-cursor@3.0.0-beta.3
  - @remirror/extension-embed@3.0.0-beta.3
  - @remirror/extension-emoji@3.0.0-beta.3
  - @remirror/extension-entity-reference@3.0.0-beta.3
  - @remirror/extension-epic-mode@3.0.0-beta.3
  - @remirror/extension-events@3.0.0-beta.3
  - @remirror/extension-font-family@3.0.0-beta.3
  - @remirror/extension-font-size@3.0.0-beta.3
  - @remirror/extension-gap-cursor@3.0.0-beta.3
  - @remirror/extension-hard-break@3.0.0-beta.3
  - @remirror/extension-heading@3.0.0-beta.3
  - @remirror/extension-history@3.0.0-beta.3
  - @remirror/extension-horizontal-rule@3.0.0-beta.3
  - @remirror/extension-image@3.0.0-beta.3
  - @remirror/extension-italic@3.0.0-beta.3
  - @remirror/extension-link@3.0.0-beta.3
  - @remirror/extension-list@3.0.0-beta.3
  - @remirror/extension-markdown@3.0.0-beta.3
  - @remirror/extension-mention@3.0.0-beta.3
  - @remirror/extension-mention-atom@3.0.0-beta.3
  - @remirror/extension-node-formatting@3.0.0-beta.3
  - @remirror/extension-paragraph@3.0.0-beta.3
  - @remirror/extension-placeholder@3.0.0-beta.3
  - @remirror/extension-positioner@3.0.0-beta.3
  - @remirror/extension-search@3.0.0-beta.3
  - @remirror/extension-shortcuts@3.0.0-beta.3
  - @remirror/extension-strike@3.0.0-beta.3
  - @remirror/extension-sub@3.0.0-beta.3
  - @remirror/extension-sup@3.0.0-beta.3
  - @remirror/extension-tables@3.0.0-beta.3
  - @remirror/extension-text@3.0.0-beta.3
  - @remirror/extension-text-case@3.0.0-beta.3
  - @remirror/extension-text-color@3.0.0-beta.3
  - @remirror/extension-text-highlight@3.0.0-beta.3
  - @remirror/extension-trailing-node@3.0.0-beta.3
  - @remirror/extension-underline@3.0.0-beta.3
  - @remirror/extension-whitespace@3.0.0-beta.3
  - @remirror/extension-yjs@4.0.0-beta.3
  - @remirror/preset-core@3.0.0-beta.3
  - @remirror/preset-formatting@3.0.0-beta.3
  - @remirror/preset-wysiwyg@3.0.0-beta.3

## 3.0.0-beta.2

> 2023-11-07

### Patch Changes

- Updated dependencies [47bda7aab]
  - @remirror/core@3.0.0-beta.2
  - @remirror/dom@3.0.0-beta.2
  - @remirror/extension-annotation@3.0.0-beta.2
  - @remirror/extension-bidi@3.0.0-beta.2
  - @remirror/extension-blockquote@3.0.0-beta.2
  - @remirror/extension-bold@3.0.0-beta.2
  - @remirror/extension-callout@3.0.0-beta.2
  - @remirror/extension-code@3.0.0-beta.2
  - @remirror/extension-code-block@3.0.0-beta.2
  - @remirror/extension-codemirror5@3.0.0-beta.2
  - @remirror/extension-collaboration@3.0.0-beta.2
  - @remirror/extension-columns@3.0.0-beta.2
  - @remirror/extension-diff@3.0.0-beta.2
  - @remirror/extension-doc@3.0.0-beta.2
  - @remirror/extension-drop-cursor@3.0.0-beta.2
  - @remirror/extension-embed@3.0.0-beta.2
  - @remirror/extension-emoji@3.0.0-beta.2
  - @remirror/extension-entity-reference@3.0.0-beta.2
  - @remirror/extension-epic-mode@3.0.0-beta.2
  - @remirror/extension-events@3.0.0-beta.2
  - @remirror/extension-font-family@3.0.0-beta.2
  - @remirror/extension-font-size@3.0.0-beta.2
  - @remirror/extension-gap-cursor@3.0.0-beta.2
  - @remirror/extension-hard-break@3.0.0-beta.2
  - @remirror/extension-heading@3.0.0-beta.2
  - @remirror/extension-history@3.0.0-beta.2
  - @remirror/extension-horizontal-rule@3.0.0-beta.2
  - @remirror/extension-image@3.0.0-beta.2
  - @remirror/extension-italic@3.0.0-beta.2
  - @remirror/extension-link@3.0.0-beta.2
  - @remirror/extension-list@3.0.0-beta.2
  - @remirror/extension-markdown@3.0.0-beta.2
  - @remirror/extension-mention@3.0.0-beta.2
  - @remirror/extension-mention-atom@3.0.0-beta.2
  - @remirror/extension-node-formatting@3.0.0-beta.2
  - @remirror/extension-paragraph@3.0.0-beta.2
  - @remirror/extension-placeholder@3.0.0-beta.2
  - @remirror/extension-positioner@3.0.0-beta.2
  - @remirror/extension-search@3.0.0-beta.2
  - @remirror/extension-shortcuts@3.0.0-beta.2
  - @remirror/extension-strike@3.0.0-beta.2
  - @remirror/extension-sub@3.0.0-beta.2
  - @remirror/extension-sup@3.0.0-beta.2
  - @remirror/extension-tables@3.0.0-beta.2
  - @remirror/extension-text@3.0.0-beta.2
  - @remirror/extension-text-case@3.0.0-beta.2
  - @remirror/extension-text-color@3.0.0-beta.2
  - @remirror/extension-text-highlight@3.0.0-beta.2
  - @remirror/extension-trailing-node@3.0.0-beta.2
  - @remirror/extension-underline@3.0.0-beta.2
  - @remirror/extension-whitespace@3.0.0-beta.2
  - @remirror/extension-yjs@4.0.0-beta.2
  - @remirror/preset-core@3.0.0-beta.2
  - @remirror/preset-formatting@3.0.0-beta.2
  - @remirror/preset-wysiwyg@3.0.0-beta.2

## 3.0.0-beta.1

> 2023-11-06

### Patch Changes

- b1d683fdb: Update ProseMirror packages to latest versions.

  Use newly provided `Transform.setDocAttribute` to update doc node attributes, rather than custom step type.

- d3954076f: Return a mention atom' label via leaf text, so it is returned in the plain text of a document.

  Allow this to be overriden via the `nodeOverrides` API

- 0e4abae1b: 💥 BREAKING 💥: Remove deprecated decorator `extensionDecorator`. Please use `extension` instead

  Make `extension` decorator backwards compatible when called directly as a function.

- Updated dependencies [b1d683fdb]
- Updated dependencies [d3954076f]
- Updated dependencies [0e4abae1b]
  - @remirror/extension-doc@3.0.0-beta.1
  - @remirror/extension-yjs@4.0.0-beta.1
  - @remirror/pm@3.0.0-beta.1
  - @remirror/extension-mention-atom@3.0.0-beta.1
  - @remirror/core-types@3.0.0-beta.1
  - @remirror/core@3.0.0-beta.1
  - @remirror/preset-core@3.0.0-beta.1
  - @remirror/core-utils@3.0.0-beta.1
  - @remirror/dom@3.0.0-beta.1
  - @remirror/extension-annotation@3.0.0-beta.1
  - @remirror/extension-bidi@3.0.0-beta.1
  - @remirror/extension-blockquote@3.0.0-beta.1
  - @remirror/extension-bold@3.0.0-beta.1
  - @remirror/extension-callout@3.0.0-beta.1
  - @remirror/extension-code@3.0.0-beta.1
  - @remirror/extension-code-block@3.0.0-beta.1
  - @remirror/extension-codemirror5@3.0.0-beta.1
  - @remirror/extension-collaboration@3.0.0-beta.1
  - @remirror/extension-columns@3.0.0-beta.1
  - @remirror/extension-diff@3.0.0-beta.1
  - @remirror/extension-drop-cursor@3.0.0-beta.1
  - @remirror/extension-embed@3.0.0-beta.1
  - @remirror/extension-emoji@3.0.0-beta.1
  - @remirror/extension-entity-reference@3.0.0-beta.1
  - @remirror/extension-epic-mode@3.0.0-beta.1
  - @remirror/extension-events@3.0.0-beta.1
  - @remirror/extension-font-family@3.0.0-beta.1
  - @remirror/extension-font-size@3.0.0-beta.1
  - @remirror/extension-gap-cursor@3.0.0-beta.1
  - @remirror/extension-hard-break@3.0.0-beta.1
  - @remirror/extension-heading@3.0.0-beta.1
  - @remirror/extension-history@3.0.0-beta.1
  - @remirror/extension-horizontal-rule@3.0.0-beta.1
  - @remirror/extension-image@3.0.0-beta.1
  - @remirror/extension-italic@3.0.0-beta.1
  - @remirror/extension-link@3.0.0-beta.1
  - @remirror/extension-list@3.0.0-beta.1
  - @remirror/extension-markdown@3.0.0-beta.1
  - @remirror/extension-mention@3.0.0-beta.1
  - @remirror/extension-node-formatting@3.0.0-beta.1
  - @remirror/extension-paragraph@3.0.0-beta.1
  - @remirror/extension-placeholder@3.0.0-beta.1
  - @remirror/extension-positioner@3.0.0-beta.1
  - @remirror/extension-search@3.0.0-beta.1
  - @remirror/extension-shortcuts@3.0.0-beta.1
  - @remirror/extension-strike@3.0.0-beta.1
  - @remirror/extension-sub@3.0.0-beta.1
  - @remirror/extension-sup@3.0.0-beta.1
  - @remirror/extension-tables@3.0.0-beta.1
  - @remirror/extension-text@3.0.0-beta.1
  - @remirror/extension-text-case@3.0.0-beta.1
  - @remirror/extension-text-color@3.0.0-beta.1
  - @remirror/extension-text-highlight@3.0.0-beta.1
  - @remirror/extension-trailing-node@3.0.0-beta.1
  - @remirror/extension-underline@3.0.0-beta.1
  - @remirror/extension-whitespace@3.0.0-beta.1
  - @remirror/preset-formatting@3.0.0-beta.1
  - @remirror/preset-wysiwyg@3.0.0-beta.1
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
  - @remirror/core-types@3.0.0-beta.0
  - @remirror/core-utils@3.0.0-beta.0
  - @remirror/core@3.0.0-beta.0
  - @remirror/extension-bidi@3.0.0-beta.0
  - @remirror/extension-callout@3.0.0-beta.0
  - @remirror/extension-columns@3.0.0-beta.0
  - @remirror/extension-heading@3.0.0-beta.0
  - @remirror/extension-text-color@3.0.0-beta.0
  - @remirror/extension-entity-reference@3.0.0-beta.0
  - @remirror/extension-horizontal-rule@3.0.0-beta.0
  - @remirror/extension-node-formatting@3.0.0-beta.0
  - @remirror/extension-text-highlight@3.0.0-beta.0
  - @remirror/extension-collaboration@3.0.0-beta.0
  - @remirror/extension-trailing-node@3.0.0-beta.0
  - @remirror/extension-mention-atom@3.0.0-beta.0
  - @remirror/extension-codemirror5@3.0.0-beta.0
  - @remirror/extension-drop-cursor@3.0.0-beta.0
  - @remirror/extension-font-family@3.0.0-beta.0
  - @remirror/extension-placeholder@3.0.0-beta.0
  - @remirror/extension-annotation@3.0.0-beta.0
  - @remirror/extension-blockquote@3.0.0-beta.0
  - @remirror/extension-code-block@3.0.0-beta.0
  - @remirror/extension-gap-cursor@3.0.0-beta.0
  - @remirror/extension-hard-break@3.0.0-beta.0
  - @remirror/extension-positioner@3.0.0-beta.0
  - @remirror/extension-whitespace@3.0.0-beta.0
  - @remirror/extension-epic-mode@3.0.0-beta.0
  - @remirror/extension-font-size@3.0.0-beta.0
  - @remirror/extension-paragraph@3.0.0-beta.0
  - @remirror/extension-shortcuts@3.0.0-beta.0
  - @remirror/extension-text-case@3.0.0-beta.0
  - @remirror/extension-underline@3.0.0-beta.0
  - @remirror/extension-markdown@3.0.0-beta.0
  - @remirror/extension-history@3.0.0-beta.0
  - @remirror/extension-mention@3.0.0-beta.0
  - @remirror/preset-formatting@3.0.0-beta.0
  - @remirror/extension-events@3.0.0-beta.0
  - @remirror/extension-italic@3.0.0-beta.0
  - @remirror/extension-search@3.0.0-beta.0
  - @remirror/extension-strike@3.0.0-beta.0
  - @remirror/extension-tables@3.0.0-beta.0
  - @remirror/extension-embed@3.0.0-beta.0
  - @remirror/extension-emoji@3.0.0-beta.0
  - @remirror/extension-image@3.0.0-beta.0
  - @remirror/core-constants@3.0.0-beta.0
  - @remirror/extension-bold@3.0.0-beta.0
  - @remirror/extension-code@3.0.0-beta.0
  - @remirror/extension-diff@3.0.0-beta.0
  - @remirror/extension-link@3.0.0-beta.0
  - @remirror/extension-list@3.0.0-beta.0
  - @remirror/extension-text@3.0.0-beta.0
  - @remirror/preset-wysiwyg@3.0.0-beta.0
  - @remirror/extension-doc@3.0.0-beta.0
  - @remirror/extension-sub@3.0.0-beta.0
  - @remirror/extension-sup@3.0.0-beta.0
  - @remirror/extension-yjs@4.0.0-beta.0
  - @remirror/core-helpers@4.0.0-beta.0
  - @remirror/preset-core@3.0.0-beta.0
  - @remirror/icons@3.0.0-beta.0
  - @remirror/theme@3.0.0-beta.0
  - @remirror/dom@3.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0

## 2.0.40

> 2024-07-18

### Patch Changes

- 29b02cca2: Allow file node attr `fileSize` to be a string.

## 2.0.39

> 2024-02-21

### Patch Changes

- 00a41e38f: Fix the html sanitizing on HTML output from markdown. Removed the default html sanitizer because it doesn't provide any security guarantees and it's not been called due to a bug in the markdown extension.
- Updated dependencies [00a41e38f]
  - @remirror/extension-markdown@2.0.14

## 2.0.38

> 2023-12-12

### Patch Changes

- 55602747f: Fix a bug where calling `commands.setTableCellBackground` overrides the style attribute of the table cell node.
- Updated dependencies [55602747f]
  - @remirror/extension-tables@2.4.1

## 2.0.37

> 2023-11-12

### Patch Changes

- 2c6456fbe: Add a `tabKeyboardShortcuts` option to `TableExtension` to enable `Tab` and `Shift-Tab` keyboard shortcuts for navigating between table cells. Defaults to `false`.
- Updated dependencies [2c6456fbe]
  - @remirror/extension-tables@2.4.0

## 2.0.36

> 2023-08-03

### Patch Changes

- 7d15cdc1f: Revert the `prettier` dependency to v2.8.8 in `@remirror/extension-code-block`.

  Prettier v3 has changed all APIs to be asynchronous. ProseMirror's APIs are mostly synchronous, so using Prettier v3's API would be challenging (although possible). `@prettier/sync` provides a synchronous Prettier v3 API, but this library can only be used in a Node.js environment, so we cannot use it either.

- Updated dependencies [7d15cdc1f]
  - @remirror/extension-code-block@2.0.18

## 2.0.35

> 2023-07-31

### Patch Changes

- 149511224: Update dependency prettier to v3
- Updated dependencies [149511224]
- Updated dependencies [d50dadf27]
  - @remirror/extension-code-block@2.0.17
  - @remirror/extension-embed@2.0.14
  - @remirror/extension-image@2.1.10
  - @remirror/extension-yjs@3.0.15
  - @remirror/pm@2.0.8

## 2.0.34

> 2023-07-30

### Patch Changes

- 2f542ccb0: move cx function from core helpers to core package
- Updated dependencies [a5bd32cf0]
- Updated dependencies [2f542ccb0]
  - @remirror/extension-events@2.1.16
  - @remirror/extension-tables@2.3.1
  - @remirror/core-helpers@3.0.0
  - @remirror/core@2.0.19
  - @remirror/core-utils@2.0.13
  - @remirror/icons@2.0.3
  - @remirror/pm@2.0.7

## 2.0.33

> 2023-07-03

### Patch Changes

- 2d3fdc511: Update lingui to latest version
- Updated dependencies [2d3fdc511]
  - @remirror/extension-text-color@2.0.15
  - @remirror/extension-callout@2.0.15
  - @remirror/extension-columns@2.0.14
  - @remirror/extension-heading@2.0.14
  - @remirror/extension-bidi@2.0.14

## 2.0.32

> 2023-05-21

### Patch Changes

- e59e75aec: Disable link click handler when contenteditable is `false`. This fixes an issue that causes clicking a link in an uneditable editor will open the link twice.
- b12e3fbfe: Remove `isolating: true` from the spec of `codeBlock` node type.
- Updated dependencies [e59e75aec]
- Updated dependencies [b12e3fbfe]
  - @remirror/extension-link@2.0.16
  - @remirror/extension-code-block@2.0.15

## 2.0.31

> 2023-04-27

### Patch Changes

- 761fbd211: Export type `ClassName`.
- Updated dependencies [761fbd211]
  - @remirror/core-helpers@2.0.3
  - @remirror/core@2.0.16

## 2.0.30

> 2023-04-27

### Patch Changes

- 93653611d: Add `cut` event.
- Updated dependencies [93653611d]
  - @remirror/extension-events@2.1.15
  - @remirror/core@2.0.15

## 2.0.29

> 2023-04-27

### Patch Changes

- b267c5dcd: Fix incorrect typing file.
- Updated dependencies [b267c5dcd]
  - @remirror/core@2.0.14

## 2.0.28

> 2023-04-26

### Patch Changes

- 86e9e5b3c: Fix incorrect typing file.
- Updated dependencies [86e9e5b3c]
  - @remirror/theme@2.0.8

## 2.0.27

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
- Updated dependencies [e88cf35bb]
  - @remirror/extension-entity-reference@2.2.6
  - @remirror/extension-horizontal-rule@2.0.13
  - @remirror/extension-node-formatting@2.0.13
  - @remirror/extension-text-highlight@2.0.14
  - @remirror/extension-collaboration@2.0.13
  - @remirror/extension-trailing-node@2.0.13
  - @remirror/extension-mention-atom@2.0.16
  - @remirror/extension-codemirror5@2.0.13
  - @remirror/extension-drop-cursor@2.0.13
  - @remirror/extension-font-family@2.0.13
  - @remirror/extension-placeholder@2.0.14
  - @remirror/extension-annotation@2.0.16
  - @remirror/extension-blockquote@2.0.14
  - @remirror/extension-code-block@2.0.14
  - @remirror/extension-gap-cursor@2.0.13
  - @remirror/extension-hard-break@2.0.13
  - @remirror/extension-positioner@2.1.8
  - @remirror/extension-text-color@2.0.14
  - @remirror/extension-whitespace@2.0.13
  - @remirror/extension-epic-mode@2.0.13
  - @remirror/extension-font-size@2.0.13
  - @remirror/extension-paragraph@2.0.13
  - @remirror/extension-shortcuts@2.0.13
  - @remirror/extension-text-case@2.0.13
  - @remirror/extension-underline@2.0.13
  - @remirror/extension-markdown@2.0.13
  - @remirror/extension-callout@2.0.14
  - @remirror/extension-columns@2.0.13
  - @remirror/extension-heading@2.0.13
  - @remirror/extension-history@2.0.13
  - @remirror/extension-mention@2.0.15
  - @remirror/preset-formatting@2.0.14
  - @remirror/extension-events@2.1.14
  - @remirror/extension-italic@2.0.13
  - @remirror/extension-search@2.0.14
  - @remirror/extension-strike@2.0.13
  - @remirror/extension-tables@2.2.10
  - @remirror/extension-embed@2.0.13
  - @remirror/extension-emoji@2.0.17
  - @remirror/extension-image@2.1.9
  - @remirror/core-constants@2.0.1
  - @remirror/extension-bidi@2.0.13
  - @remirror/extension-bold@2.0.13
  - @remirror/extension-code@2.0.13
  - @remirror/extension-diff@2.0.13
  - @remirror/extension-link@2.0.15
  - @remirror/extension-list@2.0.16
  - @remirror/extension-text@2.0.13
  - @remirror/preset-wysiwyg@2.0.19
  - @remirror/extension-doc@2.1.5
  - @remirror/extension-sub@2.0.13
  - @remirror/extension-sup@2.0.13
  - @remirror/extension-yjs@3.0.14
  - @remirror/core-helpers@2.0.2
  - @remirror/preset-core@2.0.16
  - @remirror/core-types@2.0.5
  - @remirror/core-utils@2.0.12
  - @remirror/icons@2.0.2
  - @remirror/theme@2.0.7
  - @remirror/core@2.0.13
  - @remirror/dom@2.0.16
  - @remirror/pm@2.0.5

## 2.0.26

> 2023-03-10

### Patch Changes

- Updated dependencies [5bfcb41d5]
  - @remirror/extension-yjs@3.0.13

## 2.0.25

> 2023-03-10

### Patch Changes

- Updated dependencies [7a6811d96]
  - @remirror/pm@2.0.4
  - @remirror/core@2.0.12
  - @remirror/core-types@2.0.4
  - @remirror/core-utils@2.0.11
  - @remirror/dom@2.0.15
  - @remirror/extension-annotation@2.0.15
  - @remirror/extension-bidi@2.0.12
  - @remirror/extension-blockquote@2.0.13
  - @remirror/extension-bold@2.0.12
  - @remirror/extension-callout@2.0.13
  - @remirror/extension-code@2.0.12
  - @remirror/extension-code-block@2.0.13
  - @remirror/extension-codemirror5@2.0.12
  - @remirror/extension-collaboration@2.0.12
  - @remirror/extension-columns@2.0.12
  - @remirror/extension-diff@2.0.12
  - @remirror/extension-doc@2.1.4
  - @remirror/extension-drop-cursor@2.0.12
  - @remirror/extension-embed@2.0.12
  - @remirror/extension-emoji@2.0.16
  - @remirror/extension-entity-reference@2.2.5
  - @remirror/extension-epic-mode@2.0.12
  - @remirror/extension-events@2.1.13
  - @remirror/extension-font-family@2.0.12
  - @remirror/extension-font-size@2.0.12
  - @remirror/extension-gap-cursor@2.0.12
  - @remirror/extension-hard-break@2.0.12
  - @remirror/extension-heading@2.0.12
  - @remirror/extension-history@2.0.12
  - @remirror/extension-horizontal-rule@2.0.12
  - @remirror/extension-image@2.1.8
  - @remirror/extension-italic@2.0.12
  - @remirror/extension-link@2.0.14
  - @remirror/extension-list@2.0.15
  - @remirror/extension-markdown@2.0.12
  - @remirror/extension-mention@2.0.14
  - @remirror/extension-mention-atom@2.0.15
  - @remirror/extension-node-formatting@2.0.12
  - @remirror/extension-paragraph@2.0.12
  - @remirror/extension-placeholder@2.0.13
  - @remirror/extension-positioner@2.1.7
  - @remirror/extension-search@2.0.13
  - @remirror/extension-shortcuts@2.0.12
  - @remirror/extension-strike@2.0.12
  - @remirror/extension-sub@2.0.12
  - @remirror/extension-sup@2.0.12
  - @remirror/extension-tables@2.2.9
  - @remirror/extension-text@2.0.12
  - @remirror/extension-text-case@2.0.12
  - @remirror/extension-text-color@2.0.13
  - @remirror/extension-text-highlight@2.0.13
  - @remirror/extension-trailing-node@2.0.12
  - @remirror/extension-underline@2.0.12
  - @remirror/extension-whitespace@2.0.12
  - @remirror/extension-yjs@3.0.12
  - @remirror/preset-core@2.0.15
  - @remirror/preset-formatting@2.0.13
  - @remirror/preset-wysiwyg@2.0.18
  - @remirror/theme@2.0.6

## 2.0.24

> 2023-01-15

### Patch Changes

- Updated dependencies [830724900]
  - @remirror/extension-events@2.1.12
  - @remirror/extension-entity-reference@2.2.4
  - @remirror/extension-link@2.0.13
  - @remirror/extension-list@2.0.14
  - @remirror/extension-mention@2.0.13
  - @remirror/extension-mention-atom@2.0.14
  - @remirror/extension-positioner@2.1.6
  - @remirror/preset-core@2.0.14
  - @remirror/preset-wysiwyg@2.0.17
  - @remirror/extension-annotation@2.0.14
  - @remirror/extension-tables@2.2.8
  - @remirror/dom@2.0.14

## 2.0.23

> 2022-12-29

### Patch Changes

- Updated dependencies [6a93233e2]
  - @remirror/core-helpers@2.0.1
  - @remirror/core@2.0.11
  - @remirror/core-utils@2.0.10
  - @remirror/extension-codemirror5@2.0.11
  - @remirror/icons@2.0.1
  - @remirror/pm@2.0.3
  - @remirror/extension-embed@2.0.11
  - @remirror/extension-image@2.1.7
  - @remirror/dom@2.0.13
  - @remirror/extension-annotation@2.0.13
  - @remirror/extension-bidi@2.0.11
  - @remirror/extension-blockquote@2.0.12
  - @remirror/extension-bold@2.0.11
  - @remirror/extension-callout@2.0.12
  - @remirror/extension-code@2.0.11
  - @remirror/extension-code-block@2.0.12
  - @remirror/extension-collaboration@2.0.11
  - @remirror/extension-columns@2.0.11
  - @remirror/extension-diff@2.0.11
  - @remirror/extension-doc@2.1.3
  - @remirror/extension-drop-cursor@2.0.11
  - @remirror/extension-emoji@2.0.15
  - @remirror/extension-entity-reference@2.2.3
  - @remirror/extension-epic-mode@2.0.11
  - @remirror/extension-events@2.1.11
  - @remirror/extension-font-family@2.0.11
  - @remirror/extension-font-size@2.0.11
  - @remirror/extension-gap-cursor@2.0.11
  - @remirror/extension-hard-break@2.0.11
  - @remirror/extension-heading@2.0.11
  - @remirror/extension-history@2.0.11
  - @remirror/extension-horizontal-rule@2.0.11
  - @remirror/extension-italic@2.0.11
  - @remirror/extension-link@2.0.12
  - @remirror/extension-list@2.0.13
  - @remirror/extension-markdown@2.0.11
  - @remirror/extension-mention@2.0.12
  - @remirror/extension-mention-atom@2.0.13
  - @remirror/extension-node-formatting@2.0.11
  - @remirror/extension-paragraph@2.0.11
  - @remirror/extension-placeholder@2.0.12
  - @remirror/extension-positioner@2.1.5
  - @remirror/extension-search@2.0.12
  - @remirror/extension-shortcuts@2.0.11
  - @remirror/extension-strike@2.0.11
  - @remirror/extension-sub@2.0.11
  - @remirror/extension-sup@2.0.11
  - @remirror/extension-tables@2.2.7
  - @remirror/extension-text@2.0.11
  - @remirror/extension-text-case@2.0.11
  - @remirror/extension-text-color@2.0.12
  - @remirror/extension-text-highlight@2.0.12
  - @remirror/extension-trailing-node@2.0.11
  - @remirror/extension-underline@2.0.11
  - @remirror/extension-whitespace@2.0.11
  - @remirror/extension-yjs@3.0.11
  - @remirror/preset-core@2.0.13
  - @remirror/preset-formatting@2.0.12
  - @remirror/preset-wysiwyg@2.0.16
  - @remirror/core-types@2.0.3
  - @remirror/theme@2.0.5

## 2.0.22

> 2022-12-26

### Patch Changes

- Updated dependencies [2d9ac815b]
  - @remirror/core@2.0.10
  - @remirror/dom@2.0.12
  - @remirror/extension-annotation@2.0.12
  - @remirror/extension-bidi@2.0.10
  - @remirror/extension-blockquote@2.0.11
  - @remirror/extension-bold@2.0.10
  - @remirror/extension-callout@2.0.11
  - @remirror/extension-code@2.0.10
  - @remirror/extension-code-block@2.0.11
  - @remirror/extension-codemirror5@2.0.10
  - @remirror/extension-collaboration@2.0.10
  - @remirror/extension-columns@2.0.10
  - @remirror/extension-diff@2.0.10
  - @remirror/extension-doc@2.1.2
  - @remirror/extension-drop-cursor@2.0.10
  - @remirror/extension-embed@2.0.10
  - @remirror/extension-emoji@2.0.14
  - @remirror/extension-entity-reference@2.2.2
  - @remirror/extension-epic-mode@2.0.10
  - @remirror/extension-events@2.1.10
  - @remirror/extension-font-family@2.0.10
  - @remirror/extension-font-size@2.0.10
  - @remirror/extension-gap-cursor@2.0.10
  - @remirror/extension-hard-break@2.0.10
  - @remirror/extension-heading@2.0.10
  - @remirror/extension-history@2.0.10
  - @remirror/extension-horizontal-rule@2.0.10
  - @remirror/extension-image@2.1.6
  - @remirror/extension-italic@2.0.10
  - @remirror/extension-link@2.0.11
  - @remirror/extension-list@2.0.12
  - @remirror/extension-markdown@2.0.10
  - @remirror/extension-mention@2.0.11
  - @remirror/extension-mention-atom@2.0.12
  - @remirror/extension-node-formatting@2.0.10
  - @remirror/extension-paragraph@2.0.10
  - @remirror/extension-placeholder@2.0.11
  - @remirror/extension-positioner@2.1.4
  - @remirror/extension-search@2.0.11
  - @remirror/extension-shortcuts@2.0.10
  - @remirror/extension-strike@2.0.10
  - @remirror/extension-sub@2.0.10
  - @remirror/extension-sup@2.0.10
  - @remirror/extension-tables@2.2.6
  - @remirror/extension-text@2.0.10
  - @remirror/extension-text-case@2.0.10
  - @remirror/extension-text-color@2.0.11
  - @remirror/extension-text-highlight@2.0.11
  - @remirror/extension-trailing-node@2.0.10
  - @remirror/extension-underline@2.0.10
  - @remirror/extension-whitespace@2.0.10
  - @remirror/extension-yjs@3.0.10
  - @remirror/preset-core@2.0.12
  - @remirror/preset-formatting@2.0.11
  - @remirror/preset-wysiwyg@2.0.15

## 2.0.21

> 2022-12-14

### Patch Changes

- Updated dependencies [8d911e983]
  - @remirror/extension-entity-reference@2.2.1

## 2.0.20

> 2022-12-12

### Patch Changes

- Updated dependencies [977838001]
  - @remirror/extension-entity-reference@2.2.0

## 2.0.19

> 2022-12-10

### Patch Changes

- c24854eef: Update `prosemirror-tables` to the latest version, which includes new TypeScript declaration.
- f62c04ad3: Update all `prosemirror` dependencies to latest version.
- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/extension-tables@2.2.5
  - @remirror/pm@2.0.2
  - @remirror/core@2.0.9
  - @remirror/core-types@2.0.2
  - @remirror/core-utils@2.0.9
  - @remirror/dom@2.0.11
  - @remirror/extension-annotation@2.0.11
  - @remirror/extension-bidi@2.0.9
  - @remirror/extension-blockquote@2.0.10
  - @remirror/extension-bold@2.0.9
  - @remirror/extension-callout@2.0.10
  - @remirror/extension-code@2.0.9
  - @remirror/extension-code-block@2.0.10
  - @remirror/extension-codemirror5@2.0.9
  - @remirror/extension-collaboration@2.0.9
  - @remirror/extension-columns@2.0.9
  - @remirror/extension-diff@2.0.9
  - @remirror/extension-doc@2.1.1
  - @remirror/extension-drop-cursor@2.0.9
  - @remirror/extension-embed@2.0.9
  - @remirror/extension-emoji@2.0.13
  - @remirror/extension-entity-reference@2.1.2
  - @remirror/extension-epic-mode@2.0.9
  - @remirror/extension-events@2.1.9
  - @remirror/extension-font-family@2.0.9
  - @remirror/extension-font-size@2.0.9
  - @remirror/extension-gap-cursor@2.0.9
  - @remirror/extension-hard-break@2.0.9
  - @remirror/extension-heading@2.0.9
  - @remirror/extension-history@2.0.9
  - @remirror/extension-horizontal-rule@2.0.9
  - @remirror/extension-image@2.1.5
  - @remirror/extension-italic@2.0.9
  - @remirror/extension-link@2.0.10
  - @remirror/extension-list@2.0.11
  - @remirror/extension-markdown@2.0.9
  - @remirror/extension-mention@2.0.10
  - @remirror/extension-mention-atom@2.0.11
  - @remirror/extension-node-formatting@2.0.9
  - @remirror/extension-paragraph@2.0.9
  - @remirror/extension-placeholder@2.0.10
  - @remirror/extension-positioner@2.1.3
  - @remirror/extension-search@2.0.10
  - @remirror/extension-shortcuts@2.0.9
  - @remirror/extension-strike@2.0.9
  - @remirror/extension-sub@2.0.9
  - @remirror/extension-sup@2.0.9
  - @remirror/extension-text@2.0.9
  - @remirror/extension-text-case@2.0.9
  - @remirror/extension-text-color@2.0.10
  - @remirror/extension-text-highlight@2.0.10
  - @remirror/extension-trailing-node@2.0.9
  - @remirror/extension-underline@2.0.9
  - @remirror/extension-whitespace@2.0.9
  - @remirror/extension-yjs@3.0.9
  - @remirror/preset-core@2.0.11
  - @remirror/preset-formatting@2.0.10
  - @remirror/preset-wysiwyg@2.0.14
  - @remirror/theme@2.0.4

## 2.0.18

> 2022-11-25

### Patch Changes

- Updated dependencies [8bd49f599]
- Updated dependencies [8bd49f599]
  - @remirror/extension-doc@2.1.0
  - @remirror/core-utils@2.0.8
  - @remirror/extension-tables@2.2.4
  - @remirror/preset-core@2.0.10
  - @remirror/core@2.0.8
  - @remirror/dom@2.0.10
  - @remirror/preset-wysiwyg@2.0.13
  - @remirror/extension-embed@2.0.8
  - @remirror/extension-image@2.1.4
  - @remirror/extension-annotation@2.0.10
  - @remirror/extension-bidi@2.0.8
  - @remirror/extension-blockquote@2.0.9
  - @remirror/extension-bold@2.0.8
  - @remirror/extension-callout@2.0.9
  - @remirror/extension-code@2.0.8
  - @remirror/extension-code-block@2.0.9
  - @remirror/extension-codemirror5@2.0.8
  - @remirror/extension-collaboration@2.0.8
  - @remirror/extension-columns@2.0.8
  - @remirror/extension-diff@2.0.8
  - @remirror/extension-drop-cursor@2.0.8
  - @remirror/extension-emoji@2.0.12
  - @remirror/extension-entity-reference@2.1.1
  - @remirror/extension-epic-mode@2.0.8
  - @remirror/extension-events@2.1.8
  - @remirror/extension-font-family@2.0.8
  - @remirror/extension-font-size@2.0.8
  - @remirror/extension-gap-cursor@2.0.8
  - @remirror/extension-hard-break@2.0.8
  - @remirror/extension-heading@2.0.8
  - @remirror/extension-history@2.0.8
  - @remirror/extension-horizontal-rule@2.0.8
  - @remirror/extension-italic@2.0.8
  - @remirror/extension-link@2.0.9
  - @remirror/extension-list@2.0.10
  - @remirror/extension-markdown@2.0.8
  - @remirror/extension-mention@2.0.9
  - @remirror/extension-mention-atom@2.0.10
  - @remirror/extension-node-formatting@2.0.8
  - @remirror/extension-paragraph@2.0.8
  - @remirror/extension-placeholder@2.0.9
  - @remirror/extension-positioner@2.1.2
  - @remirror/extension-search@2.0.9
  - @remirror/extension-shortcuts@2.0.8
  - @remirror/extension-strike@2.0.8
  - @remirror/extension-sub@2.0.8
  - @remirror/extension-sup@2.0.8
  - @remirror/extension-text@2.0.8
  - @remirror/extension-text-case@2.0.8
  - @remirror/extension-text-color@2.0.9
  - @remirror/extension-text-highlight@2.0.9
  - @remirror/extension-trailing-node@2.0.8
  - @remirror/extension-underline@2.0.8
  - @remirror/extension-whitespace@2.0.8
  - @remirror/extension-yjs@3.0.8
  - @remirror/preset-formatting@2.0.9

## 2.0.17

> 2022-11-21

### Patch Changes

- Updated dependencies [79aeb4f5f]
- Updated dependencies [79aeb4f5f]
- Updated dependencies [d395a8a11]
- Updated dependencies [d395a8a11]
  - @remirror/extension-tables@2.2.3
  - @remirror/extension-entity-reference@2.1.0
  - @remirror/extension-list@2.0.9
  - @remirror/theme@2.0.3
  - @remirror/preset-wysiwyg@2.0.12
  - @remirror/extension-blockquote@2.0.8
  - @remirror/extension-callout@2.0.8
  - @remirror/extension-code-block@2.0.8
  - @remirror/extension-emoji@2.0.11
  - @remirror/extension-image@2.1.3
  - @remirror/extension-mention-atom@2.0.9
  - @remirror/extension-placeholder@2.0.8
  - @remirror/extension-positioner@2.1.1
  - @remirror/extension-text-color@2.0.8
  - @remirror/extension-annotation@2.0.9
  - @remirror/preset-core@2.0.9
  - @remirror/extension-text-highlight@2.0.8
  - @remirror/preset-formatting@2.0.8
  - @remirror/dom@2.0.9

## 2.0.16

> 2022-11-15

### Patch Changes

- Updated dependencies [71c154420]
  - @remirror/extension-image@2.1.2
  - @remirror/preset-wysiwyg@2.0.11

## 2.0.15

> 2022-11-02

### Patch Changes

- Updated dependencies [8843920bb]
  - @remirror/extension-search@2.0.8
  - @remirror/preset-wysiwyg@2.0.10

## 2.0.14

> 2022-10-28

### Patch Changes

- Updated dependencies [64fccb544]
  - @remirror/extension-tables@2.2.2

## 2.0.13

> 2022-10-27

### Patch Changes

- Updated dependencies [0d2237a8d]
  - @remirror/extension-tables@2.2.1

## 2.0.12

> 2022-10-27

### Patch Changes

- Updated dependencies [3fa267878]
- Updated dependencies [3fa267878]
- Updated dependencies [3fa267878]
- Updated dependencies [b637f9f3e]
- Updated dependencies [3fa267878]
  - @remirror/extension-positioner@2.1.0
  - @remirror/extension-tables@2.2.0
  - @remirror/core-utils@2.0.7
  - @remirror/extension-code-block@2.0.7
  - @remirror/pm@2.0.1
  - @remirror/extension-annotation@2.0.8
  - @remirror/extension-entity-reference@2.0.8
  - @remirror/preset-core@2.0.8
  - @remirror/extension-markdown@2.0.7
  - @remirror/core@2.0.7
  - @remirror/extension-embed@2.0.7
  - @remirror/extension-image@2.1.1
  - @remirror/preset-wysiwyg@2.0.9
  - @remirror/core-types@2.0.1
  - @remirror/dom@2.0.8
  - @remirror/extension-bidi@2.0.7
  - @remirror/extension-blockquote@2.0.7
  - @remirror/extension-bold@2.0.7
  - @remirror/extension-callout@2.0.7
  - @remirror/extension-code@2.0.7
  - @remirror/extension-codemirror5@2.0.7
  - @remirror/extension-collaboration@2.0.7
  - @remirror/extension-columns@2.0.7
  - @remirror/extension-diff@2.0.7
  - @remirror/extension-doc@2.0.7
  - @remirror/extension-drop-cursor@2.0.7
  - @remirror/extension-emoji@2.0.10
  - @remirror/extension-epic-mode@2.0.7
  - @remirror/extension-events@2.1.7
  - @remirror/extension-font-family@2.0.7
  - @remirror/extension-font-size@2.0.7
  - @remirror/extension-gap-cursor@2.0.7
  - @remirror/extension-hard-break@2.0.7
  - @remirror/extension-heading@2.0.7
  - @remirror/extension-history@2.0.7
  - @remirror/extension-horizontal-rule@2.0.7
  - @remirror/extension-italic@2.0.7
  - @remirror/extension-link@2.0.8
  - @remirror/extension-list@2.0.8
  - @remirror/extension-mention@2.0.8
  - @remirror/extension-mention-atom@2.0.8
  - @remirror/extension-node-formatting@2.0.7
  - @remirror/extension-paragraph@2.0.7
  - @remirror/extension-placeholder@2.0.7
  - @remirror/extension-search@2.0.7
  - @remirror/extension-shortcuts@2.0.7
  - @remirror/extension-strike@2.0.7
  - @remirror/extension-sub@2.0.7
  - @remirror/extension-sup@2.0.7
  - @remirror/extension-text@2.0.7
  - @remirror/extension-text-case@2.0.7
  - @remirror/extension-text-color@2.0.7
  - @remirror/extension-text-highlight@2.0.7
  - @remirror/extension-trailing-node@2.0.7
  - @remirror/extension-underline@2.0.7
  - @remirror/extension-whitespace@2.0.7
  - @remirror/extension-yjs@3.0.7
  - @remirror/preset-formatting@2.0.7
  - @remirror/theme@2.0.2

## 2.0.11

> 2022-10-14

### Patch Changes

- The ImageExtension **now prefers text content, over images when pasting mixed text and image content**.

  The behaviour when pasting _only_ an image, or _only_ text **remains unchanged**.

  This situation usually occurs when pasting content from Microsoft Office products, the content available via clipboard data is either:

  1. One large image:
     - Effectively a _screenshot_ of the original content (an image with text in it).
  2. HTML content:
     - Containing text that can be parsed by your chosen extensions.
     - However, the images have `file:///` protocol URLs, which cannot be resolved due to browser security restrictions.

  Remirror's ImageExtension will now prefer HTML content, when the paste contains mixed content.

  **This will potentially introduce a breaking change for some**. However, we believe the current behaviour to be incorrect so we are viewing this more as a fix, than a breaking change.

  This update adds a new option to the ImageExtension `preferPastedTextContent` which you can set to `false` to restore the previous behaviour.

  `preferPastedTextContent`

  - If `true`, this will **use the text** from the clipboard data, and **drop the images** (default).
  - If `false`, the "screenshot" image will be used, and the **text will be dropped**.

- Prevent table plugins (such as column resizing) from loading, if the view is not editable
- Updated dependencies
- Updated dependencies
  - @remirror/extension-image@2.1.0
  - @remirror/preset-wysiwyg@2.0.8
  - @remirror/extension-tables@2.1.0

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
  - @remirror/dom@2.0.7
  - @remirror/extension-annotation@2.0.7
  - @remirror/extension-blockquote@2.0.6
  - @remirror/extension-callout@2.0.6
  - @remirror/extension-code-block@2.0.6
  - @remirror/extension-emoji@2.0.9
  - @remirror/extension-entity-reference@2.0.7
  - @remirror/extension-image@2.0.6
  - @remirror/extension-list@2.0.7
  - @remirror/extension-mention-atom@2.0.7
  - @remirror/extension-placeholder@2.0.6
  - @remirror/extension-positioner@2.0.7
  - @remirror/extension-tables@2.0.6
  - @remirror/extension-text-color@2.0.6
  - @remirror/extension-text-highlight@2.0.6
  - @remirror/preset-core@2.0.7
  - @remirror/preset-formatting@2.0.6
  - @remirror/preset-wysiwyg@2.0.7
  - @remirror/core-utils@2.0.6
  - @remirror/core@2.0.6
  - @remirror/extension-bidi@2.0.6
  - @remirror/extension-bold@2.0.6
  - @remirror/extension-code@2.0.6
  - @remirror/extension-codemirror5@2.0.6
  - @remirror/extension-collaboration@2.0.6
  - @remirror/extension-columns@2.0.6
  - @remirror/extension-diff@2.0.6
  - @remirror/extension-doc@2.0.6
  - @remirror/extension-drop-cursor@2.0.6
  - @remirror/extension-embed@2.0.6
  - @remirror/extension-epic-mode@2.0.6
  - @remirror/extension-events@2.1.6
  - @remirror/extension-font-family@2.0.6
  - @remirror/extension-font-size@2.0.6
  - @remirror/extension-gap-cursor@2.0.6
  - @remirror/extension-hard-break@2.0.6
  - @remirror/extension-heading@2.0.6
  - @remirror/extension-history@2.0.6
  - @remirror/extension-horizontal-rule@2.0.6
  - @remirror/extension-italic@2.0.6
  - @remirror/extension-link@2.0.7
  - @remirror/extension-markdown@2.0.6
  - @remirror/extension-mention@2.0.7
  - @remirror/extension-node-formatting@2.0.6
  - @remirror/extension-paragraph@2.0.6
  - @remirror/extension-search@2.0.6
  - @remirror/extension-shortcuts@2.0.6
  - @remirror/extension-strike@2.0.6
  - @remirror/extension-sub@2.0.6
  - @remirror/extension-sup@2.0.6
  - @remirror/extension-text@2.0.6
  - @remirror/extension-text-case@2.0.6
  - @remirror/extension-trailing-node@2.0.6
  - @remirror/extension-underline@2.0.6
  - @remirror/extension-whitespace@2.0.6
  - @remirror/extension-yjs@3.0.6

## 2.0.9

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
- Updated dependencies
  - @remirror/core-utils@2.0.5
  - @remirror/core@2.0.5
  - @remirror/dom@2.0.6
  - @remirror/extension-annotation@2.0.6
  - @remirror/extension-bidi@2.0.5
  - @remirror/extension-blockquote@2.0.5
  - @remirror/extension-bold@2.0.5
  - @remirror/extension-callout@2.0.5
  - @remirror/extension-code@2.0.5
  - @remirror/extension-code-block@2.0.5
  - @remirror/extension-codemirror5@2.0.5
  - @remirror/extension-collaboration@2.0.5
  - @remirror/extension-columns@2.0.5
  - @remirror/extension-diff@2.0.5
  - @remirror/extension-doc@2.0.5
  - @remirror/extension-drop-cursor@2.0.5
  - @remirror/extension-embed@2.0.5
  - @remirror/extension-emoji@2.0.8
  - @remirror/extension-entity-reference@2.0.6
  - @remirror/extension-epic-mode@2.0.5
  - @remirror/extension-events@2.1.5
  - @remirror/extension-font-family@2.0.5
  - @remirror/extension-font-size@2.0.5
  - @remirror/extension-gap-cursor@2.0.5
  - @remirror/extension-hard-break@2.0.5
  - @remirror/extension-heading@2.0.5
  - @remirror/extension-history@2.0.5
  - @remirror/extension-horizontal-rule@2.0.5
  - @remirror/extension-image@2.0.5
  - @remirror/extension-italic@2.0.5
  - @remirror/extension-link@2.0.6
  - @remirror/extension-list@2.0.6
  - @remirror/extension-markdown@2.0.5
  - @remirror/extension-mention@2.0.6
  - @remirror/extension-mention-atom@2.0.6
  - @remirror/extension-node-formatting@2.0.5
  - @remirror/extension-paragraph@2.0.5
  - @remirror/extension-placeholder@2.0.5
  - @remirror/extension-positioner@2.0.6
  - @remirror/extension-search@2.0.5
  - @remirror/extension-shortcuts@2.0.5
  - @remirror/extension-strike@2.0.5
  - @remirror/extension-sub@2.0.5
  - @remirror/extension-sup@2.0.5
  - @remirror/extension-tables@2.0.5
  - @remirror/extension-text@2.0.5
  - @remirror/extension-text-case@2.0.5
  - @remirror/extension-text-color@2.0.5
  - @remirror/extension-text-highlight@2.0.5
  - @remirror/extension-trailing-node@2.0.5
  - @remirror/extension-underline@2.0.5
  - @remirror/extension-whitespace@2.0.5
  - @remirror/extension-yjs@3.0.5
  - @remirror/preset-core@2.0.6
  - @remirror/preset-formatting@2.0.5
  - @remirror/preset-wysiwyg@2.0.6

## 2.0.8

> 2022-09-28

### Patch Changes

- Workarounds the import error for `@remirror/extension-emoji` when using `react-scripts start` by not using `.cjs` file extension.
- Updated dependencies
  - @remirror/extension-emoji@2.0.7

## 2.0.7

> 2022-09-28

### Patch Changes

- Fixes the import error for `@remirror/extension-emoji` when using `vite dev`.
- Updated dependencies
  - @remirror/extension-emoji@2.0.6

## 2.0.6

> 2022-09-27

### Patch Changes

- Fixes the CJS build of `@remirror/extension-emoji`.
- Updated dependencies
  - @remirror/extension-emoji@2.0.5

## 2.0.5

> 2022-09-23

### Patch Changes

- Allow for simplified argument for `setTextCase` command
- Update dependencies.
- Fix the default import for `turndown`.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-text-case@2.0.4
  - @remirror/preset-formatting@2.0.4
  - @remirror/core-utils@2.0.4
  - @remirror/core@2.0.4
  - @remirror/dom@2.0.5
  - @remirror/extension-annotation@2.0.5
  - @remirror/extension-bidi@2.0.4
  - @remirror/extension-blockquote@2.0.4
  - @remirror/extension-bold@2.0.4
  - @remirror/extension-callout@2.0.4
  - @remirror/extension-code@2.0.4
  - @remirror/extension-code-block@2.0.4
  - @remirror/extension-codemirror5@2.0.4
  - @remirror/extension-collaboration@2.0.4
  - @remirror/extension-columns@2.0.4
  - @remirror/extension-diff@2.0.4
  - @remirror/extension-doc@2.0.4
  - @remirror/extension-drop-cursor@2.0.4
  - @remirror/extension-embed@2.0.4
  - @remirror/extension-emoji@2.0.4
  - @remirror/extension-entity-reference@2.0.5
  - @remirror/extension-epic-mode@2.0.4
  - @remirror/extension-events@2.1.4
  - @remirror/extension-font-family@2.0.4
  - @remirror/extension-font-size@2.0.4
  - @remirror/extension-gap-cursor@2.0.4
  - @remirror/extension-hard-break@2.0.4
  - @remirror/extension-heading@2.0.4
  - @remirror/extension-history@2.0.4
  - @remirror/extension-horizontal-rule@2.0.4
  - @remirror/extension-image@2.0.4
  - @remirror/extension-italic@2.0.4
  - @remirror/extension-link@2.0.5
  - @remirror/extension-list@2.0.5
  - @remirror/extension-markdown@2.0.4
  - @remirror/extension-mention@2.0.5
  - @remirror/extension-mention-atom@2.0.5
  - @remirror/extension-node-formatting@2.0.4
  - @remirror/extension-paragraph@2.0.4
  - @remirror/extension-placeholder@2.0.4
  - @remirror/extension-positioner@2.0.5
  - @remirror/extension-search@2.0.4
  - @remirror/extension-shortcuts@2.0.4
  - @remirror/extension-strike@2.0.4
  - @remirror/extension-sub@2.0.4
  - @remirror/extension-sup@2.0.4
  - @remirror/extension-tables@2.0.4
  - @remirror/extension-text@2.0.4
  - @remirror/extension-text-color@2.0.4
  - @remirror/extension-text-highlight@2.0.4
  - @remirror/extension-trailing-node@2.0.4
  - @remirror/extension-underline@2.0.4
  - @remirror/extension-whitespace@2.0.4
  - @remirror/extension-yjs@3.0.4
  - @remirror/preset-core@2.0.5
  - @remirror/preset-wysiwyg@2.0.5

## 2.0.4

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

- Updated dependencies
  - @remirror/core-utils@2.0.3
  - @remirror/core@2.0.3
  - @remirror/dom@2.0.4
  - @remirror/extension-annotation@2.0.4
  - @remirror/extension-bidi@2.0.3
  - @remirror/extension-blockquote@2.0.3
  - @remirror/extension-bold@2.0.3
  - @remirror/extension-callout@2.0.3
  - @remirror/extension-code@2.0.3
  - @remirror/extension-code-block@2.0.3
  - @remirror/extension-codemirror5@2.0.3
  - @remirror/extension-collaboration@2.0.3
  - @remirror/extension-columns@2.0.3
  - @remirror/extension-diff@2.0.3
  - @remirror/extension-doc@2.0.3
  - @remirror/extension-drop-cursor@2.0.3
  - @remirror/extension-embed@2.0.3
  - @remirror/extension-emoji@2.0.3
  - @remirror/extension-entity-reference@2.0.4
  - @remirror/extension-epic-mode@2.0.3
  - @remirror/extension-events@2.1.3
  - @remirror/extension-font-family@2.0.3
  - @remirror/extension-font-size@2.0.3
  - @remirror/extension-gap-cursor@2.0.3
  - @remirror/extension-hard-break@2.0.3
  - @remirror/extension-heading@2.0.3
  - @remirror/extension-history@2.0.3
  - @remirror/extension-horizontal-rule@2.0.3
  - @remirror/extension-image@2.0.3
  - @remirror/extension-italic@2.0.3
  - @remirror/extension-link@2.0.4
  - @remirror/extension-list@2.0.4
  - @remirror/extension-markdown@2.0.3
  - @remirror/extension-mention@2.0.4
  - @remirror/extension-mention-atom@2.0.4
  - @remirror/extension-node-formatting@2.0.3
  - @remirror/extension-paragraph@2.0.3
  - @remirror/extension-placeholder@2.0.3
  - @remirror/extension-positioner@2.0.4
  - @remirror/extension-search@2.0.3
  - @remirror/extension-shortcuts@2.0.3
  - @remirror/extension-strike@2.0.3
  - @remirror/extension-sub@2.0.3
  - @remirror/extension-sup@2.0.3
  - @remirror/extension-tables@2.0.3
  - @remirror/extension-text@2.0.3
  - @remirror/extension-text-case@2.0.3
  - @remirror/extension-text-color@2.0.3
  - @remirror/extension-text-highlight@2.0.3
  - @remirror/extension-trailing-node@2.0.3
  - @remirror/extension-underline@2.0.3
  - @remirror/extension-whitespace@2.0.3
  - @remirror/extension-yjs@3.0.3
  - @remirror/preset-core@2.0.4
  - @remirror/preset-formatting@2.0.3
  - @remirror/preset-wysiwyg@2.0.4

## 2.0.3

> 2022-09-21

### Patch Changes

- Fix active helpers for text alignment in `NodeFormattingExtension`
- Make `SubExtension` and `SupExtension` overridable
- Decorate the `insertHorizontalRule` command
- Fix the display of whitespace character when made visible
- Make the task list button in `ListButtonGroup` optional

  Add a new hook `useHasExtension` which checks for the presence of an extension in the manager

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-node-formatting@2.0.2
  - @remirror/preset-formatting@2.0.2
  - @remirror/extension-sub@2.0.2
  - @remirror/extension-sup@2.0.2
  - @remirror/extension-horizontal-rule@2.0.2
  - @remirror/preset-wysiwyg@2.0.3
  - @remirror/core@2.0.2
  - @remirror/dom@2.0.3
  - @remirror/extension-annotation@2.0.3
  - @remirror/extension-bidi@2.0.2
  - @remirror/extension-blockquote@2.0.2
  - @remirror/extension-bold@2.0.2
  - @remirror/extension-callout@2.0.2
  - @remirror/extension-code@2.0.2
  - @remirror/extension-code-block@2.0.2
  - @remirror/extension-codemirror5@2.0.2
  - @remirror/extension-collaboration@2.0.2
  - @remirror/extension-columns@2.0.2
  - @remirror/extension-diff@2.0.2
  - @remirror/extension-doc@2.0.2
  - @remirror/extension-drop-cursor@2.0.2
  - @remirror/extension-embed@2.0.2
  - @remirror/extension-emoji@2.0.2
  - @remirror/extension-entity-reference@2.0.3
  - @remirror/extension-epic-mode@2.0.2
  - @remirror/extension-events@2.1.2
  - @remirror/extension-font-family@2.0.2
  - @remirror/extension-font-size@2.0.2
  - @remirror/extension-gap-cursor@2.0.2
  - @remirror/extension-hard-break@2.0.2
  - @remirror/extension-heading@2.0.2
  - @remirror/extension-history@2.0.2
  - @remirror/extension-image@2.0.2
  - @remirror/extension-italic@2.0.2
  - @remirror/extension-link@2.0.3
  - @remirror/extension-list@2.0.3
  - @remirror/extension-markdown@2.0.2
  - @remirror/extension-mention@2.0.3
  - @remirror/extension-mention-atom@2.0.3
  - @remirror/extension-paragraph@2.0.2
  - @remirror/extension-placeholder@2.0.2
  - @remirror/extension-positioner@2.0.3
  - @remirror/extension-search@2.0.2
  - @remirror/extension-shortcuts@2.0.2
  - @remirror/extension-strike@2.0.2
  - @remirror/extension-tables@2.0.2
  - @remirror/extension-text@2.0.2
  - @remirror/extension-text-case@2.0.2
  - @remirror/extension-text-color@2.0.2
  - @remirror/extension-text-highlight@2.0.2
  - @remirror/extension-trailing-node@2.0.2
  - @remirror/extension-underline@2.0.2
  - @remirror/extension-whitespace@2.0.2
  - @remirror/extension-yjs@3.0.2
  - @remirror/preset-core@2.0.3
  - @remirror/core-utils@2.0.2

## 2.0.2

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.
- Updated dependencies
  - @remirror/core-utils@2.0.1
  - @remirror/core@2.0.1
  - @remirror/dom@2.0.2
  - @remirror/extension-annotation@2.0.2
  - @remirror/extension-bidi@2.0.1
  - @remirror/extension-blockquote@2.0.1
  - @remirror/extension-bold@2.0.1
  - @remirror/extension-callout@2.0.1
  - @remirror/extension-code@2.0.1
  - @remirror/extension-code-block@2.0.1
  - @remirror/extension-codemirror5@2.0.1
  - @remirror/extension-collaboration@2.0.1
  - @remirror/extension-columns@2.0.1
  - @remirror/extension-diff@2.0.1
  - @remirror/extension-doc@2.0.1
  - @remirror/extension-drop-cursor@2.0.1
  - @remirror/extension-embed@2.0.1
  - @remirror/extension-emoji@2.0.1
  - @remirror/extension-entity-reference@2.0.2
  - @remirror/extension-epic-mode@2.0.1
  - @remirror/extension-events@2.1.1
  - @remirror/extension-font-family@2.0.1
  - @remirror/extension-font-size@2.0.1
  - @remirror/extension-gap-cursor@2.0.1
  - @remirror/extension-hard-break@2.0.1
  - @remirror/extension-heading@2.0.1
  - @remirror/extension-history@2.0.1
  - @remirror/extension-horizontal-rule@2.0.1
  - @remirror/extension-image@2.0.1
  - @remirror/extension-italic@2.0.1
  - @remirror/extension-link@2.0.2
  - @remirror/extension-list@2.0.2
  - @remirror/extension-markdown@2.0.1
  - @remirror/extension-mention@2.0.2
  - @remirror/extension-mention-atom@2.0.2
  - @remirror/extension-node-formatting@2.0.1
  - @remirror/extension-paragraph@2.0.1
  - @remirror/extension-placeholder@2.0.1
  - @remirror/extension-positioner@2.0.2
  - @remirror/extension-search@2.0.1
  - @remirror/extension-shortcuts@2.0.1
  - @remirror/extension-strike@2.0.1
  - @remirror/extension-sub@2.0.1
  - @remirror/extension-sup@2.0.1
  - @remirror/extension-tables@2.0.1
  - @remirror/extension-text@2.0.1
  - @remirror/extension-text-case@2.0.1
  - @remirror/extension-text-color@2.0.1
  - @remirror/extension-text-highlight@2.0.1
  - @remirror/extension-trailing-node@2.0.1
  - @remirror/extension-underline@2.0.1
  - @remirror/extension-whitespace@2.0.1
  - @remirror/extension-yjs@3.0.1
  - @remirror/preset-core@2.0.2
  - @remirror/preset-formatting@2.0.1
  - @remirror/preset-wysiwyg@2.0.2

## 2.0.1

> 2022-09-19

### Patch Changes

- Adds four new events `doubleClick`, `doubleClickMark`, `tripleClick` and `tripleClickMark`. They have the same interface as the existing `click` and `clickMark` event, but are triggered when the user double or triple clicks.
- Updated dependencies
  - @remirror/extension-events@2.1.0
  - @remirror/dom@2.0.1
  - @remirror/extension-annotation@2.0.1
  - @remirror/extension-entity-reference@2.0.1
  - @remirror/extension-link@2.0.1
  - @remirror/extension-list@2.0.1
  - @remirror/extension-mention@2.0.1
  - @remirror/extension-mention-atom@2.0.1
  - @remirror/extension-positioner@2.0.1
  - @remirror/preset-core@2.0.1
  - @remirror/preset-wysiwyg@2.0.1

## 2.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Improve the calculation of changed ranges by utilising mapping
- Add an optional onclickmark handler to handle clicks on entity reference
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- When href equals text content, treat the link as an auto link (if enabled)
- Transform a hard break into `\n` in `Node.textContent`.
- Update pnpm-lock.yaml
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- add helper to get shortest entity reference
- Try to require JSDOM implicitly in node environment.
- Correct a bad import.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes `domino` from the codebase.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

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
  - @remirror/extension-entity-reference@2.0.0
  - @remirror/core-utils@2.0.0
  - @remirror/core@2.0.0
  - @remirror/dom@2.0.0
  - @remirror/extension-annotation@2.0.0
  - @remirror/extension-bidi@2.0.0
  - @remirror/extension-blockquote@2.0.0
  - @remirror/extension-bold@2.0.0
  - @remirror/extension-callout@2.0.0
  - @remirror/extension-code@2.0.0
  - @remirror/extension-code-block@2.0.0
  - @remirror/extension-codemirror5@2.0.0
  - @remirror/extension-collaboration@2.0.0
  - @remirror/extension-columns@2.0.0
  - @remirror/extension-diff@2.0.0
  - @remirror/extension-doc@2.0.0
  - @remirror/extension-drop-cursor@2.0.0
  - @remirror/extension-embed@2.0.0
  - @remirror/extension-emoji@2.0.0
  - @remirror/extension-epic-mode@2.0.0
  - @remirror/extension-events@2.0.0
  - @remirror/extension-font-family@2.0.0
  - @remirror/extension-font-size@2.0.0
  - @remirror/extension-gap-cursor@2.0.0
  - @remirror/extension-hard-break@2.0.0
  - @remirror/extension-heading@2.0.0
  - @remirror/extension-history@2.0.0
  - @remirror/extension-horizontal-rule@2.0.0
  - @remirror/extension-image@2.0.0
  - @remirror/extension-italic@2.0.0
  - @remirror/extension-link@2.0.0
  - @remirror/extension-list@2.0.0
  - @remirror/extension-markdown@2.0.0
  - @remirror/extension-mention@2.0.0
  - @remirror/extension-mention-atom@2.0.0
  - @remirror/extension-node-formatting@2.0.0
  - @remirror/extension-paragraph@2.0.0
  - @remirror/extension-placeholder@2.0.0
  - @remirror/extension-positioner@2.0.0
  - @remirror/extension-search@2.0.0
  - @remirror/extension-shortcuts@2.0.0
  - @remirror/extension-strike@2.0.0
  - @remirror/extension-sub@2.0.0
  - @remirror/extension-sup@2.0.0
  - @remirror/extension-tables@2.0.0
  - @remirror/extension-text@2.0.0
  - @remirror/extension-text-case@2.0.0
  - @remirror/extension-text-color@2.0.0
  - @remirror/extension-text-highlight@2.0.0
  - @remirror/extension-trailing-node@2.0.0
  - @remirror/extension-underline@2.0.0
  - @remirror/extension-whitespace@2.0.0
  - @remirror/extension-yjs@3.0.0
  - @remirror/preset-core@2.0.0
  - @remirror/preset-formatting@2.0.0
  - @remirror/preset-wysiwyg@2.0.0
  - @remirror/core-helpers@2.0.0
  - @remirror/core-types@2.0.0
  - @remirror/pm@2.0.0
  - @remirror/core-constants@2.0.0
  - @remirror/icons@2.0.0
  - @remirror/theme@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- option for supported characters in emoji suggester.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- When href equals text content, treat the link as an auto link (if enabled)
- SSR features are removed.
- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- Update pnpm-lock.yaml
- Add an optional onclickmark handler to handle clicks on entity reference
- Correct a bad import.
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Update ProseMirror packages to latest versions.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Transform a hard break into `\n` in `Node.textContent`.
- Expose the return type of the throttle and debounce helpers
- Improve the calculation of changed ranges by utilising mapping
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- add helper to get shortest entity reference
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
  - @remirror/core-utils@2.0.0-beta.19
  - @remirror/core@2.0.0-beta.19
  - @remirror/dom@2.0.0-beta.19
  - @remirror/extension-annotation@2.0.0-beta.19
  - @remirror/extension-bidi@2.0.0-beta.19
  - @remirror/extension-blockquote@2.0.0-beta.19
  - @remirror/extension-bold@2.0.0-beta.19
  - @remirror/extension-callout@2.0.0-beta.19
  - @remirror/extension-code@2.0.0-beta.19
  - @remirror/extension-code-block@2.0.0-beta.19
  - @remirror/extension-codemirror5@2.0.0-beta.19
  - @remirror/extension-collaboration@2.0.0-beta.19
  - @remirror/extension-columns@2.0.0-beta.19
  - @remirror/extension-diff@2.0.0-beta.19
  - @remirror/extension-doc@2.0.0-beta.19
  - @remirror/extension-drop-cursor@2.0.0-beta.19
  - @remirror/extension-embed@2.0.0-beta.19
  - @remirror/extension-emoji@2.0.0-beta.19
  - @remirror/extension-entity-reference@2.0.0-beta.19
  - @remirror/extension-epic-mode@2.0.0-beta.19
  - @remirror/extension-events@2.0.0-beta.19
  - @remirror/extension-font-family@2.0.0-beta.19
  - @remirror/extension-font-size@2.0.0-beta.19
  - @remirror/extension-gap-cursor@2.0.0-beta.19
  - @remirror/extension-hard-break@2.0.0-beta.19
  - @remirror/extension-heading@2.0.0-beta.19
  - @remirror/extension-history@2.0.0-beta.19
  - @remirror/extension-horizontal-rule@2.0.0-beta.19
  - @remirror/extension-image@2.0.0-beta.19
  - @remirror/extension-italic@2.0.0-beta.19
  - @remirror/extension-link@2.0.0-beta.19
  - @remirror/extension-list@2.0.0-beta.19
  - @remirror/extension-markdown@2.0.0-beta.19
  - @remirror/extension-mention@2.0.0-beta.19
  - @remirror/extension-mention-atom@2.0.0-beta.19
  - @remirror/extension-node-formatting@2.0.0-beta.19
  - @remirror/extension-paragraph@2.0.0-beta.19
  - @remirror/extension-placeholder@2.0.0-beta.19
  - @remirror/extension-positioner@2.0.0-beta.19
  - @remirror/extension-search@2.0.0-beta.19
  - @remirror/extension-shortcuts@2.0.0-beta.19
  - @remirror/extension-strike@2.0.0-beta.19
  - @remirror/extension-sub@2.0.0-beta.19
  - @remirror/extension-sup@2.0.0-beta.19
  - @remirror/extension-tables@2.0.0-beta.19
  - @remirror/extension-text@2.0.0-beta.19
  - @remirror/extension-text-case@2.0.0-beta.19
  - @remirror/extension-text-color@2.0.0-beta.19
  - @remirror/extension-text-highlight@2.0.0-beta.19
  - @remirror/extension-trailing-node@2.0.0-beta.19
  - @remirror/extension-underline@2.0.0-beta.19
  - @remirror/extension-whitespace@2.0.0-beta.19
  - @remirror/extension-yjs@3.0.0-beta.19
  - @remirror/preset-core@2.0.0-beta.19
  - @remirror/preset-formatting@2.0.0-beta.19
  - @remirror/preset-wysiwyg@2.0.0-beta.19
  - @remirror/core-constants@2.0.0-beta.19
  - @remirror/core-helpers@2.0.0-beta.19
  - @remirror/core-types@2.0.0-beta.19
  - @remirror/icons@2.0.0-beta.19
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

- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- SSR features are removed.
- option for supported characters in emoji suggester.
- Support both ESM and CJS.
- Correct a bad import.
- Expose the return type of the throttle and debounce helpers
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Update ProseMirror packages to latest versions.
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes `domino` from the codebase.
- When href equals text content, treat the link as an auto link (if enabled)
- Add an optional onclickmark handler to handle clicks on entity reference
- Try to require JSDOM implicitly in node environment.
- Transform a hard break into `\n` in `Node.textContent`.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- add helper to get shortest entity reference
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Update pnpm-lock.yaml
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
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
  - @remirror/dom@2.0.0-beta.18
  - @remirror/extension-annotation@2.0.0-beta.18
  - @remirror/extension-blockquote@2.0.0-beta.18
  - @remirror/extension-callout@2.0.0-beta.18
  - @remirror/extension-code-block@2.0.0-beta.18
  - @remirror/extension-emoji@2.0.0-beta.18
  - @remirror/extension-entity-reference@2.0.0-beta.18
  - @remirror/extension-image@2.0.0-beta.18
  - @remirror/extension-list@2.0.0-beta.18
  - @remirror/extension-mention-atom@2.0.0-beta.18
  - @remirror/extension-placeholder@2.0.0-beta.18
  - @remirror/extension-positioner@2.0.0-beta.18
  - @remirror/extension-tables@2.0.0-beta.18
  - @remirror/extension-text-color@2.0.0-beta.18
  - @remirror/extension-text-highlight@2.0.0-beta.18
  - @remirror/preset-core@2.0.0-beta.18
  - @remirror/preset-formatting@2.0.0-beta.18
  - @remirror/preset-wysiwyg@2.0.0-beta.18
  - @remirror/extension-collaboration@2.0.0-beta.18
  - @remirror/extension-link@2.0.0-beta.18
  - @remirror/core@2.0.0-beta.18
  - @remirror/extension-bidi@2.0.0-beta.18
  - @remirror/extension-bold@2.0.0-beta.18
  - @remirror/extension-code@2.0.0-beta.18
  - @remirror/extension-codemirror5@2.0.0-beta.18
  - @remirror/extension-columns@2.0.0-beta.18
  - @remirror/extension-diff@2.0.0-beta.18
  - @remirror/extension-doc@2.0.0-beta.18
  - @remirror/extension-drop-cursor@2.0.0-beta.18
  - @remirror/extension-embed@2.0.0-beta.18
  - @remirror/extension-epic-mode@2.0.0-beta.18
  - @remirror/extension-events@2.0.0-beta.18
  - @remirror/extension-font-family@2.0.0-beta.18
  - @remirror/extension-font-size@2.0.0-beta.18
  - @remirror/extension-gap-cursor@2.0.0-beta.18
  - @remirror/extension-hard-break@2.0.0-beta.18
  - @remirror/extension-heading@2.0.0-beta.18
  - @remirror/extension-history@2.0.0-beta.18
  - @remirror/extension-horizontal-rule@2.0.0-beta.18
  - @remirror/extension-italic@2.0.0-beta.18
  - @remirror/extension-markdown@2.0.0-beta.18
  - @remirror/extension-mention@2.0.0-beta.18
  - @remirror/extension-node-formatting@2.0.0-beta.18
  - @remirror/extension-paragraph@2.0.0-beta.18
  - @remirror/extension-search@2.0.0-beta.18
  - @remirror/extension-shortcuts@2.0.0-beta.18
  - @remirror/extension-strike@2.0.0-beta.18
  - @remirror/extension-sub@2.0.0-beta.18
  - @remirror/extension-sup@2.0.0-beta.18
  - @remirror/extension-text@2.0.0-beta.18
  - @remirror/extension-text-case@2.0.0-beta.18
  - @remirror/extension-trailing-node@2.0.0-beta.18
  - @remirror/extension-underline@2.0.0-beta.18
  - @remirror/extension-whitespace@2.0.0-beta.18
  - @remirror/extension-yjs@3.0.0-beta.18
  - @remirror/core-constants@2.0.0-beta.18
  - @remirror/core-helpers@2.0.0-beta.18
  - @remirror/core-types@2.0.0-beta.18
  - @remirror/core-utils@2.0.0-beta.18
  - @remirror/icons@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- option for supported characters in emoji suggester.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Transform a hard break into `\n` in `Node.textContent`.
- When href equals text content, treat the link as an auto link (if enabled)
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- SSR features are removed.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Add an optional onclickmark handler to handle clicks on entity reference
- Improve the calculation of changed ranges by utilising mapping
- add helper to get shortest entity reference
- Update ProseMirror packages to latest versions.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Expose the return type of the throttle and debounce helpers
- Update pnpm-lock.yaml
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
  - @remirror/pm@2.0.0-beta.17
  - @remirror/extension-emoji@2.0.0-beta.17
  - @remirror/extension-link@2.0.0-beta.17
  - @remirror/preset-wysiwyg@2.0.0-beta.17
  - @remirror/extension-hard-break@2.0.0-beta.17
  - @remirror/core@2.0.0-beta.17
  - @remirror/core-helpers@2.0.0-beta.17
  - @remirror/core-types@2.0.0-beta.17
  - @remirror/core-utils@2.0.0-beta.17
  - @remirror/dom@2.0.0-beta.17
  - @remirror/extension-annotation@2.0.0-beta.17
  - @remirror/extension-blockquote@2.0.0-beta.17
  - @remirror/extension-callout@2.0.0-beta.17
  - @remirror/extension-collaboration@2.0.0-beta.17
  - @remirror/extension-doc@2.0.0-beta.17
  - @remirror/extension-epic-mode@2.0.0-beta.17
  - @remirror/extension-events@2.0.0-beta.17
  - @remirror/extension-font-size@2.0.0-beta.17
  - @remirror/extension-heading@2.0.0-beta.17
  - @remirror/extension-image@2.0.0-beta.17
  - @remirror/extension-list@2.0.0-beta.17
  - @remirror/extension-mention@2.0.0-beta.17
  - @remirror/extension-mention-atom@2.0.0-beta.17
  - @remirror/extension-node-formatting@2.0.0-beta.17
  - @remirror/extension-placeholder@2.0.0-beta.17
  - @remirror/extension-tables@2.0.0-beta.17
  - @remirror/extension-text-color@2.0.0-beta.17
  - @remirror/extension-text-highlight@2.0.0-beta.17
  - @remirror/core-constants@2.0.0-beta.17
  - @remirror/extension-bidi@2.0.0-beta.17
  - @remirror/extension-bold@2.0.0-beta.17
  - @remirror/extension-code@2.0.0-beta.17
  - @remirror/extension-code-block@2.0.0-beta.17
  - @remirror/extension-codemirror5@2.0.0-beta.17
  - @remirror/extension-columns@2.0.0-beta.17
  - @remirror/extension-diff@2.0.0-beta.17
  - @remirror/extension-drop-cursor@2.0.0-beta.17
  - @remirror/extension-embed@2.0.0-beta.17
  - @remirror/extension-font-family@2.0.0-beta.17
  - @remirror/extension-gap-cursor@2.0.0-beta.17
  - @remirror/extension-history@2.0.0-beta.17
  - @remirror/extension-horizontal-rule@2.0.0-beta.17
  - @remirror/extension-italic@2.0.0-beta.17
  - @remirror/extension-markdown@2.0.0-beta.17
  - @remirror/extension-paragraph@2.0.0-beta.17
  - @remirror/extension-positioner@2.0.0-beta.17
  - @remirror/extension-search@2.0.0-beta.17
  - @remirror/extension-shortcuts@2.0.0-beta.17
  - @remirror/extension-strike@2.0.0-beta.17
  - @remirror/extension-sub@2.0.0-beta.17
  - @remirror/extension-sup@2.0.0-beta.17
  - @remirror/extension-text@2.0.0-beta.17
  - @remirror/extension-text-case@2.0.0-beta.17
  - @remirror/extension-trailing-node@2.0.0-beta.17
  - @remirror/extension-underline@2.0.0-beta.17
  - @remirror/extension-whitespace@2.0.0-beta.17
  - @remirror/extension-yjs@3.0.0-beta.17
  - @remirror/icons@2.0.0-beta.17
  - @remirror/preset-core@2.0.0-beta.17
  - @remirror/preset-formatting@2.0.0-beta.17
  - @remirror/theme@2.0.0-beta.17
  - @remirror/extension-entity-reference@2.0.0-beta.17

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Removes `domino` from the codebase.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update ProseMirror packages to latest versions.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update pnpm-lock.yaml
- add helper to get shortest entity reference
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Add an optional onclickmark handler to handle clicks on entity reference
- Support both ESM and CJS.
- SSR features are removed.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Expose the return type of the throttle and debounce helpers
- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- When href equals text content, treat the link as an auto link (if enabled)
- Transform a hard break into `\n` in `Node.textContent`.
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
  - @remirror/pm@2.0.0-beta.16
  - @remirror/extension-entity-reference@2.0.0-beta.16
  - @remirror/core-utils@2.0.0-beta.16
  - @remirror/core@2.0.0-beta.16
  - @remirror/dom@2.0.0-beta.16
  - @remirror/extension-annotation@2.0.0-beta.16
  - @remirror/extension-bidi@2.0.0-beta.16
  - @remirror/extension-blockquote@2.0.0-beta.16
  - @remirror/extension-bold@2.0.0-beta.16
  - @remirror/extension-callout@2.0.0-beta.16
  - @remirror/extension-code@2.0.0-beta.16
  - @remirror/extension-code-block@2.0.0-beta.16
  - @remirror/extension-codemirror5@2.0.0-beta.16
  - @remirror/extension-collaboration@2.0.0-beta.16
  - @remirror/extension-columns@2.0.0-beta.16
  - @remirror/extension-diff@2.0.0-beta.16
  - @remirror/extension-doc@2.0.0-beta.16
  - @remirror/extension-drop-cursor@2.0.0-beta.16
  - @remirror/extension-embed@2.0.0-beta.16
  - @remirror/extension-emoji@2.0.0-beta.16
  - @remirror/extension-epic-mode@2.0.0-beta.16
  - @remirror/extension-events@2.0.0-beta.16
  - @remirror/extension-font-family@2.0.0-beta.16
  - @remirror/extension-font-size@2.0.0-beta.16
  - @remirror/extension-gap-cursor@2.0.0-beta.16
  - @remirror/extension-hard-break@2.0.0-beta.16
  - @remirror/extension-heading@2.0.0-beta.16
  - @remirror/extension-history@2.0.0-beta.16
  - @remirror/extension-horizontal-rule@2.0.0-beta.16
  - @remirror/extension-image@2.0.0-beta.16
  - @remirror/extension-italic@2.0.0-beta.16
  - @remirror/extension-link@2.0.0-beta.16
  - @remirror/extension-list@2.0.0-beta.16
  - @remirror/extension-markdown@2.0.0-beta.16
  - @remirror/extension-mention@2.0.0-beta.16
  - @remirror/extension-mention-atom@2.0.0-beta.16
  - @remirror/extension-node-formatting@2.0.0-beta.16
  - @remirror/extension-paragraph@2.0.0-beta.16
  - @remirror/extension-placeholder@2.0.0-beta.16
  - @remirror/extension-positioner@2.0.0-beta.16
  - @remirror/extension-search@2.0.0-beta.16
  - @remirror/extension-shortcuts@2.0.0-beta.16
  - @remirror/extension-strike@2.0.0-beta.16
  - @remirror/extension-sub@2.0.0-beta.16
  - @remirror/extension-sup@2.0.0-beta.16
  - @remirror/extension-tables@2.0.0-beta.16
  - @remirror/extension-text@2.0.0-beta.16
  - @remirror/extension-text-case@2.0.0-beta.16
  - @remirror/extension-text-color@2.0.0-beta.16
  - @remirror/extension-text-highlight@2.0.0-beta.16
  - @remirror/extension-trailing-node@2.0.0-beta.16
  - @remirror/extension-underline@2.0.0-beta.16
  - @remirror/extension-whitespace@2.0.0-beta.16
  - @remirror/extension-yjs@3.0.0-beta.16
  - @remirror/preset-core@2.0.0-beta.16
  - @remirror/preset-formatting@2.0.0-beta.16
  - @remirror/preset-wysiwyg@2.0.0-beta.16
  - @remirror/theme@2.0.0-beta.16
  - @remirror/core-constants@2.0.0-beta.16
  - @remirror/core-helpers@2.0.0-beta.16
  - @remirror/core-types@2.0.0-beta.16
  - @remirror/icons@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- add helper to get shortest entity reference
- When href equals text content, treat the link as an auto link (if enabled)
- Removes `domino` from the codebase.
- Add an optional onclickmark handler to handle clicks on entity reference
- Expose the return type of the throttle and debounce helpers
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update pnpm-lock.yaml
- Try to require JSDOM implicitly in node environment.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Support both ESM and CJS.
- Transform a hard break into `\n` in `Node.textContent`.
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update ProseMirror packages to latest versions.
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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-events@2.0.0-beta.15
  - @remirror/dom@2.0.0-beta.15
  - @remirror/extension-annotation@2.0.0-beta.15
  - @remirror/extension-entity-reference@2.0.0-beta.15
  - @remirror/extension-link@2.0.0-beta.15
  - @remirror/extension-list@2.0.0-beta.15
  - @remirror/extension-mention@2.0.0-beta.15
  - @remirror/extension-mention-atom@2.0.0-beta.15
  - @remirror/extension-positioner@2.0.0-beta.15
  - @remirror/preset-core@2.0.0-beta.15
  - @remirror/preset-wysiwyg@2.0.0-beta.15
  - @remirror/pm@2.0.0-beta.15
  - @remirror/core-utils@2.0.0-beta.15
  - @remirror/core@2.0.0-beta.15
  - @remirror/extension-bidi@2.0.0-beta.15
  - @remirror/extension-blockquote@2.0.0-beta.15
  - @remirror/extension-bold@2.0.0-beta.15
  - @remirror/extension-callout@2.0.0-beta.15
  - @remirror/extension-code@2.0.0-beta.15
  - @remirror/extension-code-block@2.0.0-beta.15
  - @remirror/extension-codemirror5@2.0.0-beta.15
  - @remirror/extension-collaboration@2.0.0-beta.15
  - @remirror/extension-columns@2.0.0-beta.15
  - @remirror/extension-diff@2.0.0-beta.15
  - @remirror/extension-doc@2.0.0-beta.15
  - @remirror/extension-drop-cursor@2.0.0-beta.15
  - @remirror/extension-embed@2.0.0-beta.15
  - @remirror/extension-emoji@2.0.0-beta.15
  - @remirror/extension-epic-mode@2.0.0-beta.15
  - @remirror/extension-font-family@2.0.0-beta.15
  - @remirror/extension-font-size@2.0.0-beta.15
  - @remirror/extension-gap-cursor@2.0.0-beta.15
  - @remirror/extension-hard-break@2.0.0-beta.15
  - @remirror/extension-heading@2.0.0-beta.15
  - @remirror/extension-history@2.0.0-beta.15
  - @remirror/extension-horizontal-rule@2.0.0-beta.15
  - @remirror/extension-image@2.0.0-beta.15
  - @remirror/extension-italic@2.0.0-beta.15
  - @remirror/extension-markdown@2.0.0-beta.15
  - @remirror/extension-node-formatting@2.0.0-beta.15
  - @remirror/extension-paragraph@2.0.0-beta.15
  - @remirror/extension-placeholder@2.0.0-beta.15
  - @remirror/extension-search@2.0.0-beta.15
  - @remirror/extension-shortcuts@2.0.0-beta.15
  - @remirror/extension-strike@2.0.0-beta.15
  - @remirror/extension-sub@2.0.0-beta.15
  - @remirror/extension-sup@2.0.0-beta.15
  - @remirror/extension-tables@2.0.0-beta.15
  - @remirror/extension-text@2.0.0-beta.15
  - @remirror/extension-text-case@2.0.0-beta.15
  - @remirror/extension-text-color@2.0.0-beta.15
  - @remirror/extension-text-highlight@2.0.0-beta.15
  - @remirror/extension-trailing-node@2.0.0-beta.15
  - @remirror/extension-underline@2.0.0-beta.15
  - @remirror/extension-whitespace@2.0.0-beta.15
  - @remirror/extension-yjs@3.0.0-beta.15
  - @remirror/preset-formatting@2.0.0-beta.15
  - @remirror/core-helpers@2.0.0-beta.15
  - @remirror/icons@2.0.0-beta.15
  - @remirror/theme@2.0.0-beta.15
  - @remirror/core-types@2.0.0-beta.15
  - @remirror/core-constants@2.0.0-beta.15

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
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Try to require JSDOM implicitly in node environment.
- add helper to get shortest entity reference
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update ProseMirror packages to latest versions.
- When href equals text content, treat the link as an auto link (if enabled)
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Transform a hard break into `\n` in `Node.textContent`.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update pnpm-lock.yaml
- Add an optional onclickmark handler to handle clicks on entity reference
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
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
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/theme@2.0.0-beta.14
  - @remirror/dom@2.0.0-beta.14
  - @remirror/extension-annotation@2.0.0-beta.14
  - @remirror/extension-blockquote@2.0.0-beta.14
  - @remirror/extension-callout@2.0.0-beta.14
  - @remirror/extension-code-block@2.0.0-beta.14
  - @remirror/extension-emoji@2.0.0-beta.14
  - @remirror/extension-entity-reference@2.0.0-beta.14
  - @remirror/extension-image@2.0.0-beta.14
  - @remirror/extension-list@2.0.0-beta.14
  - @remirror/extension-mention-atom@2.0.0-beta.14
  - @remirror/extension-placeholder@2.0.0-beta.14
  - @remirror/extension-positioner@2.0.0-beta.14
  - @remirror/extension-tables@2.0.0-beta.14
  - @remirror/extension-text-color@2.0.0-beta.14
  - @remirror/extension-text-highlight@2.0.0-beta.14
  - @remirror/preset-core@2.0.0-beta.14
  - @remirror/preset-formatting@2.0.0-beta.14
  - @remirror/preset-wysiwyg@2.0.0-beta.14
  - @remirror/core@2.0.0-beta.14
  - @remirror/extension-bidi@2.0.0-beta.14
  - @remirror/extension-bold@2.0.0-beta.14
  - @remirror/extension-code@2.0.0-beta.14
  - @remirror/extension-codemirror5@2.0.0-beta.14
  - @remirror/extension-collaboration@2.0.0-beta.14
  - @remirror/extension-columns@2.0.0-beta.14
  - @remirror/extension-diff@2.0.0-beta.14
  - @remirror/extension-doc@2.0.0-beta.14
  - @remirror/extension-drop-cursor@2.0.0-beta.14
  - @remirror/extension-embed@2.0.0-beta.14
  - @remirror/extension-epic-mode@2.0.0-beta.14
  - @remirror/extension-events@2.0.0-beta.14
  - @remirror/extension-font-family@2.0.0-beta.14
  - @remirror/extension-font-size@2.0.0-beta.14
  - @remirror/extension-gap-cursor@2.0.0-beta.14
  - @remirror/extension-hard-break@2.0.0-beta.14
  - @remirror/extension-heading@2.0.0-beta.14
  - @remirror/extension-history@2.0.0-beta.14
  - @remirror/extension-horizontal-rule@2.0.0-beta.14
  - @remirror/extension-italic@2.0.0-beta.14
  - @remirror/extension-link@2.0.0-beta.14
  - @remirror/extension-markdown@2.0.0-beta.14
  - @remirror/extension-mention@2.0.0-beta.14
  - @remirror/extension-node-formatting@2.0.0-beta.14
  - @remirror/extension-paragraph@2.0.0-beta.14
  - @remirror/extension-search@2.0.0-beta.14
  - @remirror/extension-shortcuts@2.0.0-beta.14
  - @remirror/extension-strike@2.0.0-beta.14
  - @remirror/extension-sub@2.0.0-beta.14
  - @remirror/extension-sup@2.0.0-beta.14
  - @remirror/extension-text@2.0.0-beta.14
  - @remirror/extension-text-case@2.0.0-beta.14
  - @remirror/extension-trailing-node@2.0.0-beta.14
  - @remirror/extension-underline@2.0.0-beta.14
  - @remirror/extension-whitespace@2.0.0-beta.14
  - @remirror/extension-yjs@3.0.0-beta.14
  - @remirror/core-utils@2.0.0-beta.14
  - @remirror/pm@2.0.0-beta.14
  - @remirror/core-helpers@2.0.0-beta.14
  - @remirror/core-types@2.0.0-beta.14
  - @remirror/core-constants@2.0.0-beta.14
  - @remirror/icons@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update pnpm-lock.yaml
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
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- When href equals text content, treat the link as an auto link (if enabled)
- Transform a hard break into `\n` in `Node.textContent`.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Add an optional onclickmark handler to handle clicks on entity reference
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Update ProseMirror packages to latest versions.
- add helper to get shortest entity reference
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
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
  - @remirror/extension-events@2.0.0-beta.13
  - @remirror/dom@2.0.0-beta.13
  - @remirror/extension-annotation@2.0.0-beta.13
  - @remirror/extension-entity-reference@2.0.0-beta.13
  - @remirror/extension-link@2.0.0-beta.13
  - @remirror/extension-list@2.0.0-beta.13
  - @remirror/extension-mention@2.0.0-beta.13
  - @remirror/extension-mention-atom@2.0.0-beta.13
  - @remirror/extension-positioner@2.0.0-beta.13
  - @remirror/preset-core@2.0.0-beta.13
  - @remirror/preset-wysiwyg@2.0.0-beta.13
  - @remirror/theme@2.0.0-beta.13
  - @remirror/extension-blockquote@2.0.0-beta.13
  - @remirror/extension-callout@2.0.0-beta.13
  - @remirror/extension-code-block@2.0.0-beta.13
  - @remirror/extension-emoji@2.0.0-beta.13
  - @remirror/extension-image@2.0.0-beta.13
  - @remirror/extension-placeholder@2.0.0-beta.13
  - @remirror/extension-tables@2.0.0-beta.13
  - @remirror/extension-text-color@2.0.0-beta.13
  - @remirror/extension-text-highlight@2.0.0-beta.13
  - @remirror/preset-formatting@2.0.0-beta.13
  - @remirror/core-helpers@2.0.0-beta.13
  - @remirror/core@2.0.0-beta.13
  - @remirror/core-utils@2.0.0-beta.13
  - @remirror/extension-bidi@2.0.0-beta.13
  - @remirror/extension-bold@2.0.0-beta.13
  - @remirror/extension-code@2.0.0-beta.13
  - @remirror/extension-codemirror5@2.0.0-beta.13
  - @remirror/extension-collaboration@2.0.0-beta.13
  - @remirror/extension-columns@2.0.0-beta.13
  - @remirror/extension-diff@2.0.0-beta.13
  - @remirror/extension-doc@2.0.0-beta.13
  - @remirror/extension-drop-cursor@2.0.0-beta.13
  - @remirror/extension-embed@2.0.0-beta.13
  - @remirror/extension-epic-mode@2.0.0-beta.13
  - @remirror/extension-font-family@2.0.0-beta.13
  - @remirror/extension-font-size@2.0.0-beta.13
  - @remirror/extension-gap-cursor@2.0.0-beta.13
  - @remirror/extension-hard-break@2.0.0-beta.13
  - @remirror/extension-heading@2.0.0-beta.13
  - @remirror/extension-history@2.0.0-beta.13
  - @remirror/extension-horizontal-rule@2.0.0-beta.13
  - @remirror/extension-italic@2.0.0-beta.13
  - @remirror/extension-markdown@2.0.0-beta.13
  - @remirror/extension-node-formatting@2.0.0-beta.13
  - @remirror/extension-paragraph@2.0.0-beta.13
  - @remirror/extension-search@2.0.0-beta.13
  - @remirror/extension-shortcuts@2.0.0-beta.13
  - @remirror/extension-strike@2.0.0-beta.13
  - @remirror/extension-sub@2.0.0-beta.13
  - @remirror/extension-sup@2.0.0-beta.13
  - @remirror/extension-text@2.0.0-beta.13
  - @remirror/extension-text-case@2.0.0-beta.13
  - @remirror/extension-trailing-node@2.0.0-beta.13
  - @remirror/extension-underline@2.0.0-beta.13
  - @remirror/extension-whitespace@2.0.0-beta.13
  - @remirror/extension-yjs@3.0.0-beta.13
  - @remirror/icons@2.0.0-beta.13
  - @remirror/core-constants@2.0.0-beta.13
  - @remirror/core-types@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Add an optional onclickmark handler to handle clicks on entity reference
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
- Update pnpm-lock.yaml
- Transform a hard break into `\n` in `Node.textContent`.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- When href equals text content, treat the link as an auto link (if enabled)
- add helper to get shortest entity reference
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
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
  - @remirror/core-constants@2.0.0-beta.12
  - @remirror/core-helpers@2.0.0-beta.12
  - @remirror/core-types@2.0.0-beta.12
  - @remirror/core-utils@2.0.0-beta.12
  - @remirror/dom@2.0.0-beta.12
  - @remirror/extension-annotation@2.0.0-beta.12
  - @remirror/extension-bidi@2.0.0-beta.12
  - @remirror/extension-blockquote@2.0.0-beta.12
  - @remirror/extension-bold@2.0.0-beta.12
  - @remirror/extension-callout@2.0.0-beta.12
  - @remirror/extension-code@2.0.0-beta.12
  - @remirror/extension-code-block@2.0.0-beta.12
  - @remirror/extension-codemirror5@2.0.0-beta.12
  - @remirror/extension-collaboration@2.0.0-beta.12
  - @remirror/extension-columns@2.0.0-beta.12
  - @remirror/extension-diff@2.0.0-beta.12
  - @remirror/extension-doc@2.0.0-beta.12
  - @remirror/extension-drop-cursor@2.0.0-beta.12
  - @remirror/extension-embed@2.0.0-beta.12
  - @remirror/extension-emoji@2.0.0-beta.12
  - @remirror/extension-entity-reference@2.0.0-beta.12
  - @remirror/extension-epic-mode@2.0.0-beta.12
  - @remirror/extension-events@2.0.0-beta.12
  - @remirror/extension-font-family@2.0.0-beta.12
  - @remirror/extension-font-size@2.0.0-beta.12
  - @remirror/extension-gap-cursor@2.0.0-beta.12
  - @remirror/extension-hard-break@2.0.0-beta.12
  - @remirror/extension-heading@2.0.0-beta.12
  - @remirror/extension-history@2.0.0-beta.12
  - @remirror/extension-horizontal-rule@2.0.0-beta.12
  - @remirror/extension-image@2.0.0-beta.12
  - @remirror/extension-italic@2.0.0-beta.12
  - @remirror/extension-link@2.0.0-beta.12
  - @remirror/extension-list@2.0.0-beta.12
  - @remirror/extension-markdown@2.0.0-beta.12
  - @remirror/extension-mention@2.0.0-beta.12
  - @remirror/extension-mention-atom@2.0.0-beta.12
  - @remirror/extension-node-formatting@2.0.0-beta.12
  - @remirror/extension-paragraph@2.0.0-beta.12
  - @remirror/extension-placeholder@2.0.0-beta.12
  - @remirror/extension-positioner@2.0.0-beta.12
  - @remirror/extension-search@2.0.0-beta.12
  - @remirror/extension-shortcuts@2.0.0-beta.12
  - @remirror/extension-strike@2.0.0-beta.12
  - @remirror/extension-sub@2.0.0-beta.12
  - @remirror/extension-sup@2.0.0-beta.12
  - @remirror/extension-tables@2.0.0-beta.12
  - @remirror/extension-text@2.0.0-beta.12
  - @remirror/extension-text-case@2.0.0-beta.12
  - @remirror/extension-text-color@2.0.0-beta.12
  - @remirror/extension-text-highlight@2.0.0-beta.12
  - @remirror/extension-trailing-node@2.0.0-beta.12
  - @remirror/extension-underline@2.0.0-beta.12
  - @remirror/extension-whitespace@2.0.0-beta.12
  - @remirror/extension-yjs@3.0.0-beta.12
  - @remirror/icons@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12
  - @remirror/preset-core@2.0.0-beta.12
  - @remirror/preset-formatting@2.0.0-beta.12
  - @remirror/preset-wysiwyg@2.0.0-beta.12
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
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update pnpm-lock.yaml
- Add an optional onclickmark handler to handle clicks on entity reference
- When href equals text content, treat the link as an auto link (if enabled)
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Transform a hard break into `\n` in `Node.textContent`.
- add helper to get shortest entity reference
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
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
  - @remirror/extension-markdown@2.0.0-beta.11
  - @remirror/extension-tables@2.0.0-beta.11
  - @remirror/theme@2.0.0-beta.11
  - @remirror/dom@2.0.0-beta.11
  - @remirror/extension-annotation@2.0.0-beta.11
  - @remirror/extension-blockquote@2.0.0-beta.11
  - @remirror/extension-callout@2.0.0-beta.11
  - @remirror/extension-code-block@2.0.0-beta.11
  - @remirror/extension-emoji@2.0.0-beta.11
  - @remirror/extension-entity-reference@2.0.0-beta.11
  - @remirror/extension-image@2.0.0-beta.11
  - @remirror/extension-list@2.0.0-beta.11
  - @remirror/extension-mention-atom@2.0.0-beta.11
  - @remirror/extension-placeholder@2.0.0-beta.11
  - @remirror/extension-positioner@2.0.0-beta.11
  - @remirror/extension-text-color@2.0.0-beta.11
  - @remirror/extension-text-highlight@2.0.0-beta.11
  - @remirror/preset-core@2.0.0-beta.11
  - @remirror/preset-formatting@2.0.0-beta.11
  - @remirror/preset-wysiwyg@2.0.0-beta.11
  - @remirror/core@2.0.0-beta.11
  - @remirror/core-helpers@2.0.0-beta.11
  - @remirror/core-types@2.0.0-beta.11
  - @remirror/core-utils@2.0.0-beta.11
  - @remirror/extension-collaboration@2.0.0-beta.11
  - @remirror/extension-doc@2.0.0-beta.11
  - @remirror/extension-epic-mode@2.0.0-beta.11
  - @remirror/extension-events@2.0.0-beta.11
  - @remirror/extension-font-size@2.0.0-beta.11
  - @remirror/extension-heading@2.0.0-beta.11
  - @remirror/extension-link@2.0.0-beta.11
  - @remirror/extension-mention@2.0.0-beta.11
  - @remirror/extension-node-formatting@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11
  - @remirror/core-constants@2.0.0-beta.11
  - @remirror/extension-bidi@2.0.0-beta.11
  - @remirror/extension-bold@2.0.0-beta.11
  - @remirror/extension-code@2.0.0-beta.11
  - @remirror/extension-codemirror5@2.0.0-beta.11
  - @remirror/extension-columns@2.0.0-beta.11
  - @remirror/extension-diff@2.0.0-beta.11
  - @remirror/extension-drop-cursor@2.0.0-beta.11
  - @remirror/extension-embed@2.0.0-beta.11
  - @remirror/extension-font-family@2.0.0-beta.11
  - @remirror/extension-gap-cursor@2.0.0-beta.11
  - @remirror/extension-hard-break@2.0.0-beta.11
  - @remirror/extension-history@2.0.0-beta.11
  - @remirror/extension-horizontal-rule@2.0.0-beta.11
  - @remirror/extension-italic@2.0.0-beta.11
  - @remirror/extension-paragraph@2.0.0-beta.11
  - @remirror/extension-search@2.0.0-beta.11
  - @remirror/extension-shortcuts@2.0.0-beta.11
  - @remirror/extension-strike@2.0.0-beta.11
  - @remirror/extension-sub@2.0.0-beta.11
  - @remirror/extension-sup@2.0.0-beta.11
  - @remirror/extension-text@2.0.0-beta.11
  - @remirror/extension-text-case@2.0.0-beta.11
  - @remirror/extension-trailing-node@2.0.0-beta.11
  - @remirror/extension-underline@2.0.0-beta.11
  - @remirror/extension-whitespace@2.0.0-beta.11
  - @remirror/extension-yjs@3.0.0-beta.11
  - @remirror/icons@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Add an optional onclickmark handler to handle clicks on entity reference
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- add helper to get shortest entity reference
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- When href equals text content, treat the link as an auto link (if enabled)
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Transform a hard break into `\n` in `Node.textContent`.
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
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
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.10
  - @remirror/core-helpers@2.0.0-beta.10
  - @remirror/core@2.0.0-beta.10
  - @remirror/core-utils@2.0.0-beta.10
  - @remirror/dom@2.0.0-beta.10
  - @remirror/extension-annotation@2.0.0-beta.10
  - @remirror/extension-bidi@2.0.0-beta.10
  - @remirror/extension-blockquote@2.0.0-beta.10
  - @remirror/extension-bold@2.0.0-beta.10
  - @remirror/extension-callout@2.0.0-beta.10
  - @remirror/extension-code@2.0.0-beta.10
  - @remirror/extension-code-block@2.0.0-beta.10
  - @remirror/extension-codemirror5@2.0.0-beta.10
  - @remirror/extension-collaboration@2.0.0-beta.10
  - @remirror/extension-columns@2.0.0-beta.10
  - @remirror/extension-diff@2.0.0-beta.10
  - @remirror/extension-doc@2.0.0-beta.10
  - @remirror/extension-drop-cursor@2.0.0-beta.10
  - @remirror/extension-embed@2.0.0-beta.10
  - @remirror/extension-emoji@2.0.0-beta.10
  - @remirror/extension-entity-reference@2.0.0-beta.10
  - @remirror/extension-epic-mode@2.0.0-beta.10
  - @remirror/extension-events@2.0.0-beta.10
  - @remirror/extension-font-family@2.0.0-beta.10
  - @remirror/extension-font-size@2.0.0-beta.10
  - @remirror/extension-gap-cursor@2.0.0-beta.10
  - @remirror/extension-hard-break@2.0.0-beta.10
  - @remirror/extension-heading@2.0.0-beta.10
  - @remirror/extension-history@2.0.0-beta.10
  - @remirror/extension-horizontal-rule@2.0.0-beta.10
  - @remirror/extension-image@2.0.0-beta.10
  - @remirror/extension-italic@2.0.0-beta.10
  - @remirror/extension-link@2.0.0-beta.10
  - @remirror/extension-list@2.0.0-beta.10
  - @remirror/extension-markdown@2.0.0-beta.10
  - @remirror/extension-mention@2.0.0-beta.10
  - @remirror/extension-mention-atom@2.0.0-beta.10
  - @remirror/extension-node-formatting@2.0.0-beta.10
  - @remirror/extension-paragraph@2.0.0-beta.10
  - @remirror/extension-placeholder@2.0.0-beta.10
  - @remirror/extension-positioner@2.0.0-beta.10
  - @remirror/extension-search@2.0.0-beta.10
  - @remirror/extension-shortcuts@2.0.0-beta.10
  - @remirror/extension-strike@2.0.0-beta.10
  - @remirror/extension-sub@2.0.0-beta.10
  - @remirror/extension-sup@2.0.0-beta.10
  - @remirror/extension-tables@2.0.0-beta.10
  - @remirror/extension-text@2.0.0-beta.10
  - @remirror/extension-text-case@2.0.0-beta.10
  - @remirror/extension-text-color@2.0.0-beta.10
  - @remirror/extension-text-highlight@2.0.0-beta.10
  - @remirror/extension-trailing-node@2.0.0-beta.10
  - @remirror/extension-underline@2.0.0-beta.10
  - @remirror/extension-whitespace@2.0.0-beta.10
  - @remirror/extension-yjs@3.0.0-beta.10
  - @remirror/icons@2.0.0-beta.10
  - @remirror/preset-core@2.0.0-beta.10
  - @remirror/preset-formatting@2.0.0-beta.10
  - @remirror/preset-wysiwyg@2.0.0-beta.10
  - @remirror/core-types@2.0.0-beta.10
  - @remirror/core-constants@2.0.0-beta.10
  - @remirror/theme@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Transform a hard break into `\n` in `Node.textContent`.
- Update ProseMirror packages to latest versions.
- add helper to get shortest entity reference
- When href equals text content, treat the link as an auto link (if enabled)
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
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
  - @remirror/extension-collaboration@2.0.0-beta.9
  - @remirror/core@2.0.0-beta.9
  - @remirror/core-helpers@2.0.0-beta.9
  - @remirror/core-types@2.0.0-beta.9
  - @remirror/core-utils@2.0.0-beta.9
  - @remirror/dom@2.0.0-beta.9
  - @remirror/extension-annotation@2.0.0-beta.9
  - @remirror/extension-blockquote@2.0.0-beta.9
  - @remirror/extension-callout@2.0.0-beta.9
  - @remirror/extension-doc@2.0.0-beta.9
  - @remirror/extension-emoji@2.0.0-beta.9
  - @remirror/extension-epic-mode@2.0.0-beta.9
  - @remirror/extension-events@2.0.0-beta.9
  - @remirror/extension-font-size@2.0.0-beta.9
  - @remirror/extension-heading@2.0.0-beta.9
  - @remirror/extension-image@2.0.0-beta.9
  - @remirror/extension-link@2.0.0-beta.9
  - @remirror/extension-list@2.0.0-beta.9
  - @remirror/extension-mention@2.0.0-beta.9
  - @remirror/extension-mention-atom@2.0.0-beta.9
  - @remirror/extension-node-formatting@2.0.0-beta.9
  - @remirror/extension-placeholder@2.0.0-beta.9
  - @remirror/extension-tables@2.0.0-beta.9
  - @remirror/extension-text-color@2.0.0-beta.9
  - @remirror/extension-text-highlight@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9
  - @remirror/core-constants@2.0.0-beta.9
  - @remirror/extension-bidi@2.0.0-beta.9
  - @remirror/extension-bold@2.0.0-beta.9
  - @remirror/extension-code@2.0.0-beta.9
  - @remirror/extension-code-block@2.0.0-beta.9
  - @remirror/extension-codemirror5@2.0.0-beta.9
  - @remirror/extension-columns@2.0.0-beta.9
  - @remirror/extension-diff@2.0.0-beta.9
  - @remirror/extension-drop-cursor@2.0.0-beta.9
  - @remirror/extension-embed@2.0.0-beta.9
  - @remirror/extension-font-family@2.0.0-beta.9
  - @remirror/extension-gap-cursor@2.0.0-beta.9
  - @remirror/extension-hard-break@2.0.0-beta.9
  - @remirror/extension-history@2.0.0-beta.9
  - @remirror/extension-horizontal-rule@2.0.0-beta.9
  - @remirror/extension-italic@2.0.0-beta.9
  - @remirror/extension-markdown@2.0.0-beta.9
  - @remirror/extension-paragraph@2.0.0-beta.9
  - @remirror/extension-positioner@2.0.0-beta.9
  - @remirror/extension-search@2.0.0-beta.9
  - @remirror/extension-shortcuts@2.0.0-beta.9
  - @remirror/extension-strike@2.0.0-beta.9
  - @remirror/extension-sub@2.0.0-beta.9
  - @remirror/extension-sup@2.0.0-beta.9
  - @remirror/extension-text@2.0.0-beta.9
  - @remirror/extension-text-case@2.0.0-beta.9
  - @remirror/extension-trailing-node@2.0.0-beta.9
  - @remirror/extension-underline@2.0.0-beta.9
  - @remirror/extension-whitespace@2.0.0-beta.9
  - @remirror/extension-yjs@3.0.0-beta.9
  - @remirror/icons@2.0.0-beta.9
  - @remirror/preset-core@2.0.0-beta.9
  - @remirror/preset-formatting@2.0.0-beta.9
  - @remirror/preset-wysiwyg@2.0.0-beta.9
  - @remirror/theme@2.0.0-beta.9
  - @remirror/extension-entity-reference@2.0.0-beta.9

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

- Update ProseMirror packages to latest versions.
- Transform a hard break into `\n` in `Node.textContent`.
- SSR features are removed.
- When href equals text content, treat the link as an auto link (if enabled)
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Try to require JSDOM implicitly in node environment.
- add helper to get shortest entity reference
- Expose the return type of the throttle and debounce helpers
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
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
  - @remirror/dom@2.0.0-beta.8
  - @remirror/extension-annotation@2.0.0-beta.8
  - @remirror/extension-blockquote@2.0.0-beta.8
  - @remirror/extension-callout@2.0.0-beta.8
  - @remirror/extension-code-block@2.0.0-beta.8
  - @remirror/extension-emoji@2.0.0-beta.8
  - @remirror/extension-entity-reference@2.0.0-beta.8
  - @remirror/extension-image@2.0.0-beta.8
  - @remirror/extension-list@2.0.0-beta.8
  - @remirror/extension-mention-atom@2.0.0-beta.8
  - @remirror/extension-placeholder@2.0.0-beta.8
  - @remirror/extension-positioner@2.0.0-beta.8
  - @remirror/extension-tables@2.0.0-beta.8
  - @remirror/extension-text-color@2.0.0-beta.8
  - @remirror/extension-text-highlight@2.0.0-beta.8
  - @remirror/preset-core@2.0.0-beta.8
  - @remirror/preset-formatting@2.0.0-beta.8
  - @remirror/preset-wysiwyg@2.0.0-beta.8
  - @remirror/pm@2.0.0-beta.8
  - @remirror/extension-embed@2.0.0-beta.8
  - @remirror/extension-hard-break@2.0.0-beta.8
  - @remirror/core@2.0.0-beta.8
  - @remirror/extension-bidi@2.0.0-beta.8
  - @remirror/extension-bold@2.0.0-beta.8
  - @remirror/extension-code@2.0.0-beta.8
  - @remirror/extension-codemirror5@2.0.0-beta.8
  - @remirror/extension-collaboration@2.0.0-beta.8
  - @remirror/extension-columns@2.0.0-beta.8
  - @remirror/extension-diff@2.0.0-beta.8
  - @remirror/extension-doc@2.0.0-beta.8
  - @remirror/extension-drop-cursor@2.0.0-beta.8
  - @remirror/extension-epic-mode@2.0.0-beta.8
  - @remirror/extension-events@2.0.0-beta.8
  - @remirror/extension-font-family@2.0.0-beta.8
  - @remirror/extension-font-size@2.0.0-beta.8
  - @remirror/extension-gap-cursor@2.0.0-beta.8
  - @remirror/extension-heading@2.0.0-beta.8
  - @remirror/extension-history@2.0.0-beta.8
  - @remirror/extension-horizontal-rule@2.0.0-beta.8
  - @remirror/extension-italic@2.0.0-beta.8
  - @remirror/extension-link@2.0.0-beta.8
  - @remirror/extension-markdown@2.0.0-beta.8
  - @remirror/extension-mention@2.0.0-beta.8
  - @remirror/extension-node-formatting@2.0.0-beta.8
  - @remirror/extension-paragraph@2.0.0-beta.8
  - @remirror/extension-search@2.0.0-beta.8
  - @remirror/extension-shortcuts@2.0.0-beta.8
  - @remirror/extension-strike@2.0.0-beta.8
  - @remirror/extension-sub@2.0.0-beta.8
  - @remirror/extension-sup@2.0.0-beta.8
  - @remirror/extension-text@2.0.0-beta.8
  - @remirror/extension-text-case@2.0.0-beta.8
  - @remirror/extension-trailing-node@2.0.0-beta.8
  - @remirror/extension-underline@2.0.0-beta.8
  - @remirror/extension-whitespace@2.0.0-beta.8
  - @remirror/extension-yjs@3.0.0-beta.8
  - @remirror/core-helpers@2.0.0-beta.8
  - @remirror/core-types@2.0.0-beta.8
  - @remirror/core-utils@2.0.0-beta.8
  - @remirror/core-constants@2.0.0-beta.8
  - @remirror/icons@2.0.0-beta.8

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- SSR features are removed.
- When href equals text content, treat the link as an auto link (if enabled)
- Update ProseMirror packages to latest versions.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Transform a hard break into `\n` in `Node.textContent`.
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
- Updated dependencies
  - @remirror/core@2.0.0-beta.7
  - @remirror/dom@2.0.0-beta.7
  - @remirror/extension-annotation@2.0.0-beta.7
  - @remirror/extension-bidi@2.0.0-beta.7
  - @remirror/extension-blockquote@2.0.0-beta.7
  - @remirror/extension-bold@2.0.0-beta.7
  - @remirror/extension-callout@2.0.0-beta.7
  - @remirror/extension-code@2.0.0-beta.7
  - @remirror/extension-code-block@2.0.0-beta.7
  - @remirror/extension-codemirror5@2.0.0-beta.7
  - @remirror/extension-collaboration@2.0.0-beta.7
  - @remirror/extension-columns@2.0.0-beta.7
  - @remirror/extension-diff@2.0.0-beta.7
  - @remirror/extension-doc@2.0.0-beta.7
  - @remirror/extension-drop-cursor@2.0.0-beta.7
  - @remirror/extension-embed@2.0.0-beta.7
  - @remirror/extension-emoji@2.0.0-beta.7
  - @remirror/extension-entity-reference@2.0.0-beta.7
  - @remirror/extension-epic-mode@2.0.0-beta.7
  - @remirror/extension-events@2.0.0-beta.7
  - @remirror/extension-font-family@2.0.0-beta.7
  - @remirror/extension-font-size@2.0.0-beta.7
  - @remirror/extension-gap-cursor@2.0.0-beta.7
  - @remirror/extension-hard-break@2.0.0-beta.7
  - @remirror/extension-heading@2.0.0-beta.7
  - @remirror/extension-history@2.0.0-beta.7
  - @remirror/extension-horizontal-rule@2.0.0-beta.7
  - @remirror/extension-image@2.0.0-beta.7
  - @remirror/extension-italic@2.0.0-beta.7
  - @remirror/extension-link@2.0.0-beta.7
  - @remirror/extension-list@2.0.0-beta.7
  - @remirror/extension-markdown@2.0.0-beta.7
  - @remirror/extension-mention@2.0.0-beta.7
  - @remirror/extension-mention-atom@2.0.0-beta.7
  - @remirror/extension-node-formatting@2.0.0-beta.7
  - @remirror/extension-paragraph@2.0.0-beta.7
  - @remirror/extension-placeholder@2.0.0-beta.7
  - @remirror/extension-positioner@2.0.0-beta.7
  - @remirror/extension-search@2.0.0-beta.7
  - @remirror/extension-shortcuts@2.0.0-beta.7
  - @remirror/extension-strike@2.0.0-beta.7
  - @remirror/extension-sub@2.0.0-beta.7
  - @remirror/extension-sup@2.0.0-beta.7
  - @remirror/extension-tables@2.0.0-beta.7
  - @remirror/extension-text@2.0.0-beta.7
  - @remirror/extension-text-case@2.0.0-beta.7
  - @remirror/extension-text-color@2.0.0-beta.7
  - @remirror/extension-text-highlight@2.0.0-beta.7
  - @remirror/extension-trailing-node@2.0.0-beta.7
  - @remirror/extension-underline@2.0.0-beta.7
  - @remirror/extension-whitespace@2.0.0-beta.7
  - @remirror/extension-yjs@3.0.0-beta.7
  - @remirror/preset-core@2.0.0-beta.7
  - @remirror/preset-formatting@2.0.0-beta.7
  - @remirror/preset-wysiwyg@2.0.0-beta.7
  - @remirror/pm@2.0.0-beta.7
  - @remirror/theme@2.0.0-beta.7
  - @remirror/core-constants@2.0.0-beta.7
  - @remirror/core-helpers@2.0.0-beta.7
  - @remirror/core-types@2.0.0-beta.7
  - @remirror/core-utils@2.0.0-beta.7
  - @remirror/icons@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Transform a hard break into `\n` in `Node.textContent`.
- Try to require JSDOM implicitly in node environment.
- When href equals text content, treat the link as an auto link (if enabled)
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
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
  - @remirror/theme@2.0.0-beta.6
  - @remirror/dom@2.0.0-beta.6
  - @remirror/extension-annotation@2.0.0-beta.6
  - @remirror/extension-blockquote@2.0.0-beta.6
  - @remirror/extension-callout@2.0.0-beta.6
  - @remirror/extension-code-block@2.0.0-beta.6
  - @remirror/extension-emoji@2.0.0-beta.6
  - @remirror/extension-entity-reference@2.0.0-beta.6
  - @remirror/extension-image@2.0.0-beta.6
  - @remirror/extension-list@2.0.0-beta.6
  - @remirror/extension-mention-atom@2.0.0-beta.6
  - @remirror/extension-placeholder@2.0.0-beta.6
  - @remirror/extension-positioner@2.0.0-beta.6
  - @remirror/extension-tables@2.0.0-beta.6
  - @remirror/extension-text-color@2.0.0-beta.6
  - @remirror/extension-text-highlight@2.0.0-beta.6
  - @remirror/preset-core@2.0.0-beta.6
  - @remirror/preset-formatting@2.0.0-beta.6
  - @remirror/preset-wysiwyg@2.0.0-beta.6
  - @remirror/pm@2.0.0-beta.6
  - @remirror/extension-embed@2.0.0-beta.6
  - @remirror/core-helpers@2.0.0-beta.6
  - @remirror/core@2.0.0-beta.6
  - @remirror/core-utils@2.0.0-beta.6
  - @remirror/extension-bidi@2.0.0-beta.6
  - @remirror/extension-bold@2.0.0-beta.6
  - @remirror/extension-code@2.0.0-beta.6
  - @remirror/extension-codemirror5@2.0.0-beta.6
  - @remirror/extension-collaboration@2.0.0-beta.6
  - @remirror/extension-columns@2.0.0-beta.6
  - @remirror/extension-diff@2.0.0-beta.6
  - @remirror/extension-doc@2.0.0-beta.6
  - @remirror/extension-drop-cursor@2.0.0-beta.6
  - @remirror/extension-epic-mode@2.0.0-beta.6
  - @remirror/extension-events@2.0.0-beta.6
  - @remirror/extension-font-family@2.0.0-beta.6
  - @remirror/extension-font-size@2.0.0-beta.6
  - @remirror/extension-gap-cursor@2.0.0-beta.6
  - @remirror/extension-hard-break@2.0.0-beta.6
  - @remirror/extension-heading@2.0.0-beta.6
  - @remirror/extension-history@2.0.0-beta.6
  - @remirror/extension-horizontal-rule@2.0.0-beta.6
  - @remirror/extension-italic@2.0.0-beta.6
  - @remirror/extension-link@2.0.0-beta.6
  - @remirror/extension-markdown@2.0.0-beta.6
  - @remirror/extension-mention@2.0.0-beta.6
  - @remirror/extension-node-formatting@2.0.0-beta.6
  - @remirror/extension-paragraph@2.0.0-beta.6
  - @remirror/extension-search@2.0.0-beta.6
  - @remirror/extension-shortcuts@2.0.0-beta.6
  - @remirror/extension-strike@2.0.0-beta.6
  - @remirror/extension-sub@2.0.0-beta.6
  - @remirror/extension-sup@2.0.0-beta.6
  - @remirror/extension-text@2.0.0-beta.6
  - @remirror/extension-text-case@2.0.0-beta.6
  - @remirror/extension-trailing-node@2.0.0-beta.6
  - @remirror/extension-underline@2.0.0-beta.6
  - @remirror/extension-whitespace@2.0.0-beta.6
  - @remirror/extension-yjs@3.0.0-beta.6
  - @remirror/icons@2.0.0-beta.6
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
- Update ProseMirror packages to latest versions.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Transform a hard break into `\n` in `Node.textContent`.
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
  - @remirror/core-utils@2.0.0-beta.5
  - @remirror/core@2.0.0-beta.5
  - @remirror/dom@2.0.0-beta.5
  - @remirror/extension-annotation@2.0.0-beta.5
  - @remirror/extension-bidi@2.0.0-beta.5
  - @remirror/extension-blockquote@2.0.0-beta.5
  - @remirror/extension-bold@2.0.0-beta.5
  - @remirror/extension-callout@2.0.0-beta.5
  - @remirror/extension-code@2.0.0-beta.5
  - @remirror/extension-code-block@2.0.0-beta.5
  - @remirror/extension-codemirror5@2.0.0-beta.5
  - @remirror/extension-collaboration@2.0.0-beta.5
  - @remirror/extension-columns@2.0.0-beta.5
  - @remirror/extension-diff@2.0.0-beta.5
  - @remirror/extension-doc@2.0.0-beta.5
  - @remirror/extension-drop-cursor@2.0.0-beta.5
  - @remirror/extension-embed@2.0.0-beta.5
  - @remirror/extension-emoji@2.0.0-beta.5
  - @remirror/extension-entity-reference@2.0.0-beta.5
  - @remirror/extension-epic-mode@2.0.0-beta.5
  - @remirror/extension-events@2.0.0-beta.5
  - @remirror/extension-font-family@2.0.0-beta.5
  - @remirror/extension-font-size@2.0.0-beta.5
  - @remirror/extension-gap-cursor@2.0.0-beta.5
  - @remirror/extension-hard-break@2.0.0-beta.5
  - @remirror/extension-heading@2.0.0-beta.5
  - @remirror/extension-history@2.0.0-beta.5
  - @remirror/extension-horizontal-rule@2.0.0-beta.5
  - @remirror/extension-image@2.0.0-beta.5
  - @remirror/extension-italic@2.0.0-beta.5
  - @remirror/extension-link@2.0.0-beta.5
  - @remirror/extension-list@2.0.0-beta.5
  - @remirror/extension-markdown@2.0.0-beta.5
  - @remirror/extension-mention@2.0.0-beta.5
  - @remirror/extension-mention-atom@2.0.0-beta.5
  - @remirror/extension-node-formatting@2.0.0-beta.5
  - @remirror/extension-paragraph@2.0.0-beta.5
  - @remirror/extension-placeholder@2.0.0-beta.5
  - @remirror/extension-positioner@2.0.0-beta.5
  - @remirror/extension-search@2.0.0-beta.5
  - @remirror/extension-shortcuts@2.0.0-beta.5
  - @remirror/extension-strike@2.0.0-beta.5
  - @remirror/extension-sub@2.0.0-beta.5
  - @remirror/extension-sup@2.0.0-beta.5
  - @remirror/extension-tables@2.0.0-beta.5
  - @remirror/extension-text@2.0.0-beta.5
  - @remirror/extension-text-case@2.0.0-beta.5
  - @remirror/extension-text-color@2.0.0-beta.5
  - @remirror/extension-text-highlight@2.0.0-beta.5
  - @remirror/extension-trailing-node@2.0.0-beta.5
  - @remirror/extension-underline@2.0.0-beta.5
  - @remirror/extension-whitespace@2.0.0-beta.5
  - @remirror/extension-yjs@3.0.0-beta.5
  - @remirror/preset-core@2.0.0-beta.5
  - @remirror/preset-formatting@2.0.0-beta.5
  - @remirror/preset-wysiwyg@2.0.0-beta.5
  - @remirror/core-helpers@2.0.0-beta.5
  - @remirror/icons@2.0.0-beta.5
  - @remirror/pm@2.0.0-beta.5
  - @remirror/theme@2.0.0-beta.5
  - @remirror/core-constants@2.0.0-beta.5
  - @remirror/core-types@2.0.0-beta.5

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- Transform a hard break into `\n` in `Node.textContent`.
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
  - @remirror/extension-collaboration@2.0.0-beta.4
  - @remirror/pm@2.0.0-beta.4
  - @remirror/core@2.0.0-beta.4
  - @remirror/dom@2.0.0-beta.4
  - @remirror/extension-annotation@2.0.0-beta.4
  - @remirror/extension-bidi@2.0.0-beta.4
  - @remirror/extension-blockquote@2.0.0-beta.4
  - @remirror/extension-bold@2.0.0-beta.4
  - @remirror/extension-callout@2.0.0-beta.4
  - @remirror/extension-code@2.0.0-beta.4
  - @remirror/extension-code-block@2.0.0-beta.4
  - @remirror/extension-codemirror5@2.0.0-beta.4
  - @remirror/extension-columns@2.0.0-beta.4
  - @remirror/extension-diff@2.0.0-beta.4
  - @remirror/extension-doc@2.0.0-beta.4
  - @remirror/extension-drop-cursor@2.0.0-beta.4
  - @remirror/extension-embed@2.0.0-beta.4
  - @remirror/extension-emoji@2.0.0-beta.4
  - @remirror/extension-entity-reference@2.0.0-beta.4
  - @remirror/extension-epic-mode@2.0.0-beta.4
  - @remirror/extension-events@2.0.0-beta.4
  - @remirror/extension-font-family@2.0.0-beta.4
  - @remirror/extension-font-size@2.0.0-beta.4
  - @remirror/extension-gap-cursor@2.0.0-beta.4
  - @remirror/extension-hard-break@2.0.0-beta.4
  - @remirror/extension-heading@2.0.0-beta.4
  - @remirror/extension-history@2.0.0-beta.4
  - @remirror/extension-horizontal-rule@2.0.0-beta.4
  - @remirror/extension-image@2.0.0-beta.4
  - @remirror/extension-italic@2.0.0-beta.4
  - @remirror/extension-link@2.0.0-beta.4
  - @remirror/extension-list@2.0.0-beta.4
  - @remirror/extension-markdown@2.0.0-beta.4
  - @remirror/extension-mention@2.0.0-beta.4
  - @remirror/extension-mention-atom@2.0.0-beta.4
  - @remirror/extension-node-formatting@2.0.0-beta.4
  - @remirror/extension-paragraph@2.0.0-beta.4
  - @remirror/extension-placeholder@2.0.0-beta.4
  - @remirror/extension-positioner@2.0.0-beta.4
  - @remirror/extension-search@2.0.0-beta.4
  - @remirror/extension-shortcuts@2.0.0-beta.4
  - @remirror/extension-strike@2.0.0-beta.4
  - @remirror/extension-sub@2.0.0-beta.4
  - @remirror/extension-sup@2.0.0-beta.4
  - @remirror/extension-tables@2.0.0-beta.4
  - @remirror/extension-text@2.0.0-beta.4
  - @remirror/extension-text-case@2.0.0-beta.4
  - @remirror/extension-text-color@2.0.0-beta.4
  - @remirror/extension-text-highlight@2.0.0-beta.4
  - @remirror/extension-trailing-node@2.0.0-beta.4
  - @remirror/extension-underline@2.0.0-beta.4
  - @remirror/extension-whitespace@2.0.0-beta.4
  - @remirror/extension-yjs@3.0.0-beta.4
  - @remirror/preset-core@2.0.0-beta.4
  - @remirror/preset-formatting@2.0.0-beta.4
  - @remirror/preset-wysiwyg@2.0.0-beta.4
  - @remirror/core-helpers@2.0.0-beta.4
  - @remirror/core-utils@2.0.0-beta.4
  - @remirror/icons@2.0.0-beta.4
  - @remirror/core-types@2.0.0-beta.4
  - @remirror/core-constants@2.0.0-beta.4
  - @remirror/theme@2.0.0-beta.4

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Transform a hard break into `\n` in `Node.textContent`.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Updated dependencies
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
  - @remirror/core-helpers@2.0.0-beta.3
  - @remirror/core-types@2.0.0-beta.3
  - @remirror/core-utils@2.0.0-beta.3
  - @remirror/dom@2.0.0-beta.3
  - @remirror/extension-annotation@2.0.0-beta.3
  - @remirror/extension-blockquote@2.0.0-beta.3
  - @remirror/extension-callout@2.0.0-beta.3
  - @remirror/extension-collaboration@2.0.0-beta.3
  - @remirror/extension-doc@2.0.0-beta.3
  - @remirror/extension-emoji@2.0.0-beta.3
  - @remirror/extension-epic-mode@2.0.0-beta.3
  - @remirror/extension-events@2.0.0-beta.3
  - @remirror/extension-font-size@2.0.0-beta.3
  - @remirror/extension-heading@2.0.0-beta.3
  - @remirror/extension-image@2.0.0-beta.3
  - @remirror/extension-link@2.0.0-beta.3
  - @remirror/extension-list@2.0.0-beta.3
  - @remirror/extension-mention@2.0.0-beta.3
  - @remirror/extension-mention-atom@2.0.0-beta.3
  - @remirror/extension-node-formatting@2.0.0-beta.3
  - @remirror/extension-placeholder@2.0.0-beta.3
  - @remirror/extension-tables@2.0.0-beta.3
  - @remirror/extension-text-color@2.0.0-beta.3
  - @remirror/extension-text-highlight@2.0.0-beta.3
  - @remirror/core-constants@2.0.0-beta.3
  - @remirror/extension-bidi@2.0.0-beta.3
  - @remirror/extension-bold@2.0.0-beta.3
  - @remirror/extension-code@2.0.0-beta.3
  - @remirror/extension-code-block@2.0.0-beta.3
  - @remirror/extension-codemirror5@2.0.0-beta.3
  - @remirror/extension-columns@2.0.0-beta.3
  - @remirror/extension-diff@2.0.0-beta.3
  - @remirror/extension-drop-cursor@2.0.0-beta.3
  - @remirror/extension-embed@2.0.0-beta.3
  - @remirror/extension-font-family@2.0.0-beta.3
  - @remirror/extension-gap-cursor@2.0.0-beta.3
  - @remirror/extension-hard-break@2.0.0-beta.3
  - @remirror/extension-history@2.0.0-beta.3
  - @remirror/extension-horizontal-rule@2.0.0-beta.3
  - @remirror/extension-italic@2.0.0-beta.3
  - @remirror/extension-markdown@2.0.0-beta.3
  - @remirror/extension-paragraph@2.0.0-beta.3
  - @remirror/extension-positioner@2.0.0-beta.3
  - @remirror/extension-search@2.0.0-beta.3
  - @remirror/extension-shortcuts@2.0.0-beta.3
  - @remirror/extension-strike@2.0.0-beta.3
  - @remirror/extension-sub@2.0.0-beta.3
  - @remirror/extension-sup@2.0.0-beta.3
  - @remirror/extension-text@2.0.0-beta.3
  - @remirror/extension-text-case@2.0.0-beta.3
  - @remirror/extension-trailing-node@2.0.0-beta.3
  - @remirror/extension-underline@2.0.0-beta.3
  - @remirror/extension-whitespace@2.0.0-beta.3
  - @remirror/extension-yjs@3.0.0-beta.3
  - @remirror/icons@2.0.0-beta.3
  - @remirror/preset-core@2.0.0-beta.3
  - @remirror/preset-formatting@2.0.0-beta.3
  - @remirror/preset-wysiwyg@2.0.0-beta.3
  - @remirror/theme@2.0.0-beta.3
  - @remirror/extension-entity-reference@2.0.0-beta.3

## 2.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Transform a hard break into `\n` in `Node.textContent`.
- SSR features are removed.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update ProseMirror packages to latest versions.
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
  - @remirror/core@2.0.0-beta.2
  - @remirror/core-constants@2.0.0-beta.2
  - @remirror/core-helpers@2.0.0-beta.2
  - @remirror/core-types@2.0.0-beta.2
  - @remirror/core-utils@2.0.0-beta.2
  - @remirror/dom@2.0.0-beta.2
  - @remirror/extension-annotation@2.0.0-beta.2
  - @remirror/extension-bidi@2.0.0-beta.2
  - @remirror/extension-blockquote@2.0.0-beta.2
  - @remirror/extension-bold@2.0.0-beta.2
  - @remirror/extension-callout@2.0.0-beta.2
  - @remirror/extension-code@2.0.0-beta.2
  - @remirror/extension-code-block@2.0.0-beta.2
  - @remirror/extension-codemirror5@2.0.0-beta.2
  - @remirror/extension-collaboration@2.0.0-beta.2
  - @remirror/extension-columns@2.0.0-beta.2
  - @remirror/extension-diff@2.0.0-beta.2
  - @remirror/extension-doc@2.0.0-beta.2
  - @remirror/extension-drop-cursor@2.0.0-beta.2
  - @remirror/extension-embed@2.0.0-beta.2
  - @remirror/extension-emoji@2.0.0-beta.2
  - @remirror/extension-entity-reference@2.0.0-beta.2
  - @remirror/extension-epic-mode@2.0.0-beta.2
  - @remirror/extension-events@2.0.0-beta.2
  - @remirror/extension-font-family@2.0.0-beta.2
  - @remirror/extension-font-size@2.0.0-beta.2
  - @remirror/extension-gap-cursor@2.0.0-beta.2
  - @remirror/extension-hard-break@2.0.0-beta.2
  - @remirror/extension-heading@2.0.0-beta.2
  - @remirror/extension-history@2.0.0-beta.2
  - @remirror/extension-horizontal-rule@2.0.0-beta.2
  - @remirror/extension-image@2.0.0-beta.2
  - @remirror/extension-italic@2.0.0-beta.2
  - @remirror/extension-link@2.0.0-beta.2
  - @remirror/extension-list@2.0.0-beta.2
  - @remirror/extension-markdown@2.0.0-beta.2
  - @remirror/extension-mention@2.0.0-beta.2
  - @remirror/extension-mention-atom@2.0.0-beta.2
  - @remirror/extension-node-formatting@2.0.0-beta.2
  - @remirror/extension-paragraph@2.0.0-beta.2
  - @remirror/extension-placeholder@2.0.0-beta.2
  - @remirror/extension-positioner@2.0.0-beta.2
  - @remirror/extension-search@2.0.0-beta.2
  - @remirror/extension-shortcuts@2.0.0-beta.2
  - @remirror/extension-strike@2.0.0-beta.2
  - @remirror/extension-sub@2.0.0-beta.2
  - @remirror/extension-sup@2.0.0-beta.2
  - @remirror/extension-tables@2.0.0-beta.2
  - @remirror/extension-text@2.0.0-beta.2
  - @remirror/extension-text-case@2.0.0-beta.2
  - @remirror/extension-text-color@2.0.0-beta.2
  - @remirror/extension-text-highlight@2.0.0-beta.2
  - @remirror/extension-trailing-node@2.0.0-beta.2
  - @remirror/extension-underline@2.0.0-beta.2
  - @remirror/extension-whitespace@2.0.0-beta.2
  - @remirror/extension-yjs@3.0.0-beta.2
  - @remirror/icons@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2
  - @remirror/preset-core@2.0.0-beta.2
  - @remirror/preset-formatting@2.0.0-beta.2
  - @remirror/preset-wysiwyg@2.0.0-beta.2
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
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Transform a hard break into `\n` in `Node.textContent`.
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-events@2.0.0-beta.1
  - @remirror/dom@2.0.0-beta.1
  - @remirror/extension-annotation@2.0.0-beta.1
  - @remirror/extension-entity-reference@2.0.0-beta.1
  - @remirror/extension-link@2.0.0-beta.1
  - @remirror/extension-list@2.0.0-beta.1
  - @remirror/extension-mention@2.0.0-beta.1
  - @remirror/extension-mention-atom@2.0.0-beta.1
  - @remirror/extension-positioner@2.0.0-beta.1
  - @remirror/preset-core@2.0.0-beta.1
  - @remirror/preset-wysiwyg@2.0.0-beta.1
  - @remirror/core@2.0.0-beta.1
  - @remirror/extension-bidi@2.0.0-beta.1
  - @remirror/extension-blockquote@2.0.0-beta.1
  - @remirror/extension-bold@2.0.0-beta.1
  - @remirror/extension-callout@2.0.0-beta.1
  - @remirror/extension-code@2.0.0-beta.1
  - @remirror/extension-code-block@2.0.0-beta.1
  - @remirror/extension-codemirror5@2.0.0-beta.1
  - @remirror/extension-collaboration@2.0.0-beta.1
  - @remirror/extension-columns@2.0.0-beta.1
  - @remirror/extension-diff@2.0.0-beta.1
  - @remirror/extension-doc@2.0.0-beta.1
  - @remirror/extension-drop-cursor@2.0.0-beta.1
  - @remirror/extension-embed@2.0.0-beta.1
  - @remirror/extension-emoji@2.0.0-beta.1
  - @remirror/extension-epic-mode@2.0.0-beta.1
  - @remirror/extension-font-family@2.0.0-beta.1
  - @remirror/extension-font-size@2.0.0-beta.1
  - @remirror/extension-gap-cursor@2.0.0-beta.1
  - @remirror/extension-hard-break@2.0.0-beta.1
  - @remirror/extension-heading@2.0.0-beta.1
  - @remirror/extension-history@2.0.0-beta.1
  - @remirror/extension-horizontal-rule@2.0.0-beta.1
  - @remirror/extension-image@2.0.0-beta.1
  - @remirror/extension-italic@2.0.0-beta.1
  - @remirror/extension-markdown@2.0.0-beta.1
  - @remirror/extension-node-formatting@2.0.0-beta.1
  - @remirror/extension-paragraph@2.0.0-beta.1
  - @remirror/extension-placeholder@2.0.0-beta.1
  - @remirror/extension-search@2.0.0-beta.1
  - @remirror/extension-shortcuts@2.0.0-beta.1
  - @remirror/extension-strike@2.0.0-beta.1
  - @remirror/extension-sub@2.0.0-beta.1
  - @remirror/extension-sup@2.0.0-beta.1
  - @remirror/extension-tables@2.0.0-beta.1
  - @remirror/extension-text@2.0.0-beta.1
  - @remirror/extension-text-case@2.0.0-beta.1
  - @remirror/extension-text-color@2.0.0-beta.1
  - @remirror/extension-text-highlight@2.0.0-beta.1
  - @remirror/extension-trailing-node@2.0.0-beta.1
  - @remirror/extension-underline@2.0.0-beta.1
  - @remirror/extension-whitespace@2.0.0-beta.1
  - @remirror/extension-yjs@3.0.0-beta.1
  - @remirror/preset-formatting@2.0.0-beta.1
  - @remirror/core-helpers@2.0.0-beta.1
  - @remirror/core-utils@2.0.0-beta.1
  - @remirror/icons@2.0.0-beta.1
  - @remirror/pm@2.0.0-beta.1
  - @remirror/core-types@2.0.0-beta.1
  - @remirror/core-constants@2.0.0-beta.1
  - @remirror/theme@2.0.0-beta.1

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core@2.0.0-beta.0
  - @remirror/core-helpers@2.0.0-beta.0
  - @remirror/core-types@2.0.0-beta.0
  - @remirror/core-utils@2.0.0-beta.0
  - @remirror/dom@2.0.0-beta.0
  - @remirror/extension-annotation@2.0.0-beta.0
  - @remirror/extension-blockquote@2.0.0-beta.0
  - @remirror/extension-callout@2.0.0-beta.0
  - @remirror/extension-collaboration@2.0.0-beta.0
  - @remirror/extension-doc@2.0.0-beta.0
  - @remirror/extension-emoji@2.0.0-beta.0
  - @remirror/extension-epic-mode@2.0.0-beta.0
  - @remirror/extension-events@2.0.0-beta.0
  - @remirror/extension-font-size@2.0.0-beta.0
  - @remirror/extension-heading@2.0.0-beta.0
  - @remirror/extension-image@2.0.0-beta.0
  - @remirror/extension-link@2.0.0-beta.0
  - @remirror/extension-list@2.0.0-beta.0
  - @remirror/extension-mention@2.0.0-beta.0
  - @remirror/extension-mention-atom@2.0.0-beta.0
  - @remirror/extension-node-formatting@2.0.0-beta.0
  - @remirror/extension-placeholder@2.0.0-beta.0
  - @remirror/extension-tables@2.0.0-beta.0
  - @remirror/extension-text-color@2.0.0-beta.0
  - @remirror/extension-text-highlight@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0
  - @remirror/core-constants@2.0.0-beta.0
  - @remirror/extension-bidi@2.0.0-beta.0
  - @remirror/extension-bold@2.0.0-beta.0
  - @remirror/extension-code@2.0.0-beta.0
  - @remirror/extension-code-block@2.0.0-beta.0
  - @remirror/extension-codemirror5@2.0.0-beta.0
  - @remirror/extension-columns@2.0.0-beta.0
  - @remirror/extension-diff@2.0.0-beta.0
  - @remirror/extension-drop-cursor@2.0.0-beta.0
  - @remirror/extension-embed@2.0.0-beta.0
  - @remirror/extension-font-family@2.0.0-beta.0
  - @remirror/extension-gap-cursor@2.0.0-beta.0
  - @remirror/extension-hard-break@2.0.0-beta.0
  - @remirror/extension-history@2.0.0-beta.0
  - @remirror/extension-horizontal-rule@2.0.0-beta.0
  - @remirror/extension-italic@2.0.0-beta.0
  - @remirror/extension-markdown@2.0.0-beta.0
  - @remirror/extension-paragraph@2.0.0-beta.0
  - @remirror/extension-positioner@2.0.0-beta.0
  - @remirror/extension-search@2.0.0-beta.0
  - @remirror/extension-shortcuts@2.0.0-beta.0
  - @remirror/extension-strike@2.0.0-beta.0
  - @remirror/extension-sub@2.0.0-beta.0
  - @remirror/extension-sup@2.0.0-beta.0
  - @remirror/extension-text@2.0.0-beta.0
  - @remirror/extension-text-case@2.0.0-beta.0
  - @remirror/extension-trailing-node@2.0.0-beta.0
  - @remirror/extension-underline@2.0.0-beta.0
  - @remirror/extension-whitespace@2.0.0-beta.0
  - @remirror/extension-yjs@3.0.0-beta.0
  - @remirror/icons@2.0.0-beta.0
  - @remirror/preset-core@2.0.0-beta.0
  - @remirror/preset-formatting@2.0.0-beta.0
  - @remirror/preset-wysiwyg@2.0.0-beta.0
  - @remirror/theme@2.0.0-beta.0

## 1.0.85

> 2022-05-31

### Patch Changes

- Lock ProseMirror pacakges to lower versions.

  The latest ProseMirror includes the buit-in TypeScript declaration, which is incompatible with the TypeScript definition in Remirror v1.

  See also: https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624

* Fix rendering and parsing of tasklists in markdown

* Updated dependencies []:
  - @remirror/pm@1.0.20
  - @remirror/extension-embed@1.1.33
  - @remirror/extension-image@1.0.38
  - @remirror/preset-wysiwyg@1.1.56
  - @remirror/extension-markdown@1.0.24

## 1.0.84

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

- Prevent checkbox toggle when view is not editable

- Updated dependencies []:
  - @remirror/core@1.4.6
  - @remirror/core-utils@1.1.10
  - @remirror/dom@1.0.30
  - @remirror/extension-annotation@1.1.24
  - @remirror/extension-bidi@1.0.23
  - @remirror/extension-blockquote@1.0.26
  - @remirror/extension-bold@1.0.23
  - @remirror/extension-callout@1.0.26
  - @remirror/extension-code@1.0.24
  - @remirror/extension-code-block@1.0.29
  - @remirror/extension-codemirror5@1.0.23
  - @remirror/extension-collaboration@1.0.23
  - @remirror/extension-columns@1.0.23
  - @remirror/extension-diff@1.0.23
  - @remirror/extension-doc@1.0.24
  - @remirror/extension-drop-cursor@1.0.23
  - @remirror/extension-embed@1.1.32
  - @remirror/extension-emoji@1.0.27
  - @remirror/extension-epic-mode@1.0.23
  - @remirror/extension-events@1.1.4
  - @remirror/extension-font-family@1.0.23
  - @remirror/extension-font-size@1.0.25
  - @remirror/extension-gap-cursor@1.0.23
  - @remirror/extension-hard-break@1.0.23
  - @remirror/extension-heading@1.0.24
  - @remirror/extension-history@1.0.23
  - @remirror/extension-horizontal-rule@1.0.24
  - @remirror/extension-image@1.0.37
  - @remirror/extension-italic@1.0.23
  - @remirror/extension-link@1.2.3
  - @remirror/extension-list@1.2.26
  - @remirror/extension-markdown@1.0.23
  - @remirror/extension-mention@1.0.24
  - @remirror/extension-mention-atom@1.0.27
  - @remirror/extension-node-formatting@1.0.27
  - @remirror/extension-paragraph@1.0.23
  - @remirror/extension-placeholder@1.0.26
  - @remirror/extension-positioner@1.2.7
  - @remirror/extension-search@1.0.23
  - @remirror/extension-shortcuts@1.1.12
  - @remirror/extension-strike@1.0.23
  - @remirror/extension-sub@1.0.23
  - @remirror/extension-sup@1.0.23
  - @remirror/extension-tables@1.0.26
  - @remirror/extension-text@1.0.23
  - @remirror/extension-text-case@1.0.23
  - @remirror/extension-text-color@1.0.26
  - @remirror/extension-text-highlight@1.0.26
  - @remirror/extension-trailing-node@1.0.23
  - @remirror/extension-underline@1.0.23
  - @remirror/extension-whitespace@1.0.23
  - @remirror/extension-yjs@2.0.3
  - @remirror/preset-core@1.0.29
  - @remirror/preset-formatting@1.0.32
  - @remirror/preset-wysiwyg@1.1.55

## 1.0.83

> 2022-05-27

### Patch Changes

- Return `false` when list indent and dedent commands won't work.

* Make sure NodeFormattingExtension works well with list extensions for `Tab` and `Shift-Tab` shortcuts.

* Updated dependencies []:
  - @remirror/extension-list@1.2.25
  - @remirror/preset-wysiwyg@1.1.54
  - @remirror/extension-node-formatting@1.0.26
  - @remirror/preset-formatting@1.0.31

## 1.0.82

> 2022-05-24

### Patch Changes

- Add a built in extension allowing external code to subscribe to document changes.

  ```ts
  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);
  ```

- Updated dependencies []:
  - @remirror/core@1.4.5
  - @remirror/dom@1.0.29
  - @remirror/extension-annotation@1.1.23
  - @remirror/extension-bidi@1.0.22
  - @remirror/extension-blockquote@1.0.25
  - @remirror/extension-bold@1.0.22
  - @remirror/extension-callout@1.0.25
  - @remirror/extension-code@1.0.23
  - @remirror/extension-code-block@1.0.28
  - @remirror/extension-codemirror5@1.0.22
  - @remirror/extension-collaboration@1.0.22
  - @remirror/extension-columns@1.0.22
  - @remirror/extension-diff@1.0.22
  - @remirror/extension-doc@1.0.23
  - @remirror/extension-drop-cursor@1.0.22
  - @remirror/extension-embed@1.1.31
  - @remirror/extension-emoji@1.0.26
  - @remirror/extension-epic-mode@1.0.22
  - @remirror/extension-events@1.1.3
  - @remirror/extension-font-family@1.0.22
  - @remirror/extension-font-size@1.0.24
  - @remirror/extension-gap-cursor@1.0.22
  - @remirror/extension-hard-break@1.0.22
  - @remirror/extension-heading@1.0.23
  - @remirror/extension-history@1.0.22
  - @remirror/extension-horizontal-rule@1.0.23
  - @remirror/extension-image@1.0.36
  - @remirror/extension-italic@1.0.22
  - @remirror/extension-link@1.2.2
  - @remirror/extension-list@1.2.24
  - @remirror/extension-markdown@1.0.22
  - @remirror/extension-mention@1.0.23
  - @remirror/extension-mention-atom@1.0.26
  - @remirror/extension-node-formatting@1.0.25
  - @remirror/extension-paragraph@1.0.22
  - @remirror/extension-placeholder@1.0.25
  - @remirror/extension-positioner@1.2.6
  - @remirror/extension-search@1.0.22
  - @remirror/extension-shortcuts@1.1.11
  - @remirror/extension-strike@1.0.22
  - @remirror/extension-sub@1.0.22
  - @remirror/extension-sup@1.0.22
  - @remirror/extension-tables@1.0.25
  - @remirror/extension-text@1.0.22
  - @remirror/extension-text-case@1.0.22
  - @remirror/extension-text-color@1.0.25
  - @remirror/extension-text-highlight@1.0.25
  - @remirror/extension-trailing-node@1.0.22
  - @remirror/extension-underline@1.0.22
  - @remirror/extension-whitespace@1.0.22
  - @remirror/extension-yjs@2.0.2
  - @remirror/preset-core@1.0.28
  - @remirror/preset-formatting@1.0.30
  - @remirror/preset-wysiwyg@1.1.53

## 1.0.81

> 2022-05-18

### Patch Changes

- Support font sizes using `min`, `max` or `clamp`. Avoid error if value cannot be parsed.

* Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

- Fix paste of tables in React Tables extension

- Updated dependencies []:
  - @remirror/extension-font-size@1.0.23
  - @remirror/preset-formatting@1.0.29
  - @remirror/core-utils@1.1.9
  - @remirror/core@1.4.4
  - @remirror/dom@1.0.28
  - @remirror/extension-annotation@1.1.22
  - @remirror/extension-bidi@1.0.21
  - @remirror/extension-blockquote@1.0.24
  - @remirror/extension-bold@1.0.21
  - @remirror/extension-callout@1.0.24
  - @remirror/extension-code@1.0.22
  - @remirror/extension-code-block@1.0.27
  - @remirror/extension-codemirror5@1.0.21
  - @remirror/extension-collaboration@1.0.21
  - @remirror/extension-columns@1.0.21
  - @remirror/extension-diff@1.0.21
  - @remirror/extension-doc@1.0.22
  - @remirror/extension-drop-cursor@1.0.21
  - @remirror/extension-embed@1.1.30
  - @remirror/extension-emoji@1.0.25
  - @remirror/extension-epic-mode@1.0.21
  - @remirror/extension-events@1.1.2
  - @remirror/extension-font-family@1.0.21
  - @remirror/extension-gap-cursor@1.0.21
  - @remirror/extension-hard-break@1.0.21
  - @remirror/extension-heading@1.0.22
  - @remirror/extension-history@1.0.21
  - @remirror/extension-horizontal-rule@1.0.22
  - @remirror/extension-image@1.0.35
  - @remirror/extension-italic@1.0.21
  - @remirror/extension-link@1.2.1
  - @remirror/extension-list@1.2.23
  - @remirror/extension-markdown@1.0.21
  - @remirror/extension-mention@1.0.22
  - @remirror/extension-mention-atom@1.0.25
  - @remirror/extension-node-formatting@1.0.24
  - @remirror/extension-paragraph@1.0.21
  - @remirror/extension-placeholder@1.0.24
  - @remirror/extension-positioner@1.2.5
  - @remirror/extension-search@1.0.21
  - @remirror/extension-shortcuts@1.1.10
  - @remirror/extension-strike@1.0.21
  - @remirror/extension-sub@1.0.21
  - @remirror/extension-sup@1.0.21
  - @remirror/extension-tables@1.0.24
  - @remirror/extension-text@1.0.21
  - @remirror/extension-text-case@1.0.21
  - @remirror/extension-text-color@1.0.24
  - @remirror/extension-text-highlight@1.0.24
  - @remirror/extension-trailing-node@1.0.21
  - @remirror/extension-underline@1.0.21
  - @remirror/extension-whitespace@1.0.21
  - @remirror/extension-yjs@2.0.1
  - @remirror/preset-core@1.0.27
  - @remirror/preset-wysiwyg@1.1.52

## 1.0.80

> 2022-05-11

### Patch Changes

- Remove annotation support from yjs-extension

- Updated dependencies []:
  - @remirror/extension-yjs@2.0.0

## 1.0.79

> 2022-05-05

### Patch Changes

- Update ProseMirror packages.

* Add support for `autoLinkAllowedTLDs` which enables the restriction of auto links to a set of Top Level Domains (TLDs). Defaults to the top 50 TLDs (as of May 2022).

  For a more complete list, you could replace this with the `tlds` or `global-list-tlds` packages.

  Or to extend the default list you could

  ```ts
  import { LinkExtension, TOP_50_TLDS } from 'remirror/extensions';
  const extensions = () => [
    new LinkExtension({
      autoLinkAllowedTLDs: [...TOP_50_TLDS, 'london', 'tech'],
    }),
  ];
  ```

  Tweak auto link regex to prevent match of single digit domains (i.e. 1.com) and remove support for hostnames ending with "." i.e. "remirror.io."

* Updated dependencies []:
  - @remirror/extension-yjs@1.0.31
  - @remirror/pm@1.0.18
  - @remirror/extension-embed@1.1.29
  - @remirror/extension-image@1.0.34
  - @remirror/preset-wysiwyg@1.1.51
  - @remirror/extension-link@1.2.0

## 1.0.78

> 2022-05-03

### Patch Changes

- Insert emoticons when hitting the Enter key (rather than requiring a space)

* Simplify the paste rule regex.

* Updated dependencies []:
  - @remirror/extension-emoji@1.0.24
  - @remirror/extension-heading@1.0.21
  - @remirror/preset-formatting@1.0.28
  - @remirror/preset-wysiwyg@1.1.50
  - @remirror/pm@1.0.17

## 1.0.77

> 2022-04-25

### Patch Changes

- Fixes iframe dimensions not being preserved on content restored - https://github.com/remirror/remirror/issues/1615

- Updated dependencies []:
  - @remirror/extension-embed@1.1.28
  - @remirror/preset-wysiwyg@1.1.49

## 1.0.76

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3
  - @remirror/dom@1.0.27
  - @remirror/extension-annotation@1.1.21
  - @remirror/extension-bidi@1.0.20
  - @remirror/extension-blockquote@1.0.23
  - @remirror/extension-bold@1.0.20
  - @remirror/extension-callout@1.0.23
  - @remirror/extension-code@1.0.21
  - @remirror/extension-code-block@1.0.26
  - @remirror/extension-codemirror5@1.0.20
  - @remirror/extension-collaboration@1.0.20
  - @remirror/extension-columns@1.0.20
  - @remirror/extension-diff@1.0.20
  - @remirror/extension-doc@1.0.21
  - @remirror/extension-drop-cursor@1.0.20
  - @remirror/extension-embed@1.1.27
  - @remirror/extension-emoji@1.0.23
  - @remirror/extension-epic-mode@1.0.20
  - @remirror/extension-events@1.1.1
  - @remirror/extension-font-family@1.0.20
  - @remirror/extension-font-size@1.0.22
  - @remirror/extension-gap-cursor@1.0.20
  - @remirror/extension-hard-break@1.0.20
  - @remirror/extension-heading@1.0.20
  - @remirror/extension-history@1.0.20
  - @remirror/extension-horizontal-rule@1.0.21
  - @remirror/extension-image@1.0.33
  - @remirror/extension-italic@1.0.20
  - @remirror/extension-link@1.1.19
  - @remirror/extension-list@1.2.22
  - @remirror/extension-markdown@1.0.20
  - @remirror/extension-mention@1.0.21
  - @remirror/extension-mention-atom@1.0.24
  - @remirror/extension-node-formatting@1.0.23
  - @remirror/extension-paragraph@1.0.20
  - @remirror/extension-placeholder@1.0.23
  - @remirror/extension-positioner@1.2.4
  - @remirror/extension-search@1.0.20
  - @remirror/extension-shortcuts@1.1.9
  - @remirror/extension-strike@1.0.20
  - @remirror/extension-sub@1.0.20
  - @remirror/extension-sup@1.0.20
  - @remirror/extension-tables@1.0.23
  - @remirror/extension-text@1.0.20
  - @remirror/extension-text-case@1.0.20
  - @remirror/extension-text-color@1.0.23
  - @remirror/extension-text-highlight@1.0.23
  - @remirror/extension-trailing-node@1.0.20
  - @remirror/extension-underline@1.0.20
  - @remirror/extension-whitespace@1.0.20
  - @remirror/extension-yjs@1.0.30
  - @remirror/preset-core@1.0.26
  - @remirror/preset-formatting@1.0.27
  - @remirror/preset-wysiwyg@1.1.48

## 1.0.75

> 2022-04-20

### Patch Changes

- Prevent italic input rule activation in middle of words

* Reorder the external plugins of the tables extensions, to avoid highlighting cells while resizing.

  Proposed by Pierre\_ on Discord

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

* Prevent onUpdateLink from being called in nodes that disallow marks

* Updated dependencies []:
  - @remirror/extension-italic@1.0.19
  - @remirror/preset-formatting@1.0.26
  - @remirror/preset-wysiwyg@1.1.47
  - @remirror/extension-tables@1.0.22
  - @remirror/extension-mention-atom@1.0.23
  - @remirror/core-utils@1.1.8
  - @remirror/extension-link@1.1.18
  - @remirror/core@1.4.2
  - @remirror/dom@1.0.26
  - @remirror/extension-annotation@1.1.20
  - @remirror/extension-bidi@1.0.19
  - @remirror/extension-blockquote@1.0.22
  - @remirror/extension-bold@1.0.19
  - @remirror/extension-callout@1.0.22
  - @remirror/extension-code@1.0.20
  - @remirror/extension-code-block@1.0.25
  - @remirror/extension-codemirror5@1.0.19
  - @remirror/extension-collaboration@1.0.19
  - @remirror/extension-columns@1.0.19
  - @remirror/extension-diff@1.0.19
  - @remirror/extension-doc@1.0.20
  - @remirror/extension-drop-cursor@1.0.19
  - @remirror/extension-embed@1.1.26
  - @remirror/extension-emoji@1.0.22
  - @remirror/extension-epic-mode@1.0.19
  - @remirror/extension-events@1.1.0
  - @remirror/extension-font-family@1.0.19
  - @remirror/extension-font-size@1.0.21
  - @remirror/extension-gap-cursor@1.0.19
  - @remirror/extension-hard-break@1.0.19
  - @remirror/extension-heading@1.0.19
  - @remirror/extension-history@1.0.19
  - @remirror/extension-horizontal-rule@1.0.20
  - @remirror/extension-image@1.0.32
  - @remirror/extension-list@1.2.21
  - @remirror/extension-markdown@1.0.19
  - @remirror/extension-mention@1.0.20
  - @remirror/extension-node-formatting@1.0.22
  - @remirror/extension-paragraph@1.0.19
  - @remirror/extension-placeholder@1.0.22
  - @remirror/extension-positioner@1.2.3
  - @remirror/extension-search@1.0.19
  - @remirror/extension-shortcuts@1.1.8
  - @remirror/extension-strike@1.0.19
  - @remirror/extension-sub@1.0.19
  - @remirror/extension-sup@1.0.19
  - @remirror/extension-text@1.0.19
  - @remirror/extension-text-case@1.0.19
  - @remirror/extension-text-color@1.0.22
  - @remirror/extension-text-highlight@1.0.22
  - @remirror/extension-trailing-node@1.0.19
  - @remirror/extension-underline@1.0.19
  - @remirror/extension-whitespace@1.0.19
  - @remirror/extension-yjs@1.0.29
  - @remirror/preset-core@1.0.25

## 1.0.74

> 2022-04-06

### Patch Changes

- Fix a RangeError when the document is updated during the resizing.

- Updated dependencies []:
  - @remirror/extension-embed@1.1.25
  - @remirror/extension-image@1.0.31
  - @remirror/preset-wysiwyg@1.1.46

## 1.0.73

> 2022-04-04

### Patch Changes

- Update dependency prosemirror-view.

- Updated dependencies []:
  - @remirror/pm@1.0.16
  - @remirror/extension-embed@1.1.24
  - @remirror/extension-image@1.0.30
  - @remirror/preset-wysiwyg@1.1.45

## 1.0.72

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

* Add a new `CountExtension`, adding the ability to count words or characters in your editor, and set a soft max length

* Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/dom@1.0.25
  - @remirror/extension-annotation@1.1.19
  - @remirror/extension-bidi@1.0.18
  - @remirror/extension-blockquote@1.0.21
  - @remirror/extension-bold@1.0.18
  - @remirror/extension-callout@1.0.21
  - @remirror/extension-code@1.0.19
  - @remirror/extension-code-block@1.0.24
  - @remirror/extension-codemirror5@1.0.18
  - @remirror/extension-collaboration@1.0.18
  - @remirror/extension-columns@1.0.18
  - @remirror/extension-diff@1.0.18
  - @remirror/extension-doc@1.0.19
  - @remirror/extension-drop-cursor@1.0.18
  - @remirror/extension-embed@1.1.23
  - @remirror/extension-emoji@1.0.21
  - @remirror/extension-epic-mode@1.0.18
  - @remirror/extension-events@1.0.19
  - @remirror/extension-font-family@1.0.18
  - @remirror/extension-font-size@1.0.20
  - @remirror/extension-gap-cursor@1.0.18
  - @remirror/extension-hard-break@1.0.18
  - @remirror/extension-heading@1.0.18
  - @remirror/extension-history@1.0.18
  - @remirror/extension-horizontal-rule@1.0.19
  - @remirror/extension-image@1.0.29
  - @remirror/extension-italic@1.0.18
  - @remirror/extension-link@1.1.17
  - @remirror/extension-list@1.2.20
  - @remirror/extension-markdown@1.0.18
  - @remirror/extension-mention@1.0.19
  - @remirror/extension-mention-atom@1.0.22
  - @remirror/extension-node-formatting@1.0.21
  - @remirror/extension-paragraph@1.0.18
  - @remirror/extension-placeholder@1.0.21
  - @remirror/extension-positioner@1.2.2
  - @remirror/extension-search@1.0.18
  - @remirror/extension-shortcuts@1.1.7
  - @remirror/extension-strike@1.0.18
  - @remirror/extension-sub@1.0.18
  - @remirror/extension-sup@1.0.18
  - @remirror/extension-tables@1.0.21
  - @remirror/extension-text@1.0.18
  - @remirror/extension-text-case@1.0.18
  - @remirror/extension-text-color@1.0.21
  - @remirror/extension-text-highlight@1.0.21
  - @remirror/extension-trailing-node@1.0.18
  - @remirror/extension-underline@1.0.18
  - @remirror/extension-whitespace@1.0.18
  - @remirror/extension-yjs@1.0.28
  - @remirror/preset-core@1.0.24
  - @remirror/preset-formatting@1.0.25
  - @remirror/preset-wysiwyg@1.1.44

## 1.0.71

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/dom@1.0.24
  - @remirror/extension-annotation@1.1.18
  - @remirror/extension-bidi@1.0.17
  - @remirror/extension-blockquote@1.0.20
  - @remirror/extension-bold@1.0.17
  - @remirror/extension-callout@1.0.20
  - @remirror/extension-code@1.0.18
  - @remirror/extension-code-block@1.0.23
  - @remirror/extension-codemirror5@1.0.17
  - @remirror/extension-collaboration@1.0.17
  - @remirror/extension-columns@1.0.17
  - @remirror/extension-diff@1.0.17
  - @remirror/extension-doc@1.0.18
  - @remirror/extension-drop-cursor@1.0.17
  - @remirror/extension-embed@1.1.22
  - @remirror/extension-emoji@1.0.20
  - @remirror/extension-epic-mode@1.0.17
  - @remirror/extension-events@1.0.18
  - @remirror/extension-font-family@1.0.17
  - @remirror/extension-font-size@1.0.19
  - @remirror/extension-gap-cursor@1.0.17
  - @remirror/extension-hard-break@1.0.17
  - @remirror/extension-heading@1.0.17
  - @remirror/extension-history@1.0.17
  - @remirror/extension-horizontal-rule@1.0.18
  - @remirror/extension-image@1.0.28
  - @remirror/extension-italic@1.0.17
  - @remirror/extension-link@1.1.16
  - @remirror/extension-list@1.2.19
  - @remirror/extension-markdown@1.0.17
  - @remirror/extension-mention@1.0.18
  - @remirror/extension-mention-atom@1.0.21
  - @remirror/extension-node-formatting@1.0.20
  - @remirror/extension-paragraph@1.0.17
  - @remirror/extension-placeholder@1.0.20
  - @remirror/extension-positioner@1.2.1
  - @remirror/extension-search@1.0.17
  - @remirror/extension-shortcuts@1.1.6
  - @remirror/extension-strike@1.0.17
  - @remirror/extension-sub@1.0.17
  - @remirror/extension-sup@1.0.17
  - @remirror/extension-tables@1.0.20
  - @remirror/extension-text@1.0.17
  - @remirror/extension-text-case@1.0.17
  - @remirror/extension-text-color@1.0.20
  - @remirror/extension-text-highlight@1.0.20
  - @remirror/extension-trailing-node@1.0.17
  - @remirror/extension-underline@1.0.17
  - @remirror/extension-whitespace@1.0.17
  - @remirror/extension-yjs@1.0.27
  - @remirror/preset-core@1.0.23
  - @remirror/preset-formatting@1.0.24
  - @remirror/preset-wysiwyg@1.1.43

## 1.0.70

> 2022-03-06

### Patch Changes

- `onChange` shouldn't be called if the transaction is canceled by `filterTransaction`.

- Updated dependencies []:
  - @remirror/dom@1.0.23

## 1.0.69

> 2022-03-04

### Patch Changes

- Add the ability to force update positioners with a new command `forceUpdatePositioners`.

  This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.

- Updated dependencies []:
  - @remirror/extension-positioner@1.2.0
  - @remirror/dom@1.0.22
  - @remirror/extension-annotation@1.1.17
  - @remirror/extension-yjs@1.0.26
  - @remirror/preset-core@1.0.22
  - @remirror/preset-wysiwyg@1.1.42

## 1.0.68

> 2022-03-02

### Patch Changes

- Fix an error when clicking the list spine.

- Updated dependencies []:
  - @remirror/extension-list@1.2.18
  - @remirror/preset-wysiwyg@1.1.41

## 1.0.67

> 2022-02-22

### Patch Changes

- Updated marked to v4 to resolve vunerable dependency alert

* Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

* Updated dependencies []:
  - @remirror/extension-markdown@1.0.16
  - @remirror/core-utils@1.1.7
  - @remirror/extension-link@1.1.15
  - @remirror/core@1.3.6
  - @remirror/dom@1.0.21
  - @remirror/extension-annotation@1.1.16
  - @remirror/extension-bidi@1.0.16
  - @remirror/extension-blockquote@1.0.19
  - @remirror/extension-bold@1.0.16
  - @remirror/extension-callout@1.0.19
  - @remirror/extension-code@1.0.17
  - @remirror/extension-code-block@1.0.22
  - @remirror/extension-codemirror5@1.0.16
  - @remirror/extension-collaboration@1.0.16
  - @remirror/extension-columns@1.0.16
  - @remirror/extension-diff@1.0.16
  - @remirror/extension-doc@1.0.17
  - @remirror/extension-drop-cursor@1.0.16
  - @remirror/extension-embed@1.1.21
  - @remirror/extension-emoji@1.0.19
  - @remirror/extension-epic-mode@1.0.16
  - @remirror/extension-events@1.0.17
  - @remirror/extension-font-family@1.0.16
  - @remirror/extension-font-size@1.0.18
  - @remirror/extension-gap-cursor@1.0.16
  - @remirror/extension-hard-break@1.0.16
  - @remirror/extension-heading@1.0.16
  - @remirror/extension-history@1.0.16
  - @remirror/extension-horizontal-rule@1.0.17
  - @remirror/extension-image@1.0.27
  - @remirror/extension-italic@1.0.16
  - @remirror/extension-list@1.2.17
  - @remirror/extension-mention@1.0.17
  - @remirror/extension-mention-atom@1.0.20
  - @remirror/extension-node-formatting@1.0.19
  - @remirror/extension-paragraph@1.0.16
  - @remirror/extension-placeholder@1.0.19
  - @remirror/extension-positioner@1.1.18
  - @remirror/extension-search@1.0.16
  - @remirror/extension-shortcuts@1.1.5
  - @remirror/extension-strike@1.0.16
  - @remirror/extension-sub@1.0.16
  - @remirror/extension-sup@1.0.16
  - @remirror/extension-tables@1.0.19
  - @remirror/extension-text@1.0.16
  - @remirror/extension-text-case@1.0.16
  - @remirror/extension-text-color@1.0.19
  - @remirror/extension-text-highlight@1.0.19
  - @remirror/extension-trailing-node@1.0.16
  - @remirror/extension-underline@1.0.16
  - @remirror/extension-whitespace@1.0.16
  - @remirror/extension-yjs@1.0.25
  - @remirror/preset-core@1.0.21
  - @remirror/preset-formatting@1.0.23
  - @remirror/preset-wysiwyg@1.1.40

## 1.0.66

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/theme@1.2.1
  - @remirror/dom@1.0.20
  - @remirror/extension-annotation@1.1.15
  - @remirror/extension-blockquote@1.0.18
  - @remirror/extension-callout@1.0.18
  - @remirror/extension-code-block@1.0.21
  - @remirror/extension-emoji@1.0.18
  - @remirror/extension-image@1.0.26
  - @remirror/extension-list@1.2.16
  - @remirror/extension-mention-atom@1.0.19
  - @remirror/extension-placeholder@1.0.18
  - @remirror/extension-positioner@1.1.17
  - @remirror/extension-tables@1.0.18
  - @remirror/extension-text-color@1.0.18
  - @remirror/extension-text-highlight@1.0.18
  - @remirror/extension-yjs@1.0.24
  - @remirror/preset-core@1.0.20
  - @remirror/preset-formatting@1.0.22
  - @remirror/preset-wysiwyg@1.1.39

## 1.0.65

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

* Allow disabling the yjs undo functionality in the yjs extension

* Updated dependencies []:
  - @remirror/core@1.3.5
  - @remirror/core-utils@1.1.6
  - @remirror/dom@1.0.19
  - @remirror/extension-annotation@1.1.14
  - @remirror/extension-bidi@1.0.15
  - @remirror/extension-blockquote@1.0.17
  - @remirror/extension-bold@1.0.15
  - @remirror/extension-callout@1.0.17
  - @remirror/extension-code@1.0.16
  - @remirror/extension-code-block@1.0.20
  - @remirror/extension-codemirror5@1.0.15
  - @remirror/extension-collaboration@1.0.15
  - @remirror/extension-columns@1.0.15
  - @remirror/extension-diff@1.0.15
  - @remirror/extension-doc@1.0.16
  - @remirror/extension-drop-cursor@1.0.15
  - @remirror/extension-embed@1.1.20
  - @remirror/extension-emoji@1.0.17
  - @remirror/extension-epic-mode@1.0.15
  - @remirror/extension-events@1.0.16
  - @remirror/extension-font-family@1.0.15
  - @remirror/extension-font-size@1.0.17
  - @remirror/extension-gap-cursor@1.0.15
  - @remirror/extension-hard-break@1.0.15
  - @remirror/extension-heading@1.0.15
  - @remirror/extension-history@1.0.15
  - @remirror/extension-horizontal-rule@1.0.16
  - @remirror/extension-image@1.0.25
  - @remirror/extension-italic@1.0.15
  - @remirror/extension-link@1.1.14
  - @remirror/extension-list@1.2.15
  - @remirror/extension-markdown@1.0.15
  - @remirror/extension-mention@1.0.16
  - @remirror/extension-mention-atom@1.0.18
  - @remirror/extension-node-formatting@1.0.18
  - @remirror/extension-paragraph@1.0.15
  - @remirror/extension-placeholder@1.0.17
  - @remirror/extension-positioner@1.1.16
  - @remirror/extension-search@1.0.15
  - @remirror/extension-shortcuts@1.1.4
  - @remirror/extension-strike@1.0.15
  - @remirror/extension-sub@1.0.15
  - @remirror/extension-sup@1.0.15
  - @remirror/extension-tables@1.0.17
  - @remirror/extension-text@1.0.15
  - @remirror/extension-text-case@1.0.15
  - @remirror/extension-text-color@1.0.17
  - @remirror/extension-text-highlight@1.0.17
  - @remirror/extension-trailing-node@1.0.15
  - @remirror/extension-underline@1.0.15
  - @remirror/extension-whitespace@1.0.15
  - @remirror/extension-yjs@1.0.23
  - @remirror/preset-core@1.0.19
  - @remirror/preset-formatting@1.0.21
  - @remirror/preset-wysiwyg@1.1.38

## 1.0.64

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

* Replace wrong assertion

* Updated dependencies []:
  - @remirror/core-utils@1.1.5
  - @remirror/extension-link@1.1.13
  - @remirror/core@1.3.4
  - @remirror/dom@1.0.18
  - @remirror/extension-annotation@1.1.13
  - @remirror/extension-bidi@1.0.14
  - @remirror/extension-blockquote@1.0.16
  - @remirror/extension-bold@1.0.14
  - @remirror/extension-callout@1.0.16
  - @remirror/extension-code@1.0.15
  - @remirror/extension-code-block@1.0.19
  - @remirror/extension-codemirror5@1.0.14
  - @remirror/extension-collaboration@1.0.14
  - @remirror/extension-columns@1.0.14
  - @remirror/extension-diff@1.0.14
  - @remirror/extension-doc@1.0.15
  - @remirror/extension-drop-cursor@1.0.14
  - @remirror/extension-embed@1.1.19
  - @remirror/extension-emoji@1.0.16
  - @remirror/extension-epic-mode@1.0.14
  - @remirror/extension-events@1.0.15
  - @remirror/extension-font-family@1.0.14
  - @remirror/extension-font-size@1.0.16
  - @remirror/extension-gap-cursor@1.0.14
  - @remirror/extension-hard-break@1.0.14
  - @remirror/extension-heading@1.0.14
  - @remirror/extension-history@1.0.14
  - @remirror/extension-horizontal-rule@1.0.15
  - @remirror/extension-image@1.0.24
  - @remirror/extension-italic@1.0.14
  - @remirror/extension-list@1.2.14
  - @remirror/extension-markdown@1.0.14
  - @remirror/extension-mention@1.0.15
  - @remirror/extension-mention-atom@1.0.17
  - @remirror/extension-node-formatting@1.0.17
  - @remirror/extension-paragraph@1.0.14
  - @remirror/extension-placeholder@1.0.16
  - @remirror/extension-positioner@1.1.15
  - @remirror/extension-search@1.0.14
  - @remirror/extension-shortcuts@1.1.3
  - @remirror/extension-strike@1.0.14
  - @remirror/extension-sub@1.0.14
  - @remirror/extension-sup@1.0.14
  - @remirror/extension-tables@1.0.16
  - @remirror/extension-text@1.0.14
  - @remirror/extension-text-case@1.0.14
  - @remirror/extension-text-color@1.0.16
  - @remirror/extension-text-highlight@1.0.16
  - @remirror/extension-trailing-node@1.0.14
  - @remirror/extension-underline@1.0.14
  - @remirror/extension-whitespace@1.0.14
  - @remirror/extension-yjs@1.0.22
  - @remirror/preset-core@1.0.18
  - @remirror/preset-formatting@1.0.20
  - @remirror/preset-wysiwyg@1.1.37

## 1.0.63

> 2022-02-02

### Patch Changes

- Avoid race conditions in processing annotations

- Updated dependencies []:
  - @remirror/extension-annotation@1.1.12
  - @remirror/extension-yjs@1.0.21

## 1.0.62

> 2022-01-31

### Patch Changes

- fix: don't extend annotation when the user types at the beginning

- Updated dependencies []:
  - @remirror/extension-annotation@1.1.11
  - @remirror/extension-yjs@1.0.20

## 1.0.61

> 2022-01-21

### Patch Changes

- fix: make HorizontalRule compatible with Shortcuts

- Updated dependencies []:
  - @remirror/extension-horizontal-rule@1.0.14
  - @remirror/preset-wysiwyg@1.1.36

## 1.0.60

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

- Updated dependencies []:
  - @remirror/pm@1.0.11
  - @remirror/extension-embed@1.1.18
  - @remirror/extension-image@1.0.23
  - @remirror/preset-wysiwyg@1.1.35

## 1.0.59

> 2022-01-16

### Patch Changes

- Fix a runtime error when getting font size before the editor view is initialized.

* Increase the clickable area of the task list checkbox by using `<label>` to wrap the checkbox.

* Updated dependencies []:
  - @remirror/extension-font-size@1.0.15
  - @remirror/preset-formatting@1.0.19
  - @remirror/extension-list@1.2.13
  - @remirror/preset-wysiwyg@1.1.34

## 1.0.58

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
  - @remirror/dom@1.0.17
  - @remirror/extension-annotation@1.1.10
  - @remirror/extension-blockquote@1.0.15
  - @remirror/extension-callout@1.0.15
  - @remirror/extension-code-block@1.0.18
  - @remirror/extension-emoji@1.0.15
  - @remirror/extension-image@1.0.22
  - @remirror/extension-list@1.2.12
  - @remirror/extension-mention-atom@1.0.16
  - @remirror/extension-placeholder@1.0.15
  - @remirror/extension-positioner@1.1.14
  - @remirror/extension-tables@1.0.15
  - @remirror/extension-text-highlight@1.0.15
  - @remirror/extension-yjs@1.0.19
  - @remirror/preset-core@1.0.17
  - @remirror/preset-formatting@1.0.18
  - @remirror/preset-wysiwyg@1.1.33

## 1.0.57

> 2022-01-06

### Patch Changes

- Fix a bug that causes the cursor to jump to the end of the first node when pressing backspace at the beginning of a list and this list is the second child of the document.

- Updated dependencies []:
  - @remirror/extension-list@1.2.11
  - @remirror/preset-wysiwyg@1.1.32

## 1.0.56

> 2022-01-05

### Patch Changes

- Update yjs packages to latest version.

* Avoid leaking Yjs UndoManager instances

* Updated dependencies []:
  - @remirror/extension-yjs@1.0.18

## 1.0.55

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/core-constants@1.0.2
  - @remirror/core-helpers@1.0.5
  - @remirror/core-types@1.0.4
  - @remirror/core-utils@1.1.4
  - @remirror/dom@1.0.16
  - @remirror/extension-annotation@1.1.9
  - @remirror/extension-bidi@1.0.13
  - @remirror/extension-blockquote@1.0.14
  - @remirror/extension-bold@1.0.13
  - @remirror/extension-callout@1.0.14
  - @remirror/extension-code@1.0.14
  - @remirror/extension-code-block@1.0.17
  - @remirror/extension-codemirror5@1.0.13
  - @remirror/extension-collaboration@1.0.13
  - @remirror/extension-columns@1.0.13
  - @remirror/extension-diff@1.0.13
  - @remirror/extension-doc@1.0.14
  - @remirror/extension-drop-cursor@1.0.13
  - @remirror/extension-embed@1.1.17
  - @remirror/extension-emoji@1.0.14
  - @remirror/extension-epic-mode@1.0.13
  - @remirror/extension-events@1.0.14
  - @remirror/extension-font-family@1.0.13
  - @remirror/extension-font-size@1.0.14
  - @remirror/pm@1.0.10
  - @remirror/extension-image@1.0.21
  - @remirror/preset-wysiwyg@1.1.31
  - @remirror/extension-gap-cursor@1.0.13
  - @remirror/extension-hard-break@1.0.13
  - @remirror/extension-heading@1.0.13
  - @remirror/extension-history@1.0.13
  - @remirror/extension-horizontal-rule@1.0.13
  - @remirror/extension-italic@1.0.13
  - @remirror/extension-link@1.1.12
  - @remirror/extension-list@1.2.10
  - @remirror/extension-markdown@1.0.13
  - @remirror/extension-mention@1.0.14
  - @remirror/extension-mention-atom@1.0.15
  - @remirror/extension-node-formatting@1.0.16
  - @remirror/extension-paragraph@1.0.13
  - @remirror/extension-placeholder@1.0.14
  - @remirror/extension-positioner@1.1.13
  - @remirror/extension-search@1.0.13
  - @remirror/extension-shortcuts@1.1.2
  - @remirror/extension-strike@1.0.13
  - @remirror/extension-sub@1.0.13
  - @remirror/extension-sup@1.0.13
  - @remirror/extension-tables@1.0.14
  - @remirror/extension-text@1.0.13
  - @remirror/extension-text-case@1.0.13
  - @remirror/extension-text-color@1.0.14
  - @remirror/extension-text-highlight@1.0.14
  - @remirror/extension-trailing-node@1.0.13
  - @remirror/extension-underline@1.0.13
  - @remirror/extension-whitespace@1.0.13
  - @remirror/extension-yjs@1.0.17
  - @remirror/preset-core@1.0.16
  - @remirror/preset-formatting@1.0.17
  - @remirror/icons@1.0.7
  - @remirror/theme@1.1.5

## 1.0.54

> 2021-12-30

### Patch Changes

- Correct a document error about `CodeBlockExtension`'s option `toggleName`. Its default value should be `'paragraph'` instead of `undefined`.

* Fix a potential issue that might cause invalid text selection when pressing `Backspace` instead a code block node.

* Updated dependencies []:
  - @remirror/extension-code-block@1.0.16
  - @remirror/preset-wysiwyg@1.1.30

## 1.0.53

> 2021-12-17

### Patch Changes

- Fix types of copy and paste event handlers

- Updated dependencies []:
  - @remirror/extension-events@1.0.13
  - @remirror/dom@1.0.15
  - @remirror/extension-annotation@1.1.8
  - @remirror/extension-link@1.1.11
  - @remirror/extension-list@1.2.9
  - @remirror/extension-mention@1.0.13
  - @remirror/extension-mention-atom@1.0.14
  - @remirror/extension-positioner@1.1.12
  - @remirror/extension-yjs@1.0.16
  - @remirror/preset-core@1.0.15
  - @remirror/preset-wysiwyg@1.1.29

## 1.0.52

> 2021-12-15

### Patch Changes

- fix: prevent text loss when drag and dropping text containing links

- Updated dependencies []:
  - @remirror/extension-link@1.1.10
  - @remirror/preset-wysiwyg@1.1.28

## 1.0.51

> 2021-12-10

### Patch Changes

- Align left/right arrow style with other arrows

- Updated dependencies []:
  - @remirror/extension-shortcuts@1.1.1
  - @remirror/preset-wysiwyg@1.1.27

## 1.0.50

> 2021-12-10

### Patch Changes

- feat: support shortcut for left/right arrows

- Updated dependencies []:
  - @remirror/extension-shortcuts@1.1.0
  - @remirror/preset-wysiwyg@1.1.26

## 1.0.49

> 2021-12-09

### Patch Changes

- Fix an issue that causes the content below a list item is being deleted when deleting this list item by pressing Enter.

- Updated dependencies []:
  - @remirror/extension-list@1.2.8
  - @remirror/preset-wysiwyg@1.1.25

## 1.0.48

> 2021-11-23

### Patch Changes

- Restore image dimensions correctly from the markup.

- Updated dependencies []:
  - @remirror/extension-image@1.0.20
  - @remirror/preset-wysiwyg@1.1.24

## 1.0.47

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/extension-code-block@1.0.15
  - @remirror/icons@1.0.6
  - @remirror/pm@1.0.8
  - @remirror/preset-wysiwyg@1.1.23
  - @remirror/core@1.3.2
  - @remirror/dom@1.0.14
  - @remirror/extension-annotation@1.1.7
  - @remirror/extension-bidi@1.0.12
  - @remirror/extension-blockquote@1.0.13
  - @remirror/extension-bold@1.0.12
  - @remirror/extension-callout@1.0.13
  - @remirror/extension-code@1.0.13
  - @remirror/extension-codemirror5@1.0.12
  - @remirror/extension-collaboration@1.0.12
  - @remirror/extension-columns@1.0.12
  - @remirror/extension-diff@1.0.12
  - @remirror/extension-doc@1.0.13
  - @remirror/extension-drop-cursor@1.0.12
  - @remirror/extension-embed@1.1.16
  - @remirror/extension-emoji@1.0.13
  - @remirror/extension-epic-mode@1.0.12
  - @remirror/extension-events@1.0.12
  - @remirror/extension-font-family@1.0.12
  - @remirror/extension-font-size@1.0.13
  - @remirror/extension-gap-cursor@1.0.12
  - @remirror/extension-hard-break@1.0.12
  - @remirror/extension-heading@1.0.12
  - @remirror/extension-history@1.0.12
  - @remirror/extension-horizontal-rule@1.0.12
  - @remirror/extension-image@1.0.19
  - @remirror/extension-italic@1.0.12
  - @remirror/extension-link@1.1.9
  - @remirror/extension-list@1.2.7
  - @remirror/extension-markdown@1.0.12
  - @remirror/extension-mention@1.0.12
  - @remirror/extension-mention-atom@1.0.13
  - @remirror/extension-node-formatting@1.0.15
  - @remirror/extension-paragraph@1.0.12
  - @remirror/extension-placeholder@1.0.13
  - @remirror/extension-positioner@1.1.11
  - @remirror/extension-search@1.0.12
  - @remirror/extension-shortcuts@1.0.6
  - @remirror/extension-strike@1.0.12
  - @remirror/extension-sub@1.0.12
  - @remirror/extension-sup@1.0.12
  - @remirror/extension-tables@1.0.13
  - @remirror/extension-text@1.0.12
  - @remirror/extension-text-case@1.0.12
  - @remirror/extension-text-color@1.0.13
  - @remirror/extension-text-highlight@1.0.13
  - @remirror/extension-trailing-node@1.0.12
  - @remirror/extension-underline@1.0.12
  - @remirror/extension-whitespace@1.0.12
  - @remirror/extension-yjs@1.0.15
  - @remirror/preset-core@1.0.14
  - @remirror/preset-formatting@1.0.16

## 1.0.46

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/dom@1.0.13
  - @remirror/extension-annotation@1.1.6
  - @remirror/extension-bidi@1.0.11
  - @remirror/extension-blockquote@1.0.12
  - @remirror/extension-bold@1.0.11
  - @remirror/extension-callout@1.0.12
  - @remirror/extension-code@1.0.12
  - @remirror/extension-code-block@1.0.14
  - @remirror/extension-codemirror5@1.0.11
  - @remirror/extension-collaboration@1.0.11
  - @remirror/extension-columns@1.0.11
  - @remirror/extension-diff@1.0.11
  - @remirror/extension-doc@1.0.12
  - @remirror/extension-drop-cursor@1.0.11
  - @remirror/extension-embed@1.1.15
  - @remirror/extension-emoji@1.0.12
  - @remirror/extension-epic-mode@1.0.11
  - @remirror/extension-events@1.0.11
  - @remirror/extension-font-family@1.0.11
  - @remirror/extension-font-size@1.0.12
  - @remirror/extension-gap-cursor@1.0.11
  - @remirror/extension-hard-break@1.0.11
  - @remirror/extension-heading@1.0.11
  - @remirror/extension-history@1.0.11
  - @remirror/extension-horizontal-rule@1.0.11
  - @remirror/extension-image@1.0.18
  - @remirror/extension-italic@1.0.11
  - @remirror/extension-link@1.1.8
  - @remirror/extension-list@1.2.6
  - @remirror/extension-markdown@1.0.11
  - @remirror/extension-mention@1.0.11
  - @remirror/extension-mention-atom@1.0.12
  - @remirror/extension-node-formatting@1.0.14
  - @remirror/extension-paragraph@1.0.11
  - @remirror/extension-placeholder@1.0.12
  - @remirror/extension-positioner@1.1.10
  - @remirror/extension-search@1.0.11
  - @remirror/extension-shortcuts@1.0.5
  - @remirror/extension-strike@1.0.11
  - @remirror/extension-sub@1.0.11
  - @remirror/extension-sup@1.0.11
  - @remirror/extension-tables@1.0.12
  - @remirror/extension-text@1.0.11
  - @remirror/extension-text-case@1.0.11
  - @remirror/extension-text-color@1.0.12
  - @remirror/extension-text-highlight@1.0.12
  - @remirror/extension-trailing-node@1.0.11
  - @remirror/extension-underline@1.0.11
  - @remirror/extension-whitespace@1.0.11
  - @remirror/extension-yjs@1.0.14
  - @remirror/preset-core@1.0.13
  - @remirror/preset-formatting@1.0.15
  - @remirror/preset-wysiwyg@1.1.22
  - @remirror/pm@1.0.7

## 1.0.45

> 2021-11-18

### Patch Changes

- fix: remove rules depending on capture groups

- Updated dependencies []:
  - @remirror/extension-shortcuts@1.0.4
  - @remirror/preset-wysiwyg@1.1.21

## 1.0.44

> 2021-11-17

### Patch Changes

- fix: removeFontSize should respect user text selection

- Updated dependencies []:
  - @remirror/extension-font-size@1.0.11
  - @remirror/preset-formatting@1.0.14

## 1.0.43

> 2021-11-16

### Patch Changes

- Make extension-shortcuts package public

- Updated dependencies []:
  - @remirror/extension-shortcuts@1.0.3
  - @remirror/preset-wysiwyg@1.1.20

## 1.0.42

> 2021-11-16

### Patch Changes

- Add support for keyboard shortcuts

* Add keyboard shortcuts

* Updated dependencies []:
  - @remirror/extension-shortcuts@1.0.2
  - @remirror/preset-wysiwyg@1.1.19

## 1.0.41

> 2021-11-16

### Patch Changes

- Fix an error when indenting the list.

- Updated dependencies []:
  - @remirror/extension-list@1.2.5
  - @remirror/preset-wysiwyg@1.1.18

## 1.0.40

> 2021-11-11

### Patch Changes

- Add a new option `extractHref` to `ExtensionLink`. Users can use this option to customize the `href` attribute, for example `file://` and `tel:`.

- Updated dependencies []:
  - @remirror/extension-link@1.1.7
  - @remirror/preset-wysiwyg@1.1.17

## 1.0.39

> 2021-11-10

### Patch Changes

- Add new method `hasHandlers` to extensions.

- Updated dependencies []:
  - @remirror/core@1.3.0
  - @remirror/dom@1.0.12
  - @remirror/extension-annotation@1.1.5
  - @remirror/extension-bidi@1.0.10
  - @remirror/extension-blockquote@1.0.11
  - @remirror/extension-bold@1.0.10
  - @remirror/extension-callout@1.0.11
  - @remirror/extension-code@1.0.11
  - @remirror/extension-code-block@1.0.13
  - @remirror/extension-codemirror5@1.0.10
  - @remirror/extension-collaboration@1.0.10
  - @remirror/extension-columns@1.0.10
  - @remirror/extension-diff@1.0.10
  - @remirror/extension-doc@1.0.11
  - @remirror/extension-drop-cursor@1.0.10
  - @remirror/extension-embed@1.1.14
  - @remirror/extension-emoji@1.0.11
  - @remirror/extension-epic-mode@1.0.10
  - @remirror/extension-events@1.0.10
  - @remirror/extension-font-family@1.0.10
  - @remirror/extension-font-size@1.0.10
  - @remirror/extension-gap-cursor@1.0.10
  - @remirror/extension-hard-break@1.0.10
  - @remirror/extension-heading@1.0.10
  - @remirror/extension-history@1.0.10
  - @remirror/extension-horizontal-rule@1.0.10
  - @remirror/extension-image@1.0.17
  - @remirror/extension-italic@1.0.10
  - @remirror/extension-link@1.1.6
  - @remirror/extension-list@1.2.4
  - @remirror/extension-markdown@1.0.10
  - @remirror/extension-mention@1.0.10
  - @remirror/extension-mention-atom@1.0.11
  - @remirror/extension-node-formatting@1.0.13
  - @remirror/extension-paragraph@1.0.10
  - @remirror/extension-placeholder@1.0.11
  - @remirror/extension-positioner@1.1.9
  - @remirror/extension-search@1.0.10
  - @remirror/extension-strike@1.0.10
  - @remirror/extension-sub@1.0.10
  - @remirror/extension-sup@1.0.10
  - @remirror/extension-tables@1.0.11
  - @remirror/extension-text@1.0.10
  - @remirror/extension-text-case@1.0.10
  - @remirror/extension-text-color@1.0.11
  - @remirror/extension-text-highlight@1.0.11
  - @remirror/extension-trailing-node@1.0.10
  - @remirror/extension-underline@1.0.10
  - @remirror/extension-whitespace@1.0.10
  - @remirror/extension-yjs@1.0.13
  - @remirror/preset-core@1.0.12
  - @remirror/preset-formatting@1.0.13
  - @remirror/preset-wysiwyg@1.1.16

## 1.0.38

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4
  - @remirror/core@1.2.2
  - @remirror/core-utils@1.1.3
  - @remirror/dom@1.0.11
  - @remirror/extension-annotation@1.1.4
  - @remirror/extension-bidi@1.0.9
  - @remirror/extension-blockquote@1.0.10
  - @remirror/extension-bold@1.0.9
  - @remirror/extension-callout@1.0.10
  - @remirror/extension-code@1.0.10
  - @remirror/extension-code-block@1.0.12
  - @remirror/extension-codemirror5@1.0.9
  - @remirror/extension-collaboration@1.0.9
  - @remirror/extension-columns@1.0.9
  - @remirror/extension-diff@1.0.9
  - @remirror/extension-doc@1.0.10
  - @remirror/extension-drop-cursor@1.0.9
  - @remirror/extension-embed@1.1.13
  - @remirror/extension-emoji@1.0.10
  - @remirror/extension-epic-mode@1.0.9
  - @remirror/extension-events@1.0.9
  - @remirror/extension-font-family@1.0.9
  - @remirror/extension-font-size@1.0.9
  - @remirror/extension-gap-cursor@1.0.9
  - @remirror/extension-hard-break@1.0.9
  - @remirror/extension-heading@1.0.9
  - @remirror/extension-history@1.0.9
  - @remirror/extension-horizontal-rule@1.0.9
  - @remirror/extension-image@1.0.16
  - @remirror/extension-italic@1.0.9
  - @remirror/extension-link@1.1.5
  - @remirror/extension-list@1.2.3
  - @remirror/extension-markdown@1.0.9
  - @remirror/extension-mention@1.0.9
  - @remirror/extension-mention-atom@1.0.10
  - @remirror/extension-node-formatting@1.0.12
  - @remirror/extension-paragraph@1.0.9
  - @remirror/extension-placeholder@1.0.10
  - @remirror/extension-positioner@1.1.8
  - @remirror/extension-search@1.0.9
  - @remirror/extension-strike@1.0.9
  - @remirror/extension-sub@1.0.9
  - @remirror/extension-sup@1.0.9
  - @remirror/extension-tables@1.0.10
  - @remirror/extension-text@1.0.9
  - @remirror/extension-text-case@1.0.9
  - @remirror/extension-text-color@1.0.10
  - @remirror/extension-text-highlight@1.0.10
  - @remirror/extension-trailing-node@1.0.9
  - @remirror/extension-underline@1.0.9
  - @remirror/extension-whitespace@1.0.9
  - @remirror/extension-yjs@1.0.12
  - @remirror/icons@1.0.5
  - @remirror/pm@1.0.6
  - @remirror/preset-core@1.0.11
  - @remirror/preset-formatting@1.0.12
  - @remirror/preset-wysiwyg@1.1.15

## 1.0.37

> 2021-11-04

### Patch Changes

- Fix an issue where the resizable view is too tall on a small viewpoint.

- Updated dependencies []:
  - @remirror/extension-embed@1.1.12
  - @remirror/extension-image@1.0.15
  - @remirror/preset-wysiwyg@1.1.14

## 1.0.36

> 2021-10-24

### Patch Changes

- Fix a bug that causes initial size CSS in resizable view not be set.

- Updated dependencies []:
  - @remirror/extension-embed@1.1.11
  - @remirror/extension-image@1.0.14
  - @remirror/preset-wysiwyg@1.1.13

## 1.0.35

> 2021-10-24

### Patch Changes

- Make sure that the `width` and `height` attribute of `<img>` and `<iframe>` HTML elements is an integer without a unit.

* Update the type of `ImageExtensionAttributes.height` and `ImageExtensionAttributes.width` to `string | number`.

* Updated dependencies []:
  - @remirror/extension-embed@1.1.10
  - @remirror/extension-image@1.0.13
  - @remirror/preset-wysiwyg@1.1.12

## 1.0.34

> 2021-10-23

### Patch Changes

- Fixed an issue that causes resizable image's height can't be updated during resizing.

* Update dependency `marked` to v3.

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/extension-embed@1.1.9
  - @remirror/extension-image@1.0.12
  - @remirror/preset-wysiwyg@1.1.11
  - @remirror/extension-markdown@1.0.8
  - @remirror/core@1.2.1
  - @remirror/core-helpers@1.0.3
  - @remirror/core-types@1.0.3
  - @remirror/dom@1.0.10
  - @remirror/extension-annotation@1.1.3
  - @remirror/extension-bidi@1.0.8
  - @remirror/extension-blockquote@1.0.9
  - @remirror/extension-bold@1.0.8
  - @remirror/extension-callout@1.0.9
  - @remirror/extension-code@1.0.9
  - @remirror/extension-code-block@1.0.11
  - @remirror/extension-codemirror5@1.0.8
  - @remirror/extension-collaboration@1.0.8
  - @remirror/extension-columns@1.0.8
  - @remirror/extension-diff@1.0.8
  - @remirror/extension-doc@1.0.9
  - @remirror/extension-drop-cursor@1.0.8
  - @remirror/extension-emoji@1.0.9
  - @remirror/extension-epic-mode@1.0.8
  - @remirror/extension-events@1.0.8
  - @remirror/extension-font-family@1.0.8
  - @remirror/extension-font-size@1.0.8
  - @remirror/extension-gap-cursor@1.0.8
  - @remirror/extension-hard-break@1.0.8
  - @remirror/extension-heading@1.0.8
  - @remirror/extension-history@1.0.8
  - @remirror/extension-horizontal-rule@1.0.8
  - @remirror/extension-italic@1.0.8
  - @remirror/extension-link@1.1.4
  - @remirror/extension-list@1.2.2
  - @remirror/extension-mention@1.0.8
  - @remirror/extension-mention-atom@1.0.9
  - @remirror/extension-node-formatting@1.0.11
  - @remirror/extension-paragraph@1.0.8
  - @remirror/extension-placeholder@1.0.9
  - @remirror/extension-positioner@1.1.7
  - @remirror/extension-search@1.0.8
  - @remirror/extension-strike@1.0.8
  - @remirror/extension-sub@1.0.8
  - @remirror/extension-sup@1.0.8
  - @remirror/extension-tables@1.0.9
  - @remirror/extension-text@1.0.8
  - @remirror/extension-text-case@1.0.8
  - @remirror/extension-text-color@1.0.9
  - @remirror/extension-text-highlight@1.0.9
  - @remirror/extension-trailing-node@1.0.8
  - @remirror/extension-underline@1.0.8
  - @remirror/extension-whitespace@1.0.8
  - @remirror/extension-yjs@1.0.11
  - @remirror/preset-core@1.0.10
  - @remirror/preset-formatting@1.0.11
  - @remirror/core-utils@1.1.2
  - @remirror/icons@1.0.4
  - @remirror/pm@1.0.4
  - @remirror/theme@1.1.4

## 1.0.33

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
    const { manager } = useRemirror({
      builtin: { persistentSelectionClass: 'selection' },
    });
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
  - @remirror/dom@1.0.9
  - @remirror/extension-annotation@1.1.2
  - @remirror/extension-bidi@1.0.7
  - @remirror/extension-blockquote@1.0.8
  - @remirror/extension-bold@1.0.7
  - @remirror/extension-callout@1.0.8
  - @remirror/extension-code@1.0.8
  - @remirror/extension-code-block@1.0.10
  - @remirror/extension-codemirror5@1.0.7
  - @remirror/extension-collaboration@1.0.7
  - @remirror/extension-columns@1.0.7
  - @remirror/extension-diff@1.0.7
  - @remirror/extension-doc@1.0.8
  - @remirror/extension-drop-cursor@1.0.7
  - @remirror/extension-embed@1.1.8
  - @remirror/extension-emoji@1.0.8
  - @remirror/extension-epic-mode@1.0.7
  - @remirror/extension-events@1.0.7
  - @remirror/extension-font-family@1.0.7
  - @remirror/extension-font-size@1.0.7
  - @remirror/extension-gap-cursor@1.0.7
  - @remirror/extension-hard-break@1.0.7
  - @remirror/extension-heading@1.0.7
  - @remirror/extension-history@1.0.7
  - @remirror/extension-horizontal-rule@1.0.7
  - @remirror/extension-image@1.0.11
  - @remirror/extension-italic@1.0.7
  - @remirror/extension-link@1.1.3
  - @remirror/extension-list@1.2.1
  - @remirror/extension-markdown@1.0.7
  - @remirror/extension-mention@1.0.7
  - @remirror/extension-mention-atom@1.0.8
  - @remirror/extension-node-formatting@1.0.10
  - @remirror/extension-paragraph@1.0.7
  - @remirror/extension-placeholder@1.0.8
  - @remirror/extension-positioner@1.1.6
  - @remirror/extension-search@1.0.7
  - @remirror/extension-strike@1.0.7
  - @remirror/extension-sub@1.0.7
  - @remirror/extension-sup@1.0.7
  - @remirror/extension-tables@1.0.8
  - @remirror/extension-text@1.0.7
  - @remirror/extension-text-case@1.0.7
  - @remirror/extension-text-color@1.0.8
  - @remirror/extension-text-highlight@1.0.8
  - @remirror/extension-trailing-node@1.0.7
  - @remirror/extension-underline@1.0.7
  - @remirror/extension-whitespace@1.0.7
  - @remirror/extension-yjs@1.0.10
  - @remirror/preset-core@1.0.9
  - @remirror/preset-formatting@1.0.10
  - @remirror/preset-wysiwyg@1.1.10

## 1.0.32

> 2021-10-14

### Patch Changes

- Disable spellcheck in code and codeBlock.

- Updated dependencies []:
  - @remirror/extension-code@1.0.7
  - @remirror/extension-code-block@1.0.9
  - @remirror/preset-wysiwyg@1.1.9

## 1.0.31

> 2021-10-11

### Patch Changes

- Improved the behavior of increasing indentation in a list. Now unselected sub lists won't increase indentation when the user indent the parent list item.

  Exported a new helper function `indentList`.

  Deprecated `sharedSinkListItem`.

* Improved the behavior of decreasing indentation in a list. A list item won't be able to lift out of list anymore when the user dedent it. Indenting across different types of lists is more consistent.

  Exported a new helper function `dedentList`.

  Deprecated `sharedLiftListItem`.

- Improve backspace behavior between two lists.

- Updated dependencies []:
  - @remirror/extension-list@1.2.0
  - @remirror/preset-wysiwyg@1.1.8

## 1.0.30

> 2021-10-08

### Patch Changes

- Fix a bug that causes incorrect indent when changing list type.

- Updated dependencies []:
  - @remirror/extension-list@1.1.1
  - @remirror/preset-wysiwyg@1.1.7

## 1.0.29

> 2021-10-06

### Patch Changes

- Automagically join two lists with the same node type when there are siblings.

* Allow input rules to convert task list to bullet list or ordered list.

- Merge a patch from the upstream prosemirror-schema-list: https://github.com/ProseMirror/prosemirror-schema-list/commit/38867345f6d97d6793655ed77c16f1a7b18f6846

  Make sure liftListItem doesn't crash when multiple items can't be merged.

  Fix a crash in `liftListItem` that happens when list items that can't be merged are lifted together.

- Updated dependencies []:
  - @remirror/extension-list@1.1.0
  - @remirror/preset-wysiwyg@1.1.6

## 1.0.28

> 2021-10-04

### Patch Changes

- Don't let the browser handle the Tab key in a list.

- Updated dependencies []:
  - @remirror/extension-list@1.0.15
  - @remirror/preset-wysiwyg@1.1.5

## 1.0.27

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/core@1.1.3
  - @remirror/dom@1.0.8
  - @remirror/extension-annotation@1.1.1
  - @remirror/extension-bidi@1.0.6
  - @remirror/extension-blockquote@1.0.7
  - @remirror/extension-bold@1.0.6
  - @remirror/extension-callout@1.0.7
  - @remirror/extension-code@1.0.6
  - @remirror/extension-code-block@1.0.8
  - @remirror/extension-codemirror5@1.0.6
  - @remirror/extension-collaboration@1.0.6
  - @remirror/extension-columns@1.0.6
  - @remirror/extension-diff@1.0.6
  - @remirror/extension-doc@1.0.7
  - @remirror/extension-drop-cursor@1.0.6
  - @remirror/extension-embed@1.1.7
  - @remirror/extension-emoji@1.0.7
  - @remirror/extension-epic-mode@1.0.6
  - @remirror/extension-events@1.0.6
  - @remirror/extension-font-family@1.0.6
  - @remirror/extension-font-size@1.0.6
  - @remirror/extension-gap-cursor@1.0.6
  - @remirror/extension-hard-break@1.0.6
  - @remirror/extension-heading@1.0.6
  - @remirror/extension-history@1.0.6
  - @remirror/extension-horizontal-rule@1.0.6
  - @remirror/extension-image@1.0.10
  - @remirror/extension-italic@1.0.6
  - @remirror/extension-link@1.1.2
  - @remirror/extension-list@1.0.14
  - @remirror/extension-markdown@1.0.6
  - @remirror/extension-mention@1.0.6
  - @remirror/extension-mention-atom@1.0.7
  - @remirror/extension-node-formatting@1.0.9
  - @remirror/extension-paragraph@1.0.6
  - @remirror/extension-placeholder@1.0.7
  - @remirror/extension-positioner@1.1.5
  - @remirror/extension-search@1.0.6
  - @remirror/extension-strike@1.0.6
  - @remirror/extension-sub@1.0.6
  - @remirror/extension-sup@1.0.6
  - @remirror/extension-tables@1.0.7
  - @remirror/extension-text@1.0.6
  - @remirror/extension-text-case@1.0.6
  - @remirror/extension-text-color@1.0.7
  - @remirror/extension-text-highlight@1.0.7
  - @remirror/extension-trailing-node@1.0.6
  - @remirror/extension-underline@1.0.6
  - @remirror/extension-whitespace@1.0.6
  - @remirror/extension-yjs@1.0.9
  - @remirror/preset-core@1.0.8
  - @remirror/preset-formatting@1.0.9
  - @remirror/preset-wysiwyg@1.1.4
  - @remirror/core-utils@1.1.1
  - @remirror/core-helpers@1.0.2
  - @remirror/icons@1.0.3
  - @remirror/pm@1.0.3
  - @remirror/core-constants@1.0.1
  - @remirror/core-types@1.0.2
  - @remirror/theme@1.1.3

## 1.0.26

> 2021-09-29

### Patch Changes

- Add a flag to filter out edge matches from `getAnnotationAt` helper

- Updated dependencies []:
  - @remirror/extension-annotation@1.1.0
  - @remirror/extension-yjs@1.0.8

## 1.0.25

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

* Improve the performance of large task lists and collapsible bullet lists.

* Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/dom@1.0.7
  - @remirror/extension-annotation@1.0.7
  - @remirror/extension-bidi@1.0.5
  - @remirror/extension-blockquote@1.0.6
  - @remirror/extension-bold@1.0.5
  - @remirror/extension-callout@1.0.6
  - @remirror/extension-code@1.0.5
  - @remirror/extension-code-block@1.0.7
  - @remirror/extension-codemirror5@1.0.5
  - @remirror/extension-collaboration@1.0.5
  - @remirror/extension-columns@1.0.5
  - @remirror/extension-diff@1.0.5
  - @remirror/extension-doc@1.0.6
  - @remirror/extension-drop-cursor@1.0.5
  - @remirror/extension-embed@1.1.6
  - @remirror/extension-emoji@1.0.6
  - @remirror/extension-epic-mode@1.0.5
  - @remirror/extension-events@1.0.5
  - @remirror/extension-font-family@1.0.5
  - @remirror/extension-font-size@1.0.5
  - @remirror/extension-gap-cursor@1.0.5
  - @remirror/extension-hard-break@1.0.5
  - @remirror/extension-heading@1.0.5
  - @remirror/extension-history@1.0.5
  - @remirror/extension-horizontal-rule@1.0.5
  - @remirror/extension-image@1.0.9
  - @remirror/extension-italic@1.0.5
  - @remirror/extension-link@1.1.1
  - @remirror/extension-list@1.0.13
  - @remirror/extension-markdown@1.0.5
  - @remirror/extension-mention@1.0.5
  - @remirror/extension-mention-atom@1.0.6
  - @remirror/extension-node-formatting@1.0.8
  - @remirror/extension-paragraph@1.0.5
  - @remirror/extension-placeholder@1.0.6
  - @remirror/extension-positioner@1.1.4
  - @remirror/extension-search@1.0.5
  - @remirror/extension-strike@1.0.5
  - @remirror/extension-sub@1.0.5
  - @remirror/extension-sup@1.0.5
  - @remirror/extension-tables@1.0.6
  - @remirror/extension-text@1.0.5
  - @remirror/extension-text-case@1.0.5
  - @remirror/extension-text-color@1.0.6
  - @remirror/extension-text-highlight@1.0.6
  - @remirror/extension-trailing-node@1.0.5
  - @remirror/extension-underline@1.0.5
  - @remirror/extension-whitespace@1.0.5
  - @remirror/extension-yjs@1.0.7
  - @remirror/preset-core@1.0.7
  - @remirror/preset-formatting@1.0.8
  - @remirror/preset-wysiwyg@1.1.3

## 1.0.24

> 2021-09-15

### Patch Changes

- Fix a RangeError when calling list commands.

- Updated dependencies []:
  - @remirror/extension-list@1.0.12
  - @remirror/preset-wysiwyg@1.1.2

## 1.0.23

> 2021-09-13

### Patch Changes

- feat: detect emails as links

* Add a white border to the handle to make it more recognizable.

* Updated dependencies []:
  - @remirror/extension-link@1.1.0
  - @remirror/preset-wysiwyg@1.1.1
  - @remirror/extension-embed@1.1.5
  - @remirror/extension-image@1.0.8

## 1.0.22

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

* Remove react dependency from wysiwyg-preset: An earlier commit upgraded the tables from simple to fancy tables. As a side effect, this had introduced a dependency from wysiwyg to the react-part of remirror. This change removes this dependency again.

* Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/dom@1.0.6
  - @remirror/extension-annotation@1.0.6
  - @remirror/extension-bidi@1.0.4
  - @remirror/extension-blockquote@1.0.5
  - @remirror/extension-bold@1.0.4
  - @remirror/extension-callout@1.0.5
  - @remirror/extension-code@1.0.4
  - @remirror/extension-code-block@1.0.6
  - @remirror/extension-codemirror5@1.0.4
  - @remirror/extension-collaboration@1.0.4
  - @remirror/extension-columns@1.0.4
  - @remirror/extension-diff@1.0.4
  - @remirror/extension-doc@1.0.5
  - @remirror/extension-drop-cursor@1.0.4
  - @remirror/extension-embed@1.1.4
  - @remirror/extension-emoji@1.0.5
  - @remirror/extension-epic-mode@1.0.4
  - @remirror/extension-events@1.0.4
  - @remirror/extension-font-family@1.0.4
  - @remirror/extension-font-size@1.0.4
  - @remirror/extension-gap-cursor@1.0.4
  - @remirror/extension-hard-break@1.0.4
  - @remirror/extension-heading@1.0.4
  - @remirror/extension-history@1.0.4
  - @remirror/extension-horizontal-rule@1.0.4
  - @remirror/extension-image@1.0.7
  - @remirror/extension-italic@1.0.4
  - @remirror/extension-link@1.0.4
  - @remirror/extension-list@1.0.11
  - @remirror/extension-markdown@1.0.4
  - @remirror/extension-mention@1.0.4
  - @remirror/extension-mention-atom@1.0.5
  - @remirror/extension-node-formatting@1.0.7
  - @remirror/extension-paragraph@1.0.4
  - @remirror/extension-placeholder@1.0.5
  - @remirror/extension-positioner@1.1.3
  - @remirror/extension-search@1.0.4
  - @remirror/extension-strike@1.0.4
  - @remirror/extension-sub@1.0.4
  - @remirror/extension-sup@1.0.4
  - @remirror/extension-tables@1.0.5
  - @remirror/extension-text@1.0.4
  - @remirror/extension-text-case@1.0.4
  - @remirror/extension-text-color@1.0.5
  - @remirror/extension-text-highlight@1.0.5
  - @remirror/extension-trailing-node@1.0.4
  - @remirror/extension-underline@1.0.4
  - @remirror/extension-whitespace@1.0.4
  - @remirror/extension-yjs@1.0.6
  - @remirror/preset-core@1.0.6
  - @remirror/preset-formatting@1.0.7
  - @remirror/preset-wysiwyg@1.1.0

## 1.0.21

> 2021-09-04

### Patch Changes

- Don't discard node attributes when resizing.

- Updated dependencies []:
  - @remirror/extension-embed@1.1.3
  - @remirror/extension-image@1.0.6
  - @remirror/preset-wysiwyg@1.0.13

## 1.0.20

> 2021-09-02

### Patch Changes

- Fix an out of range error when there is nothing in the dropdown menu.

- Updated dependencies []:
  - @remirror/preset-wysiwyg@1.0.12

## 1.0.19

> 2021-09-01

### Patch Changes

- Fix an issue that causes clicking a nested checkbox won't toggle its checked state.

- Updated dependencies []:
  - @remirror/extension-list@1.0.10
  - @remirror/preset-wysiwyg@1.0.11

## 1.0.18

> 2021-09-01

### Patch Changes

- fix: task list wasn't available in wysiwyg editors

* Don't create a node selection within the `toggleCheckboxChecked` command.

* Updated dependencies []:
  - @remirror/preset-wysiwyg@1.0.10
  - @remirror/extension-list@1.0.9

## 1.0.17

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/theme@1.1.2
  - @remirror/dom@1.0.5
  - @remirror/extension-annotation@1.0.5
  - @remirror/extension-blockquote@1.0.4
  - @remirror/extension-callout@1.0.4
  - @remirror/extension-code-block@1.0.5
  - @remirror/extension-emoji@1.0.4
  - @remirror/extension-image@1.0.5
  - @remirror/extension-list@1.0.8
  - @remirror/extension-mention-atom@1.0.4
  - @remirror/extension-placeholder@1.0.4
  - @remirror/extension-positioner@1.1.2
  - @remirror/extension-tables@1.0.4
  - @remirror/extension-text-color@1.0.4
  - @remirror/extension-text-highlight@1.0.4
  - @remirror/extension-yjs@1.0.5
  - @remirror/preset-core@1.0.5
  - @remirror/preset-formatting@1.0.6
  - @remirror/preset-wysiwyg@1.0.9

## 1.0.16

> 2021-08-30

### Patch Changes

- Don't require a `NodeSelection` to fire `toggleCheckboxChecked` anymore.

- Updated dependencies []:
  - @remirror/extension-list@1.0.7
  - @remirror/preset-wysiwyg@1.0.8

## 1.0.15

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Improve commands `toggleBulletList`, `toggleOrderedList` and `toggleTaskList`. Now you can toggle list between bullet list, ordered list and task list.

- Don't install `@remirror/theme` as a dependency of `@remirror/core`.

* Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

* Updated dependencies []:
  - @remirror/theme@1.1.1
  - @remirror/dom@1.0.4
  - @remirror/extension-annotation@1.0.4
  - @remirror/extension-blockquote@1.0.3
  - @remirror/extension-callout@1.0.3
  - @remirror/extension-code-block@1.0.4
  - @remirror/extension-emoji@1.0.3
  - @remirror/extension-image@1.0.4
  - @remirror/extension-list@1.0.6
  - @remirror/extension-mention-atom@1.0.3
  - @remirror/extension-placeholder@1.0.3
  - @remirror/extension-positioner@1.1.1
  - @remirror/extension-tables@1.0.3
  - @remirror/extension-text-color@1.0.3
  - @remirror/extension-text-highlight@1.0.3
  - @remirror/extension-yjs@1.0.4
  - @remirror/preset-core@1.0.4
  - @remirror/preset-formatting@1.0.5
  - @remirror/preset-wysiwyg@1.0.7
  - @remirror/core@1.1.0
  - @remirror/extension-bidi@1.0.3
  - @remirror/extension-bold@1.0.3
  - @remirror/extension-code@1.0.3
  - @remirror/extension-codemirror5@1.0.3
  - @remirror/extension-collaboration@1.0.3
  - @remirror/extension-columns@1.0.3
  - @remirror/extension-diff@1.0.3
  - @remirror/extension-doc@1.0.4
  - @remirror/extension-drop-cursor@1.0.3
  - @remirror/extension-embed@1.1.2
  - @remirror/extension-epic-mode@1.0.3
  - @remirror/extension-events@1.0.3
  - @remirror/extension-font-family@1.0.3
  - @remirror/extension-font-size@1.0.3
  - @remirror/extension-gap-cursor@1.0.3
  - @remirror/extension-hard-break@1.0.3
  - @remirror/extension-heading@1.0.3
  - @remirror/extension-history@1.0.3
  - @remirror/extension-horizontal-rule@1.0.3
  - @remirror/extension-italic@1.0.3
  - @remirror/extension-link@1.0.3
  - @remirror/extension-markdown@1.0.3
  - @remirror/extension-mention@1.0.3
  - @remirror/extension-node-formatting@1.0.6
  - @remirror/extension-paragraph@1.0.3
  - @remirror/extension-search@1.0.3
  - @remirror/extension-strike@1.0.3
  - @remirror/extension-sub@1.0.3
  - @remirror/extension-sup@1.0.3
  - @remirror/extension-text@1.0.3
  - @remirror/extension-text-case@1.0.3
  - @remirror/extension-trailing-node@1.0.3
  - @remirror/extension-underline@1.0.3
  - @remirror/extension-whitespace@1.0.3

## 1.0.14

> 2021-08-26

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - @remirror/extension-positioner@1.1.0
  - @remirror/dom@1.0.3
  - @remirror/extension-annotation@1.0.3
  - @remirror/extension-yjs@1.0.3
  - @remirror/preset-core@1.0.3
  - @remirror/preset-wysiwyg@1.0.6

## 1.0.13

> 2021-08-25

### Patch Changes

- Fixes a bug that causes the editor to insert an empty task list when deleting all content in the editor. Closes #1163.

- Updated dependencies []:
  - @remirror/extension-list@1.0.5
  - @remirror/preset-wysiwyg@1.0.5

## 1.0.12

> 2021-08-22

### Patch Changes

- Exports `remirror/styles`.

## 1.0.11

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

* Exports `remirror/styles`.

* Updated dependencies []:
  - @remirror/core@1.0.3
  - @remirror/dom@1.0.2
  - @remirror/extension-annotation@1.0.2
  - @remirror/extension-bidi@1.0.2
  - @remirror/extension-blockquote@1.0.2
  - @remirror/extension-bold@1.0.2
  - @remirror/extension-callout@1.0.2
  - @remirror/extension-code@1.0.2
  - @remirror/extension-code-block@1.0.3
  - @remirror/extension-codemirror5@1.0.2
  - @remirror/extension-collaboration@1.0.2
  - @remirror/extension-columns@1.0.2
  - @remirror/extension-diff@1.0.2
  - @remirror/extension-doc@1.0.3
  - @remirror/extension-drop-cursor@1.0.2
  - @remirror/extension-embed@1.1.1
  - @remirror/extension-emoji@1.0.2
  - @remirror/extension-epic-mode@1.0.2
  - @remirror/extension-events@1.0.2
  - @remirror/extension-font-family@1.0.2
  - @remirror/extension-font-size@1.0.2
  - @remirror/extension-gap-cursor@1.0.2
  - @remirror/extension-hard-break@1.0.2
  - @remirror/extension-heading@1.0.2
  - @remirror/extension-history@1.0.2
  - @remirror/extension-horizontal-rule@1.0.2
  - @remirror/extension-image@1.0.3
  - @remirror/extension-italic@1.0.2
  - @remirror/extension-link@1.0.2
  - @remirror/extension-list@1.0.4
  - @remirror/extension-markdown@1.0.2
  - @remirror/extension-mention@1.0.2
  - @remirror/extension-mention-atom@1.0.2
  - @remirror/extension-node-formatting@1.0.5
  - @remirror/extension-paragraph@1.0.2
  - @remirror/extension-placeholder@1.0.2
  - @remirror/extension-positioner@1.0.2
  - @remirror/extension-search@1.0.2
  - @remirror/extension-strike@1.0.2
  - @remirror/extension-sub@1.0.2
  - @remirror/extension-sup@1.0.2
  - @remirror/extension-tables@1.0.2
  - @remirror/extension-text@1.0.2
  - @remirror/extension-text-case@1.0.2
  - @remirror/extension-text-color@1.0.2
  - @remirror/extension-text-highlight@1.0.2
  - @remirror/extension-trailing-node@1.0.2
  - @remirror/extension-underline@1.0.2
  - @remirror/extension-whitespace@1.0.2
  - @remirror/extension-yjs@1.0.2
  - @remirror/preset-core@1.0.2
  - @remirror/preset-formatting@1.0.4
  - @remirror/preset-wysiwyg@1.0.4

## 1.0.10

> 2021-08-20

### Patch Changes

- Fix eager parsing of style attribute, and limit valid `line-height` values in `NodeFormattingExtension`

- Updated dependencies []:
  - @remirror/extension-node-formatting@1.0.4
  - @remirror/preset-formatting@1.0.3

## 1.0.9

> 2021-08-18

### Patch Changes

- Remove the playground API from `remirror`.

- Updated dependencies []:
  - @remirror/pm@1.0.2

## 1.0.8

> 2021-08-18

### Patch Changes

- Publish a version of `@remirror/extension-node-formatting` without code modification.

- Updated dependencies []:
  - @remirror/extension-node-formatting@1.0.3
  - @remirror/preset-formatting@1.0.2

## 1.0.7

> 2021-08-18

### Patch Changes

- [#1069](https://github.com/remirror/remirror/pull/1069) [`937c3332d`](https://github.com/remirror/remirror/commit/937c3332d11ff28f5c218e3ed77a85b4a817b067) Thanks [@whawker](https://github.com/whawker)! - Add ability for doc node's `docAttributes` to have default attribute values

- Updated dependencies [[`937c3332d`](https://github.com/remirror/remirror/commit/937c3332d11ff28f5c218e3ed77a85b4a817b067)]:
  - @remirror/extension-doc@1.0.2

## 1.0.6

> 2021-08-13

### Patch Changes

- [#1057](https://github.com/remirror/remirror/pull/1057) [`662edfdaa`](https://github.com/remirror/remirror/commit/662edfdaa6ab7954edd4946b6f06da6d36288042) Thanks [@ocavue](https://github.com/ocavue)! - Update dependency `@remirror/extension-code-block`.

- Updated dependencies [[`662edfdaa`](https://github.com/remirror/remirror/commit/662edfdaa6ab7954edd4946b6f06da6d36288042), [`b288d665f`](https://github.com/remirror/remirror/commit/b288d665fe1f3b8f0a9a635ca3f29e49e22ac4b3)]:
  - @remirror/preset-wysiwyg@1.0.3
  - @remirror/extension-code-block@1.0.2

## 1.0.5

> 2021-08-08

### Patch Changes

- [#1046](https://github.com/remirror/remirror/pull/1046) [`1d83e4fde`](https://github.com/remirror/remirror/commit/1d83e4fde5a92b68b68d4b1a8e2260b4a985b3cd) Thanks [@ocavue](https://github.com/ocavue)! - Update dependency `@remirror/extension-list`.

- Updated dependencies [[`79a5cb55b`](https://github.com/remirror/remirror/commit/79a5cb55b2e9c3db10b137d1e2235df724291d52)]:
  - @remirror/extension-list@1.0.3

## 1.0.4

> 2021-08-04

### Patch Changes

- [#1033](https://github.com/remirror/remirror/pull/1033) [`ec998d82b`](https://github.com/remirror/remirror/commit/ec998d82b5f2926b4d1eb36eb62d0557aab8fe4b) Thanks [@devmrin](https://github.com/devmrin)! - Fix i18n bold command label.

## 1.0.3

> 2021-07-26

### Patch Changes

- [#1029](https://github.com/remirror/remirror/pull/1029) [`ecad7e4be`](https://github.com/remirror/remirror/commit/ecad7e4beed04778de8060b06c93c8e893d73ed2) Thanks [@ocavue](https://github.com/ocavue)! - Update remirror dependencies.

- Updated dependencies [[`ecad7e4be`](https://github.com/remirror/remirror/commit/ecad7e4beed04778de8060b06c93c8e893d73ed2)]:
  - @remirror/core@1.0.2
  - @remirror/preset-wysiwyg@1.0.2

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies.

- Updated dependencies [[`22115ea9e`](https://github.com/remirror/remirror/commit/22115ea9ed1977d20b7019d065d6a31d39b359eb), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b)]:
  - @remirror/icons@1.0.2
  - @remirror/core-utils@1.0.2

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1
  - @remirror/core-helpers@1.0.1
  - @remirror/core-types@1.0.1
  - @remirror/core-utils@1.0.1
  - @remirror/dom@1.0.1
  - @remirror/extension-annotation@1.0.1
  - @remirror/extension-bidi@1.0.1
  - @remirror/extension-blockquote@1.0.1
  - @remirror/extension-bold@1.0.1
  - @remirror/extension-callout@1.0.1
  - @remirror/extension-code@1.0.1
  - @remirror/extension-code-block@1.0.1
  - @remirror/extension-codemirror5@1.0.1
  - @remirror/extension-collaboration@1.0.1
  - @remirror/extension-columns@1.0.1
  - @remirror/extension-diff@1.0.1
  - @remirror/extension-doc@1.0.1
  - @remirror/extension-drop-cursor@1.0.1
  - @remirror/extension-embed@1.0.1
  - @remirror/extension-emoji@1.0.1
  - @remirror/extension-epic-mode@1.0.1
  - @remirror/extension-events@1.0.1
  - @remirror/extension-font-family@1.0.1
  - @remirror/extension-font-size@1.0.1
  - @remirror/extension-gap-cursor@1.0.1
  - @remirror/extension-hard-break@1.0.1
  - @remirror/extension-heading@1.0.1
  - @remirror/extension-history@1.0.1
  - @remirror/extension-horizontal-rule@1.0.1
  - @remirror/extension-image@1.0.1
  - @remirror/extension-italic@1.0.1
  - @remirror/extension-link@1.0.1
  - @remirror/extension-list@1.0.1
  - @remirror/extension-markdown@1.0.1
  - @remirror/extension-mention@1.0.1
  - @remirror/extension-mention-atom@1.0.1
  - @remirror/extension-node-formatting@1.0.1
  - @remirror/extension-paragraph@1.0.1
  - @remirror/extension-placeholder@1.0.1
  - @remirror/extension-positioner@1.0.1
  - @remirror/extension-search@1.0.1
  - @remirror/extension-strike@1.0.1
  - @remirror/extension-sub@1.0.1
  - @remirror/extension-sup@1.0.1
  - @remirror/extension-tables@1.0.1
  - @remirror/extension-text@1.0.1
  - @remirror/extension-text-case@1.0.1
  - @remirror/extension-text-color@1.0.1
  - @remirror/extension-text-highlight@1.0.1
  - @remirror/extension-trailing-node@1.0.1
  - @remirror/extension-underline@1.0.1
  - @remirror/extension-whitespace@1.0.1
  - @remirror/extension-yjs@1.0.1
  - @remirror/icons@1.0.1
  - @remirror/pm@1.0.1
  - @remirror/preset-core@1.0.1
  - @remirror/preset-formatting@1.0.1
  - @remirror/preset-wysiwyg@1.0.1
  - @remirror/theme@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Minor Changes

- [#837](https://github.com/remirror/remirror/pull/837) [`f6fc2729d`](https://github.com/remirror/remirror/commit/f6fc2729d3a39c76f52dbf1c73d4f2ce1f7f361b) Thanks [@cmanou](https://github.com/cmanou)! - Add @remirror/extension-sub extension

* [#706](https://github.com/remirror/remirror/pull/706) [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make peer dependencies of `CodeBlockExtension`, `YjsExtension` and `CollaborationExtension` dependencies of `remirror`. This is so that `remirror/extensions` can be imported safely.

- [#839](https://github.com/remirror/remirror/pull/839) [`db49e4678`](https://github.com/remirror/remirror/commit/db49e467811c3c95f48c29f7bd267dac4c3ff85f) Thanks [@cmanou](https://github.com/cmanou)! - Add @remirror/extension-sup extension

### Patch Changes

- [#865](https://github.com/remirror/remirror/pull/865) [`561ae7792`](https://github.com/remirror/remirror/commit/561ae7792e9a6632f220429c8b9add3061f964dc) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add missing `y-protocols` dependency for `remirror` package.

* [#954](https://github.com/remirror/remirror/pull/954) [`4966eedae`](https://github.com/remirror/remirror/commit/4966eedaeb37cdb8c40b7b1dcce5eabf27dc1fd1) Thanks [@zofiag](https://github.com/zofiag)! - Fix decreasing node indent with keyboard shortcut `Shift-Tab`.

* Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`979c4cb6b`](https://github.com/remirror/remirror/commit/979c4cb6bd1fa301a1716915514b27542f972c9f), [`d9bc9180b`](https://github.com/remirror/remirror/commit/d9bc9180ba85e0edd4ae11b7e53ee5aa73acb9e5), [`f6fc2729d`](https://github.com/remirror/remirror/commit/f6fc2729d3a39c76f52dbf1c73d4f2ce1f7f361b), [`e0f1bec4a`](https://github.com/remirror/remirror/commit/e0f1bec4a1e8073ce8f5500d62193e52321155b9), [`4a00b301d`](https://github.com/remirror/remirror/commit/4a00b301d87f711575cdd30c232dfa086ddc38eb), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`2214e6054`](https://github.com/remirror/remirror/commit/2214e6054c345a265bfdba6f2004c3047d69901e), [`5c981d96d`](https://github.com/remirror/remirror/commit/5c981d96d9344f2507f32a4213bd55c17bfcd92f), [`9fe4191e1`](https://github.com/remirror/remirror/commit/9fe4191e171d5e693c0f72cd7dd44a0dcab89297), [`6bba1782e`](https://github.com/remirror/remirror/commit/6bba1782e838fbe94e0d0aee0824a45371644c88), [`123a20ae8`](https://github.com/remirror/remirror/commit/123a20ae8067d97d46373d079728f942e1daed0c), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`221316411`](https://github.com/remirror/remirror/commit/2213164114480feaa22638bd6dae1a8acafacb8f), [`6de1e675c`](https://github.com/remirror/remirror/commit/6de1e675c9f502197a31a1e0e21ba0bd91919fe2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`862a0c8ec`](https://github.com/remirror/remirror/commit/862a0c8ec4e90c2108abe8c2f50cdcb562ffa713), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`9cb393ec5`](https://github.com/remirror/remirror/commit/9cb393ec58a8070dc43b7f2805c0920a04578f20), [`281ba2172`](https://github.com/remirror/remirror/commit/281ba2172713e40448c6208cc728ff60af2b2761), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`675243004`](https://github.com/remirror/remirror/commit/675243004231db49df37404576c393ab7305ede9), [`8b9522257`](https://github.com/remirror/remirror/commit/8b95222571ed2925be43d6eabe7340bbf9a2cd62), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`d896c3196`](https://github.com/remirror/remirror/commit/d896c3196d0a2ec372e9515ea5d9362205a352a7), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b884f04ae`](https://github.com/remirror/remirror/commit/b884f04ae45090fc95155b4cdae5f98d0377cc19), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`e7a1d7c1d`](https://github.com/remirror/remirror/commit/e7a1d7c1db1b42ce5cffc4a821669b734c73eae2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`4966eedae`](https://github.com/remirror/remirror/commit/4966eedaeb37cdb8c40b7b1dcce5eabf27dc1fd1), [`38a409923`](https://github.com/remirror/remirror/commit/38a40992377fac42ad5b30613a48ab56e69961b2), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`4d3b81c6e`](https://github.com/remirror/remirror/commit/4d3b81c6e1b691f22061f7c152421b807965fc0d), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`ac37ea7f4`](https://github.com/remirror/remirror/commit/ac37ea7f4f332d1129b7aeb0a80e19fae6bd2b1c), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`f9780e645`](https://github.com/remirror/remirror/commit/f9780e645f4b6ddd80d07d11ed70741a54e7af31), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`28b81a858`](https://github.com/remirror/remirror/commit/28b81a8580670c4ebc06ad04db088a4b684237bf), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`db49e4678`](https://github.com/remirror/remirror/commit/db49e467811c3c95f48c29f7bd267dac4c3ff85f), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`561ae7792`](https://github.com/remirror/remirror/commit/561ae7792e9a6632f220429c8b9add3061f964dc), [`b6f29f0e3`](https://github.com/remirror/remirror/commit/b6f29f0e3dfa2806023d13e68f34ee57ba5c1ae9), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`62a494c14`](https://github.com/remirror/remirror/commit/62a494c143157d2fe0483c010845a4c377e8524c), [`f52405b4b`](https://github.com/remirror/remirror/commit/f52405b4b27c579cec8c59b6657e6fb66bcf0e7d)]:
  - @remirror/core@1.0.0
  - @remirror/extension-link@1.0.0
  - @remirror/extension-mention-atom@1.0.0
  - @remirror/extension-sub@1.0.0
  - @remirror/extension-image@1.0.0
  - @remirror/extension-tables@1.0.0
  - @remirror/extension-events@1.0.0
  - @remirror/extension-markdown@1.0.0
  - @remirror/extension-callout@1.0.0
  - @remirror/extension-yjs@1.0.0
  - @remirror/extension-annotation@1.0.0
  - @remirror/extension-list@1.0.0
  - @remirror/extension-positioner@1.0.0
  - @remirror/core-constants@1.0.0
  - @remirror/core-helpers@1.0.0
  - @remirror/core-types@1.0.0
  - @remirror/core-utils@1.0.0
  - @remirror/dom@1.0.0
  - @remirror/extension-bidi@1.0.0
  - @remirror/extension-blockquote@1.0.0
  - @remirror/extension-bold@1.0.0
  - @remirror/extension-code@1.0.0
  - @remirror/extension-code-block@1.0.0
  - @remirror/extension-codemirror5@1.0.0
  - @remirror/extension-collaboration@1.0.0
  - @remirror/extension-columns@1.0.0
  - @remirror/extension-diff@1.0.0
  - @remirror/extension-doc@1.0.0
  - @remirror/extension-drop-cursor@1.0.0
  - @remirror/extension-embed@1.0.0
  - @remirror/extension-emoji@1.0.0
  - @remirror/extension-epic-mode@1.0.0
  - @remirror/extension-font-family@1.0.0
  - @remirror/extension-font-size@1.0.0
  - @remirror/extension-gap-cursor@1.0.0
  - @remirror/extension-hard-break@1.0.0
  - @remirror/extension-heading@1.0.0
  - @remirror/extension-history@1.0.0
  - @remirror/extension-horizontal-rule@1.0.0
  - @remirror/extension-italic@1.0.0
  - @remirror/extension-mention@1.0.0
  - @remirror/extension-node-formatting@1.0.0
  - @remirror/extension-paragraph@1.0.0
  - @remirror/extension-placeholder@1.0.0
  - @remirror/extension-search@1.0.0
  - @remirror/extension-strike@1.0.0
  - @remirror/extension-sup@1.0.0
  - @remirror/extension-text@1.0.0
  - @remirror/extension-text-case@1.0.0
  - @remirror/extension-text-color@1.0.0
  - @remirror/extension-text-highlight@1.0.0
  - @remirror/extension-trailing-node@1.0.0
  - @remirror/extension-underline@1.0.0
  - @remirror/extension-whitespace@1.0.0
  - @remirror/icons@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/preset-core@1.0.0
  - @remirror/preset-formatting@1.0.0
  - @remirror/preset-wysiwyg@1.0.0
  - @remirror/theme@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`34a7981d`](https://github.com/remirror/remirror/commit/34a7981de827e9d804a0fb5e1304ddf5a8ae4505), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`302bdf7e`](https://github.com/remirror/remirror/commit/302bdf7e92c5df562d0402b83da9d7b7240aa2f6), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0)]:
  - @remirror/extension-yjs@1.0.0-next.60
  - @remirror/core-utils@1.0.0-next.60
  - @remirror/core-constants@1.0.0-next.60
  - @remirror/extension-image@1.0.0-next.60
  - @remirror/core@1.0.0-next.60
  - @remirror/core-helpers@1.0.0-next.60
  - @remirror/core-types@1.0.0-next.60
  - @remirror/dom@1.0.0-next.60
  - @remirror/extension-annotation@1.0.0-next.60
  - @remirror/extension-auto-link@1.0.0-next.60
  - @remirror/extension-bidi@1.0.0-next.60
  - @remirror/extension-blockquote@1.0.0-next.60
  - @remirror/extension-bold@1.0.0-next.60
  - @remirror/extension-callout@1.0.0-next.60
  - @remirror/extension-code@1.0.0-next.60
  - @remirror/extension-code-block@1.0.0-next.60
  - @remirror/extension-codemirror5@1.0.0-next.60
  - @remirror/extension-collaboration@1.0.0-next.60
  - @remirror/extension-diff@1.0.0-next.60
  - @remirror/extension-doc@1.0.0-next.60
  - @remirror/extension-drop-cursor@1.0.0-next.60
  - @remirror/extension-emoji@1.0.0-next.60
  - @remirror/extension-epic-mode@1.0.0-next.60
  - @remirror/extension-events@1.0.0-next.60
  - @remirror/extension-gap-cursor@1.0.0-next.60
  - @remirror/extension-hard-break@1.0.0-next.60
  - @remirror/extension-heading@1.0.0-next.60
  - @remirror/extension-history@1.0.0-next.60
  - @remirror/extension-horizontal-rule@1.0.0-next.60
  - @remirror/extension-italic@1.0.0-next.60
  - @remirror/extension-link@1.0.0-next.60
  - @remirror/extension-mention@1.0.0-next.60
  - @remirror/extension-mention-atom@1.0.0-next.60
  - @remirror/extension-paragraph@1.0.0-next.60
  - @remirror/extension-placeholder@1.0.0-next.60
  - @remirror/extension-positioner@1.0.0-next.60
  - @remirror/extension-react-component@1.0.0-next.60
  - @remirror/extension-react-ssr@1.0.0-next.60
  - @remirror/extension-search@1.0.0-next.60
  - @remirror/extension-strike@1.0.0-next.60
  - @remirror/extension-text@1.0.0-next.60
  - @remirror/extension-trailing-node@1.0.0-next.60
  - @remirror/extension-underline@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60
  - @remirror/preset-core@1.0.0-next.60
  - @remirror/preset-embed@1.0.0-next.60
  - @remirror/preset-list@1.0.0-next.60
  - @remirror/preset-react@1.0.0-next.60
  - @remirror/preset-social@1.0.0-next.60
  - @remirror/preset-table@1.0.0-next.60
  - @remirror/preset-wysiwyg@1.0.0-next.60
  - @remirror/react@1.0.0-next.60
  - @remirror/react-hooks@1.0.0-next.60
  - @remirror/react-social@1.0.0-next.60
  - @remirror/react-utils@1.0.0-next.60
  - @remirror/react-wysiwyg@1.0.0-next.60
  - @remirror/theme@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`e69115f1`](https://github.com/remirror/remirror/commit/e69115f141c12c7dd21bd89c716b12b279414364)]:
  - @remirror/core@1.0.0-next.59
  - @remirror/core-constants@1.0.0-next.59
  - @remirror/core-helpers@1.0.0-next.59
  - @remirror/core-types@1.0.0-next.59
  - @remirror/dom@1.0.0-next.59
  - @remirror/extension-annotation@1.0.0-next.59
  - @remirror/extension-auto-link@1.0.0-next.59
  - @remirror/extension-bidi@1.0.0-next.59
  - @remirror/extension-blockquote@1.0.0-next.59
  - @remirror/extension-bold@1.0.0-next.59
  - @remirror/extension-callout@1.0.0-next.59
  - @remirror/extension-code@1.0.0-next.59
  - @remirror/extension-code-block@1.0.0-next.59
  - @remirror/extension-codemirror5@1.0.0-next.59
  - @remirror/extension-collaboration@1.0.0-next.59
  - @remirror/extension-diff@1.0.0-next.59
  - @remirror/extension-doc@1.0.0-next.59
  - @remirror/extension-drop-cursor@1.0.0-next.59
  - @remirror/extension-emoji@1.0.0-next.59
  - @remirror/extension-epic-mode@1.0.0-next.59
  - @remirror/extension-events@1.0.0-next.59
  - @remirror/extension-gap-cursor@1.0.0-next.59
  - @remirror/extension-hard-break@1.0.0-next.59
  - @remirror/extension-heading@1.0.0-next.59
  - @remirror/extension-history@1.0.0-next.59
  - @remirror/extension-horizontal-rule@1.0.0-next.59
  - @remirror/extension-image@1.0.0-next.59
  - @remirror/extension-italic@1.0.0-next.59
  - @remirror/extension-link@1.0.0-next.59
  - @remirror/extension-mention@1.0.0-next.59
  - @remirror/extension-mention-atom@1.0.0-next.59
  - @remirror/extension-paragraph@1.0.0-next.59
  - @remirror/extension-placeholder@1.0.0-next.59
  - @remirror/extension-positioner@1.0.0-next.59
  - @remirror/extension-react-component@1.0.0-next.59
  - @remirror/extension-react-ssr@1.0.0-next.59
  - @remirror/extension-search@1.0.0-next.59
  - @remirror/extension-strike@1.0.0-next.59
  - @remirror/extension-text@1.0.0-next.59
  - @remirror/extension-trailing-node@1.0.0-next.59
  - @remirror/extension-underline@1.0.0-next.59
  - @remirror/extension-yjs@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59
  - @remirror/preset-core@1.0.0-next.59
  - @remirror/preset-embed@1.0.0-next.59
  - @remirror/preset-list@1.0.0-next.59
  - @remirror/preset-react@1.0.0-next.59
  - @remirror/preset-social@1.0.0-next.59
  - @remirror/preset-table@1.0.0-next.59
  - @remirror/preset-wysiwyg@1.0.0-next.59
  - @remirror/react@1.0.0-next.59
  - @remirror/react-hooks@1.0.0-next.59
  - @remirror/react-social@1.0.0-next.59
  - @remirror/react-utils@1.0.0-next.59
  - @remirror/react-wysiwyg@1.0.0-next.59
  - @remirror/theme@1.0.0-next.59
  - @remirror/core-utils@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`3d3da227`](https://github.com/remirror/remirror/commit/3d3da227fd582d388ed2587f0ccd0ac6e5b6ae73)]:
  - @remirror/core@1.0.0-next.58
  - @remirror/core-constants@1.0.0-next.58
  - @remirror/core-helpers@1.0.0-next.58
  - @remirror/core-types@1.0.0-next.58
  - @remirror/core-utils@1.0.0-next.58
  - @remirror/dom@1.0.0-next.58
  - @remirror/extension-annotation@1.0.0-next.58
  - @remirror/extension-auto-link@1.0.0-next.58
  - @remirror/extension-bidi@1.0.0-next.58
  - @remirror/extension-blockquote@1.0.0-next.58
  - @remirror/extension-bold@1.0.0-next.58
  - @remirror/extension-callout@1.0.0-next.58
  - @remirror/extension-code@1.0.0-next.58
  - @remirror/extension-code-block@1.0.0-next.58
  - @remirror/extension-codemirror5@1.0.0-next.58
  - @remirror/extension-collaboration@1.0.0-next.58
  - @remirror/extension-diff@1.0.0-next.58
  - @remirror/extension-doc@1.0.0-next.58
  - @remirror/extension-drop-cursor@1.0.0-next.58
  - @remirror/extension-emoji@1.0.0-next.58
  - @remirror/extension-epic-mode@1.0.0-next.58
  - @remirror/extension-events@1.0.0-next.58
  - @remirror/extension-gap-cursor@1.0.0-next.58
  - @remirror/extension-hard-break@1.0.0-next.58
  - @remirror/extension-heading@1.0.0-next.58
  - @remirror/extension-history@1.0.0-next.58
  - @remirror/extension-horizontal-rule@1.0.0-next.58
  - @remirror/extension-image@1.0.0-next.58
  - @remirror/extension-italic@1.0.0-next.58
  - @remirror/extension-link@1.0.0-next.58
  - @remirror/extension-mention@1.0.0-next.58
  - @remirror/extension-mention-atom@1.0.0-next.58
  - @remirror/extension-paragraph@1.0.0-next.58
  - @remirror/extension-placeholder@1.0.0-next.58
  - @remirror/extension-positioner@1.0.0-next.58
  - @remirror/extension-react-component@1.0.0-next.58
  - @remirror/extension-react-ssr@1.0.0-next.58
  - @remirror/extension-search@1.0.0-next.58
  - @remirror/extension-strike@1.0.0-next.58
  - @remirror/extension-text@1.0.0-next.58
  - @remirror/extension-trailing-node@1.0.0-next.58
  - @remirror/extension-underline@1.0.0-next.58
  - @remirror/extension-yjs@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58
  - @remirror/preset-core@1.0.0-next.58
  - @remirror/preset-embed@1.0.0-next.58
  - @remirror/preset-list@1.0.0-next.58
  - @remirror/preset-react@1.0.0-next.58
  - @remirror/preset-social@1.0.0-next.58
  - @remirror/preset-table@1.0.0-next.58
  - @remirror/preset-wysiwyg@1.0.0-next.58
  - @remirror/react@1.0.0-next.58
  - @remirror/react-hooks@1.0.0-next.58
  - @remirror/react-social@1.0.0-next.58
  - @remirror/react-utils@1.0.0-next.58
  - @remirror/react-wysiwyg@1.0.0-next.58
  - @remirror/theme@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`4ae3c9b2`](https://github.com/remirror/remirror/commit/4ae3c9b2a1f2073aa243d093a2da4b110e7d246e)]:
  - @remirror/extension-link@1.0.0-next.57
  - @remirror/core@1.0.0-next.57
  - @remirror/core-constants@1.0.0-next.57
  - @remirror/core-helpers@1.0.0-next.57
  - @remirror/core-types@1.0.0-next.57
  - @remirror/core-utils@1.0.0-next.57
  - @remirror/dom@1.0.0-next.57
  - @remirror/extension-annotation@1.0.0-next.57
  - @remirror/extension-auto-link@1.0.0-next.57
  - @remirror/extension-bidi@1.0.0-next.57
  - @remirror/extension-blockquote@1.0.0-next.57
  - @remirror/extension-bold@1.0.0-next.57
  - @remirror/extension-callout@1.0.0-next.57
  - @remirror/extension-code@1.0.0-next.57
  - @remirror/extension-code-block@1.0.0-next.57
  - @remirror/extension-codemirror5@1.0.0-next.57
  - @remirror/extension-collaboration@1.0.0-next.57
  - @remirror/extension-diff@1.0.0-next.57
  - @remirror/extension-doc@1.0.0-next.57
  - @remirror/extension-drop-cursor@1.0.0-next.57
  - @remirror/extension-emoji@1.0.0-next.57
  - @remirror/extension-epic-mode@1.0.0-next.57
  - @remirror/extension-events@1.0.0-next.57
  - @remirror/extension-gap-cursor@1.0.0-next.57
  - @remirror/extension-hard-break@1.0.0-next.57
  - @remirror/extension-heading@1.0.0-next.57
  - @remirror/extension-history@1.0.0-next.57
  - @remirror/extension-horizontal-rule@1.0.0-next.57
  - @remirror/extension-image@1.0.0-next.57
  - @remirror/extension-italic@1.0.0-next.57
  - @remirror/extension-mention@1.0.0-next.57
  - @remirror/extension-mention-atom@1.0.0-next.57
  - @remirror/extension-paragraph@1.0.0-next.57
  - @remirror/extension-placeholder@1.0.0-next.57
  - @remirror/extension-positioner@1.0.0-next.57
  - @remirror/extension-react-component@1.0.0-next.57
  - @remirror/extension-react-ssr@1.0.0-next.57
  - @remirror/extension-search@1.0.0-next.57
  - @remirror/extension-strike@1.0.0-next.57
  - @remirror/extension-text@1.0.0-next.57
  - @remirror/extension-trailing-node@1.0.0-next.57
  - @remirror/extension-underline@1.0.0-next.57
  - @remirror/extension-yjs@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57
  - @remirror/preset-core@1.0.0-next.57
  - @remirror/preset-embed@1.0.0-next.57
  - @remirror/preset-list@1.0.0-next.57
  - @remirror/preset-react@1.0.0-next.57
  - @remirror/preset-social@1.0.0-next.57
  - @remirror/preset-table@1.0.0-next.57
  - @remirror/preset-wysiwyg@1.0.0-next.57
  - @remirror/react@1.0.0-next.57
  - @remirror/react-hooks@1.0.0-next.57
  - @remirror/react-social@1.0.0-next.57
  - @remirror/react-utils@1.0.0-next.57
  - @remirror/react-wysiwyg@1.0.0-next.57
  - @remirror/theme@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`cba35d51`](https://github.com/remirror/remirror/commit/cba35d51f2c95c2b930b083959dccdf7cf521615), [`01e5c2d2`](https://github.com/remirror/remirror/commit/01e5c2d2707c715cd4e0006f9ac10c0cc3b11042)]:
  - @remirror/core@1.0.0-next.56
  - @remirror/core-constants@1.0.0-next.56
  - @remirror/core-helpers@1.0.0-next.56
  - @remirror/core-types@1.0.0-next.56
  - @remirror/core-utils@1.0.0-next.56
  - @remirror/dom@1.0.0-next.56
  - @remirror/extension-annotation@1.0.0-next.56
  - @remirror/extension-auto-link@1.0.0-next.56
  - @remirror/extension-bidi@1.0.0-next.56
  - @remirror/extension-blockquote@1.0.0-next.56
  - @remirror/extension-bold@1.0.0-next.56
  - @remirror/extension-callout@1.0.0-next.56
  - @remirror/extension-code@1.0.0-next.56
  - @remirror/extension-code-block@1.0.0-next.56
  - @remirror/extension-codemirror5@1.0.0-next.56
  - @remirror/extension-collaboration@1.0.0-next.56
  - @remirror/extension-diff@1.0.0-next.56
  - @remirror/extension-doc@1.0.0-next.56
  - @remirror/extension-drop-cursor@1.0.0-next.56
  - @remirror/extension-emoji@1.0.0-next.56
  - @remirror/extension-epic-mode@1.0.0-next.56
  - @remirror/extension-events@1.0.0-next.56
  - @remirror/extension-gap-cursor@1.0.0-next.56
  - @remirror/extension-hard-break@1.0.0-next.56
  - @remirror/extension-heading@1.0.0-next.56
  - @remirror/extension-history@1.0.0-next.56
  - @remirror/extension-horizontal-rule@1.0.0-next.56
  - @remirror/extension-image@1.0.0-next.56
  - @remirror/extension-italic@1.0.0-next.56
  - @remirror/extension-link@1.0.0-next.56
  - @remirror/extension-mention@1.0.0-next.56
  - @remirror/extension-mention-atom@1.0.0-next.56
  - @remirror/extension-paragraph@1.0.0-next.56
  - @remirror/extension-placeholder@1.0.0-next.56
  - @remirror/extension-react-component@1.0.0-next.56
  - @remirror/extension-react-ssr@1.0.0-next.56
  - @remirror/extension-search@1.0.0-next.56
  - @remirror/extension-strike@1.0.0-next.56
  - @remirror/extension-text@1.0.0-next.56
  - @remirror/extension-trailing-node@1.0.0-next.56
  - @remirror/extension-underline@1.0.0-next.56
  - @remirror/extension-yjs@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56
  - @remirror/preset-core@1.0.0-next.56
  - @remirror/preset-embed@1.0.0-next.56
  - @remirror/preset-list@1.0.0-next.56
  - @remirror/preset-react@1.0.0-next.56
  - @remirror/preset-social@1.0.0-next.56
  - @remirror/preset-table@1.0.0-next.56
  - @remirror/preset-wysiwyg@1.0.0-next.56
  - @remirror/react@1.0.0-next.56
  - @remirror/react-hooks@1.0.0-next.56
  - @remirror/react-social@1.0.0-next.56
  - @remirror/react-utils@1.0.0-next.56
  - @remirror/react-wysiwyg@1.0.0-next.56
  - @remirror/extension-positioner@1.0.0-next.56
  - @remirror/theme@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`b65ea785`](https://github.com/remirror/remirror/commit/b65ea785c96b52cc54be205be66918de104d28bc), [`3ee20d40`](https://github.com/remirror/remirror/commit/3ee20d40c90cac71c39320aaefbfb476d9f74101), [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3), [`4bdcac77`](https://github.com/remirror/remirror/commit/4bdcac775c38196ad76431e55fd817d04810f367), [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3), [`ee1ab4f3`](https://github.com/remirror/remirror/commit/ee1ab4f38bc1a169821b66017d5d24eb00275f0f), [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3), [`c2268721`](https://github.com/remirror/remirror/commit/c226872161dab8e212407d3d4bc2d177f4f3a6d4)]:
  - @remirror/extension-link@1.0.0-next.55
  - @remirror/extension-mention@1.0.0-next.55
  - @remirror/core@1.0.0-next.55
  - @remirror/extension-events@1.0.0-next.55
  - @remirror/core-constants@1.0.0-next.55
  - @remirror/core-helpers@1.0.0-next.55
  - @remirror/core-types@1.0.0-next.55
  - @remirror/dom@1.0.0-next.55
  - @remirror/extension-annotation@1.0.0-next.55
  - @remirror/extension-auto-link@1.0.0-next.55
  - @remirror/extension-bidi@1.0.0-next.55
  - @remirror/extension-blockquote@1.0.0-next.55
  - @remirror/extension-bold@1.0.0-next.55
  - @remirror/extension-callout@1.0.0-next.55
  - @remirror/extension-code@1.0.0-next.55
  - @remirror/extension-code-block@1.0.0-next.55
  - @remirror/extension-codemirror5@1.0.0-next.55
  - @remirror/extension-collaboration@1.0.0-next.55
  - @remirror/extension-diff@1.0.0-next.55
  - @remirror/extension-doc@1.0.0-next.55
  - @remirror/extension-drop-cursor@1.0.0-next.55
  - @remirror/extension-emoji@1.0.0-next.55
  - @remirror/extension-epic-mode@1.0.0-next.55
  - @remirror/extension-gap-cursor@1.0.0-next.55
  - @remirror/extension-hard-break@1.0.0-next.55
  - @remirror/extension-heading@1.0.0-next.55
  - @remirror/extension-history@1.0.0-next.55
  - @remirror/extension-horizontal-rule@1.0.0-next.55
  - @remirror/extension-image@1.0.0-next.55
  - @remirror/extension-italic@1.0.0-next.55
  - @remirror/extension-paragraph@1.0.0-next.55
  - @remirror/extension-placeholder@1.0.0-next.55
  - @remirror/extension-positioner@1.0.0-next.55
  - @remirror/extension-react-component@1.0.0-next.55
  - @remirror/extension-react-ssr@1.0.0-next.55
  - @remirror/extension-search@1.0.0-next.55
  - @remirror/extension-strike@1.0.0-next.55
  - @remirror/extension-text@1.0.0-next.55
  - @remirror/extension-trailing-node@1.0.0-next.55
  - @remirror/extension-underline@1.0.0-next.55
  - @remirror/extension-yjs@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55
  - @remirror/preset-core@1.0.0-next.55
  - @remirror/preset-embed@1.0.0-next.55
  - @remirror/preset-list@1.0.0-next.55
  - @remirror/preset-react@1.0.0-next.55
  - @remirror/preset-social@1.0.0-next.55
  - @remirror/preset-table@1.0.0-next.55
  - @remirror/preset-wysiwyg@1.0.0-next.55
  - @remirror/react@1.0.0-next.55
  - @remirror/react-hooks@1.0.0-next.55
  - @remirror/react-social@1.0.0-next.55
  - @remirror/react-utils@1.0.0-next.55
  - @remirror/react-wysiwyg@1.0.0-next.55
  - @remirror/theme@1.0.0-next.55
  - @remirror/core-utils@1.0.0-next.55
  - @remirror/extension-mention-atom@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`d720bcd4`](https://github.com/remirror/remirror/commit/d720bcd43cd8589bbb2bcc7c12104229113f212a), [`1a0348e7`](https://github.com/remirror/remirror/commit/1a0348e795e1bef83ef31489e0aa3c256da9e434), [`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764), [`b1df359b`](https://github.com/remirror/remirror/commit/b1df359b32996212a4357fb78bb6a8d2929bcf4f), [`8a6d5c34`](https://github.com/remirror/remirror/commit/8a6d5c34778a5ac877876bd24d1a252851fb4882), [`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764), [`1b5bf359`](https://github.com/remirror/remirror/commit/1b5bf35999898ab82c8868f25444edeee82486ad)]:
  - @remirror/extension-codemirror5@1.0.0-next.54
  - @remirror/core-utils@1.0.0-next.54
  - @remirror/core@1.0.0-next.54
  - @remirror/core-constants@1.0.0-next.54
  - @remirror/core-helpers@1.0.0-next.54
  - @remirror/core-types@1.0.0-next.54
  - @remirror/dom@1.0.0-next.54
  - @remirror/extension-annotation@1.0.0-next.54
  - @remirror/extension-auto-link@1.0.0-next.54
  - @remirror/extension-bidi@1.0.0-next.54
  - @remirror/extension-blockquote@1.0.0-next.54
  - @remirror/extension-bold@1.0.0-next.54
  - @remirror/extension-callout@1.0.0-next.54
  - @remirror/extension-code@1.0.0-next.54
  - @remirror/extension-code-block@1.0.0-next.54
  - @remirror/extension-collaboration@1.0.0-next.54
  - @remirror/extension-diff@1.0.0-next.54
  - @remirror/extension-doc@1.0.0-next.54
  - @remirror/extension-drop-cursor@1.0.0-next.54
  - @remirror/extension-emoji@1.0.0-next.54
  - @remirror/extension-epic-mode@1.0.0-next.54
  - @remirror/extension-events@1.0.0-next.54
  - @remirror/extension-gap-cursor@1.0.0-next.54
  - @remirror/extension-hard-break@1.0.0-next.54
  - @remirror/extension-heading@1.0.0-next.54
  - @remirror/extension-history@1.0.0-next.54
  - @remirror/extension-horizontal-rule@1.0.0-next.54
  - @remirror/extension-image@1.0.0-next.54
  - @remirror/extension-italic@1.0.0-next.54
  - @remirror/extension-mention@1.0.0-next.54
  - @remirror/extension-paragraph@1.0.0-next.54
  - @remirror/extension-placeholder@1.0.0-next.54
  - @remirror/extension-positioner@1.0.0-next.54
  - @remirror/extension-react-component@1.0.0-next.54
  - @remirror/extension-react-ssr@1.0.0-next.54
  - @remirror/extension-search@1.0.0-next.54
  - @remirror/extension-strike@1.0.0-next.54
  - @remirror/extension-text@1.0.0-next.54
  - @remirror/extension-trailing-node@1.0.0-next.54
  - @remirror/extension-underline@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54
  - @remirror/preset-core@1.0.0-next.54
  - @remirror/preset-embed@1.0.0-next.54
  - @remirror/preset-list@1.0.0-next.54
  - @remirror/preset-react@1.0.0-next.54
  - @remirror/preset-social@1.0.0-next.54
  - @remirror/preset-table@1.0.0-next.54
  - @remirror/preset-wysiwyg@1.0.0-next.54
  - @remirror/react@1.0.0-next.54
  - @remirror/react-hooks@1.0.0-next.54
  - @remirror/react-social@1.0.0-next.54
  - @remirror/react-utils@1.0.0-next.54
  - @remirror/react-wysiwyg@1.0.0-next.54
  - @remirror/theme@1.0.0-next.54
  - @remirror/extension-link@1.0.0-next.54
  - @remirror/extension-yjs@1.0.0-next.54
  - @remirror/extension-mention-atom@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655), [`5fd944c6`](https://github.com/remirror/remirror/commit/5fd944c64880ec3e7c60a954d22770ff1c613aee)]:
  - @remirror/core@1.0.0-next.53
  - @remirror/core-utils@1.0.0-next.53
  - @remirror/extension-auto-link@1.0.0-next.53
  - @remirror/extension-callout@1.0.0-next.53
  - @remirror/extension-image@1.0.0-next.53
  - @remirror/extension-link@1.0.0-next.53
  - @remirror/extension-mention-atom@1.0.0-next.53
  - @remirror/preset-embed@1.0.0-next.53
  - @remirror/core-constants@1.0.0-next.53
  - @remirror/core-helpers@1.0.0-next.53
  - @remirror/core-types@1.0.0-next.53
  - @remirror/dom@1.0.0-next.53
  - @remirror/extension-annotation@1.0.0-next.53
  - @remirror/extension-bidi@1.0.0-next.53
  - @remirror/extension-blockquote@1.0.0-next.53
  - @remirror/extension-bold@1.0.0-next.53
  - @remirror/extension-code@1.0.0-next.53
  - @remirror/extension-code-block@1.0.0-next.53
  - @remirror/extension-collaboration@1.0.0-next.53
  - @remirror/extension-diff@1.0.0-next.53
  - @remirror/extension-doc@1.0.0-next.53
  - @remirror/extension-drop-cursor@1.0.0-next.53
  - @remirror/extension-emoji@1.0.0-next.53
  - @remirror/extension-epic-mode@1.0.0-next.53
  - @remirror/extension-events@1.0.0-next.53
  - @remirror/extension-gap-cursor@1.0.0-next.53
  - @remirror/extension-hard-break@1.0.0-next.53
  - @remirror/extension-heading@1.0.0-next.53
  - @remirror/extension-history@1.0.0-next.53
  - @remirror/extension-horizontal-rule@1.0.0-next.53
  - @remirror/extension-italic@1.0.0-next.53
  - @remirror/extension-mention@1.0.0-next.53
  - @remirror/extension-paragraph@1.0.0-next.53
  - @remirror/extension-placeholder@1.0.0-next.53
  - @remirror/extension-positioner@1.0.0-next.53
  - @remirror/extension-react-component@1.0.0-next.53
  - @remirror/extension-react-ssr@1.0.0-next.53
  - @remirror/extension-search@1.0.0-next.53
  - @remirror/extension-strike@1.0.0-next.53
  - @remirror/extension-text@1.0.0-next.53
  - @remirror/extension-trailing-node@1.0.0-next.53
  - @remirror/extension-underline@1.0.0-next.53
  - @remirror/extension-yjs@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53
  - @remirror/preset-core@1.0.0-next.53
  - @remirror/preset-list@1.0.0-next.53
  - @remirror/preset-react@1.0.0-next.53
  - @remirror/preset-social@1.0.0-next.53
  - @remirror/preset-table@1.0.0-next.53
  - @remirror/preset-wysiwyg@1.0.0-next.53
  - @remirror/react@1.0.0-next.53
  - @remirror/react-hooks@1.0.0-next.53
  - @remirror/react-social@1.0.0-next.53
  - @remirror/react-utils@1.0.0-next.53
  - @remirror/react-wysiwyg@1.0.0-next.53
  - @remirror/theme@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Minor Changes

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

- Updated dependencies [[`3da2b5fd`](https://github.com/remirror/remirror/commit/3da2b5fd41e088c1d24969b53853a2b6f003455c), [`caf2588d`](https://github.com/remirror/remirror/commit/caf2588d52e939cf939773837938d54f54f999a6), [`bdaa6af7`](https://github.com/remirror/remirror/commit/bdaa6af7d4daf365bd13c491420ce3e04add571e)]:
  - @remirror/preset-embed@1.0.0-next.52
  - @remirror/extension-link@1.0.0-next.52
  - @remirror/core@1.0.0-next.52
  - @remirror/core-constants@1.0.0-next.52
  - @remirror/core-helpers@1.0.0-next.52
  - @remirror/core-types@1.0.0-next.52
  - @remirror/core-utils@1.0.0-next.52
  - @remirror/dom@1.0.0-next.52
  - @remirror/extension-annotation@1.0.0-next.52
  - @remirror/extension-auto-link@1.0.0-next.52
  - @remirror/extension-bidi@1.0.0-next.52
  - @remirror/extension-blockquote@1.0.0-next.52
  - @remirror/extension-bold@1.0.0-next.52
  - @remirror/extension-code@1.0.0-next.52
  - @remirror/extension-code-block@1.0.0-next.52
  - @remirror/extension-collaboration@1.0.0-next.52
  - @remirror/extension-diff@1.0.0-next.52
  - @remirror/extension-doc@1.0.0-next.52
  - @remirror/extension-drop-cursor@1.0.0-next.52
  - @remirror/extension-emoji@1.0.0-next.52
  - @remirror/extension-epic-mode@1.0.0-next.52
  - @remirror/extension-events@1.0.0-next.52
  - @remirror/extension-gap-cursor@1.0.0-next.52
  - @remirror/extension-hard-break@1.0.0-next.52
  - @remirror/extension-heading@1.0.0-next.52
  - @remirror/extension-history@1.0.0-next.52
  - @remirror/extension-horizontal-rule@1.0.0-next.52
  - @remirror/extension-image@1.0.0-next.52
  - @remirror/extension-italic@1.0.0-next.52
  - @remirror/extension-mention@1.0.0-next.52
  - @remirror/extension-mention-atom@1.0.0-next.52
  - @remirror/extension-paragraph@1.0.0-next.52
  - @remirror/extension-placeholder@1.0.0-next.52
  - @remirror/extension-positioner@1.0.0-next.52
  - @remirror/extension-react-component@1.0.0-next.52
  - @remirror/extension-react-ssr@1.0.0-next.52
  - @remirror/extension-search@1.0.0-next.52
  - @remirror/extension-strike@1.0.0-next.52
  - @remirror/extension-text@1.0.0-next.52
  - @remirror/extension-trailing-node@1.0.0-next.52
  - @remirror/extension-underline@1.0.0-next.52
  - @remirror/extension-yjs@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52
  - @remirror/preset-core@1.0.0-next.52
  - @remirror/preset-list@1.0.0-next.52
  - @remirror/preset-react@1.0.0-next.52
  - @remirror/preset-social@1.0.0-next.52
  - @remirror/preset-table@1.0.0-next.52
  - @remirror/preset-wysiwyg@1.0.0-next.52
  - @remirror/react@1.0.0-next.52
  - @remirror/react-hooks@1.0.0-next.52
  - @remirror/react-social@1.0.0-next.52
  - @remirror/react-utils@1.0.0-next.52
  - @remirror/react-wysiwyg@1.0.0-next.52
  - @remirror/theme@1.0.0-next.52
  - @remirror/extension-callout@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`b79e4142`](https://github.com/remirror/remirror/commit/b79e414219ffc4f8435b7b934bf503c2c3b128f5), [`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/extension-link@1.0.0-next.51
  - @remirror/core@1.0.0-next.51
  - @remirror/core-constants@1.0.0-next.51
  - @remirror/core-helpers@1.0.0-next.51
  - @remirror/core-types@1.0.0-next.51
  - @remirror/core-utils@1.0.0-next.51
  - @remirror/dom@1.0.0-next.51
  - @remirror/extension-annotation@1.0.0-next.51
  - @remirror/extension-auto-link@1.0.0-next.51
  - @remirror/extension-bidi@1.0.0-next.51
  - @remirror/extension-blockquote@1.0.0-next.51
  - @remirror/extension-bold@1.0.0-next.51
  - @remirror/extension-code@1.0.0-next.51
  - @remirror/extension-code-block@1.0.0-next.51
  - @remirror/extension-collaboration@1.0.0-next.51
  - @remirror/extension-diff@1.0.0-next.51
  - @remirror/extension-doc@1.0.0-next.51
  - @remirror/extension-drop-cursor@1.0.0-next.51
  - @remirror/extension-epic-mode@1.0.0-next.51
  - @remirror/extension-events@1.0.0-next.51
  - @remirror/extension-gap-cursor@1.0.0-next.51
  - @remirror/extension-hard-break@1.0.0-next.51
  - @remirror/extension-heading@1.0.0-next.51
  - @remirror/extension-history@1.0.0-next.51
  - @remirror/extension-horizontal-rule@1.0.0-next.51
  - @remirror/extension-image@1.0.0-next.51
  - @remirror/extension-italic@1.0.0-next.51
  - @remirror/extension-mention@1.0.0-next.51
  - @remirror/extension-mention-atom@1.0.0-next.51
  - @remirror/extension-paragraph@1.0.0-next.51
  - @remirror/extension-placeholder@1.0.0-next.51
  - @remirror/extension-positioner@1.0.0-next.51
  - @remirror/extension-react-component@1.0.0-next.51
  - @remirror/extension-react-ssr@1.0.0-next.51
  - @remirror/extension-search@1.0.0-next.51
  - @remirror/extension-strike@1.0.0-next.51
  - @remirror/extension-text@1.0.0-next.51
  - @remirror/extension-trailing-node@1.0.0-next.51
  - @remirror/extension-underline@1.0.0-next.51
  - @remirror/extension-yjs@1.0.0-next.51
  - @remirror/preset-core@1.0.0-next.51
  - @remirror/preset-embed@1.0.0-next.51
  - @remirror/preset-list@1.0.0-next.51
  - @remirror/preset-react@1.0.0-next.51
  - @remirror/preset-social@1.0.0-next.51
  - @remirror/preset-table@1.0.0-next.51
  - @remirror/preset-wysiwyg@1.0.0-next.51
  - @remirror/react@1.0.0-next.51
  - @remirror/react-hooks@1.0.0-next.51
  - @remirror/react-social@1.0.0-next.51
  - @remirror/react-utils@1.0.0-next.51
  - @remirror/react-wysiwyg@1.0.0-next.51
  - @remirror/theme@1.0.0-next.51
  - @remirror/extension-emoji@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`359486f6`](https://github.com/remirror/remirror/commit/359486f6a7383588de16e6bd34c94545d3350f90), [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455), [`d27c6e1a`](https://github.com/remirror/remirror/commit/d27c6e1aa83bfd59bde0f1659f0989deb66dad24), [`d27c6e1a`](https://github.com/remirror/remirror/commit/d27c6e1aa83bfd59bde0f1659f0989deb66dad24), [`d27c6e1a`](https://github.com/remirror/remirror/commit/d27c6e1aa83bfd59bde0f1659f0989deb66dad24)]:
  - @remirror/extension-link@1.0.0-next.50
  - @remirror/preset-wysiwyg@1.0.0-next.50
  - @remirror/core@1.0.0-next.50
  - @remirror/core-constants@1.0.0-next.50
  - @remirror/core-helpers@1.0.0-next.50
  - @remirror/core-types@1.0.0-next.50
  - @remirror/core-utils@1.0.0-next.50
  - @remirror/dom@1.0.0-next.50
  - @remirror/extension-annotation@1.0.0-next.50
  - @remirror/extension-auto-link@1.0.0-next.50
  - @remirror/extension-bidi@1.0.0-next.50
  - @remirror/extension-blockquote@1.0.0-next.50
  - @remirror/extension-bold@1.0.0-next.50
  - @remirror/extension-code@1.0.0-next.50
  - @remirror/extension-code-block@1.0.0-next.50
  - @remirror/extension-collaboration@1.0.0-next.50
  - @remirror/extension-diff@1.0.0-next.50
  - @remirror/extension-doc@1.0.0-next.50
  - @remirror/extension-drop-cursor@1.0.0-next.50
  - @remirror/extension-emoji@1.0.0-next.50
  - @remirror/extension-epic-mode@1.0.0-next.50
  - @remirror/extension-events@1.0.0-next.50
  - @remirror/extension-gap-cursor@1.0.0-next.50
  - @remirror/extension-hard-break@1.0.0-next.50
  - @remirror/extension-heading@1.0.0-next.50
  - @remirror/extension-history@1.0.0-next.50
  - @remirror/extension-horizontal-rule@1.0.0-next.50
  - @remirror/extension-image@1.0.0-next.50
  - @remirror/extension-italic@1.0.0-next.50
  - @remirror/extension-mention@1.0.0-next.50
  - @remirror/extension-mention-atom@1.0.0-next.50
  - @remirror/extension-paragraph@1.0.0-next.50
  - @remirror/extension-placeholder@1.0.0-next.50
  - @remirror/extension-positioner@1.0.0-next.50
  - @remirror/extension-react-component@1.0.0-next.50
  - @remirror/extension-react-ssr@1.0.0-next.50
  - @remirror/extension-search@1.0.0-next.50
  - @remirror/extension-strike@1.0.0-next.50
  - @remirror/extension-text@1.0.0-next.50
  - @remirror/extension-trailing-node@1.0.0-next.50
  - @remirror/extension-underline@1.0.0-next.50
  - @remirror/extension-yjs@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50
  - @remirror/preset-core@1.0.0-next.50
  - @remirror/preset-embed@1.0.0-next.50
  - @remirror/preset-list@1.0.0-next.50
  - @remirror/preset-react@1.0.0-next.50
  - @remirror/preset-social@1.0.0-next.50
  - @remirror/preset-table@1.0.0-next.50
  - @remirror/react@1.0.0-next.50
  - @remirror/react-hooks@1.0.0-next.50
  - @remirror/react-social@1.0.0-next.50
  - @remirror/react-utils@1.0.0-next.50
  - @remirror/react-wysiwyg@1.0.0-next.50
  - @remirror/theme@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`cd91b689`](https://github.com/remirror/remirror/commit/cd91b6893e9f0609d95e4945075d98eb3fe53b76), [`049134a3`](https://github.com/remirror/remirror/commit/049134a3d8e99c3b56243579a59e5a316e07444d)]:
  - @remirror/react-hooks@1.0.0-next.49
  - @remirror/core@1.0.0-next.49
  - @remirror/core-constants@1.0.0-next.49
  - @remirror/core-helpers@1.0.0-next.49
  - @remirror/core-types@1.0.0-next.49
  - @remirror/core-utils@1.0.0-next.49
  - @remirror/dom@1.0.0-next.49
  - @remirror/extension-annotation@1.0.0-next.49
  - @remirror/extension-auto-link@1.0.0-next.49
  - @remirror/extension-bidi@1.0.0-next.49
  - @remirror/extension-blockquote@1.0.0-next.49
  - @remirror/extension-bold@1.0.0-next.49
  - @remirror/extension-code@1.0.0-next.49
  - @remirror/extension-code-block@1.0.0-next.49
  - @remirror/extension-collaboration@1.0.0-next.49
  - @remirror/extension-diff@1.0.0-next.49
  - @remirror/extension-doc@1.0.0-next.49
  - @remirror/extension-drop-cursor@1.0.0-next.49
  - @remirror/extension-emoji@1.0.0-next.49
  - @remirror/extension-epic-mode@1.0.0-next.49
  - @remirror/extension-events@1.0.0-next.49
  - @remirror/extension-gap-cursor@1.0.0-next.49
  - @remirror/extension-hard-break@1.0.0-next.49
  - @remirror/extension-heading@1.0.0-next.49
  - @remirror/extension-history@1.0.0-next.49
  - @remirror/extension-horizontal-rule@1.0.0-next.49
  - @remirror/extension-image@1.0.0-next.49
  - @remirror/extension-italic@1.0.0-next.49
  - @remirror/extension-link@1.0.0-next.49
  - @remirror/extension-mention@1.0.0-next.49
  - @remirror/extension-mention-atom@1.0.0-next.49
  - @remirror/extension-paragraph@1.0.0-next.49
  - @remirror/extension-placeholder@1.0.0-next.49
  - @remirror/extension-positioner@1.0.0-next.49
  - @remirror/extension-react-component@1.0.0-next.49
  - @remirror/extension-react-ssr@1.0.0-next.49
  - @remirror/extension-search@1.0.0-next.49
  - @remirror/extension-strike@1.0.0-next.49
  - @remirror/extension-text@1.0.0-next.49
  - @remirror/extension-trailing-node@1.0.0-next.49
  - @remirror/extension-underline@1.0.0-next.49
  - @remirror/extension-yjs@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49
  - @remirror/preset-core@1.0.0-next.49
  - @remirror/preset-embed@1.0.0-next.49
  - @remirror/preset-list@1.0.0-next.49
  - @remirror/preset-react@1.0.0-next.49
  - @remirror/preset-social@1.0.0-next.49
  - @remirror/preset-table@1.0.0-next.49
  - @remirror/preset-wysiwyg@1.0.0-next.49
  - @remirror/react@1.0.0-next.49
  - @remirror/react-social@1.0.0-next.49
  - @remirror/react-utils@1.0.0-next.49
  - @remirror/react-wysiwyg@1.0.0-next.49
  - @remirror/theme@1.0.0-next.49

## 1.0.0-next.48

> 2020-10-08

### Patch Changes

- Updated dependencies [[`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e), [`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e)]:
  - @remirror/core@1.0.0-next.48
  - @remirror/core-utils@1.0.0-next.48
  - @remirror/dom@1.0.0-next.48
  - @remirror/extension-annotation@1.0.0-next.48
  - @remirror/extension-auto-link@1.0.0-next.48
  - @remirror/extension-bidi@1.0.0-next.48
  - @remirror/extension-blockquote@1.0.0-next.48
  - @remirror/extension-bold@1.0.0-next.48
  - @remirror/extension-code@1.0.0-next.48
  - @remirror/extension-code-block@1.0.0-next.48
  - @remirror/extension-collaboration@1.0.0-next.48
  - @remirror/extension-diff@1.0.0-next.48
  - @remirror/extension-doc@1.0.0-next.48
  - @remirror/extension-drop-cursor@1.0.0-next.48
  - @remirror/extension-emoji@1.0.0-next.48
  - @remirror/extension-epic-mode@1.0.0-next.48
  - @remirror/extension-events@1.0.0-next.48
  - @remirror/extension-gap-cursor@1.0.0-next.48
  - @remirror/extension-hard-break@1.0.0-next.48
  - @remirror/extension-heading@1.0.0-next.48
  - @remirror/extension-history@1.0.0-next.48
  - @remirror/extension-horizontal-rule@1.0.0-next.48
  - @remirror/extension-image@1.0.0-next.48
  - @remirror/extension-italic@1.0.0-next.48
  - @remirror/extension-link@1.0.0-next.48
  - @remirror/extension-mention@1.0.0-next.48
  - @remirror/extension-mention-atom@1.0.0-next.48
  - @remirror/extension-paragraph@1.0.0-next.48
  - @remirror/extension-placeholder@1.0.0-next.48
  - @remirror/extension-positioner@1.0.0-next.48
  - @remirror/extension-react-component@1.0.0-next.48
  - @remirror/extension-react-ssr@1.0.0-next.48
  - @remirror/extension-search@1.0.0-next.48
  - @remirror/extension-strike@1.0.0-next.48
  - @remirror/extension-text@1.0.0-next.48
  - @remirror/extension-trailing-node@1.0.0-next.48
  - @remirror/extension-underline@1.0.0-next.48
  - @remirror/extension-yjs@1.0.0-next.48
  - @remirror/preset-core@1.0.0-next.48
  - @remirror/preset-embed@1.0.0-next.48
  - @remirror/preset-list@1.0.0-next.48
  - @remirror/preset-react@1.0.0-next.48
  - @remirror/preset-social@1.0.0-next.48
  - @remirror/preset-table@1.0.0-next.48
  - @remirror/preset-wysiwyg@1.0.0-next.48
  - @remirror/react@1.0.0-next.48
  - @remirror/react-hooks@1.0.0-next.48
  - @remirror/react-social@1.0.0-next.48
  - @remirror/react-wysiwyg@1.0.0-next.48

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e), [`911cc6d8`](https://github.com/remirror/remirror/commit/911cc6d85f7668cecdfd7e252e9431c1ae2ae845), [`56349ca5`](https://github.com/remirror/remirror/commit/56349ca5f638b90b743f7f008fbf190fa0ab1e12), [`c0867ced`](https://github.com/remirror/remirror/commit/c0867ced744d69c92e7ddef63ac9b11cc6e79846)]:
  - @remirror/core@1.0.0-next.47
  - @remirror/core-helpers@1.0.0-next.47
  - @remirror/core-types@1.0.0-next.47
  - @remirror/core-utils@1.0.0-next.47
  - @remirror/dom@1.0.0-next.47
  - @remirror/extension-code-block@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47
  - @remirror/preset-social@1.0.0-next.47
  - @remirror/react@1.0.0-next.47
  - @remirror/react-hooks@1.0.0-next.47
  - @remirror/react-social@1.0.0-next.47
  - @remirror/react-wysiwyg@1.0.0-next.47
  - @remirror/theme@1.0.0-next.47
  - @remirror/extension-yjs@1.0.0-next.47
  - @remirror/extension-positioner@1.0.0-next.47
  - @remirror/extension-annotation@1.0.0-next.47
  - @remirror/extension-auto-link@1.0.0-next.47
  - @remirror/extension-bidi@1.0.0-next.47
  - @remirror/extension-blockquote@1.0.0-next.47
  - @remirror/extension-bold@1.0.0-next.47
  - @remirror/extension-code@1.0.0-next.47
  - @remirror/extension-collaboration@1.0.0-next.47
  - @remirror/extension-diff@1.0.0-next.47
  - @remirror/extension-doc@1.0.0-next.47
  - @remirror/extension-drop-cursor@1.0.0-next.47
  - @remirror/extension-emoji@1.0.0-next.47
  - @remirror/extension-epic-mode@1.0.0-next.47
  - @remirror/extension-events@1.0.0-next.47
  - @remirror/extension-gap-cursor@1.0.0-next.47
  - @remirror/extension-hard-break@1.0.0-next.47
  - @remirror/extension-heading@1.0.0-next.47
  - @remirror/extension-history@1.0.0-next.47
  - @remirror/extension-horizontal-rule@1.0.0-next.47
  - @remirror/extension-image@1.0.0-next.47
  - @remirror/extension-italic@1.0.0-next.47
  - @remirror/extension-link@1.0.0-next.47
  - @remirror/extension-mention@1.0.0-next.47
  - @remirror/extension-mention-atom@1.0.0-next.47
  - @remirror/extension-paragraph@1.0.0-next.47
  - @remirror/extension-placeholder@1.0.0-next.47
  - @remirror/extension-react-component@1.0.0-next.47
  - @remirror/extension-react-ssr@1.0.0-next.47
  - @remirror/extension-search@1.0.0-next.47
  - @remirror/extension-strike@1.0.0-next.47
  - @remirror/extension-text@1.0.0-next.47
  - @remirror/extension-trailing-node@1.0.0-next.47
  - @remirror/extension-underline@1.0.0-next.47
  - @remirror/preset-core@1.0.0-next.47
  - @remirror/preset-embed@1.0.0-next.47
  - @remirror/preset-list@1.0.0-next.47
  - @remirror/preset-react@1.0.0-next.47
  - @remirror/preset-table@1.0.0-next.47
  - @remirror/preset-wysiwyg@1.0.0-next.47
  - @remirror/react-utils@1.0.0-next.47

## 1.0.0-next.46

> 2020-10-06

### Patch Changes

- Updated dependencies [[`73e81b43`](https://github.com/remirror/remirror/commit/73e81b43aa2bd685ad12bfe94942ef16c1c0a006)]:
  - @remirror/extension-annotation@1.0.0-next.46

## 1.0.0-next.45

> 2020-10-01

### Patch Changes

- Updated dependencies [[`2175be1d`](https://github.com/remirror/remirror/commit/2175be1d4b3fb1d4d1ec7edd8f6054e4e1873fc0)]:
  - @remirror/core@1.0.0-next.45
  - @remirror/dom@1.0.0-next.45
  - @remirror/extension-annotation@1.0.0-next.45
  - @remirror/extension-auto-link@1.0.0-next.45
  - @remirror/extension-bidi@1.0.0-next.45
  - @remirror/extension-blockquote@1.0.0-next.45
  - @remirror/extension-bold@1.0.0-next.45
  - @remirror/extension-code@1.0.0-next.45
  - @remirror/extension-code-block@1.0.0-next.45
  - @remirror/extension-collaboration@1.0.0-next.45
  - @remirror/extension-diff@1.0.0-next.45
  - @remirror/extension-doc@1.0.0-next.45
  - @remirror/extension-drop-cursor@1.0.0-next.45
  - @remirror/extension-emoji@1.0.0-next.45
  - @remirror/extension-epic-mode@1.0.0-next.45
  - @remirror/extension-events@1.0.0-next.45
  - @remirror/extension-gap-cursor@1.0.0-next.45
  - @remirror/extension-hard-break@1.0.0-next.45
  - @remirror/extension-heading@1.0.0-next.45
  - @remirror/extension-history@1.0.0-next.45
  - @remirror/extension-horizontal-rule@1.0.0-next.45
  - @remirror/extension-image@1.0.0-next.45
  - @remirror/extension-italic@1.0.0-next.45
  - @remirror/extension-link@1.0.0-next.45
  - @remirror/extension-mention@1.0.0-next.45
  - @remirror/extension-mention-atom@1.0.0-next.45
  - @remirror/extension-paragraph@1.0.0-next.45
  - @remirror/extension-placeholder@1.0.0-next.45
  - @remirror/extension-positioner@1.0.0-next.45
  - @remirror/extension-react-component@1.0.0-next.45
  - @remirror/extension-react-ssr@1.0.0-next.45
  - @remirror/extension-search@1.0.0-next.45
  - @remirror/extension-strike@1.0.0-next.45
  - @remirror/extension-text@1.0.0-next.45
  - @remirror/extension-trailing-node@1.0.0-next.45
  - @remirror/extension-underline@1.0.0-next.45
  - @remirror/extension-yjs@1.0.0-next.45
  - @remirror/preset-core@1.0.0-next.45
  - @remirror/preset-embed@1.0.0-next.45
  - @remirror/preset-list@1.0.0-next.45
  - @remirror/preset-react@1.0.0-next.45
  - @remirror/preset-social@1.0.0-next.45
  - @remirror/preset-table@1.0.0-next.45
  - @remirror/preset-wysiwyg@1.0.0-next.45
  - @remirror/react@1.0.0-next.45
  - @remirror/react-hooks@1.0.0-next.45
  - @remirror/react-social@1.0.0-next.45
  - @remirror/react-wysiwyg@1.0.0-next.45

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`60776b1f`](https://github.com/remirror/remirror/commit/60776b1fc683408480a5e9502d104f79146a7977), [`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/extension-events@1.0.0-next.44
  - @remirror/extension-yjs@1.0.0-next.44
  - @remirror/pm@1.0.0-next.44
  - @remirror/preset-core@1.0.0-next.44
  - @remirror/react-hooks@1.0.0-next.44
  - @remirror/react-social@1.0.0-next.44
  - @remirror/core@1.0.0-next.44
  - @remirror/core-types@1.0.0-next.44
  - @remirror/core-utils@1.0.0-next.44
  - @remirror/dom@1.0.0-next.44
  - @remirror/extension-annotation@1.0.0-next.44
  - @remirror/extension-auto-link@1.0.0-next.44
  - @remirror/extension-bidi@1.0.0-next.44
  - @remirror/extension-blockquote@1.0.0-next.44
  - @remirror/extension-bold@1.0.0-next.44
  - @remirror/extension-code@1.0.0-next.44
  - @remirror/extension-code-block@1.0.0-next.44
  - @remirror/extension-collaboration@1.0.0-next.44
  - @remirror/extension-diff@1.0.0-next.44
  - @remirror/extension-doc@1.0.0-next.44
  - @remirror/extension-drop-cursor@1.0.0-next.44
  - @remirror/extension-emoji@1.0.0-next.44
  - @remirror/extension-epic-mode@1.0.0-next.44
  - @remirror/extension-gap-cursor@1.0.0-next.44
  - @remirror/extension-hard-break@1.0.0-next.44
  - @remirror/extension-heading@1.0.0-next.44
  - @remirror/extension-history@1.0.0-next.44
  - @remirror/extension-horizontal-rule@1.0.0-next.44
  - @remirror/extension-image@1.0.0-next.44
  - @remirror/extension-italic@1.0.0-next.44
  - @remirror/extension-link@1.0.0-next.44
  - @remirror/extension-mention@1.0.0-next.44
  - @remirror/extension-mention-atom@1.0.0-next.44
  - @remirror/extension-paragraph@1.0.0-next.44
  - @remirror/extension-placeholder@1.0.0-next.44
  - @remirror/extension-positioner@1.0.0-next.44
  - @remirror/extension-react-component@1.0.0-next.44
  - @remirror/extension-react-ssr@1.0.0-next.44
  - @remirror/extension-search@1.0.0-next.44
  - @remirror/extension-strike@1.0.0-next.44
  - @remirror/extension-text@1.0.0-next.44
  - @remirror/extension-trailing-node@1.0.0-next.44
  - @remirror/extension-underline@1.0.0-next.44
  - @remirror/preset-embed@1.0.0-next.44
  - @remirror/preset-list@1.0.0-next.44
  - @remirror/preset-react@1.0.0-next.44
  - @remirror/preset-social@1.0.0-next.44
  - @remirror/preset-table@1.0.0-next.44
  - @remirror/preset-wysiwyg@1.0.0-next.44
  - @remirror/react@1.0.0-next.44
  - @remirror/react-wysiwyg@1.0.0-next.44
  - @remirror/core-helpers@1.0.0-next.44
  - @remirror/react-utils@1.0.0-next.44
  - @remirror/theme@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Patch Changes

- Updated dependencies [[`b674f906`](https://github.com/remirror/remirror/commit/b674f906815776d9c07b608a7de8cbaa9554a3a1), [`a02dd7d1`](https://github.com/remirror/remirror/commit/a02dd7d1c02b2eec2946d4300c3ef90ec0ff79db), [`b674f906`](https://github.com/remirror/remirror/commit/b674f906815776d9c07b608a7de8cbaa9554a3a1), [`b674f906`](https://github.com/remirror/remirror/commit/b674f906815776d9c07b608a7de8cbaa9554a3a1), [`bdea98bf`](https://github.com/remirror/remirror/commit/bdea98bf230d2be59ab3caef8b3cc35273883691), [`b030cb6e`](https://github.com/remirror/remirror/commit/b030cb6e50cb6fdc045a4680f4861ad145609197)]:
  - @remirror/extension-image@1.0.0-next.43
  - @remirror/extension-annotation@1.0.0-next.43
  - @remirror/extension-code-block@1.0.0-next.43
  - @remirror/core-utils@1.0.0-next.43
  - @remirror/preset-wysiwyg@1.0.0-next.43
  - @remirror/core@1.0.0-next.43
  - @remirror/react-wysiwyg@1.0.0-next.43
  - @remirror/dom@1.0.0-next.43
  - @remirror/extension-auto-link@1.0.0-next.43
  - @remirror/extension-bidi@1.0.0-next.43
  - @remirror/extension-blockquote@1.0.0-next.43
  - @remirror/extension-bold@1.0.0-next.43
  - @remirror/extension-code@1.0.0-next.43
  - @remirror/extension-collaboration@1.0.0-next.43
  - @remirror/extension-diff@1.0.0-next.43
  - @remirror/extension-doc@1.0.0-next.43
  - @remirror/extension-drop-cursor@1.0.0-next.43
  - @remirror/extension-emoji@1.0.0-next.43
  - @remirror/extension-epic-mode@1.0.0-next.43
  - @remirror/extension-events@1.0.0-next.43
  - @remirror/extension-gap-cursor@1.0.0-next.43
  - @remirror/extension-hard-break@1.0.0-next.43
  - @remirror/extension-heading@1.0.0-next.43
  - @remirror/extension-history@1.0.0-next.43
  - @remirror/extension-horizontal-rule@1.0.0-next.43
  - @remirror/extension-italic@1.0.0-next.43
  - @remirror/extension-link@1.0.0-next.43
  - @remirror/extension-mention@1.0.0-next.43
  - @remirror/extension-mention-atom@1.0.0-next.43
  - @remirror/extension-paragraph@1.0.0-next.43
  - @remirror/extension-placeholder@1.0.0-next.43
  - @remirror/extension-positioner@1.0.0-next.43
  - @remirror/extension-react-component@1.0.0-next.43
  - @remirror/extension-react-ssr@1.0.0-next.43
  - @remirror/extension-search@1.0.0-next.43
  - @remirror/extension-strike@1.0.0-next.43
  - @remirror/extension-text@1.0.0-next.43
  - @remirror/extension-trailing-node@1.0.0-next.43
  - @remirror/extension-underline@1.0.0-next.43
  - @remirror/extension-yjs@1.0.0-next.43
  - @remirror/preset-core@1.0.0-next.43
  - @remirror/preset-embed@1.0.0-next.43
  - @remirror/preset-list@1.0.0-next.43
  - @remirror/preset-react@1.0.0-next.43
  - @remirror/preset-social@1.0.0-next.43
  - @remirror/preset-table@1.0.0-next.43
  - @remirror/react@1.0.0-next.43
  - @remirror/react-hooks@1.0.0-next.43
  - @remirror/react-social@1.0.0-next.43

## 1.0.0-next.42

> 2020-09-26

### Patch Changes

- Updated dependencies [[`ef1f57c2`](https://github.com/remirror/remirror/commit/ef1f57c2b055d00ca910a0e5aa2e282875f6dde5), [`44754a5d`](https://github.com/remirror/remirror/commit/44754a5de1354ab45d2be16fb02aa2fd017319c1), [`802d5f04`](https://github.com/remirror/remirror/commit/802d5f042ea64974f6db5dc52006f858fa5e3e28), [`6f2ababd`](https://github.com/remirror/remirror/commit/6f2ababd44dbfdf4b1f7248457d8d481c33a5d13), [`9fa07878`](https://github.com/remirror/remirror/commit/9fa078780504bff81d28183ee8cda3b599412cf0), [`d33f43bf`](https://github.com/remirror/remirror/commit/d33f43bfcb8d7f578f05434b42c938b4132b544a)]:
  - @remirror/extension-annotation@1.0.0-next.42
  - @remirror/extension-code-block@1.0.0-next.42
  - @remirror/core-utils@1.0.0-next.42
  - @remirror/extension-diff@1.0.0-next.42
  - @remirror/extension-heading@1.0.0-next.42
  - @remirror/extension-mention@1.0.0-next.42
  - @remirror/extension-mention-atom@1.0.0-next.42
  - @remirror/extension-collaboration@1.0.0-next.42
  - @remirror/extension-emoji@1.0.0-next.42
  - @remirror/extension-search@1.0.0-next.42
  - @remirror/extension-strike@1.0.0-next.42
  - @remirror/preset-embed@1.0.0-next.42
  - @remirror/preset-list@1.0.0-next.42
  - @remirror/react-social@1.0.0-next.42
  - @remirror/react-wysiwyg@1.0.0-next.42
  - @remirror/preset-wysiwyg@1.0.0-next.42
  - @remirror/core@1.0.0-next.42
  - @remirror/preset-social@1.0.0-next.42
  - @remirror/react-hooks@1.0.0-next.42
  - @remirror/dom@1.0.0-next.42
  - @remirror/extension-auto-link@1.0.0-next.42
  - @remirror/extension-bidi@1.0.0-next.42
  - @remirror/extension-blockquote@1.0.0-next.42
  - @remirror/extension-bold@1.0.0-next.42
  - @remirror/extension-code@1.0.0-next.42
  - @remirror/extension-doc@1.0.0-next.42
  - @remirror/extension-drop-cursor@1.0.0-next.42
  - @remirror/extension-epic-mode@1.0.0-next.42
  - @remirror/extension-events@1.0.0-next.42
  - @remirror/extension-gap-cursor@1.0.0-next.42
  - @remirror/extension-hard-break@1.0.0-next.42
  - @remirror/extension-history@1.0.0-next.42
  - @remirror/extension-horizontal-rule@1.0.0-next.42
  - @remirror/extension-image@1.0.0-next.42
  - @remirror/extension-italic@1.0.0-next.42
  - @remirror/extension-link@1.0.0-next.42
  - @remirror/extension-paragraph@1.0.0-next.42
  - @remirror/extension-placeholder@1.0.0-next.42
  - @remirror/extension-positioner@1.0.0-next.42
  - @remirror/extension-react-component@1.0.0-next.42
  - @remirror/extension-react-ssr@1.0.0-next.42
  - @remirror/extension-text@1.0.0-next.42
  - @remirror/extension-trailing-node@1.0.0-next.42
  - @remirror/extension-underline@1.0.0-next.42
  - @remirror/extension-yjs@1.0.0-next.42
  - @remirror/preset-core@1.0.0-next.42
  - @remirror/preset-react@1.0.0-next.42
  - @remirror/preset-table@1.0.0-next.42
  - @remirror/react@1.0.0-next.42

## 1.0.0-next.41

> 2020-09-26

### Patch Changes

- Updated dependencies [[`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`83217437`](https://github.com/remirror/remirror/commit/8321743733d1aa794c5b5f5b2f07a9e1065d9ac9), [`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`6644a391`](https://github.com/remirror/remirror/commit/6644a3912a2c168a0d29db617271ec8407ba0f4f)]:
  - @remirror/core@1.0.0-next.41
  - @remirror/react@1.0.0-next.41
  - @remirror/extension-annotation@1.0.0-next.41
  - @remirror/dom@1.0.0-next.41
  - @remirror/extension-auto-link@1.0.0-next.41
  - @remirror/extension-bidi@1.0.0-next.41
  - @remirror/extension-blockquote@1.0.0-next.41
  - @remirror/extension-bold@1.0.0-next.41
  - @remirror/extension-code@1.0.0-next.41
  - @remirror/extension-code-block@1.0.0-next.41
  - @remirror/extension-collaboration@1.0.0-next.41
  - @remirror/extension-diff@1.0.0-next.41
  - @remirror/extension-doc@1.0.0-next.41
  - @remirror/extension-drop-cursor@1.0.0-next.41
  - @remirror/extension-emoji@1.0.0-next.41
  - @remirror/extension-epic-mode@1.0.0-next.41
  - @remirror/extension-events@1.0.0-next.41
  - @remirror/extension-gap-cursor@1.0.0-next.41
  - @remirror/extension-hard-break@1.0.0-next.41
  - @remirror/extension-heading@1.0.0-next.41
  - @remirror/extension-history@1.0.0-next.41
  - @remirror/extension-horizontal-rule@1.0.0-next.41
  - @remirror/extension-image@1.0.0-next.41
  - @remirror/extension-italic@1.0.0-next.41
  - @remirror/extension-link@1.0.0-next.41
  - @remirror/extension-mention@1.0.0-next.41
  - @remirror/extension-mention-atom@1.0.0-next.41
  - @remirror/extension-paragraph@1.0.0-next.41
  - @remirror/extension-placeholder@1.0.0-next.41
  - @remirror/extension-positioner@1.0.0-next.41
  - @remirror/extension-react-component@1.0.0-next.41
  - @remirror/extension-react-ssr@1.0.0-next.41
  - @remirror/extension-search@1.0.0-next.41
  - @remirror/extension-strike@1.0.0-next.41
  - @remirror/extension-text@1.0.0-next.41
  - @remirror/extension-trailing-node@1.0.0-next.41
  - @remirror/extension-underline@1.0.0-next.41
  - @remirror/extension-yjs@1.0.0-next.41
  - @remirror/preset-core@1.0.0-next.41
  - @remirror/preset-embed@1.0.0-next.41
  - @remirror/preset-list@1.0.0-next.41
  - @remirror/preset-react@1.0.0-next.41
  - @remirror/preset-social@1.0.0-next.41
  - @remirror/preset-table@1.0.0-next.41
  - @remirror/preset-wysiwyg@1.0.0-next.41
  - @remirror/react-hooks@1.0.0-next.41
  - @remirror/react-social@1.0.0-next.41
  - @remirror/react-wysiwyg@1.0.0-next.41

## 1.0.0-next.40

> 2020-09-24

### Major Changes

- [`227657ae`](https://github.com/remirror/remirror/commit/227657ae1e30b0aca4c91450b2fab2b8772e5570) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING:** 💥 Remove `@remirror/position-tracker` extension from the repository and remove `remirror/extension/position-tracker` as a potential import.

### Patch Changes

- [`07aab2e8`](https://github.com/remirror/remirror/commit/07aab2e85f79eab332a3f561274e97d9746be65d) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Improve style output and fix CSS output issues.

- Updated dependencies [[`7c5778ed`](https://github.com/remirror/remirror/commit/7c5778edf123e6a812c77b1fd6181d16887b0fa1), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`add65c90`](https://github.com/remirror/remirror/commit/add65c90162612037e1bf9abd98b6436db9ba6ef), [`89bd1e86`](https://github.com/remirror/remirror/commit/89bd1e86e56c60ffbd94a7f5e75adca438d75555), [`4b1d99a6`](https://github.com/remirror/remirror/commit/4b1d99a60c9cf7c652b69967179be39ae5db3ff4), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e), [`1808a9e9`](https://github.com/remirror/remirror/commit/1808a9e9607f7b4951210dbde2c5d5367497cdcb), [`643555cc`](https://github.com/remirror/remirror/commit/643555cc7ba22ee0a8ba3cb1333ea488830fce30)]:
  - @remirror/core@1.0.0-next.40
  - @remirror/react@1.0.0-next.40
  - @remirror/core-utils@1.0.0-next.40
  - @remirror/extension-annotation@1.0.0-next.40
  - @remirror/core-types@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - @remirror/react-social@1.0.0-next.40
  - @remirror/dom@1.0.0-next.40
  - @remirror/extension-auto-link@1.0.0-next.40
  - @remirror/extension-bidi@1.0.0-next.40
  - @remirror/extension-blockquote@1.0.0-next.40
  - @remirror/extension-bold@1.0.0-next.40
  - @remirror/extension-code@1.0.0-next.40
  - @remirror/extension-code-block@1.0.0-next.40
  - @remirror/extension-collaboration@1.0.0-next.40
  - @remirror/extension-diff@1.0.0-next.40
  - @remirror/extension-doc@1.0.0-next.40
  - @remirror/extension-drop-cursor@1.0.0-next.40
  - @remirror/extension-emoji@1.0.0-next.40
  - @remirror/extension-epic-mode@1.0.0-next.40
  - @remirror/extension-events@1.0.0-next.40
  - @remirror/extension-gap-cursor@1.0.0-next.40
  - @remirror/extension-hard-break@1.0.0-next.40
  - @remirror/extension-heading@1.0.0-next.40
  - @remirror/extension-history@1.0.0-next.40
  - @remirror/extension-horizontal-rule@1.0.0-next.40
  - @remirror/extension-image@1.0.0-next.40
  - @remirror/extension-italic@1.0.0-next.40
  - @remirror/extension-link@1.0.0-next.40
  - @remirror/extension-mention@1.0.0-next.40
  - @remirror/extension-mention-atom@1.0.0-next.40
  - @remirror/extension-paragraph@1.0.0-next.40
  - @remirror/extension-placeholder@1.0.0-next.40
  - @remirror/extension-positioner@1.0.0-next.40
  - @remirror/extension-react-component@1.0.0-next.40
  - @remirror/extension-react-ssr@1.0.0-next.40
  - @remirror/extension-search@1.0.0-next.40
  - @remirror/extension-strike@1.0.0-next.40
  - @remirror/extension-text@1.0.0-next.40
  - @remirror/extension-trailing-node@1.0.0-next.40
  - @remirror/extension-underline@1.0.0-next.40
  - @remirror/extension-yjs@1.0.0-next.40
  - @remirror/preset-core@1.0.0-next.40
  - @remirror/preset-embed@1.0.0-next.40
  - @remirror/preset-list@1.0.0-next.40
  - @remirror/preset-react@1.0.0-next.40
  - @remirror/preset-social@1.0.0-next.40
  - @remirror/preset-table@1.0.0-next.40
  - @remirror/preset-wysiwyg@1.0.0-next.40
  - @remirror/react-hooks@1.0.0-next.40
  - @remirror/react-wysiwyg@1.0.0-next.40
  - @remirror/core-helpers@1.0.0-next.40
  - @remirror/react-utils@1.0.0-next.40
  - @remirror/theme@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core@1.0.0-next.39
  - @remirror/core-types@1.0.0-next.39
  - @remirror/core-utils@1.0.0-next.39
  - @remirror/dom@1.0.0-next.39
  - @remirror/extension-annotation@1.0.0-next.39
  - @remirror/extension-auto-link@1.0.0-next.39
  - @remirror/extension-bidi@1.0.0-next.39
  - @remirror/extension-blockquote@1.0.0-next.39
  - @remirror/extension-bold@1.0.0-next.39
  - @remirror/extension-code@1.0.0-next.39
  - @remirror/extension-code-block@1.0.0-next.39
  - @remirror/extension-collaboration@1.0.0-next.39
  - @remirror/extension-diff@1.0.0-next.39
  - @remirror/extension-doc@1.0.0-next.39
  - @remirror/extension-drop-cursor@1.0.0-next.39
  - @remirror/extension-emoji@1.0.0-next.39
  - @remirror/extension-epic-mode@1.0.0-next.39
  - @remirror/extension-events@1.0.0-next.39
  - @remirror/extension-gap-cursor@1.0.0-next.39
  - @remirror/extension-hard-break@1.0.0-next.39
  - @remirror/extension-heading@1.0.0-next.39
  - @remirror/extension-history@1.0.0-next.39
  - @remirror/extension-horizontal-rule@1.0.0-next.39
  - @remirror/extension-image@1.0.0-next.39
  - @remirror/extension-italic@1.0.0-next.39
  - @remirror/extension-link@1.0.0-next.39
  - @remirror/extension-mention@1.0.0-next.39
  - @remirror/extension-mention-atom@1.0.0-next.39
  - @remirror/extension-paragraph@1.0.0-next.39
  - @remirror/extension-placeholder@1.0.0-next.39
  - @remirror/extension-position-tracker@1.0.0-next.39
  - @remirror/extension-positioner@1.0.0-next.39
  - @remirror/extension-react-component@1.0.0-next.39
  - @remirror/extension-react-ssr@1.0.0-next.39
  - @remirror/extension-search@1.0.0-next.39
  - @remirror/extension-strike@1.0.0-next.39
  - @remirror/extension-text@1.0.0-next.39
  - @remirror/extension-trailing-node@1.0.0-next.39
  - @remirror/extension-underline@1.0.0-next.39
  - @remirror/extension-yjs@1.0.0-next.39
  - @remirror/preset-core@1.0.0-next.39
  - @remirror/extension-embed@1.0.0-next.39
  - @remirror/extension-list@1.0.0-next.39
  - @remirror/preset-react@1.0.0-next.39
  - @remirror/preset-social@1.0.0-next.39
  - @remirror/preset-table@1.0.0-next.39
  - @remirror/preset-wysiwyg@1.0.0-next.39
  - @remirror/react@1.0.0-next.39
  - @remirror/react-hooks@1.0.0-next.39
  - @remirror/react-social@1.0.0-next.39
  - @remirror/react-wysiwyg@1.0.0-next.39
  - @remirror/core-helpers@1.0.0-next.39
  - @remirror/react-utils@1.0.0-next.39
  - @remirror/theme@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671), [`efd2e537`](https://github.com/remirror/remirror/commit/efd2e53779666876bb2d9bdcb917923c0a3a6295), [`8cd47216`](https://github.com/remirror/remirror/commit/8cd472168967d95959740ae7b04a51815fa866c8), [`54ae06d4`](https://github.com/remirror/remirror/commit/54ae06d488cf127116b5be75e93261f23c4fb4a2), [`6855ee77`](https://github.com/remirror/remirror/commit/6855ee773bf25a4b30d45a7e09eeab78d6b3f67a), [`54ae06d4`](https://github.com/remirror/remirror/commit/54ae06d488cf127116b5be75e93261f23c4fb4a2)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core@1.0.0-next.38
  - @remirror/dom@1.0.0-next.38
  - @remirror/react@1.0.0-next.38
  - @remirror/react-utils@1.0.0-next.38
  - @remirror/react-social@1.0.0-next.38
  - @remirror/react-wysiwyg@1.0.0-next.38
  - @remirror/core-helpers@1.0.0-next.38
  - @remirror/core-types@1.0.0-next.38
  - @remirror/core-utils@1.0.0-next.38
  - @remirror/extension-annotation@1.0.0-next.38
  - @remirror/extension-auto-link@1.0.0-next.38
  - @remirror/extension-bidi@1.0.0-next.38
  - @remirror/extension-blockquote@1.0.0-next.38
  - @remirror/extension-bold@1.0.0-next.38
  - @remirror/extension-code@1.0.0-next.38
  - @remirror/extension-code-block@1.0.0-next.38
  - @remirror/extension-collaboration@1.0.0-next.38
  - @remirror/extension-diff@1.0.0-next.38
  - @remirror/extension-doc@1.0.0-next.38
  - @remirror/extension-drop-cursor@1.0.0-next.38
  - @remirror/extension-emoji@1.0.0-next.38
  - @remirror/extension-epic-mode@1.0.0-next.38
  - @remirror/extension-events@1.0.0-next.38
  - @remirror/extension-gap-cursor@1.0.0-next.38
  - @remirror/extension-hard-break@1.0.0-next.38
  - @remirror/extension-heading@1.0.0-next.38
  - @remirror/extension-history@1.0.0-next.38
  - @remirror/extension-horizontal-rule@1.0.0-next.38
  - @remirror/extension-image@1.0.0-next.38
  - @remirror/extension-italic@1.0.0-next.38
  - @remirror/extension-link@1.0.0-next.38
  - @remirror/extension-mention@1.0.0-next.38
  - @remirror/extension-mention-atom@1.0.0-next.38
  - @remirror/extension-paragraph@1.0.0-next.38
  - @remirror/extension-placeholder@1.0.0-next.38
  - @remirror/extension-position-tracker@1.0.0-next.38
  - @remirror/extension-positioner@1.0.0-next.38
  - @remirror/extension-react-component@1.0.0-next.38
  - @remirror/extension-react-ssr@1.0.0-next.38
  - @remirror/extension-search@1.0.0-next.38
  - @remirror/extension-strike@1.0.0-next.38
  - @remirror/extension-text@1.0.0-next.38
  - @remirror/extension-trailing-node@1.0.0-next.38
  - @remirror/extension-underline@1.0.0-next.38
  - @remirror/extension-yjs@1.0.0-next.38
  - @remirror/preset-core@1.0.0-next.38
  - @remirror/extension-embed@1.0.0-next.38
  - @remirror/extension-list@1.0.0-next.38
  - @remirror/preset-react@1.0.0-next.38
  - @remirror/preset-social@1.0.0-next.38
  - @remirror/preset-table@1.0.0-next.38
  - @remirror/preset-wysiwyg@1.0.0-next.38
  - @remirror/react-hooks@1.0.0-next.38
  - @remirror/theme@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Minor Changes

- [`fb046735`](https://github.com/remirror/remirror/commit/fb046735fa67b4d469074faedae3320d09a7d755) [#686](https://github.com/remirror/remirror/pull/686) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `@remirror/pm` as a direct dependency of the `remirror` package to reduce the number of packages that need to be installed.

  1. Install `remirror`.
  2. Create an editor??
  3. Profit.

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405), [`a3383ca4`](https://github.com/remirror/remirror/commit/a3383ca4958712ebaf735f5fb25c039e6295d137), [`9b48d110`](https://github.com/remirror/remirror/commit/9b48d1101655ef89e960267b582d560f11a89e4a), [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/core@1.0.0-next.37
  - @remirror/extension-annotation@1.0.0-next.37
  - @remirror/extension-auto-link@1.0.0-next.37
  - @remirror/extension-bidi@1.0.0-next.37
  - @remirror/extension-blockquote@1.0.0-next.37
  - @remirror/extension-bold@1.0.0-next.37
  - @remirror/extension-code@1.0.0-next.37
  - @remirror/extension-code-block@1.0.0-next.37
  - @remirror/extension-collaboration@1.0.0-next.37
  - @remirror/extension-diff@1.0.0-next.37
  - @remirror/extension-doc@1.0.0-next.37
  - @remirror/extension-drop-cursor@1.0.0-next.37
  - @remirror/extension-emoji@1.0.0-next.37
  - @remirror/extension-epic-mode@1.0.0-next.37
  - @remirror/extension-events@1.0.0-next.37
  - @remirror/extension-gap-cursor@1.0.0-next.37
  - @remirror/extension-hard-break@1.0.0-next.37
  - @remirror/extension-heading@1.0.0-next.37
  - @remirror/extension-history@1.0.0-next.37
  - @remirror/extension-horizontal-rule@1.0.0-next.37
  - @remirror/extension-image@1.0.0-next.37
  - @remirror/extension-italic@1.0.0-next.37
  - @remirror/extension-link@1.0.0-next.37
  - @remirror/extension-mention@1.0.0-next.37
  - @remirror/extension-mention-atom@1.0.0-next.37
  - @remirror/extension-paragraph@1.0.0-next.37
  - @remirror/extension-placeholder@1.0.0-next.37
  - @remirror/extension-position-tracker@1.0.0-next.37
  - @remirror/extension-positioner@1.0.0-next.37
  - @remirror/extension-react-component@1.0.0-next.37
  - @remirror/extension-react-ssr@1.0.0-next.37
  - @remirror/extension-search@1.0.0-next.37
  - @remirror/extension-strike@1.0.0-next.37
  - @remirror/extension-text@1.0.0-next.37
  - @remirror/extension-trailing-node@1.0.0-next.37
  - @remirror/extension-underline@1.0.0-next.37
  - @remirror/extension-yjs@1.0.0-next.37
  - @remirror/extension-embed@1.0.0-next.37
  - @remirror/extension-list@1.0.0-next.37
  - @remirror/preset-table@1.0.0-next.37
  - @remirror/react@1.0.0-next.37
  - @remirror/react-social@1.0.0-next.37
  - @remirror/pm@1.0.0-next.37
  - @remirror/dom@1.0.0-next.37
  - @remirror/preset-core@1.0.0-next.37
  - @remirror/preset-react@1.0.0-next.37
  - @remirror/preset-social@1.0.0-next.37
  - @remirror/preset-wysiwyg@1.0.0-next.37
  - @remirror/react-hooks@1.0.0-next.37
  - @remirror/react-wysiwyg@1.0.0-next.37
  - @remirror/core-types@1.0.0-next.37
  - @remirror/core-utils@1.0.0-next.37
  - @remirror/core-helpers@1.0.0-next.37
  - @remirror/react-utils@1.0.0-next.37
  - @remirror/theme@1.0.0-next.37

## 1.0.0-next.36

> 2020-09-13

### Patch Changes

- Updated dependencies [[`0876a5cc`](https://github.com/remirror/remirror/commit/0876a5cc8cedb1f99e72ab7684b5478b3402b9e7), [`0876a5cc`](https://github.com/remirror/remirror/commit/0876a5cc8cedb1f99e72ab7684b5478b3402b9e7)]:
  - @remirror/dom@1.0.0-next.36
  - @remirror/preset-table@1.0.0-next.36
  - @remirror/preset-wysiwyg@1.0.0-next.36
  - @remirror/react-wysiwyg@1.0.0-next.36

## 1.0.0-next.35

> 2020-09-13

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- Updated dependencies [[`34b0f0b3`](https://github.com/remirror/remirror/commit/34b0f0b3c502e5c43712085b9d0da4f4168797aa), [`2a43f303`](https://github.com/remirror/remirror/commit/2a43f3035856f6a6f6ce00938321a40b745b223b), [`3a5ad917`](https://github.com/remirror/remirror/commit/3a5ad917b061117f4b94682e023295cd437fb226), [`273db89f`](https://github.com/remirror/remirror/commit/273db89f923000e42b010a4c00f2a15a0d1d9685), [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec), [`ec941d73`](https://github.com/remirror/remirror/commit/ec941d736582d6fe3efbc5682ceec303637dbdc6), [`ffa36163`](https://github.com/remirror/remirror/commit/ffa36163f7bd41409a32dd1fbec90f85da74bb5b), [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3), [`b155ff47`](https://github.com/remirror/remirror/commit/b155ff47c14f24618a5a503d38b495aef5bc0b69)]:
  - @remirror/core@1.0.0-next.35
  - @remirror/extension-auto-link@1.0.0-next.35
  - @remirror/react-hooks@1.0.0-next.35
  - @remirror/preset-table@1.0.0-next.35
  - @remirror/core-utils@1.0.0-next.35
  - @remirror/core-constants@1.0.0-next.35
  - @remirror/core-helpers@1.0.0-next.35
  - @remirror/core-types@1.0.0-next.35
  - @remirror/dom@1.0.0-next.35
  - @remirror/extension-annotation@1.0.0-next.35
  - @remirror/extension-bidi@1.0.0-next.35
  - @remirror/extension-blockquote@1.0.0-next.35
  - @remirror/extension-bold@1.0.0-next.35
  - @remirror/extension-code@1.0.0-next.35
  - @remirror/extension-code-block@1.0.0-next.35
  - @remirror/extension-collaboration@1.0.0-next.35
  - @remirror/extension-diff@1.0.0-next.35
  - @remirror/extension-doc@1.0.0-next.35
  - @remirror/extension-drop-cursor@1.0.0-next.35
  - @remirror/extension-emoji@1.0.0-next.35
  - @remirror/extension-epic-mode@1.0.0-next.35
  - @remirror/extension-events@1.0.0-next.35
  - @remirror/extension-gap-cursor@1.0.0-next.35
  - @remirror/extension-hard-break@1.0.0-next.35
  - @remirror/extension-heading@1.0.0-next.35
  - @remirror/extension-history@1.0.0-next.35
  - @remirror/extension-horizontal-rule@1.0.0-next.35
  - @remirror/extension-image@1.0.0-next.35
  - @remirror/extension-italic@1.0.0-next.35
  - @remirror/extension-link@1.0.0-next.35
  - @remirror/extension-mention@1.0.0-next.35
  - @remirror/extension-mention-atom@1.0.0-next.35
  - @remirror/extension-paragraph@1.0.0-next.35
  - @remirror/extension-placeholder@1.0.0-next.35
  - @remirror/extension-position-tracker@1.0.0-next.35
  - @remirror/extension-positioner@1.0.0-next.35
  - @remirror/extension-react-component@1.0.0-next.35
  - @remirror/extension-react-ssr@1.0.0-next.35
  - @remirror/extension-search@1.0.0-next.35
  - @remirror/extension-strike@1.0.0-next.35
  - @remirror/extension-text@1.0.0-next.35
  - @remirror/extension-trailing-node@1.0.0-next.35
  - @remirror/extension-underline@1.0.0-next.35
  - @remirror/extension-yjs@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35
  - @remirror/preset-core@1.0.0-next.35
  - @remirror/extension-embed@1.0.0-next.35
  - @remirror/extension-list@1.0.0-next.35
  - @remirror/preset-react@1.0.0-next.35
  - @remirror/preset-social@1.0.0-next.35
  - @remirror/preset-wysiwyg@1.0.0-next.35
  - @remirror/react@1.0.0-next.35
  - @remirror/react-social@1.0.0-next.35
  - @remirror/react-utils@1.0.0-next.35
  - @remirror/react-wysiwyg@1.0.0-next.35
  - @remirror/theme@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be), [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0)]:
  - @remirror/core@1.0.0-next.34
  - @remirror/core-constants@1.0.0-next.34
  - @remirror/dom@1.0.0-next.34
  - @remirror/react-social@1.0.0-next.34
  - @remirror/extension-react-component@1.0.0-next.34
  - @remirror/preset-core@1.0.0-next.34
  - @remirror/react@1.0.0-next.34
  - @remirror/react-wysiwyg@1.0.0-next.34
  - @remirror/extension-code@1.0.0-next.34
  - @remirror/core-helpers@1.0.0-next.34
  - @remirror/extension-annotation@1.0.0-next.34
  - @remirror/extension-auto-link@1.0.0-next.34
  - @remirror/extension-bidi@1.0.0-next.34
  - @remirror/extension-blockquote@1.0.0-next.34
  - @remirror/extension-bold@1.0.0-next.34
  - @remirror/extension-code-block@1.0.0-next.34
  - @remirror/extension-collaboration@1.0.0-next.34
  - @remirror/extension-diff@1.0.0-next.34
  - @remirror/extension-doc@1.0.0-next.34
  - @remirror/extension-drop-cursor@1.0.0-next.34
  - @remirror/extension-emoji@1.0.0-next.34
  - @remirror/extension-epic-mode@1.0.0-next.34
  - @remirror/extension-events@1.0.0-next.34
  - @remirror/extension-gap-cursor@1.0.0-next.34
  - @remirror/extension-hard-break@1.0.0-next.34
  - @remirror/extension-heading@1.0.0-next.34
  - @remirror/extension-history@1.0.0-next.34
  - @remirror/extension-horizontal-rule@1.0.0-next.34
  - @remirror/extension-image@1.0.0-next.34
  - @remirror/extension-italic@1.0.0-next.34
  - @remirror/extension-link@1.0.0-next.34
  - @remirror/extension-mention@1.0.0-next.34
  - @remirror/extension-mention-atom@1.0.0-next.34
  - @remirror/extension-paragraph@1.0.0-next.34
  - @remirror/extension-placeholder@1.0.0-next.34
  - @remirror/extension-position-tracker@1.0.0-next.34
  - @remirror/extension-positioner@1.0.0-next.34
  - @remirror/extension-react-ssr@1.0.0-next.34
  - @remirror/extension-search@1.0.0-next.34
  - @remirror/extension-strike@1.0.0-next.34
  - @remirror/extension-text@1.0.0-next.34
  - @remirror/extension-trailing-node@1.0.0-next.34
  - @remirror/extension-underline@1.0.0-next.34
  - @remirror/extension-yjs@1.0.0-next.34
  - @remirror/extension-embed@1.0.0-next.34
  - @remirror/extension-list@1.0.0-next.34
  - @remirror/preset-react@1.0.0-next.34
  - @remirror/preset-social@1.0.0-next.34
  - @remirror/preset-table@1.0.0-next.34
  - @remirror/preset-wysiwyg@1.0.0-next.34
  - @remirror/react-hooks@1.0.0-next.34
  - @remirror/core-types@1.0.0-next.34
  - @remirror/core-utils@1.0.0-next.34
  - @remirror/react-utils@1.0.0-next.34
  - @remirror/theme@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Patch Changes

- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [04378b54]
- Updated dependencies [92ed4135]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [92ed4135]
- Updated dependencies [d47bd78f]
- Updated dependencies [92ed4135]
  - @remirror/extension-mention@1.0.0-next.33
  - @remirror/core@1.0.0-next.33
  - @remirror/preset-table@1.0.0-next.33
  - @remirror/core-utils@1.0.0-next.33
  - @remirror/core-constants@1.0.0-next.33
  - @remirror/extension-italic@1.0.0-next.33
  - @remirror/core-types@1.0.0-next.33
  - @remirror/extension-history@1.0.0-next.33
  - @remirror/react@1.0.0-next.33
  - @remirror/react-hooks@1.0.0-next.33
  - @remirror/preset-social@1.0.0-next.33
  - @remirror/react-social@1.0.0-next.33
  - @remirror/dom@1.0.0-next.33
  - @remirror/extension-annotation@1.0.0-next.33
  - @remirror/extension-auto-link@1.0.0-next.33
  - @remirror/extension-bidi@1.0.0-next.33
  - @remirror/extension-blockquote@1.0.0-next.33
  - @remirror/extension-bold@1.0.0-next.33
  - @remirror/extension-code@1.0.0-next.33
  - @remirror/extension-code-block@1.0.0-next.33
  - @remirror/extension-collaboration@1.0.0-next.33
  - @remirror/extension-diff@1.0.0-next.33
  - @remirror/extension-doc@1.0.0-next.33
  - @remirror/extension-drop-cursor@1.0.0-next.33
  - @remirror/extension-emoji@1.0.0-next.33
  - @remirror/extension-epic-mode@1.0.0-next.33
  - @remirror/extension-events@1.0.0-next.33
  - @remirror/extension-gap-cursor@1.0.0-next.33
  - @remirror/extension-hard-break@1.0.0-next.33
  - @remirror/extension-heading@1.0.0-next.33
  - @remirror/extension-horizontal-rule@1.0.0-next.33
  - @remirror/extension-image@1.0.0-next.33
  - @remirror/extension-link@1.0.0-next.33
  - @remirror/extension-mention-atom@1.0.0-next.33
  - @remirror/extension-paragraph@1.0.0-next.33
  - @remirror/extension-placeholder@1.0.0-next.33
  - @remirror/extension-position-tracker@1.0.0-next.33
  - @remirror/extension-positioner@1.0.0-next.33
  - @remirror/extension-react-component@1.0.0-next.33
  - @remirror/extension-react-ssr@1.0.0-next.33
  - @remirror/extension-search@1.0.0-next.33
  - @remirror/extension-strike@1.0.0-next.33
  - @remirror/extension-text@1.0.0-next.33
  - @remirror/extension-trailing-node@1.0.0-next.33
  - @remirror/extension-underline@1.0.0-next.33
  - @remirror/extension-yjs@1.0.0-next.33
  - @remirror/preset-core@1.0.0-next.33
  - @remirror/extension-embed@1.0.0-next.33
  - @remirror/extension-list@1.0.0-next.33
  - @remirror/preset-react@1.0.0-next.33
  - @remirror/preset-wysiwyg@1.0.0-next.33
  - @remirror/react-wysiwyg@1.0.0-next.33
  - @remirror/core-helpers@1.0.0-next.33
  - @remirror/react-utils@1.0.0-next.33
  - @remirror/theme@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Major Changes

- [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37) [#646](https://github.com/remirror/remirror/pull/646) Thanks [@ifiokjr](https://github.com/ifiokjr)! - TypeScript 4.0.2 is now the minimum supported version.

### Patch Changes

- Updated dependencies [[`55e11ba3`](https://github.com/remirror/remirror/commit/55e11ba3515d54dda1352a15c4e86b85fb587016), [`28d1fd48`](https://github.com/remirror/remirror/commit/28d1fd486f1c73d66d6c678821cfa744751250b8), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847), [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847), [`28d1fd48`](https://github.com/remirror/remirror/commit/28d1fd486f1c73d66d6c678821cfa744751250b8), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`3bf621c5`](https://github.com/remirror/remirror/commit/3bf621c57086f8de8084e9f2edba6b2a5c2dc0db), [`bed5a9e3`](https://github.com/remirror/remirror/commit/bed5a9e37026dcbdee323c921f5c05e15d49c93d), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3)]:
  - @remirror/extension-mention-atom@1.0.0-next.32
  - @remirror/react@1.0.0-next.32
  - @remirror/core-constants@1.0.0-next.32
  - @remirror/core@1.0.0-next.32
  - @remirror/react-hooks@1.0.0-next.32
  - @remirror/core-utils@1.0.0-next.32
  - @remirror/extension-positioner@1.0.0-next.32
  - @remirror/extension-horizontal-rule@1.0.0-next.32
  - @remirror/core-helpers@1.0.0-next.32
  - @remirror/extension-code-block@1.0.0-next.32
  - @remirror/react-social@1.0.0-next.32
  - @remirror/react-wysiwyg@1.0.0-next.32
  - @remirror/core-types@1.0.0-next.32
  - @remirror/react-utils@1.0.0-next.32
  - @remirror/dom@1.0.0-next.32
  - @remirror/extension-annotation@1.0.0-next.32
  - @remirror/extension-auto-link@1.0.0-next.32
  - @remirror/extension-bidi@1.0.0-next.32
  - @remirror/extension-blockquote@1.0.0-next.32
  - @remirror/extension-bold@1.0.0-next.32
  - @remirror/extension-code@1.0.0-next.32
  - @remirror/extension-collaboration@1.0.0-next.32
  - @remirror/extension-diff@1.0.0-next.32
  - @remirror/extension-doc@1.0.0-next.32
  - @remirror/extension-drop-cursor@1.0.0-next.32
  - @remirror/extension-emoji@1.0.0-next.32
  - @remirror/extension-epic-mode@1.0.0-next.32
  - @remirror/extension-events@1.0.0-next.32
  - @remirror/extension-gap-cursor@1.0.0-next.32
  - @remirror/extension-hard-break@1.0.0-next.32
  - @remirror/extension-heading@1.0.0-next.32
  - @remirror/extension-history@1.0.0-next.32
  - @remirror/extension-image@1.0.0-next.32
  - @remirror/extension-italic@1.0.0-next.32
  - @remirror/extension-link@1.0.0-next.32
  - @remirror/extension-mention@1.0.0-next.32
  - @remirror/extension-paragraph@1.0.0-next.32
  - @remirror/extension-placeholder@1.0.0-next.32
  - @remirror/extension-position-tracker@1.0.0-next.32
  - @remirror/extension-react-component@1.0.0-next.32
  - @remirror/extension-react-ssr@1.0.0-next.32
  - @remirror/extension-search@1.0.0-next.32
  - @remirror/extension-strike@1.0.0-next.32
  - @remirror/extension-text@1.0.0-next.32
  - @remirror/extension-trailing-node@1.0.0-next.32
  - @remirror/extension-underline@1.0.0-next.32
  - @remirror/extension-yjs@1.0.0-next.32
  - @remirror/preset-core@1.0.0-next.32
  - @remirror/extension-embed@1.0.0-next.32
  - @remirror/extension-list@1.0.0-next.32
  - @remirror/preset-react@1.0.0-next.32
  - @remirror/preset-social@1.0.0-next.32
  - @remirror/preset-table@1.0.0-next.32
  - @remirror/preset-wysiwyg@1.0.0-next.32
  - @remirror/theme@1.0.0-next.32
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

### Minor Changes

- [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for creating mentions as uneditable nodes with a new package `@remirror/extension-mention-atom`.

* [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - New package `@remirror/react-hooks` with support for all core hooks`.

### Patch Changes

- Updated dependencies [[`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6)]:
  - @remirror/extension-mention-atom@1.0.0-next.31
  - @remirror/core@1.0.0-next.31
  - @remirror/core-helpers@1.0.0-next.31
  - @remirror/core-utils@1.0.0-next.31
  - @remirror/react-hooks@1.0.0-next.31
  - @remirror/extension-emoji@1.0.0-next.31
  - @remirror/extension-mention@1.0.0-next.31
  - @remirror/dom@1.0.0-next.31
  - @remirror/extension-annotation@1.0.0-next.31
  - @remirror/extension-auto-link@1.0.0-next.31
  - @remirror/extension-bidi@1.0.0-next.31
  - @remirror/extension-blockquote@1.0.0-next.31
  - @remirror/extension-bold@1.0.0-next.31
  - @remirror/extension-code@1.0.0-next.31
  - @remirror/extension-code-block@1.0.0-next.31
  - @remirror/extension-collaboration@1.0.0-next.31
  - @remirror/extension-diff@1.0.0-next.31
  - @remirror/extension-doc@1.0.0-next.31
  - @remirror/extension-drop-cursor@1.0.0-next.31
  - @remirror/extension-epic-mode@1.0.0-next.31
  - @remirror/extension-events@1.0.0-next.31
  - @remirror/extension-gap-cursor@1.0.0-next.31
  - @remirror/extension-hard-break@1.0.0-next.31
  - @remirror/extension-heading@1.0.0-next.31
  - @remirror/extension-history@1.0.0-next.31
  - @remirror/extension-horizontal-rule@1.0.0-next.31
  - @remirror/extension-image@1.0.0-next.31
  - @remirror/extension-italic@1.0.0-next.31
  - @remirror/extension-link@1.0.0-next.31
  - @remirror/extension-paragraph@1.0.0-next.31
  - @remirror/extension-placeholder@1.0.0-next.31
  - @remirror/extension-position-tracker@1.0.0-next.31
  - @remirror/extension-positioner@1.0.0-next.31
  - @remirror/extension-react-component@1.0.0-next.31
  - @remirror/extension-react-ssr@1.0.0-next.31
  - @remirror/extension-search@1.0.0-next.31
  - @remirror/extension-strike@1.0.0-next.31
  - @remirror/extension-text@1.0.0-next.31
  - @remirror/extension-trailing-node@1.0.0-next.31
  - @remirror/extension-underline@1.0.0-next.31
  - @remirror/extension-yjs@1.0.0-next.31
  - @remirror/preset-core@1.0.0-next.31
  - @remirror/extension-embed@1.0.0-next.31
  - @remirror/extension-list@1.0.0-next.31
  - @remirror/preset-react@1.0.0-next.31
  - @remirror/preset-social@1.0.0-next.31
  - @remirror/preset-table@1.0.0-next.31
  - @remirror/preset-wysiwyg@1.0.0-next.31
  - @remirror/react@1.0.0-next.31
  - @remirror/react-social@1.0.0-next.31
  - @remirror/react-wysiwyg@1.0.0-next.31
  - @remirror/react-utils@1.0.0-next.31

## 1.0.0-next.30

> 2020-08-28

### Patch Changes

- Updated dependencies [[`de0ba243`](https://github.com/remirror/remirror/commit/de0ba2436729f2fbd3bc8531b0e5fd01d3f34210)]:
  - @remirror/react@1.0.0-next.30
  - @remirror/react-social@1.0.0-next.30
  - @remirror/react-wysiwyg@1.0.0-next.30

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core@1.0.0-next.29
  - @remirror/react@1.0.0-next.29
  - @remirror/core-utils@1.0.0-next.29
  - @remirror/dom@1.0.0-next.29
  - @remirror/extension-annotation@1.0.0-next.29
  - @remirror/extension-auto-link@1.0.0-next.29
  - @remirror/extension-bidi@1.0.0-next.29
  - @remirror/extension-blockquote@1.0.0-next.29
  - @remirror/extension-bold@1.0.0-next.29
  - @remirror/extension-code@1.0.0-next.29
  - @remirror/extension-code-block@1.0.0-next.29
  - @remirror/extension-collaboration@1.0.0-next.29
  - @remirror/extension-diff@1.0.0-next.29
  - @remirror/extension-doc@1.0.0-next.29
  - @remirror/extension-drop-cursor@1.0.0-next.29
  - @remirror/extension-emoji@1.0.0-next.29
  - @remirror/extension-epic-mode@1.0.0-next.29
  - @remirror/extension-events@1.0.0-next.29
  - @remirror/extension-gap-cursor@1.0.0-next.29
  - @remirror/extension-hard-break@1.0.0-next.29
  - @remirror/extension-heading@1.0.0-next.29
  - @remirror/extension-history@1.0.0-next.29
  - @remirror/extension-horizontal-rule@1.0.0-next.29
  - @remirror/extension-image@1.0.0-next.29
  - @remirror/extension-italic@1.0.0-next.29
  - @remirror/extension-link@1.0.0-next.29
  - @remirror/extension-mention@1.0.0-next.29
  - @remirror/extension-paragraph@1.0.0-next.29
  - @remirror/extension-placeholder@1.0.0-next.29
  - @remirror/extension-position-tracker@1.0.0-next.29
  - @remirror/extension-positioner@1.0.0-next.29
  - @remirror/extension-react-component@1.0.0-next.29
  - @remirror/extension-react-ssr@1.0.0-next.29
  - @remirror/extension-search@1.0.0-next.29
  - @remirror/extension-strike@1.0.0-next.29
  - @remirror/extension-text@1.0.0-next.29
  - @remirror/extension-trailing-node@1.0.0-next.29
  - @remirror/extension-underline@1.0.0-next.29
  - @remirror/extension-yjs@1.0.0-next.29
  - @remirror/preset-core@1.0.0-next.29
  - @remirror/extension-embed@1.0.0-next.29
  - @remirror/extension-list@1.0.0-next.29
  - @remirror/preset-react@1.0.0-next.29
  - @remirror/preset-social@1.0.0-next.29
  - @remirror/preset-table@1.0.0-next.29
  - @remirror/preset-wysiwyg@1.0.0-next.29
  - @remirror/react-social@1.0.0-next.29
  - @remirror/react-wysiwyg@1.0.0-next.29

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448) [#585](https://github.com/remirror/remirror/pull/585) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies and `linaria`.

- Updated dependencies [[`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d), [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a)]:
  - @remirror/core@1.0.0-next.28
  - @remirror/extension-blockquote@1.0.0-next.28
  - @remirror/extension-gap-cursor@1.0.0-next.28
  - @remirror/extension-placeholder@1.0.0-next.28
  - @remirror/extension-search@1.0.0-next.28
  - @remirror/extension-yjs@1.0.0-next.28
  - @remirror/pm@1.0.0-next.28
  - @remirror/extension-embed@1.0.0-next.28
  - @remirror/preset-react@1.0.0-next.28
  - @remirror/preset-table@1.0.0-next.28
  - @remirror/react@1.0.0-next.28
  - @remirror/react-social@1.0.0-next.28
  - @remirror/react-wysiwyg@1.0.0-next.28
  - @remirror/core-helpers@1.0.0-next.28
  - @remirror/extension-react-component@1.0.0-next.28
  - @remirror/extension-react-ssr@1.0.0-next.28
  - @remirror/dom@1.0.0-next.28
  - @remirror/extension-annotation@1.0.0-next.28
  - @remirror/extension-auto-link@1.0.0-next.28
  - @remirror/extension-bidi@1.0.0-next.28
  - @remirror/extension-bold@1.0.0-next.28
  - @remirror/extension-code@1.0.0-next.28
  - @remirror/extension-code-block@1.0.0-next.28
  - @remirror/extension-collaboration@1.0.0-next.28
  - @remirror/extension-diff@1.0.0-next.28
  - @remirror/extension-doc@1.0.0-next.28
  - @remirror/extension-drop-cursor@1.0.0-next.28
  - @remirror/extension-emoji@1.0.0-next.28
  - @remirror/extension-epic-mode@1.0.0-next.28
  - @remirror/extension-events@1.0.0-next.28
  - @remirror/extension-hard-break@1.0.0-next.28
  - @remirror/extension-heading@1.0.0-next.28
  - @remirror/extension-history@1.0.0-next.28
  - @remirror/extension-horizontal-rule@1.0.0-next.28
  - @remirror/extension-image@1.0.0-next.28
  - @remirror/extension-italic@1.0.0-next.28
  - @remirror/extension-link@1.0.0-next.28
  - @remirror/extension-mention@1.0.0-next.28
  - @remirror/extension-paragraph@1.0.0-next.28
  - @remirror/extension-position-tracker@1.0.0-next.28
  - @remirror/extension-positioner@1.0.0-next.28
  - @remirror/extension-strike@1.0.0-next.28
  - @remirror/extension-text@1.0.0-next.28
  - @remirror/extension-trailing-node@1.0.0-next.28
  - @remirror/extension-underline@1.0.0-next.28
  - @remirror/preset-core@1.0.0-next.28
  - @remirror/extension-list@1.0.0-next.28
  - @remirror/preset-social@1.0.0-next.28
  - @remirror/preset-wysiwyg@1.0.0-next.28
  - @remirror/core-types@1.0.0-next.28
  - @remirror/core-utils@1.0.0-next.28
  - @remirror/react-utils@1.0.0-next.28
  - @remirror/theme@1.0.0-next.28

## 1.0.0-next.27

> 2020-08-25

### Minor Changes

- a7436f03: 🎉 Add support for consuming styles with `styled-components` and `emotion` as requested by a sponsor - [#550](https://github.com/remirror/remirror/issues/550).

  💥 BREAKING CHANGE - Remove exports from `@remirror/theme`.

  - ❌ `createAtomClasses`
  - ❌ `defaultRemirrorAtoms`

### Patch Changes

- Updated dependencies [a7436f03]
  - @remirror/theme@1.0.0-next.27
  - @remirror/preset-table@1.0.0-next.27
  - @remirror/react@1.0.0-next.27
  - @remirror/react-social@1.0.0-next.27
  - @remirror/react-wysiwyg@1.0.0-next.27
  - @remirror/preset-wysiwyg@1.0.0-next.27

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core@1.0.0-next.26
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/core-utils@1.0.0-next.26
  - @remirror/extension-blockquote@1.0.0-next.26
  - @remirror/extension-bold@1.0.0-next.26
  - @remirror/extension-code@1.0.0-next.26
  - @remirror/extension-code-block@1.0.0-next.26
  - @remirror/extension-hard-break@1.0.0-next.26
  - @remirror/extension-heading@1.0.0-next.26
  - @remirror/extension-image@1.0.0-next.26
  - @remirror/extension-italic@1.0.0-next.26
  - @remirror/extension-link@1.0.0-next.26
  - @remirror/extension-mention@1.0.0-next.26
  - @remirror/extension-paragraph@1.0.0-next.26
  - @remirror/extension-strike@1.0.0-next.26
  - @remirror/extension-text@1.0.0-next.26
  - @remirror/extension-trailing-node@1.0.0-next.26
  - @remirror/extension-underline@1.0.0-next.26
  - @remirror/extension-embed@1.0.0-next.26
  - @remirror/extension-list@1.0.0-next.26
  - @remirror/preset-table@1.0.0-next.26
  - @remirror/dom@1.0.0-next.26
  - @remirror/extension-annotation@1.0.0-next.26
  - @remirror/extension-auto-link@1.0.0-next.26
  - @remirror/extension-bidi@1.0.0-next.26
  - @remirror/extension-collaboration@1.0.0-next.26
  - @remirror/extension-diff@1.0.0-next.26
  - @remirror/extension-doc@1.0.0-next.26
  - @remirror/extension-drop-cursor@1.0.0-next.26
  - @remirror/extension-emoji@1.0.0-next.26
  - @remirror/extension-epic-mode@1.0.0-next.26
  - @remirror/extension-events@1.0.0-next.26
  - @remirror/extension-gap-cursor@1.0.0-next.26
  - @remirror/extension-history@1.0.0-next.26
  - @remirror/extension-horizontal-rule@1.0.0-next.26
  - @remirror/extension-placeholder@1.0.0-next.26
  - @remirror/extension-position-tracker@1.0.0-next.26
  - @remirror/extension-positioner@1.0.0-next.26
  - @remirror/extension-react-component@1.0.0-next.26
  - @remirror/extension-react-ssr@1.0.0-next.26
  - @remirror/extension-search@1.0.0-next.26
  - @remirror/extension-yjs@1.0.0-next.26
  - @remirror/preset-core@1.0.0-next.26
  - @remirror/preset-react@1.0.0-next.26
  - @remirror/preset-social@1.0.0-next.26
  - @remirror/preset-wysiwyg@1.0.0-next.26
  - @remirror/react@1.0.0-next.26
  - @remirror/react-social@1.0.0-next.26
  - @remirror/react-wysiwyg@1.0.0-next.26
  - @remirror/core-helpers@1.0.0-next.26
  - @remirror/core-types@1.0.0-next.26
  - @remirror/react-utils@1.0.0-next.26
  - @remirror/theme@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25
  - @remirror/core-utils@1.0.0-next.25
  - @remirror/extension-link@1.0.0-next.25
  - @remirror/dom@1.0.0-next.25
  - @remirror/extension-annotation@1.0.0-next.25
  - @remirror/extension-auto-link@1.0.0-next.25
  - @remirror/extension-bidi@1.0.0-next.25
  - @remirror/extension-blockquote@1.0.0-next.25
  - @remirror/extension-bold@1.0.0-next.25
  - @remirror/extension-code@1.0.0-next.25
  - @remirror/extension-code-block@1.0.0-next.25
  - @remirror/extension-collaboration@1.0.0-next.25
  - @remirror/extension-diff@1.0.0-next.25
  - @remirror/extension-doc@1.0.0-next.25
  - @remirror/extension-drop-cursor@1.0.0-next.25
  - @remirror/extension-emoji@1.0.0-next.25
  - @remirror/extension-epic-mode@1.0.0-next.25
  - @remirror/extension-events@1.0.0-next.25
  - @remirror/extension-gap-cursor@1.0.0-next.25
  - @remirror/extension-hard-break@1.0.0-next.25
  - @remirror/extension-heading@1.0.0-next.25
  - @remirror/extension-history@1.0.0-next.25
  - @remirror/extension-horizontal-rule@1.0.0-next.25
  - @remirror/extension-image@1.0.0-next.25
  - @remirror/extension-italic@1.0.0-next.25
  - @remirror/extension-mention@1.0.0-next.25
  - @remirror/extension-paragraph@1.0.0-next.25
  - @remirror/extension-placeholder@1.0.0-next.25
  - @remirror/extension-position-tracker@1.0.0-next.25
  - @remirror/extension-positioner@1.0.0-next.25
  - @remirror/extension-react-component@1.0.0-next.25
  - @remirror/extension-react-ssr@1.0.0-next.25
  - @remirror/extension-search@1.0.0-next.25
  - @remirror/extension-strike@1.0.0-next.25
  - @remirror/extension-text@1.0.0-next.25
  - @remirror/extension-trailing-node@1.0.0-next.25
  - @remirror/extension-underline@1.0.0-next.25
  - @remirror/extension-yjs@1.0.0-next.25
  - @remirror/preset-core@1.0.0-next.25
  - @remirror/extension-embed@1.0.0-next.25
  - @remirror/extension-list@1.0.0-next.25
  - @remirror/preset-react@1.0.0-next.25
  - @remirror/preset-social@1.0.0-next.25
  - @remirror/preset-table@1.0.0-next.25
  - @remirror/preset-wysiwyg@1.0.0-next.25
  - @remirror/react@1.0.0-next.25
  - @remirror/react-social@1.0.0-next.25
  - @remirror/react-wysiwyg@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
- Updated dependencies [387ab938]
  - @remirror/core@1.0.0-next.24
  - @remirror/extension-annotation@1.0.0-next.24
  - @remirror/dom@1.0.0-next.24
  - @remirror/extension-auto-link@1.0.0-next.24
  - @remirror/extension-bidi@1.0.0-next.24
  - @remirror/extension-blockquote@1.0.0-next.24
  - @remirror/extension-bold@1.0.0-next.24
  - @remirror/extension-code@1.0.0-next.24
  - @remirror/extension-code-block@1.0.0-next.24
  - @remirror/extension-collaboration@1.0.0-next.24
  - @remirror/extension-diff@1.0.0-next.24
  - @remirror/extension-doc@1.0.0-next.24
  - @remirror/extension-drop-cursor@1.0.0-next.24
  - @remirror/extension-emoji@1.0.0-next.24
  - @remirror/extension-epic-mode@1.0.0-next.24
  - @remirror/extension-events@1.0.0-next.24
  - @remirror/extension-gap-cursor@1.0.0-next.24
  - @remirror/extension-hard-break@1.0.0-next.24
  - @remirror/extension-heading@1.0.0-next.24
  - @remirror/extension-history@1.0.0-next.24
  - @remirror/extension-horizontal-rule@1.0.0-next.24
  - @remirror/extension-image@1.0.0-next.24
  - @remirror/extension-italic@1.0.0-next.24
  - @remirror/extension-link@1.0.0-next.24
  - @remirror/extension-mention@1.0.0-next.24
  - @remirror/extension-paragraph@1.0.0-next.24
  - @remirror/extension-placeholder@1.0.0-next.24
  - @remirror/extension-position-tracker@1.0.0-next.24
  - @remirror/extension-positioner@1.0.0-next.24
  - @remirror/extension-react-component@1.0.0-next.24
  - @remirror/extension-react-ssr@1.0.0-next.24
  - @remirror/extension-search@1.0.0-next.24
  - @remirror/extension-strike@1.0.0-next.24
  - @remirror/extension-text@1.0.0-next.24
  - @remirror/extension-trailing-node@1.0.0-next.24
  - @remirror/extension-underline@1.0.0-next.24
  - @remirror/extension-yjs@1.0.0-next.24
  - @remirror/preset-core@1.0.0-next.24
  - @remirror/extension-embed@1.0.0-next.24
  - @remirror/extension-list@1.0.0-next.24
  - @remirror/preset-react@1.0.0-next.24
  - @remirror/preset-social@1.0.0-next.24
  - @remirror/preset-table@1.0.0-next.24
  - @remirror/preset-wysiwyg@1.0.0-next.24
  - @remirror/react@1.0.0-next.24
  - @remirror/react-social@1.0.0-next.24
  - @remirror/react-wysiwyg@1.0.0-next.24

## 1.0.0-next.23

> 2020-08-18

### Patch Changes

- d505ebc1: Fixes #555 `onChange` callback not being updated when using a controlled editor in `StrictMode`.
- Updated dependencies [d505ebc1]
  - @remirror/react@1.0.0-next.23
  - @remirror/react-social@1.0.0-next.23
  - @remirror/react-wysiwyg@1.0.0-next.23

## 1.0.0-next.22

> 2020-08-17

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [8ccbd07b]
- Updated dependencies [45d82746]
- Updated dependencies [21c5807e]
- Updated dependencies [d300c5f0]
- Updated dependencies [f0377808]
  - @remirror/core@1.0.0-next.22
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/extension-hard-break@1.0.0-next.22
  - @remirror/core-types@1.0.0-next.22
  - @remirror/core-utils@1.0.0-next.22
  - @remirror/extension-bidi@1.0.0-next.22
  - @remirror/extension-link@1.0.0-next.22
  - @remirror/preset-wysiwyg@1.0.0-next.22
  - @remirror/react@1.0.0-next.22
  - @remirror/extension-positioner@1.0.0-next.22
  - @remirror/react-social@1.0.0-next.22
  - @remirror/extension-code-block@1.0.0-next.22
  - @remirror/dom@1.0.0-next.22
  - @remirror/extension-annotation@1.0.0-next.22
  - @remirror/extension-auto-link@1.0.0-next.22
  - @remirror/extension-blockquote@1.0.0-next.22
  - @remirror/extension-bold@1.0.0-next.22
  - @remirror/extension-code@1.0.0-next.22
  - @remirror/extension-collaboration@1.0.0-next.22
  - @remirror/extension-diff@1.0.0-next.22
  - @remirror/extension-doc@1.0.0-next.22
  - @remirror/extension-drop-cursor@1.0.0-next.22
  - @remirror/extension-emoji@1.0.0-next.22
  - @remirror/extension-epic-mode@1.0.0-next.22
  - @remirror/extension-events@1.0.0-next.22
  - @remirror/extension-gap-cursor@1.0.0-next.22
  - @remirror/extension-heading@1.0.0-next.22
  - @remirror/extension-history@1.0.0-next.22
  - @remirror/extension-horizontal-rule@1.0.0-next.22
  - @remirror/extension-image@1.0.0-next.22
  - @remirror/extension-italic@1.0.0-next.22
  - @remirror/extension-mention@1.0.0-next.22
  - @remirror/extension-paragraph@1.0.0-next.22
  - @remirror/extension-placeholder@1.0.0-next.22
  - @remirror/extension-position-tracker@1.0.0-next.22
  - @remirror/extension-react-component@1.0.0-next.22
  - @remirror/extension-react-ssr@1.0.0-next.22
  - @remirror/extension-search@1.0.0-next.22
  - @remirror/extension-strike@1.0.0-next.22
  - @remirror/extension-text@1.0.0-next.22
  - @remirror/extension-trailing-node@1.0.0-next.22
  - @remirror/extension-underline@1.0.0-next.22
  - @remirror/extension-yjs@1.0.0-next.22
  - @remirror/preset-core@1.0.0-next.22
  - @remirror/extension-embed@1.0.0-next.22
  - @remirror/extension-list@1.0.0-next.22
  - @remirror/preset-react@1.0.0-next.22
  - @remirror/preset-social@1.0.0-next.22
  - @remirror/preset-table@1.0.0-next.22
  - @remirror/react-wysiwyg@1.0.0-next.22
  - @remirror/core-helpers@1.0.0-next.22
  - @remirror/react-utils@1.0.0-next.22
  - @remirror/theme@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [8c34030e]
- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/extension-horizontal-rule@1.0.0-next.21
  - @remirror/core@1.0.0-next.21
  - @remirror/core-types@1.0.0-next.21
  - @remirror/core-utils@1.0.0-next.21
  - @remirror/extension-code@1.0.0-next.21
  - @remirror/extension-bold@1.0.0-next.21
  - @remirror/extension-italic@1.0.0-next.21
  - @remirror/extension-strike@1.0.0-next.21
  - @remirror/preset-wysiwyg@1.0.0-next.21
  - @remirror/dom@1.0.0-next.21
  - @remirror/extension-annotation@1.0.0-next.21
  - @remirror/extension-auto-link@1.0.0-next.21
  - @remirror/extension-bidi@1.0.0-next.21
  - @remirror/extension-blockquote@1.0.0-next.21
  - @remirror/extension-code-block@1.0.0-next.21
  - @remirror/extension-collaboration@1.0.0-next.21
  - @remirror/extension-diff@1.0.0-next.21
  - @remirror/extension-doc@1.0.0-next.21
  - @remirror/extension-drop-cursor@1.0.0-next.21
  - @remirror/extension-emoji@1.0.0-next.21
  - @remirror/extension-epic-mode@1.0.0-next.21
  - @remirror/extension-events@1.0.0-next.21
  - @remirror/extension-gap-cursor@1.0.0-next.21
  - @remirror/extension-hard-break@1.0.0-next.21
  - @remirror/extension-heading@1.0.0-next.21
  - @remirror/extension-history@1.0.0-next.21
  - @remirror/extension-image@1.0.0-next.21
  - @remirror/extension-link@1.0.0-next.21
  - @remirror/extension-mention@1.0.0-next.21
  - @remirror/extension-paragraph@1.0.0-next.21
  - @remirror/extension-placeholder@1.0.0-next.21
  - @remirror/extension-position-tracker@1.0.0-next.21
  - @remirror/extension-positioner@1.0.0-next.21
  - @remirror/extension-react-component@1.0.0-next.21
  - @remirror/extension-react-ssr@1.0.0-next.21
  - @remirror/extension-search@1.0.0-next.21
  - @remirror/extension-text@1.0.0-next.21
  - @remirror/extension-trailing-node@1.0.0-next.21
  - @remirror/extension-underline@1.0.0-next.21
  - @remirror/extension-yjs@1.0.0-next.21
  - @remirror/preset-core@1.0.0-next.21
  - @remirror/extension-embed@1.0.0-next.21
  - @remirror/extension-list@1.0.0-next.21
  - @remirror/preset-react@1.0.0-next.21
  - @remirror/preset-social@1.0.0-next.21
  - @remirror/preset-table@1.0.0-next.21
  - @remirror/react@1.0.0-next.21
  - @remirror/react-social@1.0.0-next.21
  - @remirror/react-wysiwyg@1.0.0-next.21
  - @remirror/core-helpers@1.0.0-next.21
  - @remirror/react-utils@1.0.0-next.21
  - @remirror/theme@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Major Changes

- 6d7edc85: Rename `areSchemaCompatible` to `areSchemasCompatible`.

### Minor Changes

- Fix the controlled editor when used in `StrictMode`.

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

- 7c603a5e: Ensure the `markInputRule` doesn't reactivate previous marks when rules are nested and activated consecutively.
- 48cce3a0: Remove misleading documentation. The matchOffset field isn't defaulted to zero for MentionExtension.
- Updated dependencies [95697fbd]
- Updated dependencies [6d7edc85]
- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
- Updated dependencies [7c603a5e]
- Updated dependencies [92653907]
  - @remirror/react@1.0.0-next.20
  - @remirror/core-utils@1.0.0-next.20
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20
  - @remirror/extension-code-block@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20
  - @remirror/react-social@1.0.0-next.20
  - @remirror/react-wysiwyg@1.0.0-next.20
  - @remirror/core@1.0.0-next.20
  - @remirror/react-utils@1.0.0-next.20
  - @remirror/theme@1.0.0-next.20
  - @remirror/preset-wysiwyg@1.0.0-next.20
  - @remirror/dom@1.0.0-next.20
  - @remirror/extension-annotation@1.0.0-next.20
  - @remirror/extension-auto-link@1.0.0-next.20
  - @remirror/extension-bidi@1.0.0-next.20
  - @remirror/extension-blockquote@1.0.0-next.20
  - @remirror/extension-bold@1.0.0-next.20
  - @remirror/extension-code@1.0.0-next.20
  - @remirror/extension-collaboration@1.0.0-next.20
  - @remirror/extension-diff@1.0.0-next.20
  - @remirror/extension-doc@1.0.0-next.20
  - @remirror/extension-drop-cursor@1.0.0-next.20
  - @remirror/extension-emoji@1.0.0-next.20
  - @remirror/extension-epic-mode@1.0.0-next.20
  - @remirror/extension-events@1.0.0-next.20
  - @remirror/extension-gap-cursor@1.0.0-next.20
  - @remirror/extension-hard-break@1.0.0-next.20
  - @remirror/extension-heading@1.0.0-next.20
  - @remirror/extension-history@1.0.0-next.20
  - @remirror/extension-horizontal-rule@1.0.0-next.20
  - @remirror/extension-image@1.0.0-next.20
  - @remirror/extension-italic@1.0.0-next.20
  - @remirror/extension-link@1.0.0-next.20
  - @remirror/extension-mention@1.0.0-next.20
  - @remirror/extension-paragraph@1.0.0-next.20
  - @remirror/extension-placeholder@1.0.0-next.20
  - @remirror/extension-position-tracker@1.0.0-next.20
  - @remirror/extension-positioner@1.0.0-next.20
  - @remirror/extension-react-component@1.0.0-next.20
  - @remirror/extension-react-ssr@1.0.0-next.20
  - @remirror/extension-search@1.0.0-next.20
  - @remirror/extension-strike@1.0.0-next.20
  - @remirror/extension-text@1.0.0-next.20
  - @remirror/extension-trailing-node@1.0.0-next.20
  - @remirror/extension-underline@1.0.0-next.20
  - @remirror/extension-yjs@1.0.0-next.20
  - @remirror/preset-core@1.0.0-next.20
  - @remirror/extension-embed@1.0.0-next.20
  - @remirror/extension-list@1.0.0-next.20
  - @remirror/preset-react@1.0.0-next.20
  - @remirror/preset-social@1.0.0-next.20
  - @remirror/preset-table@1.0.0-next.20

## 1.0.0-next.19

> 2020-08-04

### Patch Changes

- Updated dependencies [2db38fec]
  - @remirror/extension-annotation@1.0.0-next.19

## 1.0.0-next.18

> 2020-08-03

### Patch Changes

- 2059da35: Fix broken entry point `remirror/extension/annotation` from `remirror`.

## 1.0.0-next.17

> 2020-08-02

### Patch Changes

- 4498814f: Rename `UsePositionerHookReturn` and `UseMultiPositionerHookReturn` to `UsePositionerReturn` and `UseMultiPositionerReturn`.

  - Add `active: boolean` property to `UsePositionerHookReturn`.
  - Fix the floating emoji menu for the social editor and showcase. Now hidden when text selection spans multiple characters.

- 338746fa: Pin `@remirror/extension-annotation` version.
- 2d72ca94: Export `Positioner` as a value.

  - Enable creating a positioner from another positioner with `Positioner.fromPositioner`

  Closes #441

- Updated dependencies [4498814f]
- Updated dependencies [2d72ca94]
- Updated dependencies [898c62e0]
  - @remirror/react@1.0.0-next.17
  - @remirror/react-social@1.0.0-next.17
  - @remirror/extension-positioner@1.0.0-next.17
  - @remirror/core@1.0.0-next.17
  - @remirror/react-wysiwyg@1.0.0-next.17
  - @remirror/preset-core@1.0.0-next.17
  - @remirror/dom@1.0.0-next.17
  - @remirror/extension-annotation@1.0.0-next.17
  - @remirror/extension-auto-link@1.0.0-next.17
  - @remirror/extension-bidi@1.0.0-next.17
  - @remirror/extension-blockquote@1.0.0-next.17
  - @remirror/extension-bold@1.0.0-next.17
  - @remirror/extension-code@1.0.0-next.17
  - @remirror/extension-code-block@1.0.0-next.17
  - @remirror/extension-collaboration@1.0.0-next.17
  - @remirror/extension-diff@1.0.0-next.17
  - @remirror/extension-doc@1.0.0-next.17
  - @remirror/extension-drop-cursor@1.0.0-next.17
  - @remirror/extension-emoji@1.0.0-next.17
  - @remirror/extension-epic-mode@1.0.0-next.17
  - @remirror/extension-events@1.0.0-next.17
  - @remirror/extension-gap-cursor@1.0.0-next.17
  - @remirror/extension-hard-break@1.0.0-next.17
  - @remirror/extension-heading@1.0.0-next.17
  - @remirror/extension-history@1.0.0-next.17
  - @remirror/extension-horizontal-rule@1.0.0-next.17
  - @remirror/extension-image@1.0.0-next.17
  - @remirror/extension-italic@1.0.0-next.17
  - @remirror/extension-link@1.0.0-next.17
  - @remirror/extension-mention@1.0.0-next.17
  - @remirror/extension-paragraph@1.0.0-next.17
  - @remirror/extension-placeholder@1.0.0-next.17
  - @remirror/extension-position-tracker@1.0.0-next.17
  - @remirror/extension-react-component@1.0.0-next.17
  - @remirror/extension-react-ssr@1.0.0-next.17
  - @remirror/extension-search@1.0.0-next.17
  - @remirror/extension-strike@1.0.0-next.17
  - @remirror/extension-text@1.0.0-next.17
  - @remirror/extension-trailing-node@1.0.0-next.17
  - @remirror/extension-underline@1.0.0-next.17
  - @remirror/extension-yjs@1.0.0-next.17
  - @remirror/extension-embed@1.0.0-next.17
  - @remirror/extension-list@1.0.0-next.17
  - @remirror/preset-react@1.0.0-next.17
  - @remirror/preset-social@1.0.0-next.17
  - @remirror/preset-table@1.0.0-next.17
  - @remirror/preset-wysiwyg@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- e518ef1d: Rewrite the positioner extension with a new API for creating positioners.

  Positioners now return an array of `VirtualPositions` or an empty array if no positions extension.

  `@remirror/react` - Add `useMultiPositioner`. `@remirror/react` - Add `virtualNode` property for compatibility with `popper-react`

  An example of creating a new positioner with the new api is below.

  ```ts
  import { Coords, hasStateChanged, Positioner } from '@remirror/extension-positioner';

  export const cursorPopupPositioner = Positioner.create<Coords>({
    hasChanged: hasStateChanged,

    /**
     * Only active when the selection is empty (one character)
     */
    getActive: (parameter) => {
      const { state, view } = parameter;

      if (!state.selection.empty) {
        return [];
      }

      return [view.coordsAtPos(state.selection.from)];
    },

    getPosition(parameter) {
      const { element, data: cursor } = parameter;
      const parent = element.offsetParent;

      if (!parent) {
        return emptyVirtualPosition;
      }

      // The box in which the bubble menu is positioned, to use as an anchor
      const parentBox = parent.getBoundingClientRect();

      // The popup menu element
      const elementBox = element.getBoundingClientRect();

      const calculatedLeft = cursor.left - parentBox.left;
      const calculatedRight = parentBox.right - cursor.right;

      const bottom = Math.trunc(cursor.bottom - parentBox.top);
      const top = Math.trunc(cursor.top - parentBox.top);
      const rect = new DOMRect(cursor.left, cursor.top, 0, cursor.bottom - cursor.top);
      const left =
        calculatedLeft + elementBox.width > parentBox.width
          ? calculatedLeft - elementBox.width
          : calculatedLeft;
      const right =
        calculatedRight + elementBox.width > parentBox.width
          ? calculatedRight - elementBox.width
          : calculatedRight;

      return { rect, right, left, bottom, top };
    },
  });
  ```

- be9a9c17: Move all keymap functionality to `KeymapExtension` from `@remirror/core`. Remove all references to `@remirror/extension-base-keymap`.

### Minor Changes

- 206c1405: Extension to annotate content in your editor
- f032db7e: Remove `isEmptyParagraphNode` and `absoluteCoordinates` exports from `@remirror/core-utils`.
- 2592b7b3: Allow runtime updates of `PlaceholderExtension` `emptyNodeClass` option.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [206c1405]
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
- Updated dependencies [1918da2c]
- Updated dependencies [2592b7b3]
- Updated dependencies [720c9b43]
  - @remirror/preset-core@1.0.0-next.16
  - @remirror/preset-wysiwyg@1.0.0-next.16
  - @remirror/react@1.0.0-next.16
  - @remirror/react-social@1.0.0-next.16
  - @remirror/core-types@1.0.0-next.16
  - @remirror/react-wysiwyg@1.0.0-next.16
  - @remirror/extension-annotation@1.0.0-next.16
  - @remirror/core-utils@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/core-constants@1.0.0-next.16
  - @remirror/core-helpers@1.0.0-next.16
  - @remirror/dom@1.0.0-next.16
  - @remirror/extension-auto-link@1.0.0-next.16
  - @remirror/extension-bidi@1.0.0-next.16
  - @remirror/extension-blockquote@1.0.0-next.16
  - @remirror/extension-bold@1.0.0-next.16
  - @remirror/extension-code@1.0.0-next.16
  - @remirror/extension-code-block@1.0.0-next.16
  - @remirror/extension-collaboration@1.0.0-next.16
  - @remirror/extension-diff@1.0.0-next.16
  - @remirror/extension-doc@1.0.0-next.16
  - @remirror/extension-drop-cursor@1.0.0-next.16
  - @remirror/extension-emoji@1.0.0-next.16
  - @remirror/extension-epic-mode@1.0.0-next.16
  - @remirror/extension-events@1.0.0-next.16
  - @remirror/extension-gap-cursor@1.0.0-next.16
  - @remirror/extension-hard-break@1.0.0-next.16
  - @remirror/extension-heading@1.0.0-next.16
  - @remirror/extension-history@1.0.0-next.16
  - @remirror/extension-horizontal-rule@1.0.0-next.16
  - @remirror/extension-image@1.0.0-next.16
  - @remirror/extension-italic@1.0.0-next.16
  - @remirror/extension-link@1.0.0-next.16
  - @remirror/extension-mention@1.0.0-next.16
  - @remirror/extension-paragraph@1.0.0-next.16
  - @remirror/extension-placeholder@1.0.0-next.16
  - @remirror/extension-position-tracker@1.0.0-next.16
  - @remirror/extension-positioner@1.0.0-next.16
  - @remirror/extension-react-component@1.0.0-next.16
  - @remirror/extension-react-ssr@1.0.0-next.16
  - @remirror/extension-search@1.0.0-next.16
  - @remirror/extension-strike@1.0.0-next.16
  - @remirror/extension-text@1.0.0-next.16
  - @remirror/extension-trailing-node@1.0.0-next.16
  - @remirror/extension-underline@1.0.0-next.16
  - @remirror/extension-yjs@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - @remirror/extension-embed@1.0.0-next.16
  - @remirror/extension-list@1.0.0-next.16
  - @remirror/preset-react@1.0.0-next.16
  - @remirror/preset-social@1.0.0-next.16
  - @remirror/preset-table@1.0.0-next.16
  - @remirror/react-utils@1.0.0-next.16
  - @remirror/theme@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Major Changes

- cdc5b801: Add three new helpers to `@remirror/core-utils` / `@remirror/core`: `isStateEqual`, `areSchemaCompatible` and `getRemirrorJSON`.

  BREAKING: 💥 Rename `getObjectNode` to `getRemirrorJSON`.

- 0ff4fd5c: Default to inserting a new paragraph node after the `HorizontalRuleExtension`.

  BREAKING: 💥 Rename `horizonalRule` command to `insertHorizontalRule`.

  Add a new option `insertionNode` to the `HorizontalRuleExtension` which sets the default node to automatically append after insertion.

  Update the css styles for the default `hr` tag.

  Closes #417

### Minor Changes

- 44516da4: Support `chained` commands and multiple command updates in controlled editors.

  Fixes #418

- e5ea0c84: Add support for `Handler` options with custom return values and early returns.

  Previously handlers would ignore any return values. Now a handler will honour the return value. The earlyReturn value can be specified in the static options using the `extensionDecorator`. Currently it only supports primitives. Support for a function to check the return value will be added later.

- 08e51078: Add `insertHardBreak` command.

  Add inline documentation instructing developers to use the `TrailingNodeExtension` when using `hardBreak` to exit a `codeBlock`.

- f91dcab1: 🎉 New extension `@remirror/extension-events`.

  This extension adds handlers for the events happening within the remirror editor. The extension is part of the `CorePreset` but it doesn't make it's handlers available to the preset. In order to use the handlers you will need direct access to the `EventsExtension`.

  ```ts
  import { EventsExtension } from 'remirror/extension-events';
  import { useExtension } from '@remirror/react';

  const Editor = () => {
    useExtension(
      EventsExtension,
      ({ addHandler }) => {
        addHandler('focus', () => log('focused'));
      },
      [],
    );
  };
  ```

  To begin with the only events added are `focus` and `blur`.

### Patch Changes

- 0dd4d621: Prevent mid word emoji matches on colon press.
- 273d0a71: Hide social popups when the editor is blurred.
- 9d708c03: Reduce the `AutoLinkExtension` priority and remove priority override for the mention and emoji extensions.
- a404f5a1: Add the option `excludeExtensions` to `CorePreset`'s `constructor` to exclude any extensions.

  Remove the option `excludeHistory` from `CorePreset`'s `constructor`.

- e3d937f0: Support chaining for `setBold` and `removeBold` commands.
- 6c3b278b: Make sure the `transaction` has all the latest updates if changed between `onStateUpdate` events. This allows chaining to be supported properly.
- 7477b935: Use `NonChainableCommandFunction` annotation to indicate commands are not chainable.
- Updated dependencies [cdc5b801]
- Updated dependencies [0dd4d621]
- Updated dependencies [0ff4fd5c]
- Updated dependencies [273d0a71]
- Updated dependencies [44516da4]
- Updated dependencies [9d708c03]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [e3d937f0]
- Updated dependencies [6c3b278b]
- Updated dependencies [7477b935]
- Updated dependencies [08e51078]
- Updated dependencies [f91dcab1]
  - @remirror/core-utils@1.0.0-next.15
  - @remirror/core@1.0.0-next.15
  - @remirror/extension-emoji@1.0.0-next.15
  - @remirror/extension-horizontal-rule@1.0.0-next.15
  - @remirror/react-social@1.0.0-next.15
  - @remirror/extension-code@1.0.0-next.15
  - @remirror/extension-code-block@1.0.0-next.15
  - @remirror/extension-heading@1.0.0-next.15
  - @remirror/extension-italic@1.0.0-next.15
  - @remirror/extension-paragraph@1.0.0-next.15
  - @remirror/extension-strike@1.0.0-next.15
  - @remirror/extension-underline@1.0.0-next.15
  - @remirror/preset-social@1.0.0-next.15
  - @remirror/extension-bold@1.0.0-next.15
  - @remirror/extension-history@1.0.0-next.15
  - @remirror/extension-yjs@1.0.0-next.15
  - @remirror/extension-hard-break@1.0.0-next.15
  - @remirror/extension-events@1.0.0-next.15
  - @remirror/preset-core@1.0.0-next.15
  - @remirror/dom@1.0.0-next.15
  - @remirror/extension-auto-link@1.0.0-next.15
  - @remirror/extension-base-keymap@1.0.0-next.15
  - @remirror/extension-bidi@1.0.0-next.15
  - @remirror/extension-blockquote@1.0.0-next.15
  - @remirror/extension-collaboration@1.0.0-next.15
  - @remirror/extension-diff@1.0.0-next.15
  - @remirror/extension-doc@1.0.0-next.15
  - @remirror/extension-drop-cursor@1.0.0-next.15
  - @remirror/extension-epic-mode@1.0.0-next.15
  - @remirror/extension-gap-cursor@1.0.0-next.15
  - @remirror/extension-image@1.0.0-next.15
  - @remirror/extension-link@1.0.0-next.15
  - @remirror/extension-mention@1.0.0-next.15
  - @remirror/extension-placeholder@1.0.0-next.15
  - @remirror/extension-position-tracker@1.0.0-next.15
  - @remirror/extension-positioner@1.0.0-next.15
  - @remirror/extension-react-component@1.0.0-next.15
  - @remirror/extension-react-ssr@1.0.0-next.15
  - @remirror/extension-search@1.0.0-next.15
  - @remirror/extension-text@1.0.0-next.15
  - @remirror/extension-trailing-node@1.0.0-next.15
  - @remirror/extension-embed@1.0.0-next.15
  - @remirror/extension-list@1.0.0-next.15
  - @remirror/preset-react@1.0.0-next.15
  - @remirror/preset-table@1.0.0-next.15
  - @remirror/preset-wysiwyg@1.0.0-next.15
  - @remirror/react@1.0.0-next.15
  - @remirror/react-wysiwyg@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- 4030b506: For some reason `changesets` is not picking up updates to the depedencies of `remirror`.
- Updated dependencies [d877adb3]
- Updated dependencies [38941404]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [38941404]
- Updated dependencies [e45706e5]
- Updated dependencies [38941404]
- Updated dependencies [3fbb2325]
- Updated dependencies [02704d42]
- Updated dependencies [38941404]
- Updated dependencies [38941404]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13
  - @remirror/extension-auto-link@1.0.0-next.13
  - @remirror/extension-base-keymap@1.0.0-next.13
  - @remirror/extension-blockquote@1.0.0-next.13
  - @remirror/extension-bold@1.0.0-next.13
  - @remirror/extension-code@1.0.0-next.13
  - @remirror/extension-code-block@1.0.0-next.13
  - @remirror/extension-emoji@1.0.0-next.13
  - @remirror/extension-hard-break@1.0.0-next.13
  - @remirror/extension-heading@1.0.0-next.13
  - @remirror/extension-history@1.0.0-next.13
  - @remirror/extension-horizontal-rule@1.0.0-next.13
  - @remirror/extension-italic@1.0.0-next.13
  - @remirror/extension-link@1.0.0-next.13
  - @remirror/extension-mention@1.0.0-next.13
  - @remirror/extension-search@1.0.0-next.13
  - @remirror/extension-strike@1.0.0-next.13
  - @remirror/extension-underline@1.0.0-next.13
  - @remirror/extension-yjs@1.0.0-next.13
  - @remirror/extension-list@1.0.0-next.13
  - @remirror/extension-bidi@1.0.0-next.13
  - @remirror/extension-collaboration@1.0.0-next.13
  - @remirror/extension-diff@1.0.0-next.13
  - @remirror/extension-doc@1.0.0-next.13
  - @remirror/extension-drop-cursor@1.0.0-next.13
  - @remirror/extension-epic-mode@1.0.0-next.13
  - @remirror/extension-gap-cursor@1.0.0-next.13
  - @remirror/extension-image@1.0.0-next.13
  - @remirror/extension-paragraph@1.0.0-next.13
  - @remirror/extension-placeholder@1.0.0-next.13
  - @remirror/extension-position-tracker@1.0.0-next.13
  - @remirror/extension-positioner@1.0.0-next.13
  - @remirror/extension-react-component@1.0.0-next.13
  - @remirror/extension-react-ssr@1.0.0-next.13
  - @remirror/extension-text@1.0.0-next.13
  - @remirror/extension-trailing-node@1.0.0-next.13
  - @remirror/preset-core@1.0.0-next.13
  - @remirror/extension-embed@1.0.0-next.13
  - @remirror/preset-react@1.0.0-next.13
  - @remirror/preset-social@1.0.0-next.13
  - @remirror/preset-table@1.0.0-next.13
  - @remirror/preset-wysiwyg@1.0.0-next.13
  - @remirror/core-types@1.0.0-next.13
  - @remirror/react@1.0.0-next.13
  - @remirror/core-constants@1.0.0-next.13
  - @remirror/core-helpers@1.0.0-next.13
  - @remirror/dom@1.0.0-next.13
  - @remirror/react-social@1.0.0-next.13
  - @remirror/react-wysiwyg@1.0.0-next.13

## 1.0.0-next.10

> 2020-07-26

### Minor Changes

- 65efac96: Add entrypoint for `remirror/react/renderers`.

### Patch Changes

- Updated dependencies [6468058a]
- Updated dependencies [76d1df83]
- Updated dependencies [3702a83a]
- Updated dependencies [e554ce8c]
- Updated dependencies [5539bc32]
- Updated dependencies [16a683f3]
  - @remirror/core@1.0.0-next.10
  - @remirror/react@1.0.0-next.10
  - @remirror/preset-core@1.0.0-next.10
  - @remirror/extension-react-component@1.0.0-next.10
  - @remirror/extension-react-ssr@1.0.0-next.10
  - @remirror/preset-wysiwyg@1.0.0-next.10
  - @remirror/react-social@1.0.0-next.10
  - @remirror/dom@1.0.0-next.10
  - @remirror/extension-auto-link@1.0.0-next.10
  - @remirror/extension-base-keymap@1.0.0-next.10
  - @remirror/extension-bidi@1.0.0-next.10
  - @remirror/extension-blockquote@1.0.0-next.10
  - @remirror/extension-bold@1.0.0-next.10
  - @remirror/extension-code@1.0.0-next.10
  - @remirror/extension-code-block@1.0.0-next.10
  - @remirror/extension-collaboration@1.0.0-next.10
  - @remirror/extension-diff@1.0.0-next.10
  - @remirror/extension-doc@1.0.0-next.10
  - @remirror/extension-drop-cursor@1.0.0-next.10
  - @remirror/extension-emoji@1.0.0-next.10
  - @remirror/extension-epic-mode@1.0.0-next.10
  - @remirror/extension-gap-cursor@1.0.0-next.10
  - @remirror/extension-hard-break@1.0.0-next.10
  - @remirror/extension-heading@1.0.0-next.10
  - @remirror/extension-history@1.0.0-next.10
  - @remirror/extension-horizontal-rule@1.0.0-next.10
  - @remirror/extension-image@1.0.0-next.10
  - @remirror/extension-italic@1.0.0-next.10
  - @remirror/extension-link@1.0.0-next.10
  - @remirror/extension-mention@1.0.0-next.10
  - @remirror/extension-paragraph@1.0.0-next.10
  - @remirror/extension-placeholder@1.0.0-next.10
  - @remirror/extension-position-tracker@1.0.0-next.10
  - @remirror/extension-positioner@1.0.0-next.10
  - @remirror/extension-search@1.0.0-next.10
  - @remirror/extension-strike@1.0.0-next.10
  - @remirror/extension-text@1.0.0-next.10
  - @remirror/extension-trailing-node@1.0.0-next.10
  - @remirror/extension-underline@1.0.0-next.10
  - @remirror/extension-yjs@1.0.0-next.10
  - @remirror/extension-embed@1.0.0-next.10
  - @remirror/extension-list@1.0.0-next.10
  - @remirror/preset-react@1.0.0-next.10
  - @remirror/preset-social@1.0.0-next.10
  - @remirror/preset-table@1.0.0-next.10
  - @remirror/react-wysiwyg@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Patch Changes

- 02fdafff: - Rename `change` event to `updated`. `updated` is called with the `EventListenerParameter`.

  - Add new manager `stateUpdate` to the `editorWrapper`
  - Add `autoUpdate` option to `useRemirror` hook from `@remirror/react` which means that the context object returned by the hook is always up to date with the latest editor state. It will also cause the component to rerender so be careful to only use it when necessary.

  ```tsx
  import React from 'react';

  const Editor = () => {
    const { active, commands } = useRemirror({ autoUpdate: true });

    return (
      <button
        onClick={() => commands.toggleBold}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
      >
        B
      </button>
    );
  };
  ```

  - Fix broken `onChangeHandler` parameter for the use `useRemirror` hook.

- b332942b: Fix broken SSR and add unit tests back.
- Updated dependencies [02fdafff]
- Updated dependencies [b332942b]
  - @remirror/react@1.0.0-next.9
  - @remirror/core@1.0.0-next.9
  - @remirror/dom@1.0.0-next.9
  - @remirror/react-social@1.0.0-next.9
  - @remirror/react-wysiwyg@1.0.0-next.9
  - @remirror/extension-auto-link@1.0.0-next.9
  - @remirror/extension-base-keymap@1.0.0-next.9
  - @remirror/extension-bidi@1.0.0-next.9
  - @remirror/extension-blockquote@1.0.0-next.9
  - @remirror/extension-bold@1.0.0-next.9
  - @remirror/extension-code@1.0.0-next.9
  - @remirror/extension-code-block@1.0.0-next.9
  - @remirror/extension-collaboration@1.0.0-next.9
  - @remirror/extension-diff@1.0.0-next.9
  - @remirror/extension-doc@1.0.0-next.9
  - @remirror/extension-drop-cursor@1.0.0-next.9
  - @remirror/extension-emoji@1.0.0-next.9
  - @remirror/extension-epic-mode@1.0.0-next.9
  - @remirror/extension-gap-cursor@1.0.0-next.9
  - @remirror/extension-hard-break@1.0.0-next.9
  - @remirror/extension-heading@1.0.0-next.9
  - @remirror/extension-history@1.0.0-next.9
  - @remirror/extension-horizontal-rule@1.0.0-next.9
  - @remirror/extension-image@1.0.0-next.9
  - @remirror/extension-italic@1.0.0-next.9
  - @remirror/extension-link@1.0.0-next.9
  - @remirror/extension-mention@1.0.0-next.9
  - @remirror/extension-paragraph@1.0.0-next.9
  - @remirror/extension-placeholder@1.0.0-next.9
  - @remirror/extension-position-tracker@1.0.0-next.9
  - @remirror/extension-positioner@1.0.0-next.9
  - @remirror/extension-react-component@1.0.0-next.9
  - @remirror/extension-react-ssr@1.0.0-next.9
  - @remirror/extension-search@1.0.0-next.9
  - @remirror/extension-strike@1.0.0-next.9
  - @remirror/extension-text@1.0.0-next.9
  - @remirror/extension-trailing-node@1.0.0-next.9
  - @remirror/extension-underline@1.0.0-next.9
  - @remirror/extension-yjs@1.0.0-next.9
  - @remirror/preset-core@1.0.0-next.9
  - @remirror/extension-embed@1.0.0-next.9
  - @remirror/extension-list@1.0.0-next.9
  - @remirror/preset-react@1.0.0-next.9
  - @remirror/preset-social@1.0.0-next.9
  - @remirror/preset-table@1.0.0-next.9
  - @remirror/preset-wysiwyg@1.0.0-next.9

## 1.0.0-next.5

> 2020-07-17

### Patch Changes

- d186b75a: Correct the incorrect `remirror/react/ssr` and `remirror/react/component` exports. They were incorrectly referencing each other.
- Updated dependencies [4628d342]
- Updated dependencies [e9286ed9]
  - @remirror/react@1.0.0-next.5
  - @remirror/extension-paragraph@1.0.0-next.5
  - @remirror/react-social@1.0.0-next.5
  - @remirror/react-wysiwyg@1.0.0-next.5

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [e1a1b6ec]
- Updated dependencies [9f495078]
- Updated dependencies [2d74596b]
- Updated dependencies [5d5970ae]
- Updated dependencies [64edeec2]
  - @remirror/core@1.0.0-next.4
  - @remirror/react@1.0.0-next.4
  - @remirror/preset-table@1.0.0-next.4
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/core-utils@1.0.0-next.4
  - @remirror/dom@1.0.0-next.4
  - @remirror/extension-auto-link@1.0.0-next.4
  - @remirror/extension-base-keymap@1.0.0-next.4
  - @remirror/extension-bidi@1.0.0-next.4
  - @remirror/extension-blockquote@1.0.0-next.4
  - @remirror/extension-bold@1.0.0-next.4
  - @remirror/extension-code@1.0.0-next.4
  - @remirror/extension-code-block@1.0.0-next.4
  - @remirror/extension-collaboration@1.0.0-next.4
  - @remirror/extension-diff@1.0.0-next.4
  - @remirror/extension-doc@1.0.0-next.4
  - @remirror/extension-drop-cursor@1.0.0-next.4
  - @remirror/extension-emoji@1.0.0-next.4
  - @remirror/extension-epic-mode@1.0.0-next.4
  - @remirror/extension-gap-cursor@1.0.0-next.4
  - @remirror/extension-hard-break@1.0.0-next.4
  - @remirror/extension-heading@1.0.0-next.4
  - @remirror/extension-history@1.0.0-next.4
  - @remirror/extension-horizontal-rule@1.0.0-next.4
  - @remirror/extension-image@1.0.0-next.4
  - @remirror/extension-italic@1.0.0-next.4
  - @remirror/extension-link@1.0.0-next.4
  - @remirror/extension-mention@1.0.0-next.4
  - @remirror/extension-paragraph@1.0.0-next.4
  - @remirror/extension-placeholder@1.0.0-next.4
  - @remirror/extension-position-tracker@1.0.0-next.4
  - @remirror/extension-positioner@1.0.0-next.4
  - @remirror/extension-react-ssr@1.0.0-next.4
  - @remirror/extension-search@1.0.0-next.4
  - @remirror/extension-strike@1.0.0-next.4
  - @remirror/extension-text@1.0.0-next.4
  - @remirror/extension-trailing-node@1.0.0-next.4
  - @remirror/extension-underline@1.0.0-next.4
  - @remirror/extension-yjs@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - @remirror/preset-core@1.0.0-next.4
  - @remirror/extension-embed@1.0.0-next.4
  - @remirror/extension-list@1.0.0-next.4
  - @remirror/preset-react@1.0.0-next.4
  - @remirror/preset-social@1.0.0-next.4
  - @remirror/preset-wysiwyg@1.0.0-next.4
  - @remirror/react-social@1.0.0-next.4
  - @remirror/react-utils@1.0.0-next.4
  - @remirror/react-wysiwyg@1.0.0-next.4
  - @remirror/theme@1.0.0-next.4
  - @remirror/extension-react-component@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3
  - @remirror/core-types@1.0.0-next.3
  - @remirror/core-utils@1.0.0-next.3
  - @remirror/dom@1.0.0-next.3
  - @remirror/extension-auto-link@1.0.0-next.3
  - @remirror/extension-base-keymap@1.0.0-next.3
  - @remirror/extension-bidi@1.0.0-next.3
  - @remirror/extension-blockquote@1.0.0-next.3
  - @remirror/extension-bold@1.0.0-next.3
  - @remirror/extension-code@1.0.0-next.3
  - @remirror/extension-code-block@1.0.0-next.3
  - @remirror/extension-collaboration@1.0.0-next.3
  - @remirror/extension-diff@1.0.0-next.3
  - @remirror/extension-doc@1.0.0-next.3
  - @remirror/extension-drop-cursor@1.0.0-next.3
  - @remirror/extension-emoji@1.0.0-next.3
  - @remirror/extension-epic-mode@1.0.0-next.3
  - @remirror/extension-gap-cursor@1.0.0-next.3
  - @remirror/extension-hard-break@1.0.0-next.3
  - @remirror/extension-heading@1.0.0-next.3
  - @remirror/extension-history@1.0.0-next.3
  - @remirror/extension-horizontal-rule@1.0.0-next.3
  - @remirror/extension-image@1.0.0-next.3
  - @remirror/extension-italic@1.0.0-next.3
  - @remirror/extension-link@1.0.0-next.3
  - @remirror/extension-mention@1.0.0-next.3
  - @remirror/extension-paragraph@1.0.0-next.3
  - @remirror/extension-placeholder@1.0.0-next.3
  - @remirror/extension-position-tracker@1.0.0-next.3
  - @remirror/extension-positioner@1.0.0-next.3
  - @remirror/extension-react-ssr@1.0.0-next.3
  - @remirror/extension-search@1.0.0-next.3
  - @remirror/extension-strike@1.0.0-next.3
  - @remirror/extension-text@1.0.0-next.3
  - @remirror/extension-trailing-node@1.0.0-next.3
  - @remirror/extension-underline@1.0.0-next.3
  - @remirror/extension-yjs@1.0.0-next.3
  - @remirror/preset-core@1.0.0-next.3
  - @remirror/extension-embed@1.0.0-next.3
  - @remirror/extension-list@1.0.0-next.3
  - @remirror/preset-react@1.0.0-next.3
  - @remirror/preset-social@1.0.0-next.3
  - @remirror/preset-table@1.0.0-next.3
  - @remirror/preset-wysiwyg@1.0.0-next.3
  - @remirror/react@1.0.0-next.3
  - @remirror/react-social@1.0.0-next.3
  - @remirror/react-wysiwyg@1.0.0-next.3

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - @remirror/core-utils@1.0.0-next.1
  - @remirror/dom@1.0.0-next.1
  - @remirror/extension-auto-link@1.0.0-next.1
  - @remirror/extension-base-keymap@1.0.0-next.1
  - @remirror/extension-bidi@1.0.0-next.1
  - @remirror/extension-blockquote@1.0.0-next.1
  - @remirror/extension-bold@1.0.0-next.1
  - @remirror/extension-code@1.0.0-next.1
  - @remirror/extension-code-block@1.0.0-next.1
  - @remirror/extension-collaboration@1.0.0-next.1
  - @remirror/extension-diff@1.0.0-next.1
  - @remirror/extension-doc@1.0.0-next.1
  - @remirror/extension-drop-cursor@1.0.0-next.1
  - @remirror/extension-emoji@1.0.0-next.1
  - @remirror/extension-epic-mode@1.0.0-next.1
  - @remirror/extension-gap-cursor@1.0.0-next.1
  - @remirror/extension-hard-break@1.0.0-next.1
  - @remirror/extension-heading@1.0.0-next.1
  - @remirror/extension-history@1.0.0-next.1
  - @remirror/extension-horizontal-rule@1.0.0-next.1
  - @remirror/extension-image@1.0.0-next.1
  - @remirror/extension-italic@1.0.0-next.1
  - @remirror/extension-link@1.0.0-next.1
  - @remirror/extension-mention@1.0.0-next.1
  - @remirror/extension-paragraph@1.0.0-next.1
  - @remirror/extension-placeholder@1.0.0-next.1
  - @remirror/extension-position-tracker@1.0.0-next.1
  - @remirror/extension-positioner@1.0.0-next.1
  - @remirror/extension-react-ssr@1.0.0-next.1
  - @remirror/extension-search@1.0.0-next.1
  - @remirror/extension-strike@1.0.0-next.1
  - @remirror/extension-text@1.0.0-next.1
  - @remirror/extension-trailing-node@1.0.0-next.1
  - @remirror/extension-underline@1.0.0-next.1
  - @remirror/extension-yjs@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - @remirror/preset-core@1.0.0-next.1
  - @remirror/extension-embed@1.0.0-next.1
  - @remirror/extension-list@1.0.0-next.1
  - @remirror/preset-react@1.0.0-next.1
  - @remirror/preset-social@1.0.0-next.1
  - @remirror/preset-table@1.0.0-next.1
  - @remirror/preset-wysiwyg@1.0.0-next.1
  - @remirror/react@1.0.0-next.1
  - @remirror/react-social@1.0.0-next.1
  - @remirror/react-utils@1.0.0-next.1
  - @remirror/react-wysiwyg@1.0.0-next.1
  - @remirror/theme@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.

### Minor Changes

- 8334294e: Make `react`, `react-dom` and their `@type` counterparts optional peer depedencies. This means users will no longer receive a warning if they install the package without react.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
- Updated dependencies [141c7864]
  - @remirror/core@1.0.0-next.0
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/core-utils@1.0.0-next.0
  - @remirror/dom@1.0.0-next.0
  - @remirror/extension-auto-link@1.0.0-next.0
  - @remirror/extension-base-keymap@1.0.0-next.0
  - @remirror/extension-bidi@1.0.0-next.0
  - @remirror/extension-blockquote@1.0.0-next.0
  - @remirror/extension-bold@1.0.0-next.0
  - @remirror/extension-code@1.0.0-next.0
  - @remirror/extension-code-block@1.0.0-next.0
  - @remirror/extension-collaboration@1.0.0-next.0
  - @remirror/extension-diff@1.0.0-next.0
  - @remirror/extension-doc@1.0.0-next.0
  - @remirror/extension-drop-cursor@1.0.0-next.0
  - @remirror/extension-emoji@1.0.0-next.0
  - @remirror/extension-epic-mode@1.0.0-next.0
  - @remirror/extension-gap-cursor@1.0.0-next.0
  - @remirror/extension-hard-break@1.0.0-next.0
  - @remirror/extension-heading@1.0.0-next.0
  - @remirror/extension-history@1.0.0-next.0
  - @remirror/extension-horizontal-rule@1.0.0-next.0
  - @remirror/extension-image@1.0.0-next.0
  - @remirror/extension-italic@1.0.0-next.0
  - @remirror/extension-link@1.0.0-next.0
  - @remirror/extension-mention@1.0.0-next.0
  - @remirror/extension-paragraph@1.0.0-next.0
  - @remirror/extension-placeholder@1.0.0-next.0
  - @remirror/extension-position-tracker@1.0.0-next.0
  - @remirror/extension-positioner@1.0.0-next.0
  - @remirror/extension-react-ssr@1.0.0-next.0
  - @remirror/extension-search@1.0.0-next.0
  - @remirror/extension-strike@1.0.0-next.0
  - @remirror/extension-text@1.0.0-next.0
  - @remirror/extension-trailing-node@1.0.0-next.0
  - @remirror/extension-underline@1.0.0-next.0
  - @remirror/extension-yjs@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - @remirror/preset-core@1.0.0-next.0
  - @remirror/extension-embed@1.0.0-next.0
  - @remirror/extension-list@1.0.0-next.0
  - @remirror/preset-react@1.0.0-next.0
  - @remirror/preset-social@1.0.0-next.0
  - @remirror/preset-table@1.0.0-next.0
  - @remirror/preset-wysiwyg@1.0.0-next.0
  - @remirror/react@1.0.0-next.0
  - @remirror/react-social@1.0.0-next.0
  - @remirror/react-utils@1.0.0-next.0
  - @remirror/react-wysiwyg@1.0.0-next.0
  - @remirror/theme@1.0.0-next.0

## 0.13.1

### Patch Changes

- Updated dependencies [4dbb7461]
  - @remirror/core-extensions@0.13.1
  - @remirror/react@0.13.1

## 0.11.0

### Patch Changes

- Updated dependencies [026d4238]
- Updated dependencies [69d00c62]
- Updated dependencies [c2237aa0]
  - @remirror/react@0.11.0
  - @remirror/core@0.11.0
  - @remirror/core-extensions@0.11.0

## 0.7.6

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/core-extensions@0.7.6
  - @remirror/react@0.7.7

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - @remirror/core-extensions@0.7.5
  - @remirror/react@0.7.6

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [10419145]
- Updated dependencies [7380e18f]
  - @remirror/core-extensions@0.7.4
  - @remirror/core@0.7.4
  - @remirror/react@0.7.5

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/core-extensions@0.7.3
  - @remirror/react@0.7.3
