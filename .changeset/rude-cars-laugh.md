---
'@remirror/extension-code-block': patch
'@remirror/react-ui': patch
'remirror': patch
---

## 💥 BREAKING CHANGES! 💥

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
  const { manager, state } = useRemirror({ extensions, content: '', stringHandler: 'html' });

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
    formatter: myCustomFormatter,
  }),
];

export default function FormatterCodeBlock(): JSX.Element {
  const { manager, state } = useRemirror({ extensions, content: '', stringHandler: 'html' });

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
