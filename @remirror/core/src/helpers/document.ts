import is from '@sindresorhus/is';
import {
  DOMParser,
  DOMSerializer,
  Fragment,
  Mark,
  MarkType,
  Node as PMNode,
  NodeType,
} from 'prosemirror-model';
import { EditorState, NodeSelection, Plugin, TextSelection } from 'prosemirror-state';
import { EMPTY_OBJECT_NODE } from '../constants';
import {
  Attrs,
  EditorSchema,
  NodeMatch,
  ObjectNode,
  PluginKey,
  Position,
  ProsemirrorNode,
  RemirrorContentType,
  ResolvedPos,
  Selection,
  Transaction,
} from '../types';
import { bool, Cast } from './base';

/**
 * Checks to see if the passed value is a ProsemirrorNode
 *
 * @param val
 */
export const isProsemirrorNode = (val: unknown): val is ProsemirrorNode =>
  is.object(val) && is.directInstanceOf(val, PMNode);

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
    if ($from.node(d).canReplaceWith(index, index, type)) {
      return true;
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
export const getMarkRange = ($pos: ResolvedPos | null = null, type: MarkType | null = null) => {
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
export const isDOMNode = (domNode: unknown): domNode is Node => {
  return is.object(Node)
    ? is.directInstanceOf(domNode, Node)
    : !is.nullOrUndefined(domNode !== null) &&
        is.nonEmptyObject(domNode) &&
        is.number(domNode.nodeType) &&
        is.string(domNode.nodeName);
};

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
export const isTextDOMNode = (domNode: unknown): domNode is Text =>
  isDOMNode(domNode) && domNode.nodeType === Node.TEXT_NODE;

/**
 * Checks for a CDATASection Node, such as <!CDATA[[ … ]]>.
 *
 * @param domNode
 */
export const isCDATASectionDOMNode = (domNode: unknown): domNode is CDATASection =>
  isDOMNode(domNode) && domNode.nodeType === Node.CDATA_SECTION_NODE;

/**
 * Checks for a processingInstruction of an XML document, such as <?xml-stylesheet … ?>.
 *
 * @param domNode
 */
export const isProcessingInstructionDOMNode = (domNode: unknown): domNode is ProcessingInstruction =>
  isDOMNode(domNode) && domNode.nodeType === Node.PROCESSING_INSTRUCTION_NODE;

/**
 * Checks for a comment node, such as <!-- … -->.
 *
 * @param domNode
 */
export const isCommentDOMNode = (domNode: unknown): domNode is Comment =>
  isDOMNode(domNode) && domNode.nodeType === Node.COMMENT_NODE;

/**
 * Checks for a Document node.
 *
 * @param domNode
 */
export const isDocumentDOMNode = (domNode: unknown): domNode is Document =>
  isDOMNode(domNode) && domNode.nodeType === Node.DOCUMENT_NODE;

/**
 * Checks for a DocumentType node, such as <!DOCTYPE html>.
 *
 * @param domNode
 */
export const isDocumentTypeDOMNode = (domNode: unknown): domNode is DocumentType =>
  isDOMNode(domNode) && domNode.nodeType === Node.DOCUMENT_TYPE_NODE;

/**
 * Checks for a DocumentFragment node.
 *
 * @param domNode
 */
export const isDocumentFragmentDOMNode = (domNode: unknown): domNode is DocumentFragment =>
  isDOMNode(domNode) && domNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE;

/**
 * We need to translate the co-ordinates because `coordsAtPos` returns co-ordinates
 * relative to `window`. And, also need to adjust the cursor container height.
 * (0, 0)
 * +--------------------- [window] ---------------------+
 * |   (left, top) +-------- [Offset Parent] --------+  |
 * | {coordsAtPos} | [Cursor]   <- cursorHeight      |  |
 * |               | [FloatingToolbar]               |  |
 *
 * @param coords
 * @param offsetParent
 * @param cursorHeight
 */
export const getAbsoluteCoordinates = (coords: Position, offsetParent: Element, cursorHeight: number) => {
  const {
    left: offsetParentLeft,
    top: offsetParentTop,
    height: offsetParentHeight,
  } = offsetParent.getBoundingClientRect();

  return {
    left: coords.left - offsetParentLeft,
    right: coords.right - offsetParentLeft,
    top: coords.top - (offsetParentTop - cursorHeight) + offsetParent.scrollTop,
    bottom: offsetParentHeight - (coords.top - (offsetParentTop - cursorHeight) - offsetParent.scrollTop),
  };
};

/**
 * Retrieve the nearest non-text node
 *
 * @param node
 */
export const getNearestNonTextNode = (node: Node) =>
  isTextDOMNode(node) ? (node.parentNode as HTMLElement) : (node as HTMLElement);

/**
 * Predicate checking whether the selection is a TextSelection
 *
 * @param selection
 */
export const isTextSelection = (selection: Selection): selection is TextSelection<EditorSchema> =>
  selection instanceof TextSelection;

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
    outcome = is.function_(checker) ? checker(name) : checker === name;
    if (outcome) {
      break;
    }
  }
  return outcome;
};

export const isDocNode = (node: ProsemirrorNode | null | undefined, schema: EditorSchema) => {
  return isProsemirrorNode(node) && node.type === schema.nodes.doc;
};

/**
 * Checks whether the passed in JSON is a valid object node
 *
 * @param arg
 */
export const isObjectNode = (arg: unknown): arg is ObjectNode => {
  if (is.plainObject(arg) && arg.type === 'doc') {
    return true;
  }
  return false;
};

export interface CreateDocumentNodeParams {
  /** The content to render */
  content: RemirrorContentType;

  /** A prosemirror schema */
  schema: EditorSchema;

  /** A custom document object (useful for non-dom environments) */
  doc?: Document;
}

/**
 * Creates a document node from the passed in content and schema.
 *
 * @param params.content
 *         params.schema
 */
export const createDocumentNode = ({ content, schema, doc }: CreateDocumentNodeParams) => {
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
  if (is.string(content)) {
    const element = (doc || document).createElement('div');
    element.innerHTML = content.trim();
    return DOMParser.fromSchema(schema).parse(element);
  }
  return null;
};

interface ToHTMLParams {
  /** The prosemirror node */
  node: ProsemirrorNode;
  /** The prosemirror schema */
  schema: EditorSchema;
  /** An optional document to use (allows for ssr rendering) */
  doc?: Document;
}

/**
 * Convert a prosemirror node into it's HTML contents
 *
 * @param params.node
 *         params.schema
 *         params.doc
 */
export const toHTML = ({ node, schema, doc }: ToHTMLParams) => {
  const element = (doc || document).createElement('div');
  element.appendChild(toDOM({ node, schema, doc }));

  return element.innerHTML;
};

/**
 * Convert a node into its DOM representative
 *
 * @param params.node
 *         params.schema
 *         params.doc
 */
export const toDOM = ({ node, schema, doc }: ToHTMLParams): DocumentFragment => {
  const fragment = isDocNode(node, schema) ? node.content : Fragment.from(node);
  return DOMSerializer.fromSchema(schema).serializeFragment(fragment, { document: doc });
};
