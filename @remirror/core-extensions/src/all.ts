import {
  BaseKeymapExtension,
  CompositionExtension,
  HistoryExtension,
  NodeCursorExtension,
  PlaceholderExtension,
  SSRHelperExtension,
} from './extensions';
import {
  BoldExtension,
  CodeExtension,
  ItalicExtension,
  LinkExtension,
  StrikeExtension,
  UnderlineExtension,
} from './marks';
import {
  BlockquoteExtension,
  BulletListExtension,
  CodeBlockExtension,
  HardBreakExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ImageExtension,
  ListItemExtension,
  OrderedListExtension,
} from './nodes';

/**
 * Used to denote a node is empty.
 *
 * Currently used by the placeholder extension.
 */
export const EMPTY_NODE_CLASS_NAME = 'is-empty';
export const EMPTY_NODE_CLASS_SELECTOR = `.${EMPTY_NODE_CLASS_NAME}`;

/**
 * A list of nodes that need special treatment for composition events on android and also for
 * arrow key presses between items in general. Used by both the CompositionExtension and NodeCursorExtension
 */
export const NODE_CURSOR_DEFAULTS = ['emoji'];

export const ALL_NODE_EXTENSIONS = [
  BlockquoteExtension,
  BulletListExtension,
  CodeBlockExtension,
  HardBreakExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ImageExtension,
  ListItemExtension,
  OrderedListExtension,
];

export const ALL_MARK_EXTENSIONS = [
  BoldExtension,
  CodeExtension,
  ItalicExtension,
  LinkExtension,
  StrikeExtension,
  UnderlineExtension,
];

export const ALL_GENERIC_EXTENSIONS = [
  BaseKeymapExtension,
  CompositionExtension,
  HistoryExtension,
  NodeCursorExtension,
  PlaceholderExtension,
  SSRHelperExtension,
];

export const ALL_EXTENSIONS = [...ALL_NODE_EXTENSIONS, ...ALL_MARK_EXTENSIONS, ...ALL_GENERIC_EXTENSIONS];
