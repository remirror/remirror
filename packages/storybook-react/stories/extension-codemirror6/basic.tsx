import { basicSetup } from '@codemirror/basic-setup';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { ProsemirrorDevTools } from '@remirror/dev';
import { CodeMirrorExtension } from '@remirror/extension-codemirror6';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [
  new CodeMirrorExtension({ languages, extensions: [basicSetup, oneDark] }),
];

const jsCode = `function sayHello {
  console.log('Hello world, JavaScript!')
}`;
const mdCode = `Hello _world_, **Markdown**`;
const cssCode = `.hello-world-css {
  color: red;
}`;
const jsonCode = `{
  "hello-world": "JSON"
}`;

const content = {
  type: 'doc',
  content: [
    {
      type: 'codeMirror',
      attrs: {
        language: 'JavaScript',
      },
      content: [
        {
          type: 'text',
          text: jsCode,
        },
      ],
    },
    {
      type: 'codeMirror',
      attrs: {
        language: 'markdown',
      },
      content: [
        {
          type: 'text',
          text: mdCode,
        },
      ],
    },
    {
      type: 'codeMirror',
      attrs: {
        language: 'css',
      },
      content: [
        {
          type: 'text',
          text: cssCode,
        },
      ],
    },
    {
      type: 'codeMirror',
      attrs: {
        language: 'JSON',
      },
      content: [
        {
          type: 'text',
          text: jsonCode,
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
