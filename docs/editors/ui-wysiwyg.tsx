import React from 'react';

import { WysiwygUI } from '@remirror/ui-wysiwyg';

export const ExampleWysiwygUI = () => {
  return <WysiwygUI initialContent={initialContent} />;
};

const initialContent = {
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
      content: [
        {
          type: 'text',
          text:
            'Simple Code Blocks\necho "fun times"\nUse Shift-Enter or Mod-Enter to hard break out of the code block',
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
