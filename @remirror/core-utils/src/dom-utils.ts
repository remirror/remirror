import minDocument from 'min-document';

import { EMPTY_NODE, EMPTY_PARAGRAPH_NODE } from '@remirror/core-constants';
import {
  bool,
  Cast,
  isFunction,
  isNullOrUndefined,
  isNumber,
  isObject,
  isString,
  RemirrorError,
} from '@remirror/core-helpers';
import {
  EditorSchema,
  EditorState,
  EditorViewParameter,
  ElementParameter,
  FromToParameter,
  MarkTypeParameter,
  NodeMatch,
  PluginKey,
  Position,
  PositionParameter,
  ProsemirrorNode,
  ProsemirrorNodeParameter,
  RegexTuple,
  RemirrorContentType,
  RemirrorJSON,
  RenderEnvironment,
  ResolvedPos,
  SchemaParameter,
  Selection,
  StateOrTransactionParameter,
  Transaction,
} from '@remirror/core-types';
import {
  DOMParser,
  DOMSerializer,
  Fragment,
  Mark,
  MarkType,
  Node as PMNode,
  NodeType,
  ResolvedPos as PMResolvedPos,
  Schema,
  Slice,
} from '@remirror/pm/model';
import {
  EditorState as PMEditorState,
  NodeSelection,
  Plugin,
  Selection as PMSelection,
  TextSelection,
  Transaction as PMTransaction,
} from '@remirror/pm/state';

import { environment } from './environment';

/**
 * Check to see if the passed value is a NodeType.
 *
 * @param value - the value to check
 *
 * @public
 */
export function isNodeType<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is NodeType<Schema> {
  return isObject(value) && value instanceof NodeType;
}

/**
 * Check to see if the passed value is a MarkType.
 *
 * @param value - the value to check
 *
 * @public
 */
export function isMarkType<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is MarkType<Schema> {
  return isObject(value) && value instanceof MarkType;
}

/**
 * Checks to see if the passed value is a ProsemirrorNode
 *
 * @param value - the value to check
 *
 * @public
 */
export function isProsemirrorNode<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is PMNode<Schema> {
  return isObject(value) && value instanceof PMNode;
}

/**
 * Checks to see if the passed value is a Prosemirror Editor State
 *
 * @param value - the value to check
 *
 * @public
 */
export function isEditorState<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is PMEditorState<Schema> {
  return isObject(value) && value instanceof PMEditorState;
}

/**
 * Checks to see if the passed value is a Prosemirror Transaction
 *
 * @param value - the value to check
 *
 * @public
 */
export function isTransaction<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is PMTransaction<Schema> {
  return isObject(value) && value instanceof PMTransaction;
}

/**
 * Checks to see if the passed value is an instance of the editor schema
 *
 * @param value - the value to check
 *
 * @public
 */
export function isEditorSchema<Nodes extends string = string, Marks extends string = string>(
  value: unknown,
): value is Schema<Nodes, Marks> {
  return isObject(value) && value instanceof Schema;
}

/**
 * Predicate checking whether the selection is a TextSelection
 *
 * @param value - the value to check
 *
 * @public
 */
export function isTextSelection<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is TextSelection<Schema> {
  return isObject(value) && value instanceof TextSelection;
}

/**
 * Predicate checking whether the value is a Selection
 *
 * @param value - the value to check
 *
 * @public
 */
export function isSelection<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is PMSelection<Schema> {
  return isObject(value) && value instanceof PMSelection;
}

/**
 * Predicate checking whether the value is a ResolvedPosition.
 *
 * @param value - the value to check
 *
 * @public
 */
export function isResolvedPos<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is PMResolvedPos<Schema> {
  return isObject(value) && value instanceof PMResolvedPos;
}

/**
 * Predicate checking whether the selection is a NodeSelection
 *
 * @param value - the value to check
 *
 * @public
 */
export function isNodeSelection<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is NodeSelection<Schema> {
  return isObject(value) && value instanceof NodeSelection;
}

interface IsMarkActiveParameter<Schema extends EditorSchema = EditorSchema>
  extends MarkTypeParameter<Schema>,
    Partial<FromToParameter>,
    StateOrTransactionParameter<Schema> {}

/**
 * Checks that a mark is active within the selected region, or the current
 * selection point is within a region with the mark active. Used by extensions
 * to implement their active methods.
 *
 * @public
 */
export function isMarkActive<Schema extends EditorSchema = EditorSchema>(
  parameter: IsMarkActiveParameter<Schema>,
) {
  const { stateOrTransaction, type, from, to } = parameter;
  const { selection, doc, storedMarks } = stateOrTransaction;
  const { $from, empty } = selection;

  if (from && to) {
    try {
      return Math.max(from, to) < doc.nodeSize && doc.rangeHasMark(from, to, type);
    } catch {
      return false;
    }
  }

  if (empty) {
    return bool(type.isInSet(storedMarks ?? $from.marks()));
  }

  return doc.rangeHasMark(selection.from, selection.to, type);
}

/**
 * Check if the specified type (NodeType) can be inserted at the current
 * selection point.
 *
 * @param state - the editor state
 * @param type - the node type
 *
 * @public
 */
export function canInsertNode(state: EditorState, type: NodeType) {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth >= 0; depth--) {
    const index = $from.index(depth);
    try {
      if ($from.node(depth).canReplaceWith(index, index, type)) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Checks if a node looks like an empty document
 *
 * @param node - the prosemirror node
 *
 * @public
 */
export function isDocNodeEmpty(node: ProsemirrorNode) {
  const nodeChild = node.content.firstChild;

  if (node.childCount !== 1 || !nodeChild) {
    return false;
  }

  return (
    nodeChild.type.isBlock &&
    !nodeChild.childCount &&
    nodeChild.nodeSize === 2 &&
    (isNullOrUndefined(nodeChild.marks) || nodeChild.marks.length === 0)
  );
}

/**
 * Checks if the current node a paragraph node and empty
 *
 * @param node - the prosemirror node
 *
 * @public
 */
export function isEmptyParagraphNode(node: ProsemirrorNode | null | undefined) {
  return (
    !isProsemirrorNode(node) ||
    (node.type.name === 'paragraph' && !node.textContent && !node.childCount)
  );
}

/**
 * Retrieve the attributes for a mark.
 *
 * @param state - the editor state
 * @param type - the mark type
 */
export function getMarkAttributes(state: EditorState, type: MarkType) {
  const { from, to } = state.selection;
  let marks: Mark[] = [];

  state.doc.nodesBetween(from, to, (node) => {
    marks = [...marks, ...node.marks];
  });

  const mark = marks.find((markItem) => markItem.type.name === type.name);

  if (mark) {
    return mark.attrs;
  }

  return {};
}

/**
 * Retrieve the start and end position of a mark
 *
 * @remarks
 *
 * @param pmPosition - the resolved prosemirror position
 * @param type - the mark type
 */
export function getMarkRange(
  pmPosition: ResolvedPos | null = null,
  type: MarkType | null | undefined = null,
): FromToParameter | false {
  if (!pmPosition || !type) {
    return false;
  }

  const start = pmPosition.parent.childAfter(pmPosition.parentOffset);

  if (!start.node) {
    return false;
  }

  const mark = start.node.marks.find(({ type: markType }) => markType === type);
  if (!mark) {
    return false;
  }

  let startIndex = pmPosition.index();
  let startPos = pmPosition.start() + start.offset;
  while (startIndex > 0 && mark.isInSet(pmPosition.parent.child(startIndex - 1).marks)) {
    startIndex -= 1;
    startPos -= pmPosition.parent.child(startIndex).nodeSize;
  }

  const endPos = startPos + start.node.nodeSize;

  return { from: startPos, to: endPos };
}

/**
 * Retrieves the text content from a slice
 *
 * @remarks
 * A utility that's useful for pulling text content from a slice which is
 * usually created via `selection.content()`
 *
 * @param slice - the prosemirror slice
 *
 * @public
 */
export function getTextContentFromSlice(slice: Slice) {
  const node = slice.content.firstChild;
  return node ? node.textContent : '';
}

/**
 * Takes an empty selection and expands it out to the nearest group not matching
 * the excluded characters.
 *
 * @remarks
 *
 * Can be used to find the nearest selected word. See {@link getSelectedWord}
 *
 * @param stateOrTransaction - the editor state
 * @param exclude - the regex pattern to exclude
 * @returns false if not a text selection or if no expansion available
 *
 * @public
 */
export function getSelectedGroup(
  stateOrTransaction: EditorState | Transaction,
  exclude: RegExp,
): FromToParameter | false {
  if (!isTextSelection(stateOrTransaction.selection)) {
    return false;
  }

  let { from, to } = stateOrTransaction.selection;

  const getChar = (start: number, end: number) =>
    getTextContentFromSlice(TextSelection.create(stateOrTransaction.doc, start, end).content());

  for (
    let char = getChar(from - 1, from);
    char && !exclude.test(char);
    from--, char = getChar(from - 1, from)
  ) {
    // Step backwards until reaching first excluded character or empty text
    // content.
  }

  for (
    let char = getChar(to, to + 1);
    char && !exclude.test(char);
    to++, char = getChar(to, to + 1)
  ) {
    // Step forwards until reaching the first excluded character or empty text
    // content
  }

  if (from === to) {
    return false;
  }

  return { from, to };
}

/**
 * Retrieves the nearest space separated word from the current selection.
 *
 * @remarks
 *
 * This always expands outward so that given: `The tw<start>o words<end>` The
 * selection would become `The <start>two words<end>`
 *
 * In other words it expands until it meets an invalid character.
 *
 * @param stateOrTransaction - the editor state
 *
 * @public
 */
export function getSelectedWord(stateOrTransaction: EditorState | Transaction) {
  return getSelectedGroup(stateOrTransaction, /[\s\0]/);
}

/**
 * Retrieve plugin state of specified type
 *
 * @param plugin - the plugin or plugin key
 * @param state - the editor state
 *
 * @public
 */
export function getPluginState<State>(plugin: Plugin | PluginKey, state: EditorState): State {
  return plugin.getState(state);
}

/**
 * Retrieve plugin meta data of specified type
 *
 * @param key - the plugin key
 * @param tr - the transaction to retrieve from
 *
 * @public
 */
export function getPluginMeta<Meta>(key: PluginKey | Plugin | string, tr: Transaction): Meta {
  return tr.getMeta(key);
}

/**
 * Set the plugin meta data
 *
 * @param key - the plugin key
 * @param tr - the transaction
 * @param data - the data to set
 *
 * @public
 */
export function setPluginMeta<Meta>(
  key: PluginKey | Plugin | string,
  tr: Transaction,
  data: Meta,
): Transaction {
  return tr.setMeta(key, data);
}
/**
 * Get matching string from a list or single value
 *
 * @remarks
 * Get attrs can be called with a direct match string or array of string
 * matches. This method should be used to retrieve the required string.
 *
 * The index of the matched array used defaults to 0 but can be updated via the
 * second parameter.
 *
 * @param match - the match(es)
 * @param index - the zero-index point from which to start
 *
 * @public
 */
export function getMatchString(match: string | string[], index = 0) {
  return Array.isArray(match) ? match[index] : match;
}

/**
 * Checks whether the passed value is a valid dom node
 *
 * @param domNode - the dom node
 *
 * @public
 */
export function isDOMNode(domNode: unknown): domNode is Node {
  return isObject(Node)
    ? domNode instanceof Node
    : isObject(domNode) && isNumber(Cast(domNode).nodeType) && isString(Cast(domNode).nodeName);
}

/**
 * Checks for an element node like `<p>` or `<div>`.
 *
 * @param domNode - the dom node
 *
 * @public
 */
export function isElementDOMNode(domNode: unknown): domNode is HTMLElement {
  return isDOMNode(domNode) && domNode.nodeType === Node.ELEMENT_NODE;
}

/**
 * Finds the closest element which matches the passed selector
 *
 * @param domNode - the dom node
 * @param selector - the selector
 *
 * @public
 */
export function closestElement(
  domNode: Node | null | undefined,
  selector: string,
): HTMLElement | null {
  if (!isElementDOMNode(domNode)) {
    return null;
  }

  if (isNullOrUndefined(document.documentElement) || !document.documentElement.contains(domNode)) {
    return null;
  }

  const matches = isFunction(domNode.matches) ? 'matches' : Cast<'matches'>('msMatchesSelector');

  do {
    if (isFunction(domNode[matches]) && domNode[matches](selector)) {
      return domNode;
    }
    domNode = (domNode.parentElement ?? domNode.parentNode) as HTMLElement;
  } while (isElementDOMNode(domNode));

  return null;
}

/**
 * Checks for a text node.
 *
 * @param domNode - the dom node
 *
 * @public
 */
export function isTextDOMNode(domNode: unknown): domNode is Text {
  return isDOMNode(domNode) && domNode.nodeType === Node.TEXT_NODE;
}

interface GetOffsetParentParameter extends EditorViewParameter, ElementParameter {}

export function getOffsetParent({ view, element }: GetOffsetParentParameter): Element | null {
  return isNullOrUndefined(element) ? (view.dom as HTMLElement).offsetParent : element.offsetParent;
}

/**
 * Retrieve the line height from a an element
 *
 * @param params - the element params
 */
export function getLineHeight({ element }: ElementParameter) {
  return Number.parseFloat(window.getComputedStyle(element).lineHeight || '');
}

interface AbsoluteCoordinatesParameter
  extends EditorViewParameter,
    ElementParameter,
    PositionParameter {
  /**
   * The height offset of the parent
   */
  cursorHeight?: number;
}

/**
 * Retrieve the absolute coordinates
 *
 * @remarks
 *
 * We need to translate the co-ordinates because `coordsAtPos` returns
 * co-ordinates relative to `window`. And, also need to adjust the cursor
 * container height. (0, 0)
 *
 * ```
 * +--------------------- [window] ---------------------+
 * |   (left, top) +-------- [Offset Parent] --------+  |
 * | {coordsAtPos} | [Cursor]   <- cursorHeight      |  |
 * |               | [FloatingToolbar]               |  |
 * ```
 *
 * @param params - see {@link AbsoluteCoordinatesParameter}.
 */
export function absoluteCoordinates(parameter: AbsoluteCoordinatesParameter): Partial<Position> {
  const { view, element, position, cursorHeight = getLineHeight({ element }) } = parameter;

  const offsetParent = getOffsetParent({ view, element });

  if (!offsetParent) {
    return {};
  }

  const box = offsetParent.getBoundingClientRect();

  return {
    left: position.left - box.left,
    right: position.right - box.left,
    top: position.top - (box.top - cursorHeight) + offsetParent.scrollTop,
    bottom: box.height - (position.top - (box.top - cursorHeight) - offsetParent.scrollTop),
  };
}

/**
 * Retrieve the nearest non-text node
 *
 * @param domNode - the dom node
 */
export const getNearestNonTextNode = (domNode: Node) =>
  isTextDOMNode(domNode) ? (domNode.parentNode as HTMLElement) : (domNode as HTMLElement);

/**
 * Checks whether the cursor is at the end of the state.doc
 *
 * @param state - the editor state
 */
export const atDocEnd = (state: EditorState): boolean =>
  state.doc.nodeSize - state.selection.$to.pos - 2 === state.selection.$to.depth;

/**
 * Checks whether the cursor is at the beginning of the state.doc
 *
 * @param state - the editor state
 */
export const atDocStart = (state: EditorState): boolean =>
  state.selection.$from.pos === state.selection.$from.depth;

/**
 * Get the start position of the parent of the current resolve position
 *
 * @param pmPosition - the resolved prosemirror position
 */
export const startPositionOfParent = (pmPosition: ResolvedPos): number =>
  pmPosition.start(pmPosition.depth);

/**
 * Get the end position of the parent of the current resolve position
 *
 * @param pmPosition - the resolved prosemirror position
 *
 * @public
 */
export const endPositionOfParent = (pmPosition: ResolvedPos): number =>
  pmPosition.end(pmPosition.depth) + 1;

/**
 * Retrieve the current position of the cursor
 *
 * @param selection - the editor selection
 * @returns a resolved position only when the selection is a text selection
 *
 * @public
 */
export const getCursor = (selection: Selection): ResolvedPos | null | undefined =>
  isTextSelection(selection) ? selection.$cursor : undefined;

/**
 * Checks to see whether a nodeMatch checker is a tuple
 *
 * @remarks
 * A node matcher can either be a string, a function a regex or a regex tuple.
 * This check for the latter two.
 *
 * @param nodeMatch - the node match
 *
 * @public
 */
const isRegexTuple = (nodeMatch: NodeMatch): nodeMatch is RegexTuple =>
  Array.isArray(nodeMatch) && nodeMatch.length > 0 && nodeMatch.length <= 2;

/**
 * Test the passed in regexp tuple
 *
 * @param tuple - a regex tuple
 * @param value - the string to test against
 *
 * @public
 */
const regexTest = (tuple: RegexTuple, value: string) => {
  const regex = new RegExp(...tuple);
  return regex.test(value);
};

/**
 * Checks to see whether the name of the passed node matches anything in the
 * list provided.
 *
 * @param node - the prosemirror node
 * @param nodeMatches - the node matches array
 * @returns true if the node name is a match to any of the items in the
 * nodeMatches array
 *
 * @public
 */
export const nodeNameMatchesList = (
  node: ProsemirrorNode | null | undefined,
  nodeMatches: NodeMatch[],
): node is ProsemirrorNode => {
  let outcome = false;
  if (!node) {
    return outcome;
  }
  const name = node.type.name;
  for (const checker of nodeMatches) {
    outcome = isRegexTuple(checker)
      ? regexTest(checker, name)
      : isFunction(checker)
      ? checker(name, node)
      : checker === name;

    if (outcome) {
      return outcome;
    }
  }
  return outcome;
};

/**
 * Checks whether a Prosemirror node is the top level `doc` node
 *
 * @param node - the prosemirror node
 * @param schema - the prosemirror schema
 *
 * @public
 */
export const isDocNode = (node: ProsemirrorNode | null | undefined, schema?: EditorSchema) => {
  return (
    isProsemirrorNode(node) && (schema ? node.type === schema.nodes.doc : node.type.name === 'doc')
  );
};

/**
 * Checks whether the passed in JSON is a valid object node
 *
 * @param value - the value to check
 *
 * @public
 */
export const isObjectNode = (value: unknown): value is RemirrorJSON =>
  isObject(value) && value.type === 'doc' && Array.isArray(value.content);

export interface CreateDocumentNodeParameter
  extends SchemaParameter,
    Partial<CustomDocParameter>,
    StringHandlerParameter {
  /**
   * The content to render
   */
  content: RemirrorContentType;

  /**
   * The fallback object node to use if unable to convert the value correctly
   */
  onError?: Fallback | CreateDocumentErrorHandler;

  /**
   * The selection that the user should have in the created node.
   *
   * TODO add `'start' | 'end' | number` for a better developer experience.
   */
  selection?: FromToParameter;
}

export type CreateDocumentErrorHandler = (error: Error) => Fallback;
export type Fallback = RemirrorJSON | ProsemirrorNode;
export interface StringHandlerParameter {
  /**
   * A function which transforms a string into a prosemirror node.
   *
   * @remarks
   * Can be used to transform markdown / html or any other string format into a
   * prosemirror node.
   *
   * See {@link fromHTML} for an example of how this could work.
   */
  stringHandler?: (params: FromStringParameter) => ProsemirrorNode;
}

interface CreateDocumentErrorHandlerParameter {
  onError: Fallback | CreateDocumentErrorHandler;
  schema: EditorSchema;
  error: Error;
}

function createDocumentErrorHandler(parameter: CreateDocumentErrorHandlerParameter) {
  const { onError, schema, error } = parameter;
  if (isFunction(onError)) {
    return createFallback(onError(error), schema);
  }

  return createFallback(onError, schema);
}

function createFallback(fallback: Fallback, schema: EditorSchema) {
  return isProsemirrorNode(fallback) ? fallback : schema.nodeFromJSON(fallback);
}

/**
 * Creates a document node from the passed in content and schema.
 *
 * @param parameter - the destructured create document node params
 *
 * @public
 */
export function createDocumentNode(parameter: CreateDocumentNodeParameter): ProsemirrorNode {
  const { content, schema, doc, stringHandler } = parameter;

  const onError =
    parameter.onError ?? schema.nodes.doc.spec.content?.startsWith('block')
      ? () => EMPTY_PARAGRAPH_NODE
      : () => EMPTY_NODE;

  if (isProsemirrorNode(content)) {
    return content;
  }

  if (isObjectNode(content)) {
    try {
      return schema.nodeFromJSON(content);
    } catch (error) {
      return createDocumentErrorHandler({ onError, schema, error });
    }
  }

  if (isString(content) && stringHandler) {
    return stringHandler({ doc, content, schema });
  }

  return createDocumentErrorHandler({
    onError,
    schema,
    error: RemirrorError.create({ message: 'Unrecognized content type' }),
  });
}

/**
 * Checks which environment should be used. Returns true when we are in the dom
 * environment.
 *
 * @param forceEnvironment - force a specific environment to override the
 * outcome
 */
export function shouldUseDOMEnvironment(forceEnvironment?: RenderEnvironment) {
  return forceEnvironment === 'dom' || (environment.isBrowser && !forceEnvironment);
}

/**
 * Retrieves the document based on the environment we are currently in.
 *
 * @param forceEnvironment - force a specific environment
 */
export function getDocument(forceEnvironment?: RenderEnvironment) {
  return shouldUseDOMEnvironment(forceEnvironment) ? document : minDocument;
}

export interface CustomDocParameter {
  /** The custom document to use (allows for ssr rendering) */
  doc: Document;
}

/**
 * Convert a node into its DOM representative
 *
 * @param params - the from node params
 *
 * @public
 */
export function toDOM({ node, schema, doc }: FromNodeParameter): DocumentFragment {
  const fragment = isDocNode(node, schema) ? node.content : Fragment.from(node);
  return DOMSerializer.fromSchema(schema).serializeFragment(fragment, { document: doc });
}

interface FromNodeParameter
  extends SchemaParameter,
    ProsemirrorNodeParameter,
    Partial<CustomDocParameter> {}

/**
 * Convert a prosemirror node into it's HTML contents
 *
 * @param params - the from node params
 *
 * @public
 */
export function toHTML({ node, schema, doc = getDocument() }: FromNodeParameter) {
  const element = doc.createElement('div');
  element.append(toDOM({ node, schema, doc }));

  return element.innerHTML;
}

interface FromStringParameter extends Partial<CustomDocParameter>, SchemaParameter {
  /** The content  passed in an a string */
  content: string;
}

/**
 * Convert a HTML string into Prosemirror node
 *
 * @param params - the from html params
 *
 * @public
 */
export function fromHTML(parameter: FromStringParameter): ProsemirrorNode {
  const { content, schema, doc = getDocument() } = parameter;
  const element = doc.createElement('div');
  element.innerHTML = content.trim();

  return DOMParser.fromSchema(schema).parse(element);
}
