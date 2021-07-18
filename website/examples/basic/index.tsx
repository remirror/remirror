import {
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  StrikeExtension,
} from 'remirror/extensions';
import { useRemirror, Remirror, ThemeProvider } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

const extensions = () => [
  new BoldExtension({}),
  new ItalicExtension(),
  new StrikeExtension(),
  new UnderlineExtension(),
];

const BasicEditor = () => {
  const { manager, state } = useRemirror({
    extensions,
    content: '<p><u>Hello</u> there <b>friend</b> <del>and</del> <em>partner</em>.</p>',
    stringHandler: 'html',
  });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} />
      </ThemeProvider>
    </AllStyledComponent>
  );
};

export default BasicEditor;
