import { RemirrorJSON } from '@remirror/core';

export const SAMPLE_DOC: RemirrorJSON = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 1,
      },
      content: [
        {
          type: 'text',
          text: 'Heading 1',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: 'Heading 2',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'Heading 3',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Some text. ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'bold',
            },
          ],
          text: 'Some bold text. ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://www.remirror.io',
                target: null,
                auto: false,
              },
            },
          ],
          text: 'A link',
        },
      ],
    },
    {
      type: 'paragraph',
    },
    {
      type: 'iframe',
      attrs: {
        src: 'https://www.youtube-nocookie.com/embed/Zi7sRMcJT-o?',
        allowFullScreen: 'true',
        frameBorder: 0,
        type: 'youtube',
        width: null,
        height: null,
      },
    },
    {
      type: 'paragraph',
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'List item 1',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'List item 2',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'List item 3',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'typescript', wrap: false },
      content: [{ type: 'text', text: 'A code block' }],
    },
    {
      type: 'paragraph',
    },
    {
      type: 'callout',
      attrs: {
        type: 'info',
      },
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'A callout',
            },
          ],
        },
      ],
    },
  ],
};
