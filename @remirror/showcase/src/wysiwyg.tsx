import { EMPTY_PARAGRAPH_NODE } from '@remirror/core';
import { WysiwygEditor, WysiwygEditorProps } from '@remirror/editor-wysiwyg';
import React, { FC } from 'react';
import { formatter } from './code-formatter';

export const ExampleWysiwygEditor: FC<WysiwygEditorProps> = ({
  initialContent = EMPTY_PARAGRAPH_NODE,
  autoFocus = true,
  ...props
}) => {
  return (
    <WysiwygEditor {...props} initialContent={initialContent} autoFocus={autoFocus} formatter={formatter} />
  );
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
            '## Simple Code Blocks\n\n```js\nlog("with code fence support");\n```\n\n```bash\necho "fun times"\n```\n\nUse Shift-Enter or Mod-Enter to hard break out of the code block',
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
