/**
 * The empty value when rendering a markdown node.
 */
export const EMPTY_MARKDOWN_NODE = {
  type: 'doc',
  content: [
    {
      type: 'codeBlock',
      attrs: { language: 'markdown' },
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
  ],
};
