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
  <ul>
    <li>
      <p>a</p>
      <ul data-task-list="">
        <li class="remirror-list-item-with-custom-mark" data-checked="" data-task-list-item="">
          <span contenteditable="false" class="remirror-list-item-marker-container"
            ><input type="checkbox" class="remirror-list-item-checkbox" contenteditable="false"
          /></span>
          <div><p>A</p></div>
        </li>
        <li class="remirror-list-item-with-custom-mark" data-checked="" data-task-list-item="">
          <span contenteditable="false" class="remirror-list-item-marker-container"
            ><input type="checkbox" class="remirror-list-item-checkbox" contenteditable="false"
          /></span>
          <div><p>B</p></div>
        </li>
        <li class="remirror-list-item-with-custom-mark" data-checked="" data-task-list-item="">
          <span contenteditable="false" class="remirror-list-item-marker-container"
            ><input type="checkbox" class="remirror-list-item-checkbox" contenteditable="false"
          /></span>
          <div><p>C</p></div>
        </li>
      </ul>
    </li>
    <li><p>d</p></li>
  </ul>
`;

export default Basic;
