import './styles.css';

import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import React from 'react';
import { ProsemirrorDevTools } from '@remirror/dev';
import { CodeMirrorExtension } from '@remirror/extension-codemirror6';
import { Remirror, ThemeProvider, useRemirror, useRemirrorContext } from '@remirror/react';

const extensions = () => [new CodeMirrorExtension({ languages, extensions: [oneDark] })];

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
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Press the button to insert a new CodeMirror block.',
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

const CreateCodeMirrorButton = ({ language }: { language: string }) => {
  const { commands } = useRemirrorContext<CodeMirrorExtension>({ autoUpdate: true });
  const { createCodeMirror } = commands;
  const enabled = createCodeMirror.enabled({ language });

  return (
    <button
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => createCodeMirror({ language })}
      disabled={!enabled}
    >
      Create a {language} block
    </button>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender='end'>
        <CreateCodeMirrorButton language='JavaScript' />
        <CreateCodeMirrorButton language='Markdown' />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
