import {
  BulletListExtension,
  HardBreakExtension,
  HeadingExtension,
  OrderedListExtension,
  TaskListExtension,
} from 'remirror/extensions';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';

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

const content = html`
  <ul>
    <li>first unordered list item</li>
    <li>second unordered list item</li>
  </ul>
  <ol>
    <li>first ordered list item</li>
    <li>second ordered list item</li>
  </ol>
  <ul data-task-list>
    <li data-task-list-item>first task list item</li>
    <li data-task-list-item data-checked>second task list item</li>
  </ul>

  <h2>Nested bullet list:</h2>

  <ul>
    <li>A</li>
    <li>B</li>
    <li>
      C
      <ul>
        <li>C.A</li>
        <li>
          C.B
          <ul>
            <li>C.B.A</li>
            <li>C.B.B</li>
            <li>C.B.C</li>
          </ul>
        </li>
        <li>C.C</li>
      </ul>
    </li>
  </ul>

  <h2>Nested ordered list:</h2>

  <ol>
    <li>A</li>
    <li>B</li>
    <li>
      C
      <ol>
        <li>C.A</li>
        <li>
          C.B
          <ol>
            <li>C.B.A</li>
            <li>C.B.B</li>
            <li>C.B.C</li>
          </ol>
        </li>
        <li>C.C</li>
      </ol>
    </li>
  </ol>

  <h2>Nested task list:</h2>

  <ul data-task-list>
    <li data-task-list-item data-checked>A</li>
    <li data-task-list-item>B</li>
    <li data-task-list-item data-checked>
      C
      <ul data-checked data-task-list>
        <li data-task-list-item>C.A</li>
        <li data-task-list-item>
          C.B
          <ul data-task-list>
            <li data-task-list-item data-checked>C.B.A</li>
            <li data-task-list-item data-checked>C.B.B</li>
            <li data-task-list-item>C.B.C</li>
          </ul>
        </li>
        <li>C.C</li>
      </ul>
    </li>
  </ul>

  <h2>Nested mixed list:</h2>

  <ul>
    <li>A</li>
    <li>B</li>
    <li>
      C
      <ul data-task-list>
        <li data-task-list-item>C.A</li>
        <li data-task-list-item data-checked>
          C.B
          <ol>
            <li>C.B.A</li>
            <li>C.B.B</li>
            <li>C.B.C</li>
          </ol>
        </li>
        <li data-task-list-item data-checked>C.C</li>
      </ul>
    </li>
  </ul>
`;

export default Collapsible;
