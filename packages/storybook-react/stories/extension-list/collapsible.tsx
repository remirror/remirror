import {
  BulletListExtension,
  HardBreakExtension,
  HeadingExtension,
  OrderedListExtension,
  TaskListExtension,
} from 'remirror/extensions';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { content } from './content';
const Collapsible = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: extensionsWithSpine,
    content,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};

const extensionsWithSpine = () => [
  new BulletListExtension({ enableSpine: true }),
  new OrderedListExtension(),
  new TaskListExtension(),
  new HeadingExtension(),
  new HardBreakExtension(),
];

const html = String.raw; // Just for better editor support

export default Collapsible;
