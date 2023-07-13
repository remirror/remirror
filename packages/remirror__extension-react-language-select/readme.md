# @remirror/extension-react-language-select

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-react-language-select
[npm]: https://npmjs.com/package/@remirror/extension-react-language-select
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-react-language-select
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-react-language-select
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-react-language-select/red?icon=npm

A floating language select dropdown for the code block extension

## Installation

```bash
# yarn
yarn add @remirror/extension-react-language-select

# pnpm
pnpm add @remirror/extension-react-language-select

# npm
npm install @remirror/extension-react-language-select
```

## Usage

The following code creates an instance of this extension.


```tsx
import React from 'react';
import css from 'refractor/lang/css.js';
import javascript from 'refractor/lang/javascript.js';
import json from 'refractor/lang/json.js';
import markdown from 'refractor/lang/markdown.js';
import typescript from 'refractor/lang/typescript.js';
import { cx } from 'remirror';
import { CodeBlockExtension } from 'remirror/extensions';
import { CodeBlockLanguageSelect } from '@remirror/extension-react-language-select';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

const extensions = () => [
  new CodeBlockExtension({
    // optionally add spacing for select element
    extraAttributes: { style: 'padding: 2em 1em;' },
    supportedLanguages: [css, javascript, json, markdown, typescript],
  }),
];

const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content: '', stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <CodeBlockLanguageSelect
          // offset for the positioner
          offset={{ x: 5, y: 5 }}
          selectClassName={cx(
            ExtensionCodeBlockTheme.LANGUAGE_SELECT_POSITIONER,
            ExtensionCodeBlockTheme.LANGUAGE_SELECT_WIDTH,
          )}
        />
      </Remirror>
    </ThemeProvider>
  );
};
```
