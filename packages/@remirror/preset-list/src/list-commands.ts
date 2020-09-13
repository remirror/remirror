import {
  chainableEditorState,
  CommandFunction,
  EditorSchema,
  ExtensionTag,
  findParentNode,
  NodeType,
  ProsemirrorNode,
} from '@remirror/core';
import { liftListItem, wrapInList } from '@remirror/pm/schema-list';

/**
 * Checks to see whether this is a list node.
 */
function isList(node: ProsemirrorNode, schema: EditorSchema) {
  return (
    node.type.spec.group?.includes(ExtensionTag.ListContainerNode) ||
    node.type === schema.nodes.bulletList ||
    node.type === schema.nodes.orderedList
  );
}

/**
 * Toggles a list item.
 *
 * @remarks
 *
 * When the provided list wrapper is inactive (e.g. ul) then wrap the list with
 * this type. When it is active then remove the selected line from the list.
 *
 * @param type - the list node type
 * @param itemType - the list item type (must be in the schema)
 */
export function toggleList(type: NodeType, itemType: NodeType): CommandFunction {
  return (parameter) => {
    const { dispatch, tr } = parameter;
    const state = chainableEditorState(tr, parameter.state);
    const { schema } = state;
    const { selection } = tr;
    const { $from, $to } = selection;
    const range = $from.blockRange($to);

    if (!range) {
      return false;
    }

    const parentList = findParentNode({ predicate: (node) => isList(node, schema), selection });

    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      if (parentList.node.type === type) {
        return liftListItem(itemType)(state, dispatch);
      }

      if (isList(parentList.node, schema) && type.validContent(parentList.node.content)) {
        if (dispatch) {
          dispatch(tr.setNodeMarkup(parentList.pos, type));
        }

        return true;
      }
    }

    return wrapInList(type)(state, dispatch);
  };
}
