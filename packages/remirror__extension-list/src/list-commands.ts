import {
  AnyExtension,
  chainableEditorState,
  CommandFunction,
  DispatchFunction,
  ExtensionTag,
  findParentNode,
  FindProsemirrorNodeResult,
  getNodeType,
  isNodeSelection,
  NodeType,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core';
import { Fragment, NodeRange, Slice } from '@remirror/pm/model';
import { liftListItem, sinkListItem, wrapInList } from '@remirror/pm/schema-list';
import { EditorState, Selection, TextSelection, Transaction } from '@remirror/pm/state';
import { canJoin, canSplit, ReplaceAroundStep } from '@remirror/pm/transform';

import { ListItemAttributes } from './list-item-extension';
import { isList, isListItem } from './list-utils';

/**
 * Toggles a list.
 *
 * @remarks
 *
 * When the provided list wrapper is inactive (e.g. ul) then wrap the list with
 * this type. When it is active then remove the selected line from the list.
 *
 * @param listType - the list node type
 * @param itemType - the list item node type
 */
export function toggleList(listType: NodeType, itemType: NodeType): CommandFunction {
  return (props) => {
    const { dispatch, tr } = props;
    const state = chainableEditorState(tr, props.state);
    const { $from, $to } = tr.selection;
    const range = $from.blockRange($to);

    if (!range) {
      return false;
    }

    const parentList = findParentNode({
      predicate: (node) => isList(node.type),
      selection: tr.selection,
    });

    if (
      // the selection range is right inside the list
      parentList &&
      range.depth - parentList.depth <= 1 &&
      // the selectron range is the first child of the list
      range.startIndex === 0
    ) {
      if (parentList.node.type === listType) {
        return liftListItemOutOfList(itemType)(props);
      }

      if (isList(parentList.node.type)) {
        if (listType.validContent(parentList.node.content)) {
          dispatch?.(tr.setNodeMarkup(parentList.pos, listType));
          return true;
        }

        // When you try to toggle a bullet list into a task list or vice versa, since these two lists
        // use different type of list items, you can't directly change the list type.
        if (deepChangeListType(tr, parentList, listType, itemType)) {
          dispatch?.(tr.scrollIntoView());
          return true;
        }

        return false;
      }
    }

    return wrapInList(listType)(state, dispatch);
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

    // If the current list item is closed, when we split it, we'll keep its
    // content stay at the origin list item instead of the new list item.
    //
    // Since it's complex to implement, we only handle the most common case for
    // now: when the selection is inside one list item and the selection is at
    // the end of the first child (paragraph if using the default schema) of
    // this list item.
    if (
      (grandParent.attrs as ListItemAttributes).closed &&
      $from.sameParent($to) &&
      $to.pos === $to.end()
    ) {
      if (dispatch) {
        const newListItemStartPos = $from.after(-1);
        const content = listItemType.contentMatch.defaultType?.createAndFill() || undefined;
        const newListItem = listItemType.createAndFill(null, content);

        if (newListItem) {
          tr.insert(newListItemStartPos, newListItem);
          tr.setSelection(TextSelection.create(tr.doc, newListItemStartPos + 1));
        }

        tr.delete($from.pos, $to.pos);

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
      // @ts-expect-error TODO: types for `tr.split` need to be fixed in `@types/prosemirror-transform`
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

  return ({ dispatch, state }) => {
    const listItemTypes = getOrderedListItemTypes(listItemNames, state);

    for (const type of listItemTypes.values()) {
      if (sinkListItem(type)(state, dispatch)) {
        return true;
      }
    }

    // if current selection is inside at lease one list item node, then we
    // always return true.
    return listItemTypes.size > 0;
  };
}

/**
 * Create a command to lift the list item around the selection up intoa wrapping
 * list. Use this function if you get multiple list item nodes in your schema.
 */
export function sharedLiftListItem(allExtensions: AnyExtension[]): CommandFunction {
  const listItemNames = getAllListItemNames(allExtensions);

  return ({ dispatch, state }) => {
    const listItemTypes = getOrderedListItemTypes(listItemNames, state);

    for (const type of listItemTypes.values()) {
      if (liftListItem(type)(state, dispatch)) {
        return true;
      }
    }

    // if current selection is inside at lease one list item node, then we
    // always return true.
    return listItemTypes.size > 0;
  };
}

/**
 * Change a bullet list into a task list or vice versa. These lists use different type of list items,
 * so you need to use this function to not only change the list type but also change the list item type.
 */
function deepChangeListType(
  tr: Transaction,
  foundList: FindProsemirrorNodeResult,
  listType: NodeType,
  itemType: NodeType,
): boolean {
  const oldList = foundList.node;
  const $start = tr.doc.resolve(foundList.start);
  const listParent = $start.node(-1);
  const indexBefore = $start.index(-1);

  if (!listParent) {
    return false;
  }

  if (!listParent.canReplace(indexBefore, indexBefore + 1, Fragment.from(listType.create()))) {
    return false;
  }

  const newItems: ProsemirrorNode[] = [];

  for (let index = 0; index < oldList.childCount; index++) {
    const oldItem = oldList.child(index);

    if (!itemType.validContent(oldItem.content)) {
      return false;
    }

    const newItem = itemType.createChecked(null, oldItem.content);
    newItems.push(newItem);
  }

  const newList = listType.createChecked(null, newItems);

  const start = foundList.pos;
  const end = start + oldList.nodeSize;
  const from = tr.selection.from;

  tr.replaceRangeWith(start, end, newList);
  tr.setSelection((tr.selection.constructor as typeof Selection).near(tr.doc.resolve(from)));
  return true;
}

function deepChangeListItemType(
  tr: Transaction,
  foundList: FindProsemirrorNodeResult,
  listType: NodeType,
  itemType: NodeType,
): boolean {
  const oldList = foundList.node;
  const $start = tr.doc.resolve(foundList.start);
  const start = foundList.pos;
  const end = start + oldList.nodeSize;
  const from = tr.selection.from;

  const itemIndex = tr.selection.$from.index($start.depth);

  const oldItems: ProsemirrorNode[] = [];

  for (let i = 0; i < oldList.childCount; i++) {
    oldItems.push(oldList.child(i));
  }

  const newLists: ProsemirrorNode[] = [];

  //
  const newItemsPart1 = oldItems.slice(0, itemIndex);

  if (newItemsPart1.length > 0) {
    newLists.push(oldList.copy(Fragment.from(newItemsPart1)));
  }

  //
  const newItemsPart2: ProsemirrorNode[] = [];

  for (const oldItem of oldItems.slice(itemIndex, itemIndex + 1)) {
    if (!itemType.validContent(oldItem.content)) {
      return false;
    }

    const newItem = itemType.createChecked(null, oldItem.content);
    newItemsPart2.push(newItem);
  }

  newLists.push(listType.createChecked(null, newItemsPart2));

  //
  const newItemsAfter = oldItems.slice(itemIndex + 1, oldItems.length);

  if (newItemsAfter.length > 0) {
    newLists.push(oldList.copy(Fragment.from(newItemsAfter)));
  }

  //
  tr.replaceWith(start, end, newLists);
  tr.setSelection((tr.selection.constructor as typeof Selection).near(tr.doc.resolve(from)));

  return true;
}

/**
 * Wrap an existed list item to a new list, which only containes this list item.
 *
 * @remarks
 *
 * @example
 *
 * Here is a pseudo-code exmple:
 *
 * before:
 *
 * ```html
 *  <ul>
 *    <li>item A</li>
 *    <li>item B<!-- cursor --></li>
 *    <li>item C</li>
 *    <li>item D</li>
 *  </ul>
 * ```
 *
 * after:
 *
 * ```html
 *  <ul>
 *    <li>item A</li>
 *  </ul>
 *  <ol>
 *    <li>item B<!-- cursor --></li>
 *  </ol>
 *  <ul>
 *    <li>item C</li>
 *    <li>item D</li>
 *  </ul>
 * ```
 *
 * @beta
 */
export function wrapSingleItem(params: {
  listType: NodeType;
  itemType: NodeType;
  state: EditorState;
  tr: Transaction;
}): boolean {
  const { tr, listType, itemType } = params;
  const state = chainableEditorState(tr, params.state);
  const $from = tr.selection.$from;

  if ($from.depth <= 2) {
    return false;
  }

  const item = $from.node(-1);
  const list = $from.node(-2);

  // Do nothing if current cursor is not in a list item node
  if (!isList(list.type) || !isListItem(item.type)) {
    return false;
  }

  // Do nothing if current list already fits the requirement
  if (list.type === listType && item.type === itemType) {
    return false;
  }

  const foundList = findParentNode({
    selection: tr.selection,
    predicate: (node) => isList(node.type),
  });

  if (!foundList) {
    return false;
  }

  return deepChangeListItemType(tr, foundList, listType, itemType);
}

// Copied from `prosemirror-schema-list`
function liftOutOfList(state: EditorState, dispatch: DispatchFunction, range: NodeRange) {
  const tr = state.tr,
    list = range.parent;

  const originMappingLength = tr.mapping.maps.length;

  // Merge the list items into a single big item
  for (let pos = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
    pos -= list.child(i).nodeSize;
    tr.delete(pos - 1, pos + 1);
  }

  const $start = tr.doc.resolve(range.start),
    item = $start.nodeAfter;

  if (!item) {
    return false;
  }

  if (tr.mapping.slice(originMappingLength).map(range.end) !== range.start + item.nodeSize) {
    return false;
  }

  const atStart = range.startIndex === 0,
    atEnd = range.endIndex === list.childCount;
  const parent = $start.node(-1),
    indexBefore = $start.index(-1);

  if (
    !parent.canReplace(
      indexBefore + (atStart ? 0 : 1),
      indexBefore + 1,
      item.content.append(atEnd ? Fragment.empty : Fragment.from(list)),
    )
  ) {
    return false;
  }

  const start = $start.pos,
    end = start + item.nodeSize;
  // Strip off the surrounding list. At the sides where we're not at
  // the end of the list, the existing list is closed. At sides where
  // this is the end, it is overwritten to its end.
  tr.step(
    new ReplaceAroundStep(
      start - (atStart ? 1 : 0),
      end + (atEnd ? 1 : 0),
      start + 1,
      end - 1,
      new Slice(
        (atStart ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))).append(
          atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty)),
        ),
        atStart ? 0 : 1,
        atEnd ? 0 : 1,
      ),
      atStart ? 0 : 1,
    ),
  );
  dispatch(tr.scrollIntoView());
  return true;
}

export function maybeJoinList(tr: Transaction): boolean {
  const { $from, to } = tr.selection;
  const sharedDepth = $from.sharedDepth(to);

  let joinable: number[] = [];
  let index: number;
  let parent: ProsemirrorNode;
  let before: ProsemirrorNode | null | undefined;
  let after: ProsemirrorNode | null | undefined;

  for (let depth = sharedDepth; depth >= 0; depth--) {
    parent = $from.node(depth);

    // join backward
    index = $from.index(depth);
    after = parent.maybeChild(index);
    before = parent.maybeChild(index - 1);

    if (after && before && after.type.name === before.type.name && isList(before.type)) {
      const pos = $from.before(depth + 1);
      joinable.push(pos);
    }

    // join forward
    index = $from.indexAfter(depth);
    after = parent.maybeChild(index);
    before = parent.maybeChild(index - 1);

    if (after && before && after.type.name === before.type.name && isList(before.type)) {
      const pos = $from.after(depth + 1);
      joinable.push(pos);
    }
  }

  // sort `joinable` reversely
  joinable = [...new Set(joinable)].sort((a, b) => b - a);
  let updated = false;

  for (const pos of joinable) {
    if (canJoin(tr.doc, pos)) {
      tr.join(pos);
      updated = true;
    }
  }

  return updated;
}

/**
 * Build a command to lift the content inside a list item around the selection
 * out of list
 */
export function liftListItemOutOfList(itemType: NodeType): CommandFunction {
  return (props) => {
    const { dispatch, tr } = props;
    const state = chainableEditorState(tr, props.state);
    const range = getItemRange(itemType, tr.selection);

    if (!range) {
      return false;
    }

    if (!dispatch) {
      return true;
    }

    liftOutOfList(state, dispatch, range);
    return true;
  };
}

function getItemRange(itemType: NodeType, selection: Selection) {
  const { $from, $to } = selection;

  const range = $from.blockRange($to, (node) => node.firstChild?.type === itemType);

  return range;
}

export function calculateItemRange(selection: Selection): NodeRange | null | undefined {
  const { $from, $to } = selection;
  return $from.blockRange($to, (node) => isList(node.type));
}
