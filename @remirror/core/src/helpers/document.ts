import {
  DOMParser,
  DOMSerializer,
  Fragment,
  Mark,
  MarkType,
  Node as PMNode,
  NodeType,
} from 'prosemirror-model';
import {
  EditorState as PMEditorState,
  NodeSelection,
  Plugin,
  Selection as PMSelection,
  TextSelection,
} from 'prosemirror-state';
import { EMPTY_OBJECT_NODE } from '../constants';
import {
  Attrs,
  EditorSchema,
  EditorState,
  EditorViewParams,
  ElementParams,
  FixedCoordsParams,
  FromToParams,
  NodeMatch,
  ObjectNode,
  PlainObject,
  PluginKey,
  ProsemirrorNode,
  RegexTuple,
  RemirrorContentType,
  ResolvedPos,
  SchemaParams,
  Selection,
  Transaction,
} from '../types';
import { bool, Cast, isFunction, isNumber, isObject, isString } from './base';

/**
 * Checks to see if the passed value is a ProsemirrorNode
 *
 * @param value
 */
export const isProsemirrorNode = (value: unknown): value is ProsemirrorNode =>
  isObject(value) && value instanceof PMNode;

/**
 * Checks to see if the passed value is a Prosemirror Editor State
 *
 * @param value
 */
export const isEditorState = (value: unknown): value is EditorState =>
  isObject(value) && value instanceof PMEditorState;

/**
 * Predicate checking whether the selection is a TextSelection
 *
 * @param value
 */
export const isTextSelection = (value: unknown): value is TextSelection<EditorSchema> =>
  isObject(value) && value instanceof TextSelection;

/**
 * Predicate checking whether the selection is a Selection
 *
 * @param value
 */
export const isSelection = (value: unknown): value is Selection =>
  isObject(value) && value instanceof PMSelection;

/**
 * Checks that a mark is active within the selected region, or the current selection point is within a
 * region with the mark active. Used by extensions to implement their active methods.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state
 * @param type
 */
export const markActive = (state: EditorState, type: MarkType) => {
  const { from, $from, to, empty } = state.selection;
  return bool(
    empty ? type.isInSet(state.storedMarks || $from.marks()) : state.doc.rangeHasMark(from, to, type),
  );
};

/**
 * Checks whether the node type passed in is active within the region.
 * Used by extensions to implement the `#active` method.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state
 * @param type
 * @param attrs
 */
export const nodeActive = (state: EditorState, type: NodeType, attrs: Attrs = {}) => {
  const { $from, to, node } = state.selection as NodeSelection;
  if (node) {
    return node.hasMarkup(type, attrs);
  }
  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
};

/**
 * Check if the specified type (NodeType) can be inserted at the current selection point.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state
 * @param type
 */
export const canInsertNode = (state: EditorState, type: NodeType) => {
  const { $from } = state.selection;
  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d);
    try {
      if ($from.node(d).canReplaceWith(index, index, type)) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Checks if a node looks like an empty document
 *
 * @param node
 */
export const isDocNodeEmpty = (node: ProsemirrorNode) => {
  const nodeChild = node.content.firstChild;

  if (node.childCount !== 1 || !nodeChild) {
    return false;
  }

  return (
    nodeChild.type.name === 'paragraph' &&
    !nodeChild.childCount &&
    nodeChild.nodeSize === 2 &&
    (!nodeChild.marks || nodeChild.marks.length === 0)
  );
};

/**
 * Checks if the current node a paragraph node and empty
 *
 * @param node
 */
export const isEmptyParagraphNode = (node: ProsemirrorNode | null | undefined) => {
  return (
    !isProsemirrorNode(node) || (node.type.name === 'paragraph' && !node.textContent && !node.childCount)
  );
};

/**
 * Retrieve the attributes for a mark.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state
 * @param type
 */
export const getMarkAttrs = (state: EditorState, type: MarkType) => {
  const { from, to } = state.selection;
  let marks: Mark[] = [];

  state.doc.nodesBetween(from, to, node => {
    marks = [...marks, ...node.marks];
  });

  const mark = marks.find(markItem => markItem.type.name === type.name);

  if (mark) {
    return mark.attrs;
  }

  return {};
};

/**
 * Retrieve the start and end position of a mark
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param $pos
 * @param type
 */
export const getMarkRange = (
  $pos: ResolvedPos | null = null,
  type: MarkType | null | undefined = null,
): FromToParams | false => {
  if (!$pos || !type) {
    return false;
  }

  const start = $pos.parent.childAfter($pos.parentOffset);

  if (!start.node) {
    return false;
  }

  const link = start.node.marks.find(mark => mark.type === type);
  if (!link) {
    return false;
  }

  let startIndex = $pos.index();
  let startPos = $pos.start() + start.offset;
  while (startIndex > 0 && link.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }

  const endPos = startPos + start.node.nodeSize;

  return { from: startPos, to: endPos };
};

/**
 * Retrieve plugin state
 *
 * @param plugin
 * @param state
 */
export const getPluginState = <GState>(plugin: Plugin | PluginKey, state: EditorState): GState =>
  plugin.getState(state);

/**
 * Retrieve plugin meta data
 *
 * @param key
 * @param tr
 */
export const getPluginMeta = <GMeta>(key: PluginKey | Plugin | string, tr: Transaction): GMeta =>
  tr.getMeta(key);

/**
 * Set the plugin meta data
 *
 * @param key
 * @param tr
 * @param data
 */
export const setPluginMeta = <GMeta>(
  key: PluginKey | Plugin | string,
  tr: Transaction,
  data: GMeta,
): Transaction => tr.setMeta(key, data);

/**
 * Get attrs can be called with a direct match string or array of string matches.
 * This can be used to retrieve the required string.
 *
 * The index of the matched array used defaults to 0 but can be updated via the second parameter.
 *
 * @param match
 * @param [index]
 */
export const getMatchString = (match: string | string[], index = 0) =>
  Array.isArray(match) ? match[index] : match;

/**
 * Checks whether the passed value is a valid dom node
 *
 * @param domNode
 */
export const isDOMNode = (domNode: unknown): domNode is Node =>
  isObject(Node)
    ? domNode instanceof Node
    : isObject(domNode) && isNumber(Cast(domNode).nodeType) && isString(Cast(domNode).nodeName);

/**
 * Finds the closest element which matches the passed selector
 *
 * @param node
 * @param selector
 */
export const closestElement = (domNode: Node | null | undefined, selector: string): HTMLElement | null => {
  if (!isElementDOMNode(domNode)) {
    return null;
  }
  if (!document.documentElement || !document.documentElement.contains(domNode)) {
    return null;
  }
  const matches = domNode.matches ? 'matches' : Cast<'matches'>('msMatchesSelector');

  do {
    if (domNode[matches] && domNode[matches](selector)) {
      return domNode;
    }
    domNode = (domNode.parentElement || domNode.parentNode) as HTMLElement;
  } while (isElementDOMNode(domNode));
  return null;
};

/**
 * Checks for an element node like <p> or <div>.
 *
 * @param domNode
 */
export const isElementDOMNode = (domNode: unknown): domNode is HTMLElement =>
  isDOMNode(domNode) && domNode.nodeType === Node.ELEMENT_NODE;

/**
 * Checks for a text node.
 *
 * @param domNode
 */
export const isTextDOMNode = (domNode: unknown): domNode is Text => {
  return isDOMNode(domNode) && domNode.nodeType === Node.TEXT_NODE;
};

/**
 * Checks for a Document node.
 *
 * @param domNode
 */
export const isDocumentDOMNode = (domNode: unknown): domNode is Document =>
  isDOMNode(domNode) && domNode.nodeType === Node.DOCUMENT_NODE;

/**
 * Checks for a DocumentFragment node.
 *
 * @param domNode
 */
export const isDocumentFragmentDOMNode = (domNode: unknown): domNode is DocumentFragment =>
  isDOMNode(domNode) && domNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE;

interface GetOffsetParentParams extends EditorViewParams, ElementParams {}

export const getOffsetParent = ({ view, element }: GetOffsetParentParams): HTMLElement =>
  element ? (element.offsetParent as HTMLElement) : ((view.dom as HTMLElement).offsetParent as HTMLElement);

/**
 * Retrieve the line height from a an element
 *
 * @param params
 * @param params.element
 */
export const getLineHeight = ({ element }: ElementParams) =>
  parseFloat(window.getComputedStyle(element, undefined).lineHeight || '');

interface AbsoluteCoordinatesParams extends EditorViewParams, ElementParams, FixedCoordsParams {
  /**
   * The height offset of the parent
   */
  cursorHeight?: number;
}

/**
 * We need to translate the co-ordinates because `coordsAtPos` returns co-ordinates
 * relative to `window`. And, also need to adjust the cursor container height.
 * (0, 0)
 * +--------------------- [window] ---------------------+
 * |   (left, top) +-------- [Offset Parent] --------+  |
 * | {coordsAtPos} | [Cursor]   <- cursorHeight      |  |
 * |               | [FloatingToolbar]               |  |
 *
 * @param params
 * @param params.view
 * @param params.element The target element which coordinates will be relative to
 * @param params.coords
 * @param params.cursorHeight The desired cursor height
 */
export const absoluteCoordinates = ({
  view,
  element,
  coords,
  cursorHeight = getLineHeight({ element }),
}: AbsoluteCoordinatesParams) => {
  const offsetParent = getOffsetParent({ view, element });
  const box = offsetParent.getBoundingClientRect();

  return {
    left: coords.left - box.left,
    right: coords.right - box.left,
    top: coords.top - (box.top - cursorHeight) + offsetParent.scrollTop,
    bottom: box.height - (coords.top - (box.top - cursorHeight) - offsetParent.scrollTop),
  };
};

/**
 * Retrieve the nearest non-text node
 *
 * @param domNode
 */
export const getNearestNonTextNode = (domNode: Node) =>
  isTextDOMNode(domNode) ? (domNode.parentNode as HTMLElement) : (domNode as HTMLElement);

/**
 * Checks whether the cursor is at the end of the state.doc
 *
 * @param state
 */
export function atDocEnd(state: EditorState): boolean {
  const { selection, doc } = state;
  return doc.nodeSize - selection.$to.pos - 2 === selection.$to.depth;
}

/**
 * Checks whether the cursor is at the beginning of the state.doc
 *
 * @param state
 */
export function atDocStart(state: EditorState): boolean {
  const { selection } = state;
  return selection.$from.pos === selection.$from.depth;
}

/**
 * Get the start position of the parent of the current resolve position
 *
 * @param pos
 */
export function startPositionOfParent($pos: ResolvedPos): number {
  return $pos.start($pos.depth);
}

/**
 * Get the end position of the parent of the current resolve position
 *
 * @param $pos
 */
export function endPositionOfParent($pos: ResolvedPos): number {
  return $pos.end($pos.depth) + 1;
}

/**
 * Retrieve the current position of the cursor
 *
 * @param selection
 */
export function getCursor(selection: Selection): ResolvedPos | null | undefined {
  return isTextSelection(selection) ? selection.$cursor : undefined;
}

/**
 * Checks to see whether a nodeMatch checker is a tuple (used for regex) with length of 1 or 2
 *
 * @param nodeMatch
 */
const isRegexTuple = (nodeMatch: NodeMatch): nodeMatch is RegexTuple =>
  Array.isArray(nodeMatch) && nodeMatch.length > 0 && nodeMatch.length <= 2;

/**
 * Test the passed in regexp tuple
 *
 * @param tuple
 * @param name
 */
const regexTest = (tuple: RegexTuple, name: string) => {
  const regex = new RegExp(...tuple);
  return regex.test(name);
};

/**
 * Checks to see whether the name of the passed node matches anything in the list provided.
 *
 * @param node
 * @param nodeMatches
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
 * @param node
 * @param [schema]
 */
export const isDocNode = (node: ProsemirrorNode | null | undefined, schema?: EditorSchema) => {
  return isProsemirrorNode(node) && (schema ? node.type === schema.nodes.doc : node.type.name === 'doc');
};

/**
 * Checks whether the passed in JSON is a valid object node
 *
 * @param arg
 */
export const isObjectNode = (arg: unknown): arg is ObjectNode =>
  isObject(arg) && (arg as PlainObject).type === 'doc' && Array.isArray((arg as PlainObject).content);

export interface CreateDocumentNodeParams extends SchemaParams, Partial<CustomDocParams> {
  /** The content to render */
  content: RemirrorContentType;
}

/**
 * Creates a document node from the passed in content and schema.
 *
 * @param params
 * @param params.content
 * @param params.schema
 * @param [params.doc]
 */
export const createDocumentNode = ({ content, schema, doc = document }: CreateDocumentNodeParams) => {
  if (isProsemirrorNode(content)) {
    return content;
  }
  if (isObjectNode(content)) {
    try {
      return schema.nodeFromJSON(content);
    } catch (e) {
      console.error(e);
      return schema.nodeFromJSON(EMPTY_OBJECT_NODE);
    }
  }

  if (isString(content)) {
    return fromHTML({ doc, content, schema });
  }

  return null;
};

interface CustomDocParams {
  /** The custom document to use (allows for ssr rendering) */
  doc: Document;
}

interface ProsemirrorNodeParams {
  /** The prosemirror node */
  node: ProsemirrorNode;
}

interface ToHTMLParams extends SchemaParams, ProsemirrorNodeParams, Partial<CustomDocParams> {}

/**
 * Convert a prosemirror node into it's HTML contents
 *
 * @param params
 * @param params.node
 * @param params.schema
 * @param [params.doc]
 */
export const toHTML = ({ node, schema, doc = document }: ToHTMLParams) => {
  const element = doc.createElement('div');
  element.appendChild(toDOM({ node, schema, doc }));

  return element.innerHTML;
};

/**
 * Convert a node into its DOM representative
 *
 * @param params
 * @param params.node
 * @param params.schema
 * @param [params.doc]
 */
export const toDOM = ({ node, schema, doc }: ToHTMLParams): DocumentFragment => {
  const fragment = isDocNode(node, schema) ? node.content : Fragment.from(node);
  return DOMSerializer.fromSchema(schema).serializeFragment(fragment, { document: doc });
};

interface FromHTMLParams extends Partial<CustomDocParams>, SchemaParams {
  /** The content  passed in an a string */
  content: string;
}

/**
 * Convert a HTML string into Prosemirror node
 *
 * @param params
 * @param params.content
 * @param params.schema
 * @param [params.doc]
 */
export const fromHTML = ({ content, schema, doc = document }: FromHTMLParams) => {
  const element = doc.createElement('div');
  element.innerHTML = content.trim();
  return DOMParser.fromSchema(schema).parse(element);
};
