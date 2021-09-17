import {
  BulletListExtension,
  HardBreakExtension,
  HeadingExtension,
  LinkExtension,
  OrderedListExtension,
  TaskListExtension,
} from 'remirror/extensions';
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useCommands,
  useRemirror,
} from '@remirror/react';
import { content } from './content';

const Button = (): JSX.Element => {
  const commands = useCommands();

  return (
    <>
      <button onClick={commands.toggleTaskList}>toggleTaskList</button>
      <button onClick={commands.toggleBulletList}>toggleBulletList</button>
      <button onClick={commands.toggleOrderedList}>toggleOrderedList</button>
      <button onClick={commands.liftListItemOutOfList}>liftListItemOutOfList</button>
    </>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions,
    content,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <Button />
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};

const extensions = () => [
  new BulletListExtension(),
  new OrderedListExtension(),
  new TaskListExtension(),
  new HeadingExtension(),
  new LinkExtension(),
  /**
   * `HardBreakExtension` allows us to create a newline inside paragraphs .
   *  e.g. in a list item
   */
  new HardBreakExtension(),
];

export default Basic;
