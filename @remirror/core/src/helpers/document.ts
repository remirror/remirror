import { Mark, MarkType, NodeType } from 'prosemirror-model';
import { EditorState, NodeSelection, Plugin, TextSelection } from 'prosemirror-state';
import {
  Attrs,
  EditorSchema,
  NodeMatch,
  PluginKey,
  Position,
  ProsemirrorNode,
  ResolvedPos,
  Selection,
  Transaction,
} from '../types';
import { Cast } from './base';

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
  return Boolean(
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

// "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
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

// "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
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

// "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
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
 * Retrieve plugin meta data by key
 * @param key
 * @param tr
 */
export const getPluginMeta = <GMeta>(key: PluginKey | Plugin | string, tr: Transaction): GMeta =>
  tr.getMeta(key);

/**
 * Set the plugin meta data by key
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
 * Get attrs can be called with a direct match -string or array of string matches.
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
 */
export const isDomNode = (node: unknown): node is Node => {
  return typeof Node === 'object'
    ? node instanceof Node
    : node !== null &&
        typeof node === 'object' &&
        typeof Cast(node).nodeType === 'number' &&
        typeof Cast(node).nodeName === 'string';
};

export const closestElement = (node: HTMLElement | null | undefined, name: string): HTMLElement | null => {
  if (!isElementNode(node)) {
    return null;
  }
  if (!document.documentElement || !document.documentElement.contains(node)) {
    return null;
  }
  const matches = node.matches ? 'matches' : Cast<'matches'>('msMatchesSelector');

  do {
    if (node[matches] && node[matches](name)) {
      return node;
    }
    node = (node.parentElement || node.parentNode) as HTMLElement;
  } while (node !== null && node.nodeType === 1);
  return null;
};

/**
 * An Element node like <p> or <div>.
 * nodeType === 1
 */
export const isElementNode = (node: unknown): node is HTMLElement =>
  isDomNode(node) && node.nodeType === Node.ELEMENT_NODE;
/**
 * The actual Text inside an Element or Attr.
 * nodeType === 3
 */
export const isTextNode = (node: unknown): node is Text =>
  isDomNode(node) && node.nodeType === Node.TEXT_NODE;
/**
 * A CDATASection, such as <!CDATA[[ … ]]>.
 * nodeType === 4
 */
export const isCDATASectionNode = (node: unknown): node is CDATASection =>
  isDomNode(node) && node.nodeType === Node.CDATA_SECTION_NODE;
/**
 * A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
 * nodeType === 7
 */
export const isProcessingInstructionNode = (node: unknown): node is ProcessingInstruction =>
  isDomNode(node) && node.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
/**
 * A Comment node, such as <!-- … -->.
 * nodeType === 8
 */
export const isCommentNode = (node: unknown): node is Comment =>
  isDomNode(node) && node.nodeType === Node.COMMENT_NODE;
/**
 * A Document node.
 * nodeType === 9
 */
export const isDocumentNode = (node: unknown): node is Document =>
  isDomNode(node) && node.nodeType === Node.DOCUMENT_NODE;
/**
 * 	A DocumentType node, such as <!DOCTYPE html>.
 * nodeType === 1
 */
export const isDocumentTypeNode = (node: unknown): node is DocumentType =>
  isDomNode(node) && node.nodeType === Node.DOCUMENT_TYPE_NODE;
/**
 * 	A DocumentFragment node.
 * nodeType === 1
 */
export const isDocumentFragmentNode = (node: unknown): node is DocumentFragment =>
  isDomNode(node) && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;

/**
 * We need to translate the co-ordinates because `coordsAtPos` returns co-ordinates
 * relative to `window`. And, also need to adjust the cursor container height.
 * (0, 0)
 * +--------------------- [window] ---------------------+
 * |   (left, top) +-------- [Offset Parent] --------+  |
 * | {coordsAtPos} | [Cursor]   <- cursorHeight      |  |
 * |               | [FloatingToolbar]               |  |
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
 */
export const getNearestNonTextNode = (node: Node) =>
  isTextNode(node) ? (node.parentNode as HTMLElement) : (node as HTMLElement);

/**
 * Predicate checking whether the selection is a TextSelection
 */
export const isTextSelection = (selection: Selection): selection is TextSelection<EditorSchema> =>
  selection instanceof TextSelection;

/**
 * Checks whether the cursor is at the end of the state.doc
 */
export function atTheEndOfDoc(state: EditorState): boolean {
  const { selection, doc } = state;
  return doc.nodeSize - selection.$to.pos - 2 === selection.$to.depth;
}

/**
 * Checks whether the cursor is at the beginning of the state.doc
 */
export function atTheBeginningOfDoc(state: EditorState): boolean {
  const { selection } = state;
  return selection.$from.pos === selection.$from.depth;
}

export function startPositionOfParent(resolvedPos: ResolvedPos): number {
  return resolvedPos.start(resolvedPos.depth);
}

export function endPositionOfParent(resolvedPos: ResolvedPos): number {
  return resolvedPos.end(resolvedPos.depth) + 1;
}

export function getCursor(selection: Selection): ResolvedPos | null | undefined {
  return isTextSelection(selection) ? selection.$cursor : undefined;
}

/**
 * Checks to see whether the name of the passed node matches anything in the list provided.
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
    outcome = typeof checker === 'function' ? checker(name) : checker === name;
    if (outcome) {
      break;
    }
  }
  return outcome;
};
