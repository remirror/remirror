import { MarkSpec, NodeSpec } from 'prosemirror-model';
import { Selection as PMSelection } from 'prosemirror-state';
import { isUndefined } from 'util';

import { bool, isEmptyArray, isNullOrUndefined, keys, object } from '@remirror/core-helpers';
import {
  Attributes,
  AttributesParameter,
  CommandFunction,
  EditorSchema,
  EditorState,
  EditorStateParameter,
  EditorView,
  KeyBindingCommandFunction,
  NodeTypeParameter,
  NodeTypesParameter,
  OptionalProsemirrorNodeParameter,
  PosParameter,
  PredicateParameter,
  ProsemirrorCommandFunction,
  ProsemirrorNode,
  ProsemirrorNodeParameter,
  ResolvedPos,
  Selection,
  SelectionParameter,
  Transaction,
  TransactionParameter,
} from '@remirror/core-types';

import {
  isEditorState,
  isNodeSelection,
  isResolvedPos,
  isSelection,
  isTextDOMNode,
} from './dom-utils';

interface NodeEqualsTypeParams extends NodeTypesParameter, OptionalProsemirrorNodeParameter {}

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

interface RemoveNodeAtPositionParams extends TransactionParameter, PosParameter {}

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
export const findNodeAtEndOfDoc = (document_: ProsemirrorNode) =>
  findNodeAtPosition(PMSelection.atEnd(document_).$from);

/**
 * Finds the node at the start of the prosemirror.
 *
 * @param doc - the parent doc node of the editor which contains all the other
 * nodes.
 *
 * @deprecated use `doc.firstChild` instead
 */
export const findNodeAtStartOfDoc = (document_: ProsemirrorNode) =>
  findNodeAtPosition(PMSelection.atStart(document_).$from);

interface FindParentNodeOfTypeParams extends NodeTypesParameter, SelectionParameter {}

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
  return findParentNode({ predicate: (node) => nodeEqualsType({ types, node }), selection });
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
  const $pos = isResolvedPos(value)
    ? value
    : isSelection(value)
    ? value.$from
    : value.selection.$from;

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
> extends NodeTypesParameter<GSchema>, SelectionParameter<GSchema, GSelection> {}

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
}: FindSelectedNodeOfTypeParams<GSchema, GSelection>):
  | FindSelectedNodeOfType<GSchema>
  | undefined => {
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
  extends ProsemirrorNodeParameter<GSchema> {
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

interface FindParentNodeParams extends SelectionParameter, PredicateParameter<ProsemirrorNode> {}

/**
 * Returns the position of the node after the current position, selection or
 * state.
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
  const $pos = isResolvedPos(value)
    ? value
    : isSelection(value)
    ? value.$from
    : value.selection.$from;

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

interface IsNodeActiveParams
  extends EditorStateParameter,
    NodeTypeParameter,
    Partial<AttributesParameter> {}

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
export const isNodeActive = ({
  state,
  type,
  attrs: attributes = object<Attributes>(),
}: IsNodeActiveParams) => {
  const { selection } = state;
  const predicate = (node: ProsemirrorNode) => node.type === type;
  const parent =
    findSelectedNodeOfType({ selection, types: type }) ?? findParentNode({ predicate, selection });

  if (!Object.keys(attributes).length || !parent) {
    return bool(parent);
  }

  return parent.node.hasMarkup(type, attributes);
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
  const nodes = keys(schema.nodes).reduce((accumulator, key) => {
    const { spec } = schema.nodes[key];
    return { ...accumulator, [key]: spec };
  }, object<SchemaJSON['nodes']>());

  const marks = keys(schema.marks).reduce((accumulator, key) => {
    const { spec } = schema.marks[key];
    return { ...accumulator, [key]: spec };
  }, object<SchemaJSON['marks']>());

  return {
    nodes,
    marks,
  };
};

/**
 * Wraps the default {@link ProsemirrorCommandFunction} and makes it compatible
 * with the default **remirror** {@link CommandFunction} call signature.
 */
export const convertCommand = <
  GSchema extends EditorSchema = any,
  GExtraParams extends object = {}
>(
  commandFunction: ProsemirrorCommandFunction<GSchema>,
): CommandFunction<GSchema, GExtraParams> => ({ state, dispatch, view }) =>
  commandFunction(state, dispatch, view);

/**
 * Similar to the chainCommands from the `prosemirror-commands` library. Allows
 * multiple commands to be chained together and runs until one of them returns
 * true.
 */
export const chainCommands = <GSchema extends EditorSchema = any, GExtraParams extends object = {}>(
  ...commands: Array<CommandFunction<GSchema, GExtraParams>>
): CommandFunction<GSchema, GExtraParams> => ({ state, dispatch, view, ...rest }) => {
  for (const element of commands) {
    if (element({ state, dispatch, view, ...(rest as GExtraParams) })) {
      return true;
    }
  }

  return false;
};

/**
 * Chains together keybindings, allowing for the sme key binding to be used
 * across multiple extensions without overriding behavior.
 *
 * @remarks
 *
 * When `next` is called it hands over full control of the keybindings to the
 * function that invokes it.
 */
export const chainKeyBindingCommands = (
  ...commands: KeyBindingCommandFunction[]
): KeyBindingCommandFunction => (parameters) => {
  // When no commands are passed just ignore and continue.
  if (isEmptyArray(commands)) {
    return false;
  }

  const [command, ...rest] = commands;

  // Keeps track of whether the `next` method has been called. If it has been
  // called we return the result and skip the rest of the downstream commands.
  let calledNext = false;

  /**
   * Create the next function call. Updates the outer closure when the next
   * method has been called.
   */
  const createNext = (...nextCommands: KeyBindingCommandFunction[]): (() => boolean) => () => {
    if (isEmptyArray(nextCommands)) {
      return false;
    }

    // Update the closure with information that the next method was invoked by
    // this command.
    calledNext = true;

    const [, ...nextRest] = nextCommands;

    // Recursively call the key bindings method.
    return chainKeyBindingCommands(...nextCommands)({
      ...parameters,
      next: createNext(...nextRest),
    });
  };

  const next = createNext(...rest);
  const exitEarly = command({ ...parameters, next });

  // Exit the chain of commands early if either:
  // - a) next was called
  // - b) the command returned true
  if (calledNext || exitEarly) {
    return exitEarly;
  }

  // Continue on through the chain of commands.
  return next();
};
