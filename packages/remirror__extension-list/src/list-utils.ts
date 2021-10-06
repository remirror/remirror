import { ExtensionTag } from '@remirror/core';
import { NodeType } from '@remirror/pm';

export function isList(type: NodeType): boolean {
  return !!type.spec.group?.includes(ExtensionTag.ListContainerNode);
}

export function isListItem(type: NodeType): boolean {
  return !!type.spec.group?.includes(ExtensionTag.ListItemNode);
}
