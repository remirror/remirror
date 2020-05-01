/**
 * Used to denote a node is empty.
 *
 * Currently used by the placeholder extension.
 */
export const EMPTY_NODE_CLASS_NAME = 'is-empty' as const;
export const EMPTY_NODE_CLASS_SELECTOR = `.${EMPTY_NODE_CLASS_NAME}`;

/**
 * A list of nodes that need special treatment for composition events on android and also for
 * arrow key presses between items in general. Used by both the CompositionExtension and NodeCursorExtension
 */
export const NODE_CURSOR_DEFAULTS = ['emoji'];
