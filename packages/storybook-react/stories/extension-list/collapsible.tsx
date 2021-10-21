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
`;

export default Collapsible;
