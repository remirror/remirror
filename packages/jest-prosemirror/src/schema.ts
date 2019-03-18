import { NodeSpec, Schema } from 'prosemirror-model';
import { marks, nodes } from 'prosemirror-schema-basic';
import { tableNodes } from 'prosemirror-tables';

const {
  doc,
  paragraph,
  text,
  horizontal_rule: horizontalRule,
  blockquote,
  heading,
  code_block,
  hard_break,
  image,
} = nodes;
const { table, table_cell, table_header, table_row } = tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    pretty: { default: true },
    ugly: { default: false },
  },
});

const atomInline: NodeSpec = {
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  parseDOM: [
    {
      tag: 'span[data-node-type="atomInline"]',
    },
  ],
  toDOM() {
    return ['span', { 'data-node-type': 'atomInline' }];
  },
};

const atomBlock: NodeSpec = {
  inline: false,
  group: 'block',
  atom: true,
  selectable: true,
  parseDOM: [
    {
      tag: 'div[data-node-type="atomBlock"]',
    },
  ],
  toDOM() {
    return ['div', { 'data-node-type': 'atomBlock' }];
  },
};

const atomContainer: NodeSpec = {
  inline: false,
  group: 'block',
  content: 'atomBlock+',
  parseDOM: [
    {
      tag: 'div[data-node-type="atomBlockContainer"]',
    },
  ],
  toDOM() {
    return ['div', { 'data-node-type': 'atomBlockContainer' }];
  },
};

const containerWithRestrictedContent: NodeSpec = {
  inline: false,
  group: 'block',
  content: 'paragraph+',
  parseDOM: [
    {
      tag: 'div[data-node-type="containerWithRestrictedContent"]',
    },
  ],
  toDOM() {
    return ['div', { 'data-node-type': 'containerWithRestrictedContent' }];
  },
};

export const schema = new Schema({
  nodes: {
    doc,
    paragraph,
    text,
    horizontalRule,
    atomInline,
    atomBlock,
    atomContainer,
    containerWithRestrictedContent,
    table,
    table_row,
    table_cell,
    table_header,
    blockquote,
    heading,
    code_block,
    hard_break,
    image,
  },
  marks,
});
