import javascript from 'refractor/lang/javascript';
import typescript from 'refractor/lang/typescript';
import { CodeBlockExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [
  new CodeBlockExtension({
    supportedLanguages: [javascript, typescript],
  }),
];

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
      <Remirror manager={manager} initialContent={state} autoRender />
    </ThemeProvider>
  );
};

export default {
  title: 'Extensions / CodeBlock / With incorrect language',
  component: WithIncorrectLanguage,
};
