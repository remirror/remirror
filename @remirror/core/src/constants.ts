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
 * The null character.
 *
 * @see https://stackoverflow.com/a/6380172
 */
export const NULL_CHARACTER = '\0';

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
 * Used to determine the side where a gap-cursor is drawn
 */
export enum Side {
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * A default empty object node. Useful for resetting the content of a prosemirror document.
 */
export const EMPTY_OBJECT_NODE = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};
