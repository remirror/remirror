import { basicSetup } from '@codemirror/basic-setup';
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
    '&.cm-editor': {
      outlineWidth: '3px',
      outlineStyle: 'solid',
      outlineColor: '#c2c0b1',
    },
    '&.cm-editor.cm-focused': {
      outlineWidth: '3px',
      outlineStyle: 'solid',
      outlineColor: '#da8845',
    },
    '.cm-content': {
      padding: '18px 16px',
      caretColor: '#7e490d',
    },
  },
  { dark: false },
);

const extensions = () => [new CodeMirrorExtension({ extensions: [basicSetup, myTheme] })];

const content = `<pre><code>Custom CodeMirror color theme</code></pre>`;

const WithCustomExtension = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender />
    </ThemeProvider>
  );
};

export default WithCustomExtension;
