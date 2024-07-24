---
'@remirror/react-ui': patch
---

## 💥 BREAKING CHANGES! 💥

The `CodeBlockLanguageSelect` component has been refactored (again) to reside inside a more general `CodeBlockTools` component. A new format button component has been added alongside language select. These tools can be enabled independently or at the same time:

```tsx
<CodeBlockTools
  enableFormatButton={true/undefined}
  formatButtonOptions={{...}}
  enableLanguageSelect={true/undefined}
  languageSelectOptions={{...}}
/>
```

TODO: Update `tender-bears-repeat.md` since this would break that breaking change.

TODO: Add more complete migration and usage instructions here (replace most of what's below).

For the new format tool, you can supply your own formatter or use the default formatter from `@remirror/extension-code-block/formatter` which is based on Prettier.

### Usage example 1: Use the formatter extension

```tsx
import React from 'react';
import json from 'refractor/lang/json.js';
import typescript from 'refractor/lang/typescript.js';
import { CodeBlockExtension } from 'remirror/extensions';
import { formatter } from '@remirror/extension-code-block/formatter';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { CodeBlockTools } from '@remirror/react-ui';

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
        <CodeBlockTools enableFormatButton />
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
import { CodeBlockTools } from '@remirror/react-ui';

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
        <CodeBlockTools enableFormatButton />
      </Remirror>
    </ThemeProvider>
  );
}
```
