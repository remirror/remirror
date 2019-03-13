/**
 * The editor class name
 */
export const EDITOR_CLASS_NAME = 'remirror-editor';

/**
 * Explanation from `@atlaskit`
 * ProseMirror uses the Unicode Character 'OBJECT REPLACEMENT CHARACTER' (U+FFFC) as text representation for
 * leaf nodes, i.e. nodes that don't have any content or text property (e.g. hardBreak, emoji, mention, rule)
 * It was introduced because of https://github.com/ProseMirror/prosemirror/issues/262
 * This can be used in an input rule regex to be able to include or exclude such nodes.
 */
export const LEAF_NODE_REPLACING_CHARACTER = '\ufffc';

/**
 * A character useful for separating inline nodes. Typically used in decorations as follows.
 *
 * ```ts
 * document.createTextNode(ZERO_WIDTH_SPACE_CHAR)
 * ```
 *
 * This produces the html entity `&#8203;`
 */
export const ZERO_WIDTH_SPACE_CHAR = '\u200b';

/**
 * By default we don't show the gap-cursor for these nodes.
 *
 * This can be overridden via a gap cursor static method.
 * ```ts
 * GapCursorSelection.setIgnoredNodes = ['mention', 'etc...']
 * ```
 */
export const GAP_CURSOR_IGNORED_NODE = [
  'paragraph',
  'bulletList',
  'orderedList',
  'listItem',
  'taskItem',
  'decisionItem',
  'heading',
  'blockquote',
];

/**
 * Used to determine the side where a gap-cursor is drawn
 */
export enum Side {
  LEFT = 'left',
  RIGHT = 'right',
}
