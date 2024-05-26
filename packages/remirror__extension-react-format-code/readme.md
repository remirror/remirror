# @remirror/extension-react-format-code

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-react-format-code
[npm]: https://npmjs.com/package/@remirror/extension-react-format-code
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-react-format-code
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-react-format-code
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-react-format-code/red?icon=npm

A React floating language select dropdown component for the code block extension.

## Installation

```bash
# yarn
yarn add @remirror/extension-react-format-code

# pnpm
pnpm add @remirror/extension-react-format-code

# npm
npm install @remirror/extension-react-format-code
```

## Formatter

You are responsible for supplying a formatter. The code block extension includes a formatter using the default options of prettier. It can be imported from `@remirror/extension-code-block/formatter`. Alternatively, define your own formatter adhering to the `CodeBlockFormatter` interface, defined in [packages/remirror\_\_extension-code-block/src/code-block-types.ts](https://github.com/remirror/remirror/blob/main/packages/remirror__extension-code-block/src/code-block-types.ts).

## Usage

The following code creates an instance of this extension.

### Option 1: Use the formatter extension

```tsx
import React from 'react';
import json from 'refractor/lang/json.js';
import typescript from 'refractor/lang/typescript.js';
import { cx } from 'remirror';
import { CodeBlockExtension } from 'remirror/extensions';
import { formatter } from '@remirror/extension-code-block/formatter';
import { CodeBlockFormatCode } from '@remirror/extension-react-format-code';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

const extensions = () => [
  new CodeBlockExtension({
    supportedLanguages: [json, typescript],
    formatter,
  }),
];

const FormatterCodeBlock = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content: '', stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <CodeBlockFormatCode
          // offset for the positioner
          offset={{ x: 5, y: 5 }}
          className={cx(ExtensionCodeBlockTheme.FORMAT_CODE_POSITIONER)}
        />
      </Remirror>
    </ThemeProvider>
  );
};
```

### Option 2: Supply your own formatter

```tsx
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import { formatWithCursor } from 'prettier/standalone';
import React from 'react';
import json from 'refractor/lang/json.js';
import typescript from 'refractor/lang/typescript.js';
import { cx } from 'remirror';
import type { CodeBlockFormatter } from 'remirror/extensions';
import { CodeBlockExtension } from 'remirror/extensions';
import { CodeBlockFormatCode } from '@remirror/extension-react-format-code';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

const formatter: CodeBlockFormatter = ({ source, language, cursorOffset }) => {
  const parser = ['json', 'typescript'].includes(language) ? 'babel-ts' : undefined;

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
    formatter,
  }),
];

const FormatterCodeBlock = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content: '', stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <CodeBlockFormatCode
          // offset for the positioner
          offset={{ x: 5, y: 5 }}
          className={cx(ExtensionCodeBlockTheme.FORMAT_CODE_POSITIONER)}
        />
      </Remirror>
    </ThemeProvider>
  );
};
```
