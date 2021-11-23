import { CodeMirror6Extension } from '@remirror/extension-codemirror6';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new CodeMirror6Extension()];

const content = `<pre><code>log('hello world!!')</code></pre>`;

const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender />
    </ThemeProvider>
  );
};

export default Basic;
