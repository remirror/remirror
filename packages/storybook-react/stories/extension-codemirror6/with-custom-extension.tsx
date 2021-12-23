import { EditorView as CodeMirrorEditorView } from '@codemirror/view';
import { CodeMirror6Extension } from '@remirror/extension-codemirror6';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const myTheme = CodeMirrorEditorView.theme(
  {
    '&': {
      color: 'white',
      backgroundColor: '#242841',
      borderRadius: '16px',
    },
    '.cm-content': {
      padding: '18px 16px',
      caretColor: '#0e9',
    },
    '&.cm-editor.cm-focused': {
      outlineColor: '#aeb8dd',
      outlineWidth: '3px',
      outlineStyle: 'solid',
    },
  },
  { dark: true },
);

const extensions = () => [new CodeMirror6Extension({ extensions: [myTheme] })];

const content = `<pre><code>With custom CodeMirror theme</code></pre>`;

const WithCustomExtension = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender />
    </ThemeProvider>
  );
};

export default WithCustomExtension;
