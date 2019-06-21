export const testJSON = {
  type: 'paragraph',
  content: [
    { type: 'text', text: 'This is a node with ' },
    { type: 'text', marks: [{ type: 'bold' }], text: 'bold text and ' },
    { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'italic bold and ' },
    {
      type: 'text',
      marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }],
      text: 'underlined italic text',
    },
  ],
};

export const simpleJSON = {
  type: 'paragraph',
  content: [
    { type: 'text', text: 'This is a node with ' },
    { type: 'text', marks: [{ type: 'bold' }], text: 'bold text.' },
  ],
};

export const basicJSON = { type: 'paragraph', content: [{ type: 'text', text: 'basic' }] };
export const docNodeSimpleJSON = { type: 'doc', content: [simpleJSON] };
export const docNodeTestJSON = { type: 'doc', content: [testJSON] };
export const docNodeBasicJSON = { type: 'doc', content: [basicJSON] };
