import {
  BoldExtension,
  ItalicExtension,
  StrikeExtension,
  UnderlineExtension,
} from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

const extensions = () => [
  new BoldExtension({}),
  new ItalicExtension(),
  new StrikeExtension(),
  new UnderlineExtension(),
];

const content = '<p><u>Hello</u> there <b>friend</b> <del>and</del> <em>partner</em>.</p>';

const BasicEditor = () => {
  const { manager, state } = useRemirror({
    extensions,
    content,
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
