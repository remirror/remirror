import {
  chainableEditorState,
  CommandFunction,
  ExtensionTag,
  findParentNode,
  NodeType,
  ProsemirrorNode,
} from '@remirror/core';
import { Fragment, Slice } from '@remirror/pm/model';
import { liftListItem, wrapInList } from '@remirror/pm/schema-list';

/**
 * Checks to see whether this is a list node.
 */
function isList(node: ProsemirrorNode): boolean {
  const schema = node.type.schema;

  return !!(
    node.type.spec.group?.includes(ExtensionTag.ListContainerNode) ||
    node.type === schema.nodes.bulletList ||
    node.type === schema.nodes.orderedList ||
    node.type === schema.nodes.checkboxList
  );
}

/**
 * Checks to see whether this is a list item node.
 */
function isListItem(node: ProsemirrorNode): boolean {
  const schema = node.type.schema;

  return !!(
    node.type.spec.group?.includes(ExtensionTag.ListItemNode) ||
    node.type === schema.nodes.listItem ||
    node.type === schema.nodes.checkboxItem
  );
}

function tranformListItems(slice: Slice, itemType: NodeType): ProsemirrorNode[] {
  const nodes: ProsemirrorNode[] = [];

  slice.content.descendants((node) => {
    if (isListItem(node) && node.type !== itemType) {
      const newItem = itemType.createAndFill(node.attrs, node.content);

      if (newItem) {
        // If we can create a valid node by filling, do that
        nodes.push(newItem);
      } else {
        // Else add in whatever we can
        let newItem = itemType.create(node.attrs);
        node.content.forEach((node) => {
          const frag = Fragment.from(node);

          if (newItem.type.validContent(frag)) {
            newItem = itemType.create(node.attrs, newItem.content.append(frag));
          }
        });

        nodes.push(newItem);
      }

      return false;
    }

    nodes.push(node);
    return false;
  });

  return nodes;
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
  return (props) => {
    const { dispatch, tr } = props;
    const state = chainableEditorState(tr, props.state);
    const { $from, $to } = tr.selection;
    const range = $from.blockRange($to);

    if (!range) {
      return false;
    }

    const parentList = findParentNode({
      predicate: (node) => isList(node),
      selection: tr.selection,
    });

    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      if (parentList.node.type === type) {
        return liftListItem(itemType)(state, dispatch);
      }

      if (isList(parentList.node)) {
        if (type.validContent(parentList.node.content)) {
          dispatch?.(tr.setNodeMarkup(parentList.pos, type));
        } else {
          const slice = tr.doc.slice(range.start, range.end);
          const nodes = tranformListItems(slice, itemType);
          const newList = type.create(parentList.node.attrs, nodes);
          dispatch?.(tr.replaceRangeWith(parentList.start, parentList.end, newList));
        }

        return true;
      }
    }

    return wrapInList(type)(state, dispatch);
  };
}
