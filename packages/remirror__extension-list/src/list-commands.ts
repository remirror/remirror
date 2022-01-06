import {
  AnyExtension,
  chainableEditorState,
  CommandFunction,
  CommandFunctionProps,
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
import { joinBackward } from '@remirror/pm/commands';
import { Fragment, NodeRange, ResolvedPos, Slice } from '@remirror/pm/model';
import { liftListItem, sinkListItem, wrapInList } from '@remirror/pm/schema-list';
import { EditorState, Selection, TextSelection, Transaction } from '@remirror/pm/state';
import { canJoin, canSplit, ReplaceAroundStep } from '@remirror/pm/transform';

import { ListItemAttributes } from './list-item-extension';
import { isList, isListItemNode, isListNode } from './list-utils';

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

        const depthAfter =
          $from.indexAfter(-1) < $from.node(-2).childCount
            ? 1
            : $from.indexAfter(-2) < $from.node(-3).childCount
            ? 2
            : 3;

        tr.replace(
          $from.before(keepItem ? undefined : -1),
          $from.after(-depthAfter),
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
 *
 * @deprecated
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
 *
 * @deprecated use `indentList` instead.
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
 *
 * @deprecated use `dedentList` instead.
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

/**
 * Wraps list items in `range` to a list.
 */
function wrapItems({
  listType,
  itemType,
  tr,
  range,
}: {
  listType: NodeType;
  itemType: NodeType;
  tr: Transaction;
  range: NodeRange;
}): boolean {
  const oldList = range.parent;

  // A slice that contianes all selected list items
  const slice: Slice = tr.doc.slice(range.start, range.end);

  if (oldList.type === listType && slice.content.firstChild?.type === itemType) {
    return false;
  }

  const newItems: ProsemirrorNode[] = [];

  for (let i = 0; i < slice.content.childCount; i++) {
    const oldItem = slice.content.child(i);

    if (!itemType.validContent(oldItem.content)) {
      return false;
    }

    const newItem = itemType.createChecked(null, oldItem.content);
    newItems.push(newItem);
  }

  const newList = listType.createChecked(null, newItems);

  tr.replaceRange(range.start, range.end, new Slice(Fragment.from(newList), 0, 0));
  return true;
}

/**
 * Wraps existed list items to a new type of list, which only containes these list items.
 *
 * @remarks
 *
 * @example
 *
 * Here is some pseudo-code to show the purpose of this function:
 *
 * before:
 *
 * ```html
 *  <ul>
 *    <li>item A</li>
 *    <li>item B<!-- cursor_start --></li>
 *    <li>item C<!-- cursor_end --></li>
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
 *    <li>item B<!-- cursor_start --></li>
 *    <li>item C<!-- cursor_end --></li>
 *  </ol>
 *  <ul>
 *    <li>item D</li>
 *  </ul>
 * ```
 *
 * @alpha
 */
export function wrapSelectedItems({
  listType,
  itemType,
  tr,
}: {
  listType: NodeType;
  itemType: NodeType;
  tr: Transaction;
}): boolean {
  const range = calculateItemRange(tr.selection);

  if (!range) {
    return false;
  }

  const atStart = range.startIndex === 0;

  const { from, to } = tr.selection;

  if (!wrapItems({ listType, itemType, tr, range })) {
    return false;
  }

  tr.setSelection(
    new TextSelection(
      tr.doc.resolve(atStart ? from : from + 2),
      tr.doc.resolve(atStart ? to : to + 2),
    ),
  );
  tr.scrollIntoView();

  return true;
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

export function maybeJoinList(tr: Transaction, $pos?: ResolvedPos): boolean {
  const $from = $pos || tr.selection.$from;

  let joinable: number[] = [];
  let index: number;
  let parent: ProsemirrorNode;
  let before: ProsemirrorNode | null | undefined;
  let after: ProsemirrorNode | null | undefined;

  for (let depth = $from.depth; depth >= 0; depth--) {
    parent = $from.node(depth);

    // join backward
    index = $from.index(depth);
    before = parent.maybeChild(index - 1);
    after = parent.maybeChild(index);

    if (before && after && before.type.name === after.type.name && isListNode(before)) {
      const pos = $from.before(depth + 1);
      joinable.push(pos);
    }

    // join forward
    index = $from.indexAfter(depth);
    before = parent.maybeChild(index - 1);
    after = parent.maybeChild(index);

    if (before && after && before.type.name === after.type.name && isListNode(before)) {
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

/**
 * @deprecated
 */
function getItemRange(itemType: NodeType, selection: Selection) {
  const { $from, $to } = selection;

  const range = $from.blockRange($to, (node) => node.firstChild?.type === itemType);

  return range;
}

/**
 * Returns a range that include all selected list items.
 */
export function calculateItemRange(selection: Selection): NodeRange | null | undefined {
  const { $from, $to } = selection;
  return $from.blockRange($to, isListNode);
}

/**
 * Wraps selected list items to fit the list type and list item type in the
 * previous list.
 */
function wrapListBackward(tr: Transaction): boolean {
  const $cursor = tr.selection.$from;
  const range = $cursor.blockRange();

  if (!range || !isListItemNode(range.parent) || range.startIndex !== 0) {
    return false;
  }

  const root = $cursor.node(range.depth - 2); // the node that contains the list
  const itemIndex = $cursor.index(range.depth); // current node is the n-th node in item
  const listIndex = $cursor.index(range.depth - 1); // current item is the n-th item in list
  const rootIndex = $cursor.index(range.depth - 2); // current list is the n-th node in root
  const previousList = root.maybeChild(rootIndex - 1);
  const previousListItem = previousList?.lastChild;

  if (
    // current node must be the first node in its parent list item;
    itemIndex !== 0 ||
    // current list item must be the first list item in its parent list;
    listIndex !== 0
  ) {
    return false;
  }

  if (
    // there is a list before current list;
    previousList &&
    isListNode(previousList) &&
    // we can find the list item type for previousList;
    previousListItem &&
    isListItemNode(previousListItem)
  ) {
    return wrapSelectedItems({
      listType: previousList.type,
      itemType: previousListItem.type,
      tr: tr,
    });
  }

  if (isListItemNode(root)) {
    const parentListItem = root;
    const parentList = $cursor.node(range.depth - 3);

    if (isListNode(parentList)) {
      return wrapSelectedItems({
        listType: parentList.type,
        itemType: parentListItem.type,
        tr: tr,
      });
    }
  }

  return false;
}

export function listBackspace({ view }: CommandFunctionProps): boolean {
  if (!view) {
    return false;
  }

  {
    const $cursor = (view.state.selection as TextSelection).$cursor;

    if (!$cursor || $cursor.parentOffset > 0) {
      return false;
    }

    const range = $cursor.blockRange();

    if (!range || !isListItemNode(range.parent) || range.startIndex !== 0) {
      return false;
    }
  }

  {
    const tr = view.state.tr;

    if (wrapListBackward(tr)) {
      view.dispatch(tr);
    }
  }

  {
    const $cursor = (view.state.selection as TextSelection).$cursor;

    if (!$cursor || $cursor.parentOffset > 0) {
      return false;
    }

    const range = $cursor.blockRange();

    if (!range || !isListItemNode(range.parent) || range.startIndex !== 0) {
      return false;
    }

    // Handle the backspace key in a three-levels list correctly:
    // * A
    //   * <cursor>B
    //     * C
    const itemIndex = $cursor.index(range.depth); // current node is the n-th node in item
    const listIndex = $cursor.index(range.depth - 1); // current item is the n-th item in list
    const rootIndex = $cursor.index(range.depth - 2); // current list is the n-th list in its parent
    const isNestedList = range.depth - 2 >= 1 && isListItemNode($cursor.node(range.depth - 2));

    if (itemIndex === 0 && listIndex === 0 && rootIndex <= 1 && isNestedList) {
      liftListItem(range.parent.type)(view.state, view.dispatch);
    }
  }

  joinBackward(view.state, view.dispatch, view);

  return true;
}
