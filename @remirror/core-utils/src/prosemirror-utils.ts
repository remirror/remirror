import { ErrorConstant } from '@remirror/core-constants';
import {
  bool,
  entries,
  invariant,
  isEmptyArray,
  isEmptyObject,
  isNullOrUndefined,
  isUndefined,
  keys,
  object,
} from '@remirror/core-helpers';
import {
  AnyFunction,
  AttributesParameter,
  Brand,
  CommandFunction,
  EditorSchema,
  EditorState,
  EditorStateParameter,
  EditorView,
  EmptyShape,
  KeyBindingCommandFunction,
  KeyBindings,
  MarkTypesParameter,
  NodeTypeParameter,
  NodeTypesParameter,
  OptionalMarkParameter,
  OptionalProsemirrorNodeParameter,
  PosParameter,
  PredicateParameter,
  ProsemirrorCommandFunction,
  ProsemirrorKeyBindings,
  ProsemirrorNode,
  ProsemirrorNodeParameter,
  ResolvedPos,
  Selection,
  SelectionParameter,
  Shape,
  Transaction,
  TransactionParameter,
} from '@remirror/core-types';
import { MarkSpec, NodeSpec } from '@remirror/pm/model';
import { Selection as PMSelection } from '@remirror/pm/state';

import {
  isEditorState,
  isNodeSelection,
  isResolvedPos,
  isSelection,
  isTextDOMNode,
} from './dom-utils';

interface NodeEqualsTypeParameter<Schema extends EditorSchema = any>
  extends NodeTypesParameter<Schema>,
    OptionalProsemirrorNodeParameter<Schema> {}

/**
 * Checks if the type a given `node` has a given `nodeType`.
 */
export function nodeEqualsType<Schema extends EditorSchema = any>(
  parameter: NodeEqualsTypeParameter<Schema>,
) {
  const { types, node } = parameter;
  return node ? (Array.isArray(types) && types.includes(node.type)) || node.type === types : false;
}

interface MarkEqualsTypeParameter<Schema extends EditorSchema = any>
  extends MarkTypesParameter<Schema>,
    OptionalMarkParameter<Schema> {}

/**
 * Checks if the type a given `node` has a given `nodeType`.
 */
export function markEqualsType<Schema extends EditorSchema = any>(
  parameter: MarkEqualsTypeParameter<Schema>,
) {
  const { types, mark } = parameter;
  return mark ? (Array.isArray(types) && types.includes(mark.type)) || mark.type === types : false;
}

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

interface RemoveNodeAtPositionParameter extends TransactionParameter, PosParameter {}

/**
 * Returns a `delete` transaction that removes a node at a given position with
 * the given `node`. `position` should point at the position immediately before
 * the node.
 *
 * @param position - the prosemirror position
 *
 * @public
 */
export const removeNodeAtPosition = ({ pos, tr }: RemoveNodeAtPositionParameter) => {
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
}: FindParentNodeParameter): FindProsemirrorNodeResult | undefined => {
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
export const findNodeAtEndOfDoc = (doc: ProsemirrorNode) =>
  findNodeAtPosition(PMSelection.atEnd(doc).$from);

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

interface FindParentNodeOfTypeParameter extends NodeTypesParameter, SelectionParameter {}

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
}: FindParentNodeOfTypeParameter): FindProsemirrorNodeResult | undefined => {
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
export function findPositionOfNodeBefore<Schema extends EditorSchema = any>(
  value: Selection<Schema> | ResolvedPos<Schema> | EditorState<Schema> | Transaction<Schema>,
): FindProsemirrorNodeResult | undefined {
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
}

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

interface FindSelectedNodeOfTypeParameter<Schema extends EditorSchema = any>
  extends NodeTypesParameter<Schema>,
    SelectionParameter<Schema> {}

export interface FindSelectedNodeOfType<Schema extends EditorSchema = any>
  extends FindProsemirrorNodeResult<Schema> {
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
export function findSelectedNodeOfType<Schema extends EditorSchema = any>(
  parameter: FindSelectedNodeOfTypeParameter<Schema>,
): FindSelectedNodeOfType<Schema> | undefined {
  const { types, selection } = parameter;

  if (!isNodeSelection(selection) || !nodeEqualsType({ types, node: selection.node })) {
    return;
  }

  return {
    pos: selection.$from.pos,
    depth: selection.$from.depth,
    start: selection.$from.start(),
    end: selection.$from.pos + selection.node.nodeSize,
    node: selection.node as ProsemirrorNode<Schema>,
  };
}

export interface FindProsemirrorNodeResult<Schema extends EditorSchema = any>
  extends ProsemirrorNodeParameter<Schema> {
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

interface FindParentNodeParameter extends SelectionParameter, PredicateParameter<ProsemirrorNode> {}

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
export const findPositionOfNodeAfter = <Schema extends EditorSchema = any>(
  value: Selection<Schema> | ResolvedPos<Schema> | EditorState<Schema>,
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
 * @param params - the TransactionChangeParameter object
 */
export const transactionChanged = (tr: Transaction) => {
  return tr.docChanged || tr.selectionSet;
};

interface IsNodeActiveParameter
  extends EditorStateParameter,
    NodeTypeParameter,
    Partial<AttributesParameter> {}

/**
 * Checks whether the node type passed in is active within the region. Used by
 * extensions to implement the `#active` method.
 *
 * To ignore `attrs` just leave the attrs object empty or undefined.
 *
 * @param params - the destructured node active parameters
 */
export const isNodeActive = ({ state, type, attrs }: IsNodeActiveParameter) => {
  const { selection } = state;
  const predicate = (node: ProsemirrorNode) => node.type === type;

  const parent =
    findSelectedNodeOfType({ selection, types: type }) ?? findParentNode({ predicate, selection });

  if (!attrs || isEmptyObject(attrs) || !parent) {
    return bool(parent);
  }

  return parent.node.hasMarkup(type, attrs);
};

export interface SchemaJSON<Nodes extends string = string, Marks extends string = string> {
  nodes: Record<Nodes, NodeSpec>;
  marks: Record<Marks, MarkSpec>;
}

/**
 * Converts a schema to a simple json compatible object.
 */
export function schemaToJSON<Nodes extends string = string, Marks extends string = string>(
  schema: EditorSchema<Nodes, Marks>,
): SchemaJSON<Nodes, Marks> {
  const nodes: SchemaJSON['nodes'] = object();
  const marks: SchemaJSON['marks'] = object();

  for (const [key, { spec }] of entries(schema.nodes)) {
    nodes[key] = spec;
  }

  for (const [key, { spec }] of entries(schema.marks)) {
    marks[key] = spec;
  }

  return {
    nodes,
    marks,
  };
}

/**
 * Wraps the default {@link ProsemirrorCommandFunction} and makes it compatible
 * with the default **remirror** {@link CommandFunction} call signature.
 */
export function convertCommand<Schema extends EditorSchema = any, Extra extends Shape = EmptyShape>(
  commandFunction: ProsemirrorCommandFunction<Schema>,
): CommandFunction<Schema, Extra> {
  return ({ state, dispatch, view }) => commandFunction(state, dispatch, view);
}

/**
 * Brands a command as non chainable so that it can be excluded from the
 * inferred chainable commands.
 */
export type NonChainableCommandFunction<
  Schema extends EditorSchema = any,
  Extra extends Shape = EmptyShape
> = Brand<CommandFunction<Schema, Extra>, 'non-chainable'>;

/**
 * Marks a command function as non chainable. It will throw an error when
 * chaining is attempted.
 *
 * @remarks
 *
 * ```ts
 * const command = nonChainable(({ state, dispatch }) => {...});
 * ```
 */
export function nonChainable<Schema extends EditorSchema = any, Extra extends Shape = EmptyShape>(
  commandFunction: CommandFunction<Schema, Extra>,
): NonChainableCommandFunction<Schema, Extra> {
  return ((parameter) => {
    invariant(parameter.dispatch === undefined || parameter.dispatch === parameter.view?.dispatch, {
      code: ErrorConstant.NON_CHAINABLE_COMMAND,
    });

    return commandFunction(parameter);
  }) as NonChainableCommandFunction<Schema, Extra>;
}

/**
 * Similar to the chainCommands from the `prosemirror-commands` library. Allows
 * multiple commands to be chained together and runs until one of them returns
 * true.
 */
export const chainCommands = <Schema extends EditorSchema = any, Extra extends object = object>(
  ...commands: Array<CommandFunction<Schema, Extra>>
): CommandFunction<Schema, Extra> => ({ state, dispatch, view, ...rest }) => {
  for (const element of commands) {
    if (element({ state, dispatch, view, ...(rest as Extra) })) {
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

function mergeKeyBindingCreator<
  Schema extends EditorSchema = any,
  Type extends AnyFunction = KeyBindingCommandFunction<Schema>
>(
  extensionKeymaps: Array<KeyBindings<Schema>>,
  mapper: (command: KeyBindingCommandFunction) => Type,
): Record<string, Type> {
  const previousCommandsMap = new Map<string, KeyBindingCommandFunction[]>();
  const mappedCommands: Record<string, Type> = object();

  for (const extensionKeymap of extensionKeymaps) {
    for (const key of keys(extensionKeymap)) {
      const previousCommands: KeyBindingCommandFunction[] = previousCommandsMap.get(key) ?? [];
      const commands = [...previousCommands, extensionKeymap[key]];
      const command = chainKeyBindingCommands(...commands);
      previousCommandsMap.set(key, commands);

      mappedCommands[key] = mapper(command);
    }
  }

  return mappedCommands;
}

/**
 * This merges an array of keybindings into one keybinding with the priority
 * given to the items earlier in the array. `index: 0` has priority over `index: 1`
 * which has priority over `index: 2` and so on.
 *
 * This is for use on remirror keybindings. See `mergeProsemirrorKeyBindings`
 * for transforming the methods into `ProsemirrorCommandFunction`'s.
 */
export function mergeKeyBindings<Schema extends EditorSchema = any>(
  extensionKeymaps: Array<KeyBindings<Schema>>,
): KeyBindings<Schema> {
  return mergeKeyBindingCreator(extensionKeymaps, (command) => command);
}

/**
 * This merges an array of keybindings into one keybinding with the priority
 * given to the items earlier in the array. `index: 0` has priority over `index: 1`
 * which has priority over `index: 2` and so on.
 */
export function mergeProsemirrorKeyBindings<Schema extends EditorSchema = any>(
  extensionKeymaps: Array<KeyBindings<Schema>>,
): ProsemirrorKeyBindings<Schema> {
  return mergeKeyBindingCreator(
    extensionKeymaps,
    (command): ProsemirrorCommandFunction => (state, dispatch, view) => {
      return command({ state, dispatch, view, next: () => false });
    },
  );
}
