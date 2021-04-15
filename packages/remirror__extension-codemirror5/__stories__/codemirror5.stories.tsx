import 'codemirror/mode/meta'; // This must be imported.
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/nord.css';

import CodeMirror from 'codemirror';
import { CodeMirrorExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

export default { title: 'Codemirror5 extension' };

export const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender />
    </ThemeProvider>
  );
};

Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};

const extensions = () => [
  new CodeMirrorExtension({
    CodeMirror,
    defaultCodeMirrorConfig: { theme: 'nord', lineNumbers: true },
  }),
];

const content =
  `<p>Below is a CodeMirror 5 Editor</p>` +
  `<pre><code>log('hello world!!')</code></pre>` +
  `<p>Above is a CodeMirror 5 Editor</p>`;
