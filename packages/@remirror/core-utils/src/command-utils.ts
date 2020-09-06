import { invariant, isNumber, object } from '@remirror/core-helpers';
import type {
  AttributesParameter,
  CommandFunction,
  CommandFunctionParameter,
  EditorSchema,
  EditorState,
  MarkType,
  MarkTypeParameter,
  NodeType,
  NodeTypeParameter,
  ProsemirrorAttributes,
  ProsemirrorCommandFunction,
  ProsemirrorNode,
  RangeParameter,
  Transaction,
} from '@remirror/core-types';
import { liftListItem, wrapInList } from '@remirror/pm/schema-list';
import { TextSelection } from '@remirror/pm/state';
import { findWrapping, liftTarget } from '@remirror/pm/transform';

import { getMarkRange, isMarkType, isNodeType } from './core-utils';
import { findParentNode, isNodeActive, isSelectionEmpty } from './prosemirror-utils';

interface UpdateMarkParameter extends Partial<RangeParameter>, Partial<AttributesParameter> {
  /**
   * The text to append.
   *
   * @default '''
   */
  appendText?: string;

  /**
   * The type of the
   */
  type: MarkType;
}
/**
 * Update the selection with the provided MarkType.
 */
export function updateMark(parameter: UpdateMarkParameter): CommandFunction {
  return ({ dispatch, tr }) => {
    const { type, attrs = object(), appendText, range } = parameter;
    const { selection } = tr;
    const { from, to } = range ?? selection;

    dispatch?.(
      tr.addMark(from, to, type.create(attrs)) && appendText ? tr.insertText(appendText) : tr,
    );

    return true;
  };
}

/**
 * Lift the selected block, or the closest ancestor block of the selection that
 * can be lifted, out of its parent node.
 *
 * Adapted from
 * https://github.com/ProseMirror/prosemirror-commands/blob/3126d5c625953ba590c5d3a0db7f1009f46f1571/src/commands.js#L212-L221
 */
export function lift({ tr, dispatch }: Pick<CommandFunctionParameter, 'tr' | 'dispatch'>): boolean {
  const { $from, $to } = tr.selection;
  const range = $from.blockRange($to);
  const target = range && liftTarget(range);

  if (!isNumber(target) || !range) {
    return false;
  }

  dispatch?.(tr.lift(range, target).scrollIntoView());

  return true;
}

/**
 * Wrap the selection in a node of the given type with the given attributes.
 */
export function wrapIn(type: NodeType, attrs: ProsemirrorAttributes): CommandFunction {
  return function ({ tr, dispatch }) {
    const { $from, $to } = tr.selection;
    const range = $from.blockRange($to);
    const wrapping = range && findWrapping(range, type, attrs);

    if (!wrapping || !range) {
      return false;
    }

    dispatch?.(tr.wrap(range, wrapping).scrollIntoView());

    return true;
  };
}

/**
 * Toggle between wrapping an inactive node with the provided node type, and
 * lifting it up into it's parent.
 *
 * @param type - the node type to toggle
 * @param attrs - the attrs to use for the node
 *
 * @public
 */
export function toggleWrap(type: NodeType, attrs: ProsemirrorAttributes = {}): CommandFunction {
  return (parameter) => {
    const { tr } = parameter;
    const isActive = isNodeActive({ state: tr, type });

    if (isActive) {
      return lift(parameter);
    }

    return wrapIn(type, attrs)(parameter);
  };
}

/**
 * Returns a command that tries to set the selected textblocks to the
 * given node type with the given attributes.
 */
export function setBlockType(type: NodeType, attrs?: ProsemirrorAttributes): CommandFunction {
  return function ({ tr, dispatch }) {
    const { from, to } = tr.selection;
    let applicable = false;

    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (applicable) {
        return false;
      }

      if (!node.isTextblock || node.hasMarkup(type, attrs)) {
        return;
      }

      if (node.type === type) {
        applicable = true;
        return;
      }

      const $pos = tr.doc.resolve(pos);
      const index = $pos.index();

      applicable = $pos.parent.canReplaceWith(index, index + 1, type);
      return;
    });

    if (!applicable) {
      return false;
    }

    if (dispatch) {
      dispatch(tr.setBlockType(from, to, type, attrs).scrollIntoView());
    }

    return true;
  };
}

/**
 * TODO make this more inclusive of custom user list types.
 */
function isList(node: ProsemirrorNode, schema: EditorSchema) {
  return node.type === schema.nodes.bulletList || node.type === schema.nodes.orderedList;
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
    const { state, dispatch, tr } = parameter;
    const { schema } = state;
    const { selection } = tr;
    const { $from, $to } = selection;
    const range = $from.blockRange($to);

    if (!range) {
      return false;
    }

    const parentList = findParentNode({
      predicate: (node) => isList(node, schema),
      selection,
    });

    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      if (parentList.node.type === type) {
        return liftListItem(itemType)(state, dispatch);
      }

      if (isList(parentList.node, schema) && type.validContent(parentList.node.content)) {
        tr.setNodeMarkup(parentList.pos, type);

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      }
    }

    return wrapInList(type)(state, dispatch);
  };
}

interface ToggleBlockItemParameter extends NodeTypeParameter, Partial<AttributesParameter> {
  /**
   * The type to toggle back to. Usually this is the paragraph node type.
   */
  toggleType: NodeType;
}

/**
 * Toggle a block between the provided type and toggleType.
 *
 * @param params - the destructured params
 *
 * @public
 */
export function toggleBlockItem(toggleParameter: ToggleBlockItemParameter): CommandFunction {
  return (parameter) => {
    const { tr } = parameter;
    const { type, toggleType, attrs } = toggleParameter;
    const isActive = isNodeActive({ state: tr, type, attrs });

    if (isActive) {
      return setBlockType(toggleType)(parameter);
    }

    return setBlockType(type, attrs)(parameter);
  };
}

interface ReplaceTextParameter extends Partial<RangeParameter>, Partial<AttributesParameter> {
  /**
   * The text to append.
   *
   * @default '''
   */
  appendText?: string;
  /**
   * Optional text content to include.
   */
  content?: string;

  /**
   * The content type to be inserted in place of the range / selection.
   */
  type?: NodeType | MarkType;

  /**
   * Whether to keep the original selection after the replacement.
   */
  keepSelection?: boolean;
}

/**
 * Taken from https://stackoverflow.com/a/4900484
 *
 * Check that the browser is chrome. Supports passing a minimum version to check
 * that it is a greater than or equal to this version.
 */
export function isChrome(minVersion = 0): boolean {
  const parsedAgent = navigator.userAgent.match(/Chrom(e|ium)\/(\d+)\./);

  return parsedAgent ? Number.parseInt(parsedAgent[2], 10) >= minVersion : false;
}

/**
 * Checks the selection for the current state and updates the active transaction
 * to use this mapped transaction.
 *
 * @param state - the editor state before any updates
 * @param tr - the transaction which has been updated and may have impacted the
 * selection.
 */
function preserveSelection(state: EditorState, tr: Transaction): void {
  // Get the previous movable part of the cursor selection.
  let { head } = state.selection;

  // Map this movable cursor selection through each of the steps that have happened in
  // the transaction.
  for (const step of tr.steps) {
    const map = step.getMap();
    head = map.map(head);
  }

  if (state.selection.empty) {
    // Update the transaction with the new text selection.
    tr.setSelection(TextSelection.create(tr.doc, head));
  } else {
    tr.setSelection(TextSelection.create(tr.doc, state.selection.anchor, head));
  }
}

/**
 * Replaces text with an optional appended string at the end.
 *
 * @param params - the destructured params
 *
 * @public
 */
export function replaceText(parameter: ReplaceTextParameter): CommandFunction {
  const {
    range,
    type,
    attrs = {},
    appendText = '',
    content = '',
    keepSelection = false,
  } = parameter;

  return ({ state, tr, dispatch }) => {
    const schema = state.schema;
    const selection = tr.selection;
    const index = selection.$from.index();
    const { from, to } = range ?? selection;

    if (isNodeType(type)) {
      if (!selection.$from.parent.canReplaceWith(index, index, type)) {
        return false;
      }

      tr.replaceWith(from, to, type.create(attrs, content ? schema.text(content) : undefined));
    } else {
      invariant(content, {
        message: '`replaceText` cannot be called without content when using a mark type',
      });

      tr.replaceWith(
        from,
        to,
        schema.text(content, isMarkType(type) ? [type.create(attrs)] : undefined),
      );
    }

    // Only append the text if text is provided (ignore the empty string).
    if (appendText) {
      tr.insertText(appendText);
    }

    if (keepSelection) {
      preserveSelection(state, tr);
    }

    if (dispatch) {
      // A workaround for a chrome bug
      // https://github.com/ProseMirror/prosemirror/issues/710#issuecomment-338047650
      if (isChrome(60)) {
        document.getSelection()?.empty();
      }

      dispatch(tr);
    }

    return true;
  };
}

interface RemoveMarkParameter extends MarkTypeParameter, Partial<RangeParameter<'to'>> {
  /**
   * Whether to expand empty selections to the current mark range
   *
   * @default false
   */
  expand?: boolean;
}

/**
 * Removes a mark from the current selection or provided range.
 *
 * @param params - the destructured params
 *
 * @public
 */
export function removeMark(parameter: RemoveMarkParameter): CommandFunction {
  return ({ dispatch, tr }) => {
    const { type, expand = false, range } = parameter;
    const { selection } = tr;
    let { from, to } = range ?? selection;

    if (expand) {
      ({ from, to } = range
        ? getMarkRange(tr.doc.resolve(range.from), type) ||
          (isNumber(range.to) && getMarkRange(tr.doc.resolve(range.to), type)) || { from, to }
        : isSelectionEmpty(tr)
        ? getMarkRange(selection.$anchor, type) || { from, to }
        : { from, to });
    }

    tr.removeMark(from, isNumber(to) ? to : from, type);

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  };
}

/**
 * An empty (noop) command function.
 *
 * @remarks
 *
 * This is typically used to represent a default _do nothing_ action.
 */
export const emptyCommandFunction: ProsemirrorCommandFunction = () => false;
