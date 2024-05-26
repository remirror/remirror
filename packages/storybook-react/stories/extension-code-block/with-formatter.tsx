import React from 'react';
import css from 'refractor/lang/css.js';
import json from 'refractor/lang/json.js';
import markdown from 'refractor/lang/markdown.js';
import typescript from 'refractor/lang/typescript.js';
import { cx } from 'remirror';
import { CodeBlockExtension } from 'remirror/extensions';
import { formatter } from '@remirror/extension-code-block/formatter';
import { CodeBlockFormatCode } from '@remirror/extension-react-format-code';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

const extensions = () => [
  new CodeBlockExtension({
    supportedLanguages: [css, json, markdown, typescript],
    formatter,
  }),
];

const content = `
<pre><code data-code-block-language="typescript">function
  sayHello(   )
   {
console.log('Hello world, TypeScript!')
            }</code></pre>
<pre><code data-code-block-language="markdown">**Markdown**
-   Hello
- _world_
</code></pre>
<pre><code data-code-block-language="css">.hello-world-css{color:red;}</code></pre>
<pre><code data-code-block-language="json">{
"JSON":true,"hello":"world"}</code></pre>
`;

const WithFormatter = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <CodeBlockFormatCode
          offset={{ x: 5, y: 5 }}
          className={cx(ExtensionCodeBlockTheme.FORMAT_CODE_POSITIONER)}
        />
      </Remirror>
    </ThemeProvider>
  );
};

export default WithFormatter;
