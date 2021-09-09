import 'remirror/styles/extension-file.css';

import { useCallback } from 'react';
import { FileExtension } from '@remirror/extension-file';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const Basic = (): JSX.Element => {
  const extensions = useCallback(() => [new FileExtension({})], []);
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <>
      <p>
        Default Implementation. Uses <code>FileReader.readAsDataURL</code> under the hood.
      </p>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender />
      </ThemeProvider>
    </>
  );
};

const content = `<p>Drag and drop one or multiple non-image files into the editor.</p>`;

export default Basic;
