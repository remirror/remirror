import React from 'react';
import css from 'refractor/lang/css.js';
import javascript from 'refractor/lang/javascript.js';
import json from 'refractor/lang/json.js';
import markdown from 'refractor/lang/markdown.js';
import typescript from 'refractor/lang/typescript.js';
import { CodeBlockExtension } from 'remirror/extensions';
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
<pre><code data-code-block-language="markdown">Hello _world_, **Markdown**</code></pre>
<pre><code data-code-block-language="css">.hello-world-css {
  color: red;
}</code></pre>
<pre><code data-code-block-language="json">{
  "hello-world": "JSON"
}</code></pre>
`;

const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender />
    </ThemeProvider>
  );
};

export default Basic;
