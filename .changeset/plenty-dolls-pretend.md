---
'@remirror/react-ui': patch
---

## Updates

A new code block formatting component has been added to `@remirror/react-ui`. This component renders a MUI `Button` in code blocks that can be clicked to automatically format code in the block. You have the option of supplying your own formatter or using the default formatter supplied by `@remirror/extension-code-block/formatter` which is based on Prettier.

### Usage example 1: Use the formatter extension

```tsx
import React from 'react';
import json from 'refractor/lang/json.js';
import typescript from 'refractor/lang/typescript.js';
import { CodeBlockExtension } from 'remirror/extensions';
import { formatter } from '@remirror/extension-code-block/formatter';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { CodeBlockFormatCode } from '@remirror/react-ui';

const extensions = () => [
  new CodeBlockExtension({
    supportedLanguages: [json, typescript],
    formatter,
  }),
];

export default function FormatterCodeBlock(): JSX.Element {
  const { manager, state } = useRemirror({ extensions, content: '', stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <CodeBlockFormatCode />
      </Remirror>
    </ThemeProvider>
  );
}
```

### Usage example 2: Supply your own formatter

```tsx
import { formatWithCursor } from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import React from 'react';
import json from 'refractor/lang/json.js';
import typescript from 'refractor/lang/typescript.js';
import type { CodeBlockFormatter } from 'remirror/extensions';
import { CodeBlockExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { CodeBlockFormatCode } from '@remirror/react-ui';

const formatter: CodeBlockFormatter = ({ source, language, cursorOffset }) => {
  const parser = language === 'typescript' ? 'babel-ts' : language === 'json' ? 'json' : undefined;

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

export default function FormatterCodeBlock(): JSX.Element {
  const { manager, state } = useRemirror({ extensions, content: '', stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <CodeBlockFormatCode />
      </Remirror>
    </ThemeProvider>
  );
}
```
