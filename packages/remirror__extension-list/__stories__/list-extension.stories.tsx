import { BulletListExtension, OrderedListExtension } from 'remirror/extensions';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';

import { TaskListExtension } from '../src/task-list-extension';

export default { title: 'List Extension' };

export const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};

const extensions = () => [
  new BulletListExtension(),
  new TaskListExtension(),
  new OrderedListExtension(),
];

const html = String.raw; // Just for better editor support

const content = html`
  <ul>
    <li>first unordered list item</li>
    <li>second unordered list item</li>
  </ul>
  <ol>
    <li>first unordered list item</li>
    <li>second unordered list item</li>
  </ol>
  <ul data-task-list>
    <li data-task-list-item>first unordered list item</li>
    <li data-task-list-item>second unordered list item</li>
  </ul>

  <p>Nested List:</p>

  <ul>
    <li>A</li>
    <li>B</li>
    <li>
      C
      <ol>
        <li>C.A</li>
        <li>
          C.B
          <ul data-task-list>
            <li data-task-list-item>C.B.A</li>
            <li data-task-list-item>C.B.B</li>
            <li data-task-list-item>C.B.C</li>
          </ul>
        </li>
        <li>C.C</li>
      </ol>
    </li>
  </ul>
`;

Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};
