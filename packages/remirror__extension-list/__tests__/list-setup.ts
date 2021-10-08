import { renderEditor } from 'jest-remirror';
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
  TaskListExtension,
} from 'remirror/extensions';

export function setupListEditor() {
  const editor = renderEditor([
    new ListItemExtension(),
    new BulletListExtension(),
    new OrderedListExtension(),
    new TaskListExtension(),
  ]);
  const {
    nodes: { doc, paragraph: p, bulletList: ul, orderedList: ol, listItem: li, taskList },
    attributeNodes: { taskListItem, orderedList, listItem },
  } = editor;

  const checked = taskListItem({ checked: true });
  const unchecked = taskListItem({ checked: false });

  return {
    editor,
    doc,
    p,
    ul,
    li,
    ol,
    taskList,
    orderedList,
    checked,
    unchecked,
    taskListItem,
    listItem,
  };
}
