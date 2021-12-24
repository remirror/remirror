import { basicSetup } from '@codemirror/basic-setup';
import { languages } from '@codemirror/language-data';
import { ProsemirrorDevTools } from '@remirror/dev';
import { CodeMirrorExtension } from '@remirror/extension-codemirror6';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new CodeMirrorExtension({ languages, extensions: [basicSetup] })];

const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Here is a JavaScript code block:',
        },
      ],
    },
    {
      type: 'codeMirror',
      attrs: {
        language: 'JavaScript',
      },
      content: [
        {
          type: 'text',
          text: 'while (true) {\n    console.log("Eat");\n    console.log("Sleep");\n    console.log("Code");\n}',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Here is a Python code block:',
        },
      ],
    },
    {
      type: 'codeMirror',
      attrs: {
        language: 'Python',
      },
      content: [
        {
          type: 'text',
          text: 'while True:\n    print("Eat")\n    print("Sleep")\n    print("Code")',
        },
      ],
    },
  ],
};

const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
