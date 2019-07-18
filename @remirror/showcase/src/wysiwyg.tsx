import { EMPTY_PARAGRAPH_NODE } from '@remirror/core';
import { WysiwygEditor, WysiwygEditorProps } from '@remirror/editor-wysiwyg';
import { CodeBlockFormatter, getLanguage } from '@remirror/extension-code-block';
import babelPlugin from 'prettier/parser-babel';
import htmlPlugin from 'prettier/parser-html';
import typescriptPlugin from 'prettier/parser-typescript';
import { formatWithCursor } from 'prettier/standalone';
import React, { FC } from 'react';

const formatter: CodeBlockFormatter = ({ cursorOffset, language, source }) => {
  if () {
    return formatWithCursor(source, {
      cursorOffset,
      plugins: [typescriptPlugin],
      parser: 'typescript',
      singleQuote: true,
    });
  }
  return;
};

export const ExampleWysiwygEditor: FC<WysiwygEditorProps> = ({
  initialContent = EMPTY_PARAGRAPH_NODE,
  ...props
}) => {
  return <WysiwygEditor {...props} initialContent={initialContent} suppressHydrationWarning={false} />;
};

export const WYSIWYG_SHOWCASE_CONTENT = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'A WYSIWYG Editor' }] },
    { type: 'paragraph' },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'With ' },
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'formatting ' },
        { type: 'text', text: 'and other ' },
        { type: 'text', marks: [{ type: 'underline' }], text: 'enhancements' },
        { type: 'text', text: '.' },
      ],
    },
    { type: 'paragraph' },
    {
      type: 'codeBlock',
      attrs: { language: 'markdown' },
      content: [
        {
          type: 'text',
          text:
            '## Simple Code Blocks\n\n```js\nconsole.log("with code fence support");\n```\n\n```bash\necho "fun times"\n```\n\nUse Shift-Enter or Mod-Enter to hard break out of the code block',
        },
      ],
    },
    { type: 'paragraph' },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'List support' }] },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'With nesting' }] }],
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Built in.' }] }],
        },
      ],
    },
    { type: 'paragraph' },
    {
      type: 'blockquote',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Block quotes' }] },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'With support for headers' }],
        },
      ],
    },
    { type: 'paragraph' },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'And ' },
        { type: 'text', marks: [{ type: 'link', attrs: { href: 'https://google.com' } }], text: 'urls' },
        { type: 'text', text: ' with support for ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'Cmd-k' },
        { type: 'text', text: ' shortcut to enter a link manually.' },
      ],
    },
    { type: 'paragraph' },
    { type: 'paragraph' },
  ],
};
