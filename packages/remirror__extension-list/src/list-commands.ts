import {
  AnyExtension,
  chainableEditorState,
  CommandFunction,
  ExtensionTag,
  findParentNode,
  getNodeType,
  isNodeSelection,
  NodeType,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core';
import { Fragment, Slice } from '@remirror/pm/model';
import { liftListItem, sinkListItem, wrapInList } from '@remirror/pm/schema-list';
import { EditorState, Selection } from '@remirror/pm/state';
import { canSplit } from '@remirror/pm/transform';

/**
 * Checks to see whether this is a list node.
 */
export function isList(node: ProsemirrorNode): boolean {
  const schema = node.type.schema;

  return !!(
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

      if (isList(parentList.node) && type.validContent(parentList.node.content)) {
        if (dispatch) {
          dispatch(tr.setNodeMarkup(parentList.pos, type));
        }

        return true;
      }
    }

    return wrapInList(type)(state, dispatch);
  };
}

/**
 * Build a command that splits a non-empty textblock at the top level
 * of a list item by also splitting that list item.
 */
export function splitListItem(
  listItemTypeOrName: string | NodeType,
  ignoreAttrs: string[] = ['checked'],
): CommandFunction {
  return function ({ tr, dispatch, state }) {
    const listItemType = getNodeType(listItemTypeOrName, state.schema);
    const { $from, $to } = tr.selection;

    if (
      // Don't apply to node selection where the selected node is a block (inline nodes might be okay)
      // eslint-disable-next-line unicorn/consistent-destructuring
      (isNodeSelection(tr.selection) && tr.selection.node.isBlock) ||
      // List items can only exists at a depth of 2 or greater
      $from.depth < 2 ||
      // Don't apply to a selection which spans multiple nodes.
      !$from.sameParent($to)
    ) {
      return false;
    }

    // Get the grandparent of the start to make sure that it has the same type
    // as the list item type.
    const grandParent = $from.node(-1);

    if (grandParent.type !== listItemType) {
      return false;
    }

    if ($from.parent.content.size === 0 && $from.node(-1).childCount === $from.indexAfter(-1)) {
      // In an empty block. If this is a nested list, the wrapping
      // list item should be split. Otherwise, bail out and let next
      // command handle lifting.
      if (
        $from.depth === 2 ||
        $from.node(-3).type !== listItemType ||
        $from.index(-2) !== $from.node(-2).childCount - 1
      ) {
        return false;
      }

      if (dispatch) {
        const keepItem = $from.index(-1) > 0;
        let wrap = Fragment.empty;

        // Build a fragment containing empty versions of the structure
        // from the outer list item to the parent node of the cursor
        for (let depth = $from.depth - (keepItem ? 1 : 2); depth >= $from.depth - 3; depth--) {
          wrap = Fragment.from($from.node(depth).copy(wrap));
        }

        const content = listItemType.contentMatch.defaultType?.createAndFill() || undefined;

        wrap = wrap.append(Fragment.from(listItemType.createAndFill(null, content) || undefined));

        tr.replace(
          $from.before(keepItem ? undefined : -1),
          $from.after(-3),
          new Slice(wrap, keepItem ? 3 : 2, 2),
        );
        tr.setSelection(
          (tr.selection.constructor as typeof Selection).near(
            tr.doc.resolve($from.pos + (keepItem ? 3 : 2)),
          ),
        );
        dispatch(tr.scrollIntoView());
      }

      return true;
    }

    const listItemAttributes = Object.fromEntries(
      Object.entries(grandParent.attrs).filter(([attr]) => !ignoreAttrs.includes(attr)),
    );

    // The content inside the list item (e.g. paragraph)
    const contentType = $to.pos === $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
    const contentAttributes = { ...$from.node().attrs };

    tr.delete($from.pos, $to.pos);

    const types: TypesAfter = contentType
      ? [
          { type: listItemType, attrs: listItemAttributes },
          { type: contentType, attrs: contentAttributes },
        ]
      : [{ type: listItemType, attrs: listItemAttributes }];

    if (!canSplit(tr.doc, $from.pos, 2)) {
      // I can't use `canSplit(tr.doc, $from.pos, 2, types)` and I don't know why
      return false;
    }

    if (dispatch) {
      // TODO: types for `tr.split` need to be fixed in `@types/prosemirror-transform`
      // @ts-expect-error
      dispatch(tr.split($from.pos, 2, types).scrollIntoView());
    }

    return true;
  };
}

type TypeAfter = { type: NodeType; attrs: ProsemirrorAttributes } | null | undefined;
type TypesAfter = TypeAfter[];

/**
 * Get all list item node type names in currect schema
 */
function getAllListItemNames(allExtensions: AnyExtension[]): string[] {
  return allExtensions
    .filter((extension) => extension.tags.includes(ExtensionTag.ListItemNode))
    .map((extension) => extension.name);
}

/**
 * Get all list item node types from current selection. Sort from deepest to root.
 */
function getOrderedListItemTypes(
  listItemNames: string[],
  state: EditorState,
): Map<string, NodeType> {
  const { $from, $to } = state.selection;
  const sharedDepth = $from.sharedDepth($to.pos);
  const listItemTypes = new Map<string, NodeType>();

  for (let depth = sharedDepth; depth >= 0; depth--) {
    const type = $from.node(depth).type;

    if (listItemNames.includes(type.name) && !listItemTypes.has(type.name)) {
      listItemTypes.set(type.name, type);
    }
  }

  return listItemTypes;
}

/**
 * Create a command to sink the list item around the selection down into an
 * inner list. Use this function if you get multiple list item nodes in your
 * schema.
 */
export function sharedSinkListItem(allExtensions: AnyExtension[]): CommandFunction {
  const listItemNames = getAllListItemNames(allExtensions);

  return function ({ dispatch, state }) {
    const listItemTypes = getOrderedListItemTypes(listItemNames, state);

    for (const type of listItemTypes.values()) {
      if (sinkListItem(type)(state, dispatch)) {
        return true;
      }
    }

    return false;
  };
}

/**
 * Create a command to lift the list item around the selection up intoa wrapping
 * list. Use this function if you get multiple list item nodes in your schema.
 */
export function sharedLiftListItem(allExtensions: AnyExtension[]): CommandFunction {
  const listItemNames = getAllListItemNames(allExtensions);

  return function ({ dispatch, state }) {
    const listItemTypes = getOrderedListItemTypes(listItemNames, state);

    for (const type of listItemTypes.values()) {
      if (liftListItem(type)(state, dispatch)) {
        return true;
      }
    }

    return false;
  };
}
