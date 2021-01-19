import type { GetStaticAndDynamic } from '@remirror/core';
import { BidiExtension, BidiOptions } from '@remirror/extension-bidi';
import { BlockquoteExtension } from '@remirror/extension-blockquote';
import { BoldExtension, BoldOptions } from '@remirror/extension-bold';
import { CodeExtension } from '@remirror/extension-code';
import { CodeBlockExtension, CodeBlockOptions } from '@remirror/extension-code-block';
import { DropCursorExtension, DropCursorOptions } from '@remirror/extension-drop-cursor';
import { IframeExtension } from '@remirror/extension-embed';
import { GapCursorExtension } from '@remirror/extension-gap-cursor';
import { HardBreakExtension } from '@remirror/extension-hard-break';
import { HeadingExtension, HeadingOptions } from '@remirror/extension-heading';
import { HorizontalRuleExtension } from '@remirror/extension-horizontal-rule';
import { ImageExtension } from '@remirror/extension-image';
import { ItalicExtension } from '@remirror/extension-italic';
import { LinkExtension, LinkOptions } from '@remirror/extension-link';
import { BulletListExtension, OrderedListExtension } from '@remirror/extension-list';
import { SearchExtension, SearchOptions } from '@remirror/extension-search';
import { StrikeExtension } from '@remirror/extension-strike';
import { TableExtension, TableOptions } from '@remirror/extension-tables';
import { TrailingNodeExtension, TrailingNodeOptions } from '@remirror/extension-trailing-node';
import { UnderlineExtension } from '@remirror/extension-underline';

export interface WysiwygOptions
  extends BidiOptions,
    BoldOptions,
    CodeBlockOptions,
    DropCursorOptions,
    HeadingOptions,
    LinkOptions,
    SearchOptions,
    TrailingNodeOptions,
    TableOptions {}

const DEFAULT_OPTIONS = {
  ...BidiExtension.defaultOptions,
  ...BoldExtension.defaultOptions,
  ...CodeBlockExtension.defaultOptions,
  ...DropCursorExtension.defaultOptions,
  ...SearchExtension.defaultOptions,
  ...TrailingNodeExtension.defaultOptions,
  ...HeadingExtension.defaultOptions,
  ...TableExtension.defaultOptions,
};

/**
 * Create the wysiwyg preset which includes all the more exotic extensions
 * provided by the `remirror` core library.
 */
export function wysiwygPreset(options: GetStaticAndDynamic<WysiwygOptions> = {}): WysiwygPreset[] {
  options = { ...DEFAULT_OPTIONS, ...options };

  const gapCursorExtension = new GapCursorExtension();
  const hardBreakExtension = new HardBreakExtension();
  const horizontalRuleExtension = new HorizontalRuleExtension();
  const imageExtension = new ImageExtension();
  const italicExtension = new ItalicExtension();
  const strikeExtension = new StrikeExtension();
  const underlineExtension = new UnderlineExtension();
  const blockquoteExtension = new BlockquoteExtension();
  const codeExtension = new CodeExtension();
  const tableExtension = new TableExtension();
  const iframeExtension = new IframeExtension();
  const bulletListExtension = new BulletListExtension();
  const orderedListExtension = new OrderedListExtension();

  const { selectTextOnClick } = options;
  const linkExtension = new LinkExtension({ selectTextOnClick });

  const { autoUpdate, defaultDirection, excludeNodes } = options;
  const bidiExtension = new BidiExtension({ autoUpdate, defaultDirection, excludeNodes });

  const { weight } = options;
  const boldExtension = new BoldExtension({ weight });

  const { defaultLanguage, formatter, toggleName, syntaxTheme, supportedLanguages } = options;
  const codeBlockExtension = new CodeBlockExtension({
    defaultLanguage,
    formatter,
    toggleName,
    syntaxTheme,
    supportedLanguages,
  });

  const { color, width } = options;
  const dropCursorExtension = new DropCursorExtension({
    color,
    width,
  });

  const { defaultLevel, levels } = options;
  const headingExtension = new HeadingExtension({ defaultLevel, levels });

  const {
    alwaysSearch,
    autoSelectNext,
    caseSensitive,
    clearOnEscape,
    disableRegex,
    highlightedClass,
    searching,
    searchClass,
  } = options;
  const searchExtension = new SearchExtension({
    alwaysSearch,
    autoSelectNext,
    caseSensitive,
    clearOnEscape,
    disableRegex,
    highlightedClass,
    searching,
    searchClass,
  });

  const { disableTags, ignoredNodes, nodeName } = options;
  const trailingNodeExtension = new TrailingNodeExtension({
    disableTags,
    ignoredNodes,
    nodeName,
  });

  return [
    // Plain
    bidiExtension,
    dropCursorExtension,
    gapCursorExtension,
    searchExtension,
    trailingNodeExtension,

    // Nodes
    hardBreakExtension,
    imageExtension,
    horizontalRuleExtension,
    blockquoteExtension,
    codeBlockExtension,
    headingExtension,
    tableExtension,
    iframeExtension,
    bulletListExtension,
    orderedListExtension,

    // Marks
    boldExtension,
    codeExtension,
    strikeExtension,
    italicExtension,
    linkExtension,
    underlineExtension,
  ];
}

/**
 * The union of types for all the extensions provided by the `wysiwygPreset`
 * function call.
 */
export type WysiwygPreset =
  | GapCursorExtension
  | HardBreakExtension
  | HorizontalRuleExtension
  | ImageExtension
  | ItalicExtension
  | StrikeExtension
  | UnderlineExtension
  | BlockquoteExtension
  | CodeExtension
  | TableExtension
  | LinkExtension
  | BidiExtension
  | BoldExtension
  | CodeBlockExtension
  | DropCursorExtension
  | HeadingExtension
  | SearchExtension
  | TrailingNodeExtension
  | IframeExtension
  | BulletListExtension
  | OrderedListExtension;
