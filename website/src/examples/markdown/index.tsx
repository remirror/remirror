import '../example.css';

import React from 'react';
import { useHelpers } from '@remirror/react';
import { MarkdownEditor } from '@remirror/react-editors/markdown';

function MarkdownPreview() {
  const { getMarkdown } = useHelpers(true);

  return (
    <pre>
      <code>{getMarkdown()}</code>
    </pre>
  );
}

const Editor = () => (
  <MarkdownEditor placeholder='Start typing...'>
    <MarkdownPreview />
  </MarkdownEditor>
);

export default Editor;
