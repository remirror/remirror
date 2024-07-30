---
'@remirror/extension-positioner': patch
'@remirror/react-ui': patch
'@remirror/styles': patch
'@remirror/theme': patch
'remirror': patch
---

## 💥 BREAKING CHANGES! 💥

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

## Feedback

As always, we value your feedback on how we can improve Remirror. Please raise your proposals via [issues on GitHub](https://github.com/remirror/remirror/issues) or via our [Discord server](https://remirror.io/chat).
