import { Mark, MarkType, NodeType, ResolvedPos } from 'prosemirror-model';
import { EditorState, NodeSelection, Plugin, PluginKey } from 'prosemirror-state';
import { Attrs, Position } from './types';

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
 * An Element node like <p> or <div>.
 * nodeType === 1
 */
export const isElementNode = (node: Node): node is HTMLElement => node.nodeType === Node.ELEMENT_NODE;
/**
 * The actual Text inside an Element or Attr.
 * nodeType === 3
 */
export const isTextNode = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE;
/**
 * A CDATASection, such as <!CDATA[[ … ]]>.
 * nodeType === 4
 */
export const isCDATASectionNode = (node: Node): node is CDATASection =>
  node.nodeType === Node.CDATA_SECTION_NODE;
/**
 * A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
 * nodeType === 7
 */
export const isProcessingInstructionNode = (node: Node): node is ProcessingInstruction =>
  node.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
/**
 * A Comment node, such as <!-- … -->.
 * nodeType === 8
 */
export const isCommentNode = (node: Node): node is Comment => node.nodeType === Node.COMMENT_NODE;
/**
 * A Document node.
 * nodeType === 9
 */
export const isDocumentNode = (node: Node): node is Document => node.nodeType === Node.DOCUMENT_NODE;
/**
 * 	A DocumentType node, such as <!DOCTYPE html>.
 * nodeType === 1
 */
export const isDocumentTypeNode = (node: Node): node is DocumentType =>
  node.nodeType === Node.DOCUMENT_TYPE_NODE;
/**
 * 	A DocumentFragment node.
 * nodeType === 1
 */
export const isDocumentFragmentNode = (node: Node): node is DocumentFragment =>
  node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;

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
