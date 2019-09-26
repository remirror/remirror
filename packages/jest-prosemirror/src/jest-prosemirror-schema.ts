import { NodeGroup } from '@remirror/core-constants';
import { NodeSpec, Schema } from 'prosemirror-model';
import { marks, nodes } from 'prosemirror-schema-basic';
import {
  bulletList as baseBulletList,
  listItem as baseListItem,
  orderedList as baseOrderedList,
} from 'prosemirror-schema-list';
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

const listGroup = 'block';
const itemContent = 'paragraph block*';

const orderedList = { ...baseOrderedList, ...{ content: 'listItem+', group: listGroup } };
const bulletList = { ...baseBulletList, ...{ content: 'listItem+', group: listGroup } };
const listItem = { ...baseListItem, ...{ content: itemContent } };

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
  toDOM: () => {
    return ['span', { 'data-node-type': 'atomInline' }];
  },
};

const atomBlock: NodeSpec = {
  inline: false,
  group: NodeGroup.Block,
  atom: true,
  selectable: true,
  parseDOM: [
    {
      tag: 'div[data-node-type="atomBlock"]',
    },
  ],
  toDOM: () => {
    return ['div', { 'data-node-type': 'atomBlock' }];
  },
};

const atomContainer: NodeSpec = {
  inline: false,
  group: NodeGroup.Block,
  content: 'atomBlock+',
  parseDOM: [
    {
      tag: 'div[data-node-type="atomBlockContainer"]',
    },
  ],
  toDOM: () => {
    return ['div', { 'data-node-type': 'atomBlockContainer' }];
  },
};

const containerWithRestrictedContent: NodeSpec = {
  inline: false,
  group: NodeGroup.Block,
  content: 'paragraph+',
  parseDOM: [
    {
      tag: 'div[data-node-type="containerWithRestrictedContent"]',
    },
  ],
  toDOM: () => {
    return ['div', { 'data-node-type': 'containerWithRestrictedContent' }];
  },
};

export const schema = new Schema({
  nodes: {
    doc,
    orderedList,
    bulletList,
    listItem,
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
