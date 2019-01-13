import { nodes } from 'prosemirror-schema-basic';
import { bulletList, listItem, orderedList } from 'prosemirror-schema-list';
import { tableNodes } from 'prosemirror-tables';

const listNodes = {
  ordered_list: {
    ...orderedList,
    content: 'list_item+',
    group: 'block',
  },
  bullet_list: {
    ...bulletList,
    content: 'list_item+',
    group: 'block',
  },
  list_item: {
    ...listItem,
    content: 'paragraph block*',
    group: 'block',
  },
};

export default {
  ...nodes,
  ...listNodes,
  ...tableNodes({
    tableGroup: 'block',
    cellContent: 'block+',
    cellAttributes: {},
  }),
};

export * from './doc';
export * from './paragraph';
export * from './text';
export * from './mention';
