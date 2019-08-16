import { capitalize } from '@remirror/core';
import { EditorDisplay, MarkdownEditor } from '@remirror/editor-markdown';
import React, { FC, useState } from 'react';

export const ExampleMarkdownEditor: FC = ({ children }) => {
  const [editor, setEditor] = useState<EditorDisplay>('wysiwyg');

  const toggleEditor = () => {
    if (editor === 'wysiwyg') {
      setEditor('markdown');
    }
    if (editor === 'markdown') {
      setEditor('wysiwyg');
    }
  };

  return (
    <div>
      <span>
        <button onClick={toggleEditor}>Toggle Editor</button>: {capitalize(editor)}
      </span>
      <MarkdownEditor
        editor={editor}
        initialValue={{
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Markdown Editor' }] },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'With ' },
                { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'formatting ' },
                { type: 'text', text: 'and other ' },
                { type: 'text', marks: [{ type: 'italic' }], text: 'enhancements' },
                { type: 'text', text: '.' },
              ],
            },
            {
              type: 'codeBlock',
              attrs: { language: 'js' },
              content: [
                {
                  type: 'text',
                  text: 'const a = "welcome"',
                },
              ],
            },
          ],
        }}
      >
        {children}
      </MarkdownEditor>
    </div>
  );
};
