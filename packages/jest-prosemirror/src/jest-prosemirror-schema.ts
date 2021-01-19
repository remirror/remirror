import { marks, nodes } from 'prosemirror-schema-basic';
import { tableNodes } from 'prosemirror-tables';
import { ExtensionTag } from '@remirror/core-constants';
import { MarkSpec, NodeSpec, Schema } from '@remirror/pm/model';
import {
  bulletList as baseBulletList,
  listItem as baseListItem,
  orderedList as baseOrderedList,
} from '@remirror/pm/schema-list';

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
const { link, em, strong, code } = marks;
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
  group: ExtensionTag.Block,
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
  group: ExtensionTag.Block,
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
  group: ExtensionTag.Block,
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

const strike: MarkSpec = {
  parseDOM: [
    {
      tag: 's',
    },
    {
      tag: 'del',
    },
    {
      tag: 'strike',
    },
    {
      style: 'text-decoration',
      getAttrs: (node) => (node === 'line-through' ? {} : false),
    },
  ],
  toDOM: () => {
    return ['s', 0];
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
  marks: {
    link,
    em,
    strong,
    code,
    strike,
  },
});
