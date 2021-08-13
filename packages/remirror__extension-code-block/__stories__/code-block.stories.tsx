import javascript from 'refractor/lang/javascript';
import typescript from 'refractor/lang/typescript';
import { CodeBlockExtension } from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useEditorState, useRemirror } from '@remirror/react';

export default { title: 'Code Block extension' };

const Dev = () => {
  const updatedState = useEditorState();
  console.log(JSON.stringify(updatedState.doc.toJSON()));
  return null;
};
export const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <Dev />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};

Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};

const extensions = () => [
  new CodeBlockExtension({
    supportedLanguages: [javascript, typescript],
  }),
];

const html = String.raw;
const content = html`
  <pre><code data-code-block-language="typescript">
function sayHello{
  console.log('hello world!')
}
</code></pre>
`;

export const WithIncorrectLanguage = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions,
    content: {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'THIS_LANGUAGE_DOES_NOT_EXIST', wrap: false },
          content: [{ type: 'text', text: 'hello world' }],
        },
      ],
    },
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
