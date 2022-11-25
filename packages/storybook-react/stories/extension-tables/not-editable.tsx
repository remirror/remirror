import React from 'react';
import { TableExtension } from 'remirror/extensions';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const content = `
  <table>
    <tr>
      <td data-colwidth="113"><p>This</p></td>
      <td data-colwidth="162"><p>editor</p></td>
      <td><p>is non editable</p></td>
    </tr>
    <tr>
      <td data-colwidth="113"><p>But</p></td>
      <td data-colwidth="162"><p>table</p></td>
      <td><p>columns widths are still applied</p></td>
    </tr>
    <tr>
      <td data-colwidth="113"><p></p></td>
      <td data-colwidth="162"><p></p></td>
      <td><p></p></td>
    </tr>
  </table>
`;

const NotEditable = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, stringHandler: 'html', content });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} editable={false}>
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};

const extensions = () => [new TableExtension()];

export default NotEditable;
