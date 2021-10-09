import { ExtensionTag } from '@remirror/core';
import { NodeType, ProsemirrorNode } from '@remirror/pm';

export function isList(type: NodeType): boolean {
  return !!type.spec.group?.includes(ExtensionTag.ListContainerNode);
}

export function isListItem(type: NodeType): boolean {
  return !!type.spec.group?.includes(ExtensionTag.ListItemNode);
}

export function isListNode(node: ProsemirrorNode): boolean {
  return isList(node.type);
}

export function isListItemNode(node: ProsemirrorNode): boolean {
  return isListItem(node.type);
}
