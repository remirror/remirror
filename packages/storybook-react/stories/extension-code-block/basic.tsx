import javascript from 'refractor/lang/javascript';
import typescript from 'refractor/lang/typescript';
import { CodeBlockExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [
  new CodeBlockExtension({
    supportedLanguages: [javascript, typescript],
  }),
];

const content = `<pre><code data-code-block-language="typescript">function sayHello{
  console.log('hello world!')
}</code></pre>
`;

export const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender />
    </ThemeProvider>
  );
};
