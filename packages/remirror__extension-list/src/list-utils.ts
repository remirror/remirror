import { ExtensionTag } from '@remirror/core';
import { NodeType, ProsemirrorNode } from '@remirror/pm';

export function isList(type: NodeType): boolean {
  return !!type.spec.group?.includes(ExtensionTag.ListContainerNode);
}

export function isListItem(type: NodeType): boolean {
  return !!type.spec.group?.includes(ExtensionTag.ListItemNode);
}

export function isListNode(node: ProsemirrorNode | null | undefined): boolean {
  return !!node && isList(node.type);
}

export function isListItemNode(node: ProsemirrorNode | null | undefined): boolean {
  return !!node && isListItem(node.type);
}
