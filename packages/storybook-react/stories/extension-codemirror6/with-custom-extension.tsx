import { EditorView as CodeMirrorEditorView } from '@codemirror/view';
import { CodeMirrorExtension } from '@remirror/extension-codemirror6';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const myTheme = CodeMirrorEditorView.theme(
  {
    '&': {
      color: '#633501',
      backgroundColor: '#f5f0ab',
      borderRadius: '16px',
      fontSize: '1.5em',
    },
    '.cm-content': {
      padding: '18px 16px',
      caretColor: '#7e490d',
    },
    '&.cm-editor.cm-focused': {
      outlineColor: '#a5a27d',
      outlineWidth: '3px',
      outlineStyle: 'solid',
    },
  },
  { dark: false },
);

const extensions = () => [new CodeMirrorExtension({ extensions: [myTheme] })];

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
