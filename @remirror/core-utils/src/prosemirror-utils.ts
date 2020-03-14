import { isUndefined } from 'util';

import { MarkSpec, NodeSpec } from 'prosemirror-model';
import { Selection as PMSelection } from 'prosemirror-state';

import { bool, isNullOrUndefined, keys } from '@remirror/core-helpers';
import {
  AttrsParams,
  CommandFunction,
  EditorSchema,
  EditorState,
  EditorStateParams,
  EditorView,
  KeyBindingCommandFunction,
  NodeTypeParams,
  NodeTypesParams,
  OptionalProsemirrorNodeParams,
  PosParams,
  PredicateParams,
  ProsemirrorCommandFunction,
  ProsemirrorNode,
  ProsemirrorNodeParams,
  ResolvedPos,
  Selection,
  SelectionParams,
  Transaction,
  TransactionParams,
} from '@remirror/core-types';

import { isEditorState, isNodeSelection, isResolvedPos, isSelection, isTextDOMNode } from './dom-utils';

/* "Borrowed" from prosemirror-utils in order to avoid requirement of
`@prosemirror-tables`*/

interface NodeEqualsTypeParams extends NodeTypesParams, OptionalProsemirrorNodeParams {}

/**
 * Checks if the type a given `node` equals to a given `nodeType`.
 */
export const nodeEqualsType = ({ types, node }: NodeEqualsTypeParams) => {
  return node ? (Array.isArray(types) && types.includes(node.type)) || node.type === types : false;
};

/**
 * Creates a new transaction object from a given transaction
 *
 * @param tr - the prosemirror transaction
 *
 * @public
 */
export const cloneTransaction = (tr: Transaction): Transaction => {
  return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

interface RemoveNodeAtPositionParams extends TransactionParams, PosParams {}
/**
 * Returns a `delete` transaction that removes a node at a given position with
 * the given `node`. `position` should point at the position immediately before
 * the node.
 *
 * @param position - the prosemirror position
 *
 * @public
 */
export const removeNodeAtPosition = ({ pos, tr }: RemoveNodeAtPositionParams) => {
  const node = tr.doc.nodeAt(pos);

  if (!node) {
    return tr;
  }

  return cloneTransaction(tr.delete(pos, pos + node.nodeSize));
};

/**
 * Returns DOM reference of a node at a given `position`.
 *
 * @remarks
 *
 * If the node type is of type `TEXT_NODE` it will return the reference of the
 * parent node.
 *
 * A simple use case
 *
 * ```ts
 * const element = findElementAtPosition($from.pos, view);
 * ```
 *
 * @param position - the prosemirror position
 * @param view - the editor view
 *
 * @public
 */
export const findElementAtPosition = (position: number, view: EditorView): HTMLElement => {
  const dom = view.domAtPos(position);
  const node = dom.node.childNodes[dom.offset];

  if (isTextDOMNode(dom.node)) {
    return dom.node.parentNode as HTMLElement;
  }

  if (isNullOrUndefined(node) || isTextDOMNode(node)) {
    return dom.node as HTMLElement;
  }

  return node as HTMLElement;
};

/**
 * Iterates over parent nodes, returning the closest node and its start position
 * that the `predicate` returns truthy for. `start` points to the start position
 * of the node, `pos` points directly before the node.
 *
 * ```ts
 * const predicate = node => node.type === schema.nodes.blockquote;
 * const parent = findParentNode({predicate, selection});
 * ```
 */
export const findParentNode = ({
  predicate,
  selection,
}: FindParentNodeParams): FindProsemirrorNodeResult | undefined => {
  const { $from } = selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (predicate(node)) {
      const pos = depth > 0 ? $from.before(depth) : 0;
      const start = $from.start(depth);
      const end = pos + node.nodeSize;
      return {
        pos,
        depth,
        node,
        start,
        end,
      };
    }
  }
  return;
};

/**
 * Finds the node at the resolved position.
 *
 * @param $pos - the resolve position in the document
 */
export const findNodeAtPosition = ($pos: ResolvedPos): FindProsemirrorNodeResult => {
  const { depth } = $pos;
  const pos = depth > 0 ? $pos.before(depth) : 0;
  const node = $pos.node(depth);
  const start = $pos.start(depth);
  const end = pos + node.nodeSize;

  return {
    pos,
    start,
    node,
    end,
    depth,
  };
};

/**
 * Finds the node at the passed selection.
 */
export const findNodeAtSelection = (selection: Selection): FindProsemirrorNodeResult => {
  const parentNode = findParentNode({ predicate: () => true, selection });

  if (isUndefined(parentNode)) {
    throw new Error('No parent node found for the selection provided.');
  }

  return parentNode;
};

/**
 * Finds the node at the end of the Prosemirror document.
 *
 * @param doc - the parent doc node of the editor which contains all the other
 * nodes.
 *
 * @deprecated use `doc.lastChild` instead
 */
export const findNodeAtEndOfDoc = (doc: ProsemirrorNode) => findNodeAtPosition(PMSelection.atEnd(doc).$from);

/**
 * Finds the node at the start of the prosemirror.
 *
 * @param doc - the parent doc node of the editor which contains all the other
 * nodes.
 *
 * @deprecated use `doc.firstChild` instead
 */
export const findNodeAtStartOfDoc = (doc: ProsemirrorNode) =>
  findNodeAtPosition(PMSelection.atStart(doc).$from);

interface FindParentNodeOfTypeParams extends NodeTypesParams, SelectionParams {}

/**
 *  Iterates over parent nodes, returning closest node of a given `nodeType`.
 *  `start` points to the start position of the node, `pos` points directly
 *  before the node.
 *
 *  ```ts
 *  const parent = findParentNodeOfType({types: schema.nodes.paragraph, selection});
 *  ```
 */
export const findParentNodeOfType = ({
  types,
  selection,
}: FindParentNodeOfTypeParams): FindProsemirrorNodeResult | undefined => {
  return findParentNode({ predicate: node => nodeEqualsType({ types, node }), selection });
};

/**
 * Returns position of the previous node.
 *
 * ```ts
 * const pos = findPositionOfNodeBefore(tr.selection);
 * ```
 *
 * @param selection - the prosemirror selection
 */
export const findPositionOfNodeBefore = <GSchema extends EditorSchema = any>(
  value: Selection<GSchema> | ResolvedPos<GSchema> | EditorState<GSchema> | Transaction<GSchema>,
): FindProsemirrorNodeResult | undefined => {
  const $pos = isResolvedPos(value) ? value : isSelection(value) ? value.$from : value.selection.$from;

  if (isNullOrUndefined($pos)) {
    throw new Error('Invalid value passed in.');
  }

  const { nodeBefore } = $pos;
  const selection = PMSelection.findFrom($pos, -1);

  if (!selection || !nodeBefore) {
    return;
  }

  const parent = findParentNodeOfType({ types: nodeBefore.type, selection });
  return parent
    ? parent
    : {
        node: nodeBefore,
        pos: selection.$from.pos,
        end: selection.$from.end(),
        depth: selection.$from.depth + 1,
        start: selection.$from.start(selection.$from.depth + 1),
      };
};

/**
 * Returns a new transaction that deletes previous node.
 *
 * ```ts
 * dispatch(
 *    removeNodeBefore(state.tr)
 * );
 * ```
 *
 * @param tr
 *
 * @public
 */
export const removeNodeBefore = (tr: Transaction): Transaction => {
  const result = findPositionOfNodeBefore(tr.selection);
  if (result) {
    return removeNodeAtPosition({ pos: result.pos, tr });
  }
  return tr;
};

interface FindSelectedNodeOfTypeParams<
  GSchema extends EditorSchema = any,
  GSelection extends Selection<GSchema> = Selection<GSchema>
> extends NodeTypesParams<GSchema>, SelectionParams<GSchema, GSelection> {}

export interface FindSelectedNodeOfType<GSchema extends EditorSchema = any>
  extends FindProsemirrorNodeResult<GSchema> {
  /**
   * The depth of the returned node.
   */
  depth: number;
}

/**
 * Returns a node of a given `nodeType` if it is selected. `start` points to the
 * start position of the node, `pos` points directly before the node.
 *
 * ```ts
 * const { extension, inlineExtension, bodiedExtension } = schema.nodes;
 *
 * const selectedNode = findSelectedNodeOfType({
 *   types: [extension, inlineExtension, bodiedExtension],
 *   selection,
 * });
 * ```
 */
export const findSelectedNodeOfType = <
  GSchema extends EditorSchema = any,
  GSelection extends Selection<GSchema> = Selection<GSchema>
>({
  types,
  selection,
}: FindSelectedNodeOfTypeParams<GSchema, GSelection>): FindSelectedNodeOfType<GSchema> | undefined => {
  if (isNodeSelection(selection)) {
    const { node, $from } = selection;
    if (nodeEqualsType({ types, node })) {
      return {
        node,
        pos: $from.pos,
        depth: $from.depth,
        start: $from.start(),
        end: $from.pos + node.nodeSize,
      };
    }
  }
  return undefined;
};

export interface FindProsemirrorNodeResult<GSchema extends EditorSchema = any>
  extends ProsemirrorNodeParams<GSchema> {
  /**
   * The start position of the node.
   */
  start: number;

  /**
   * The end position of the node.
   */
  end: number;

  /**
   * Points to position directly before the node.
   */
  pos: number;

  /**
   * The depth the node. Equal to 0 if node is the root.
   */
  depth: number;
}

interface FindParentNodeParams extends SelectionParams, PredicateParams<ProsemirrorNode> {}

/**
 * Returns the position of the node after the current position, selection or state.
 *
 * ```ts
 * const pos = findPositionOfNodeBefore(tr.selection);
 * ```
 *
 * @param selection - the prosemirror selection
 */
export const findPositionOfNodeAfter = <GSchema extends EditorSchema = any>(
  value: Selection<GSchema> | ResolvedPos<GSchema> | EditorState<GSchema>,
): FindProsemirrorNodeResult | undefined => {
  const $pos = isResolvedPos(value) ? value : isSelection(value) ? value.$from : value.selection.$from;

  if (isNullOrUndefined($pos)) {
    throw new Error('Invalid value passed in.');
  }

  const { nodeAfter } = $pos;
  const selection = PMSelection.findFrom($pos, 1);

  if (!selection || !nodeAfter) {
    return;
  }

  const parent = findParentNodeOfType({ types: nodeAfter.type, selection });

  return parent
    ? parent
    : {
        node: nodeAfter,
        pos: selection.$from.pos,
        end: selection.$from.end(),
        depth: selection.$from.depth + 1,
        start: selection.$from.start(selection.$from.depth + 1),
      };
};

/**
 * Returns a new transaction that deletes the node after.
 *
 * ```ts
 * dispatch(
 *    removeNodeBefore(state.tr)
 * );
 * ```
 *
 * @param tr
 *
 * @public
 */
export const removeNodeAfter = (tr: Transaction): Transaction => {
  const result = findPositionOfNodeAfter(tr.selection);
  if (result) {
    return removeNodeAtPosition({ pos: result.pos, tr });
  }
  return tr;
};

/**
 * Checks whether the selection or state is currently empty.
 *
 * @param value - the current selection or state
 */
export const selectionEmpty = (value: Selection | EditorState) =>
  isSelection(value) ? value.empty : isEditorState(value) ? value.selection.empty : true;

/**
 * Check to see if a transaction has changed either the document or the current
 * selection.
 *
 * @param params - the TransactionChangeParams object
 */
export const transactionChanged = (tr: Transaction) => {
  return tr.docChanged || tr.selectionSet;
};

interface IsNodeActiveParams extends EditorStateParams, NodeTypeParams, Partial<AttrsParams> {}

/**
 * Checks whether the node type passed in is active within the region. Used by
 * extensions to implement the `#active` method.
 *
 * To ignore attrs just leave the attrs object empty or undefined.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param params - the destructured node active parameters
 */
export const isNodeActive = ({ state, type, attrs = Object.create(null) }: IsNodeActiveParams) => {
  const { selection } = state;
  const predicate = (node: ProsemirrorNode) => node.type === type;
  const parent =
    findSelectedNodeOfType({ selection, types: type }) ?? findParentNode({ predicate, selection });

  if (!Object.keys(attrs).length || !parent) {
    return bool(parent);
  }

  return parent.node.hasMarkup(type, attrs);
};

export interface SchemaJSON<GNodes extends string = string, GMarks extends string = string> {
  nodes: Record<GNodes, NodeSpec>;
  marks: Record<GMarks, MarkSpec>;
}

/**
 * Converts a schema to a simple json compatible object.
 */
export const schemaToJSON = <GNodes extends string = string, GMarks extends string = string>(
  schema: EditorSchema<GNodes, GMarks>,
): SchemaJSON<GNodes, GMarks> => {
  const nodes = keys(schema.nodes).reduce((acc, key) => {
    const { spec } = schema.nodes[key];
    return { ...acc, [key]: spec };
  }, Object.create(null));

  const marks = keys(schema.marks).reduce((acc, key) => {
    const { spec } = schema.marks[key];
    return { ...acc, [key]: spec };
  }, Object.create(null));

  return {
    nodes,
    marks,
  };
};

/**
 * Wraps the default {@link ProsemirrorCommandFunction} and makes it compatible with the default **remirror**
 * {@link CommandFunction} call signature.
 */
export const convertCommand = <GSchema extends EditorSchema = any, GExtraParams extends object = {}>(
  commandFunction: ProsemirrorCommandFunction<GSchema>,
): CommandFunction<GSchema, GExtraParams> => ({ state, dispatch, view }) =>
  commandFunction(state, dispatch, view);

/**
 * Similar to the chainCommands from the `prosemirror-commands` library. Allows multiple commands to be
 * chained together and runs until one of them returns true.
 */
export const chainCommands = <GSchema extends EditorSchema = any, GExtraParams extends object = {}>(
  ...commands: Array<CommandFunction<GSchema, GExtraParams>>
): CommandFunction<GSchema, GExtraParams> => ({ state, dispatch, view, ...rest }) => {
  for (let commandIndex = 0; commandIndex < commands.length; commandIndex++) {
    if (commands[commandIndex]({ state, dispatch, view, ...(rest as GExtraParams) })) {
      return true;
    }
  }

  return false;
};

/**
 * Chains together keybindings.
 *
 * @remarks
 *
 * When `next` hands over full control of the keybindings to the caller.
 */
export const chainKeyBindingCommands = (
  ...commands: KeyBindingCommandFunction[]
): KeyBindingCommandFunction => params => {
  if (!commands.length) {
    return false;
  }

  const [command, ...rest] = commands;

  let calledNext = false;

  const createNext = (...nextCommands: KeyBindingCommandFunction[]): (() => boolean) => () => {
    if (!nextCommands.length) {
      return false;
    }

    calledNext = true;

    const [, ...nextRest] = nextCommands;
    return chainKeyBindingCommands(...nextCommands)({ ...params, next: createNext(...nextRest) });
  };

  const next = createNext(...rest);
  const status = command({ ...params, next });

  if (calledNext || status) {
    return status;
  }

  return next();
};
