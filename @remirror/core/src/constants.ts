/**
 * Explanation from `@atlaskit`
 * ProseMirror uses the Unicode Character 'OBJECT REPLACEMENT CHARACTER' (U+FFFC) as text representation for
 * leaf nodes, i.e. nodes that don't have any content or text property (e.g. hardBreak, emoji, mention, rule)
 * It was introduced because of https://github.com/ProseMirror/prosemirror/issues/262
 * This can be used in an input rule regex to be able to include or exclude such nodes.
 */
export const LEAF_NODE_REPLACING_CHARACTER = '\ufffc';
