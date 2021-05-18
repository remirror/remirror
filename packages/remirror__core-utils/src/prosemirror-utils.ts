import { ErrorConstant } from '@remirror/core-constants';
import {
  entries,
  invariant,
  isArray,
  isEmptyObject,
  isNonEmptyArray,
  isNullOrUndefined,
  isString,
  object,
} from '@remirror/core-helpers';
import type {
  AnyFunction,
  AttributesProps,
  EditorSchema,
  EditorState,
  EditorView,
  Fragment,
  KeyBindingCommandFunction,
  KeyBindings,
  MarkTypesProps,
  NodeTypeProps,
  NodeTypesProps,
  OptionalMarkProps,
  OptionalProsemirrorNodeProps,
  PosProps,
  ProsemirrorCommandFunction,
  ProsemirrorKeyBindings,
  ProsemirrorNode,
  ProsemirrorNodeProps,
  ResolvedPos,
  Selection,
  SelectionProps,
  Transaction,
  TransactionProps,
} from '@remirror/core-types';
import type { MarkSpec, NodeSpec, NodeType } from '@remirror/pm/model';
import { Selection as PMSelection } from '@remirror/pm/state';

import { isEditorState, isNodeSelection, isResolvedPos, isSelection } from './core-utils';
import { isTextDomNode } from './dom-utils';

interface NodeEqualsTypeProps<Schema extends EditorSchema = EditorSchema>
  extends NodeTypesProps<Schema>,
    OptionalProsemirrorNodeProps<Schema> {}

/**
 * Checks if the type a given `node` has a given `nodeType`.
 */
export function isNodeOfType<Schema extends EditorSchema = EditorSchema>(
  props: NodeEqualsTypeProps<Schema>,
): boolean {
  const { types, node } = props;

  if (!node) {
    return false;
  }

  const matches = (type: NodeType | string) => {
    return type === node.type || type === node.type.name;
  };

  if (isArray(types)) {
    return types.some(matches);
  }

  return matches(types);
}

interface MarkEqualsTypeProps<Schema extends EditorSchema = EditorSchema>
  extends MarkTypesProps<Schema>,
    OptionalMarkProps<Schema> {}

/**
 * Creates a new transaction object from a given transaction. This is useful
 * when applying changes to a transaction, that you may want to rollback.
 *
 * ```ts
 * function() applyUpdateIfValid(state: EditorState) {
 *   const tr = cloneTransaction(state.tr);
 *
 *   tr.insertText('hello');
 *
 *   if (!checkValid(tr)) {
 *     return;
 *   }
 *
 *   applyClonedTransaction({ clone: tr, tr: state.tr });
 * }
 * ```
 *
 * The above example applies a transaction to the cloned transaction then checks
 * to see if the changes are still valid and if they are applies the mutative
 * changes to the original state transaction.
 *
 * @param tr - the prosemirror transaction
 */
export function cloneTransaction(tr: Transaction): Transaction {
  return Object.assign(Object.create(tr), tr).setTime(Date.now());
}

interface ApplyClonedTransactionProps extends TransactionProps {
  /**
   * The clone.
   */
  clone: Transaction;
}

/**
 * Get the diff between two ordered arrays with a reference equality check.
 */
function diff<Type>(primary: Type[], other: Type[]): Type[] {
  return primary.filter((item, index) => item !== other[index]);
}

/**
 * Apply the steps of a cloned transaction to the original transaction `tr`.
 */
export function applyClonedTransaction(props: ApplyClonedTransactionProps): void {
  const { clone, tr } = props;
  const steps = diff(clone.steps, tr.steps);

  for (const step of steps) {
    tr.step(step);
  }
}

/**
 * Checks if the type a given `node` has a given `nodeType`.
 */
export function markEqualsType<Schema extends EditorSchema = EditorSchema>(
  props: MarkEqualsTypeProps<Schema>,
): boolean {
  const { types, mark } = props;
  return mark ? (Array.isArray(types) && types.includes(mark.type)) || mark.type === types : false;
}

interface RemoveNodeAtPositionProps extends TransactionProps, PosProps {}

/**
 * Performs a `delete` transaction that removes a node at a given position with
 * the given `node`. `position` should point at the position immediately before
 * the node.
 *
 * @param position - the prosemirror position
 */
export function removeNodeAtPosition({ pos, tr }: RemoveNodeAtPositionProps): Transaction {
  const node = tr.doc.nodeAt(pos);

  if (node) {
    tr.delete(pos, pos + node.nodeSize);
  }

  return tr;
}

interface ReplaceNodeAtPositionProps extends RemoveNodeAtPositionProps {
  content: Fragment | ProsemirrorNode | ProsemirrorNode[];
}

/**
 * Replaces the node at the provided position with the provided content.
 */
export function replaceNodeAtPosition({
  pos,
  tr,
  content,
}: ReplaceNodeAtPositionProps): Transaction {
  const node = tr.doc.nodeAt(pos);

  if (node) {
    tr.replaceWith(pos, pos + node.nodeSize, content);
  }

  return tr;
}

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
 */
export function findElementAtPosition<Schema extends EditorSchema = EditorSchema>(
  position: number,
  view: EditorView<Schema>,
): HTMLElement {
  const dom = view.domAtPos(position);
  const node = dom.node.childNodes[dom.offset];

  if (isTextDomNode(dom.node)) {
    return dom.node.parentNode as HTMLElement;
  }

  if (isNullOrUndefined(node) || isTextDomNode(node)) {
    return dom.node as HTMLElement;
  }

  return node as HTMLElement;
}

/**
 * Iterates over parent nodes, returning the closest node and its start position
 * that the `predicate` returns truthy for. `start` points to the start position
 * of the node, `pos` points directly before the node.
 *
 * ```ts
 * const predicate = node => node.type === schema.nodes.blockquote;
 * const parent = findParentNode({ predicate, selection });
 * ```
 */
export function findParentNode(props: FindParentNodeProps): FindProsemirrorNodeResult | undefined {
  const { predicate, selection } = props;
  const $pos = isEditorState(selection)
    ? selection.selection.$from
    : isSelection(selection)
    ? selection.$from
    : selection;

  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    const pos = depth > 0 ? $pos.before(depth) : 0;
    const start = $pos.start(depth);
    const end = pos + node.nodeSize;

    if (predicate(node, pos)) {
      return { pos, depth, node, start, end };
    }
  }

  return;
}

/**
 * Finds the node at the resolved position.
 *
 * @param $pos - the resolve position in the document
 */
export function findNodeAtPosition($pos: ResolvedPos): FindProsemirrorNodeResult {
  const { depth } = $pos;
  const pos = depth > 0 ? $pos.before(depth) : 0;
  const node = $pos.node(depth);
  const start = $pos.start(depth);
  const end = pos + node.nodeSize;

  return { pos, start, node, end, depth };
}

/**
 * Finds the node at the passed selection.
 */
export function findNodeAtSelection(selection: Selection): FindProsemirrorNodeResult {
  const parentNode = findParentNode({ predicate: () => true, selection });

  invariant(parentNode, { message: 'No parent node found for the selection provided.' });

  return parentNode;
}

interface FindParentNodeOfTypeProps extends NodeTypesProps, StateSelectionPosProps {}

/**
 *  Iterates over parent nodes, returning closest node of a given `nodeType`.
 *  `start` points to the start position of the node, `pos` points directly
 *  before the node.
 *
 *  ```ts
 *  const parent = findParentNodeOfType({types: schema.nodes.paragraph, selection});
 *  ```
 */
export function findParentNodeOfType(
  props: FindParentNodeOfTypeProps,
): FindProsemirrorNodeResult | undefined {
  const { types, selection } = props;

  return findParentNode({ predicate: (node) => isNodeOfType({ types, node }), selection });
}

/**
 * Returns position of the previous node.
 *
 * ```ts
 * const pos = findPositionOfNodeBefore(tr.selection);
 * ```
 *
 * @param selection - the prosemirror selection
 */
export function findPositionOfNodeBefore(
  value: Selection | ResolvedPos | EditorState | Transaction,
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
 * Updates the provided transaction to remove the node before.
 *
 * ```ts
 * dispatch(
 *    removeNodeBefore(state.tr)
 * );
 * ```
 *
 * @param tr
 */
export function removeNodeBefore(tr: Transaction): Transaction {
  const result = findPositionOfNodeBefore(tr.selection);

  if (result) {
    removeNodeAtPosition({ pos: result.pos, tr });
  }

  return tr;
}

interface FindSelectedNodeOfTypeProps<Schema extends EditorSchema = EditorSchema>
  extends NodeTypesProps<Schema>,
    SelectionProps<Schema> {}

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
export function findSelectedNodeOfType<Schema extends EditorSchema = EditorSchema>(
  props: FindSelectedNodeOfTypeProps<Schema>,
): FindProsemirrorNodeResult<Schema> | undefined {
  const { types, selection } = props;

  if (!isNodeSelection(selection) || !isNodeOfType({ types, node: selection.node })) {
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

export interface FindProsemirrorNodeResult<Schema extends EditorSchema = EditorSchema>
  extends ProsemirrorNodeProps<Schema> {
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

interface StateSelectionPosProps {
  /**
   * Provide an editor state, or the editor selection or a resolved position.
   */
  selection: EditorState | Selection | ResolvedPos;
}

interface FindParentNodeProps extends StateSelectionPosProps {
  predicate: (node: ProsemirrorNode, pos: number) => boolean;
}

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
export function findPositionOfNodeAfter(
  value: Selection | ResolvedPos | EditorState,
): FindProsemirrorNodeResult | undefined {
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
}

/**
 * Update the transaction to delete the node after the current selection.
 *
 * ```ts
 * dispatch(removeNodeBefore(state.tr));
 * ```
 *
 * @param tr
 */
export function removeNodeAfter(tr: Transaction): Transaction {
  const result = findPositionOfNodeAfter(tr.selection);

  if (result) {
    removeNodeAtPosition({ pos: result.pos, tr });
  }

  return tr;
}

/**
 * Checks whether the selection or state is currently empty.
 *
 * @param value - the transaction selection or state
 */
export function isSelectionEmpty(value: Transaction | EditorState | Selection): boolean {
  return isSelection(value) ? value.empty : value.selection.empty;
}

/**
 * Check to see if a transaction has changed either the document or the current
 * selection.
 *
 * @param tr - the transaction to check
 */
export function hasTransactionChanged(tr: Transaction): boolean {
  return tr.docChanged || tr.selectionSet;
}

/**
 * Checks whether the node type passed in is active within the region. Used by
 * extensions to implement the `active` method.
 *
 * To ignore `attrs` just leave the attrs object empty or undefined.
 *
 * @param props - see [[`GetActiveAttrsProps`]]
 */
export function isNodeActive(props: GetActiveAttrsProps): boolean {
  return !!getActiveNode(props);
}

interface GetActiveAttrsProps extends NodeTypeProps, Partial<AttributesProps> {
  /**
   * State or transaction parameter.
   */
  state: EditorState | Transaction;
}

/**
 * Get node of a provided type with the provided attributes if it exists as a
 * parent. Returns positional data for the node that was found.
 */
export function getActiveNode(props: GetActiveAttrsProps): FindProsemirrorNodeResult | undefined {
  const { state, type, attrs } = props;
  const { selection, doc } = state;
  const nodeType = isString(type) ? doc.type.schema.nodes[type] : type;

  invariant(nodeType, { code: ErrorConstant.SCHEMA, message: `No node exists for ${type}` });

  const active =
    findSelectedNodeOfType({ selection, types: type }) ??
    findParentNode({ predicate: (node: ProsemirrorNode) => node.type === nodeType, selection });

  if (!attrs || isEmptyObject(attrs) || !active) {
    return active;
  }

  return active.node.hasMarkup(nodeType, { ...active.node.attrs, ...attrs }) ? active : undefined;
}

/**
 * The ProseMirror `Schema` as a JSON object.
 */
export interface SchemaJSON<Nodes extends string = string, Marks extends string = string> {
  /**
   * The nodes of the schema.
   */
  nodes: Record<Nodes, NodeSpec>;

  /**
   * The marks within the schema.
   */
  marks: Record<Marks, MarkSpec>;
}

/**
 * Converts a `schema` to a JSON compatible object.
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
 * Chains together keybindings, allowing for the same key binding to be used
 * across multiple extensions without overriding behavior.
 *
 * @remarks
 *
 * When `next` is called it hands over full control of the keybindings to the
 * function that invokes it.
 */
export function chainKeyBindingCommands<Schema extends EditorSchema = EditorSchema>(
  ...commands: Array<KeyBindingCommandFunction<Schema>>
): KeyBindingCommandFunction<Schema> {
  return (props) => {
    // When no commands are passed just ignore and continue.
    if (!isNonEmptyArray(commands)) {
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
    const createNext =
      (...nextCommands: Array<KeyBindingCommandFunction<Schema>>): (() => boolean) =>
      () => {
        // If there are no commands then this can be ignored and continued.
        if (!isNonEmptyArray(nextCommands)) {
          return false;
        }

        // Update the closure with information that the next method was invoked by
        // this command.
        calledNext = true;

        const [, ...nextRest] = nextCommands;

        // Recursively call the key bindings method.
        return chainKeyBindingCommands(...nextCommands)({
          ...props,
          next: createNext(...nextRest),
        });
      };

    const next = createNext(...rest);
    const exitEarly = command({ ...props, next });

    // Exit the chain of commands early if either:
    // - a) next was called
    // - b) the command returned true
    if (calledNext || exitEarly) {
      return exitEarly;
    }

    // Continue to the next function in the chain of commands.
    return next();
  };
}

/**
 * Used to merge key bindings together in a sensible way. Identical key bindings
 * likely have the same key. as a result a naive merge would result in the
 * binding added later in the merge being the only one the editor sees.
 *
 * This creator is used to create a merge that steps from the highest priority
 * to the lowest priority giving each keybinding in the chain an opportunity to
 * be run, and defer to the next command in the chain or choose not to.
 *
 * - It is used to create the [[`mergeKeyBindings`]] function helper.
 * - It is used to create the [[`mergeProsemirrorKeyBindings`]] function helper.
 *
 * @template [Schema] - the schema that is being used to create this command.
 * @template [Type] - the mapper type signature which is what the `mapper`
 * param transforms the [[`KeyBindingCommandFunction`]]  into.
 *
 * @param extensionKeymaps - the list of extension keymaps similar to the
 * following:
 *   ```ts
 *     [{ Enter: () => false}, { Escape: () => true }, { Enter: () => true }]
 *   ```
 * @param mapper - used to convert the [[`KeyBindingCommandFunction`]] into a
 * function with a different signature. It's application can be seen in
 * [[`mergeKeyBindings`]] and [[`mergeProsemirrorKeyBindings`]].
 *
 */
function mergeKeyBindingCreator<
  Schema extends EditorSchema = EditorSchema,
  Mapper extends AnyFunction = KeyBindingCommandFunction<Schema>,
>(
  extensionKeymaps: Array<KeyBindings<Schema>>,
  mapper: (command: KeyBindingCommandFunction<Schema>) => Mapper,
): Record<string, Mapper> {
  // Keep track of the previous commands as we loop through the `extensionKeymaps`.
  const previousCommandsMap = new Map<string, Array<KeyBindingCommandFunction<Schema>>>();

  // This is the combined mapping of commands. Essentially this function turns
  // the `extensionKeymaps` array into a single object `extensionKeymap` which
  // composes each function to give full control to the developer.
  const mappedCommands: Record<string, Mapper> = object();

  // Outer loop iterates over each object keybinding.
  for (const extensionKeymap of extensionKeymaps) {
    // Inner loop checks each keybinding on the keybinding object. `key` refers
    // to the name of the keyboard combination, like `Shift-Enter` or
    // `Cmd-Escape`.
    for (const [key, newCommand] of entries(extensionKeymap)) {
      // Get the previous commands for this key if it already exists
      const previousCommands: Array<KeyBindingCommandFunction<Schema>> =
        previousCommandsMap.get(key) ?? [];

      // Update the commands array. This will be added to the
      // `previousCommandsMap` to track the current keyboard combination.
      const commands = [...previousCommands, newCommand];

      // Chain the keyboard binding so that you have all the niceties, like
      // being able to call `next` to run the remaining commands in the chain.
      const command = chainKeyBindingCommands(...commands);

      // Update the previous commands with the new commands that are now being used.
      previousCommandsMap.set(key, commands);

      // Store a copy of the mapped commands. If this was the last time this
      // loop ran, then this is the command that would be called when a users
      // enters the keyboard combination specified by the `key` in this context.
      mappedCommands[key] = mapper(command);
    }
  }

  return mappedCommands;
}

/**
 * This merges an array of keybindings into one keybinding with the priority
 * given to the items earlier in the array. `index: 0` has priority over `index:
 * 1` which has priority over `index: 2` and so on.
 *
 * This is for use on remirror keybindings. See `mergeProsemirrorKeyBindings`
 * for transforming the methods into `ProsemirrorCommandFunction`'s.
 */
export function mergeKeyBindings<Schema extends EditorSchema = EditorSchema>(
  extensionKeymaps: Array<KeyBindings<Schema>>,
): KeyBindings<Schema> {
  return mergeKeyBindingCreator(extensionKeymaps, (command) => command);
}

/**
 * This merges an array of keybindings into one keybinding with the priority
 * given to the items earlier in the array. `index: 0` has priority over `index:
 * 1` which has priority over `index: 2` and so on.
 *
 * This supports the [[ProsemirrorCommandFunction]] type signature where the
 * `state`, `dispatch` and `view` are passed as separate arguments.
 */
export function mergeProsemirrorKeyBindings<Schema extends EditorSchema = EditorSchema>(
  extensionKeymaps: Array<KeyBindings<Schema>>,
): ProsemirrorKeyBindings<Schema> {
  return mergeKeyBindingCreator(
    extensionKeymaps,
    // Convert the command to have a signature of the
    // [[`ProsemirrorCommandFunction`]].
    (command): ProsemirrorCommandFunction<Schema> =>
      (state, dispatch, view) => {
        return command({ state, dispatch, view, tr: state.tr, next: () => false });
      },
  );
}
