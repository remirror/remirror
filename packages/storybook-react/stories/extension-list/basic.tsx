import {
  BulletListExtension,
  HardBreakExtension,
  HeadingExtension,
  LinkExtension,
  OrderedListExtension,
  TaskListExtension,
} from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useCommands,
  useRemirror,
} from '@remirror/react';

const Button = (): JSX.Element => {
  const commands = useCommands();

  return (
    <>
      <button onClick={() => commands.toggleTaskList()}>toggleTaskList</button>
      <button onClick={() => commands.toggleBulletList()}>toggleBulletList</button>
      <button onClick={() => commands.toggleOrderedList()}>toggleOrderedList</button>
      <button onClick={() => commands.liftListItemOutOfList()}>liftListItemOutOfList</button>
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
        <ProsemirrorDevTools />
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

const html = String.raw; // Just for better editor support

const content = html`
  <div
    contenteditable="true"
    translate="no"
    role="textbox"
    aria-multiline="true"
    aria-label=""
    class="ProseMirror remirror-editor"
    spellcheck="false"
  >
    <ul>
      <li>
        <p>Root</p>
        <ul>
          <li><p>A</p></li>
          <li><p>B</p></li>
          <li><p>C</p></li>
        </ul>
        <p>Sibling</p>
      </li>
    </ul>
  </div>
`;

export default Basic;
