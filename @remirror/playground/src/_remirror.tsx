/******************************************************************************\
*                                                                              *
*                       THIS FILE IS AUTO-GENERATED                            *
*                                                                              *
*           See @remirror/playground/scripts/import-remirror.ts.               *
*                                                                              *
\******************************************************************************/

// Remirror custom imports
import { RemirrorProvider, useExtension, useManager, useRemirror } from '@remirror/react';

import { useRemirrorPlayground } from './use-remirror-playground';

export const IMPORT_CACHE: { [moduleName: string]: any } = {
  // Auto-imported
  'remirror/extension/auto-link': require('remirror/extension/auto-link'),
  'remirror/extension/base-keymap': require('remirror/extension/base-keymap'),
  'remirror/extension/blockquote': require('remirror/extension/blockquote'),
  'remirror/extension/bold': require('remirror/extension/bold'),
  'remirror/extension/code': require('remirror/extension/code'),
  'remirror/extension/code-block': require('remirror/extension/code-block'),
  'remirror/extension/collaboration': require('remirror/extension/collaboration'),
  'remirror/extension/doc': require('remirror/extension/doc'),
  'remirror/extension/drop-cursor': require('remirror/extension/drop-cursor'),
  'remirror/extension/emoji': require('remirror/extension/emoji'),
  'remirror/extension/epic-mode': require('remirror/extension/epic-mode'),
  'remirror/extension/gap-cursor': require('remirror/extension/gap-cursor'),
  'remirror/extension/hard-break': require('remirror/extension/hard-break'),
  'remirror/extension/heading': require('remirror/extension/heading'),
  'remirror/extension/history': require('remirror/extension/history'),
  'remirror/extension/horizontal-rule': require('remirror/extension/horizontal-rule'),
  'remirror/extension/image': require('remirror/extension/image'),
  'remirror/extension/italic': require('remirror/extension/italic'),
  'remirror/extension/link': require('remirror/extension/link'),
  'remirror/extension/mention': require('remirror/extension/mention'),
  'remirror/extension/paragraph': require('remirror/extension/paragraph'),
  'remirror/extension/placeholder': require('remirror/extension/placeholder'),
  'remirror/extension/position-tracker': require('remirror/extension/position-tracker'),
  'remirror/extension/positioner': require('remirror/extension/positioner'),
  'remirror/extension/react-ssr': require('remirror/extension/react-ssr'),
  'remirror/extension/search': require('remirror/extension/search'),
  'remirror/extension/strike': require('remirror/extension/strike'),
  'remirror/extension/text': require('remirror/extension/text'),
  'remirror/extension/track-changes': require('remirror/extension/track-changes'),
  'remirror/extension/trailing-node': require('remirror/extension/trailing-node'),
  'remirror/extension/underline': require('remirror/extension/underline'),
  'remirror/preset/core': require('remirror/preset/core'),
  'remirror/preset/embed': require('remirror/preset/embed'),
  'remirror/preset/list': require('remirror/preset/list'),
  'remirror/preset/react': require('remirror/preset/react'),
  'remirror/preset/table': require('remirror/preset/table'),

  // Manual-imported
  remirror: require('remirror'),
  'remirror/react': { RemirrorProvider, useManager, useExtension, useRemirror },
  '@remirror/playground': { useRemirrorPlayground },

  // External dependencies
  '@babel/runtime/helpers/interopRequireDefault': require('@babel/runtime/helpers/interopRequireDefault'),
  react: require('react'),
};

export const INTERNAL_MODULES: Array<{ moduleName: string; exports: string[] }> = [
  {
    moduleName: 'remirror/extension/auto-link',
    exports: ['AutoLinkExtension'],
  },
  {
    moduleName: 'remirror/extension/base-keymap',
    exports: ['BaseKeymapExtension'],
  },
  {
    moduleName: 'remirror/extension/blockquote',
    exports: ['BlockquoteExtension'],
  },
  {
    moduleName: 'remirror/extension/bold',
    exports: ['BoldExtension'],
  },
  {
    moduleName: 'remirror/extension/code',
    exports: ['CodeExtension'],
  },
  {
    moduleName: 'remirror/extension/code-block',
    exports: ['CodeBlockExtension', 'getLanguage'],
  },
  {
    moduleName: 'remirror/extension/collaboration',
    exports: ['CollaborationExtension'],
  },
  {
    moduleName: 'remirror/extension/doc',
    exports: ['DocExtension'],
  },
  {
    moduleName: 'remirror/extension/drop-cursor',
    exports: ['DropCursorExtension'],
  },
  {
    moduleName: 'remirror/extension/emoji',
    exports: [
      'DEFAULT_FREQUENTLY_USED',
      'EMOTICONS',
      'EmojiExtension',
      'SKIN_VARIATIONS',
      'aliasToName',
      'emojiCategories',
      'emojiList',
      'emojiNames',
      'emoticonRegex',
      'getEmojiByName',
      'getEmojiFromEmoticon',
      'getHexadecimalsFromEmoji',
      'isEmojiAliasName',
      'isEmojiName',
      'isValidEmojiName',
      'isValidEmojiObject',
      'isValidSkinVariation',
      'populateFrequentlyUsed',
      'sortEmojiMatches',
    ],
  },
  {
    moduleName: 'remirror/extension/epic-mode',
    exports: ['COLORS', 'EpicModeExtension', 'defaultEffect', 'heartEffect', 'spawningEffect'],
  },
  {
    moduleName: 'remirror/extension/gap-cursor',
    exports: ['GapCursorExtension', 'editorStyles', 'isGapCursorSelection'],
  },
  {
    moduleName: 'remirror/extension/hard-break',
    exports: ['HardBreakExtension'],
  },
  {
    moduleName: 'remirror/extension/heading',
    exports: ['HeadingExtension'],
  },
  {
    moduleName: 'remirror/extension/history',
    exports: ['HistoryExtension'],
  },
  {
    moduleName: 'remirror/extension/horizontal-rule',
    exports: ['HorizontalRuleExtension'],
  },
  {
    moduleName: 'remirror/extension/image',
    exports: ['ImageExtension', 'isImageFileType'],
  },
  {
    moduleName: 'remirror/extension/italic',
    exports: ['ItalicExtension'],
  },
  {
    moduleName: 'remirror/extension/link',
    exports: ['LinkExtension'],
  },
  {
    moduleName: 'remirror/extension/mention',
    exports: ['MentionExtension'],
  },
  {
    moduleName: 'remirror/extension/paragraph',
    exports: ['ParagraphExtension'],
  },
  {
    moduleName: 'remirror/extension/placeholder',
    exports: ['EMPTY_NODE_CLASS_NAME', 'EMPTY_NODE_CLASS_SELECTOR', 'PlaceholderExtension'],
  },
  {
    moduleName: 'remirror/extension/position-tracker',
    exports: ['PositionTrackerExtension'],
  },
  {
    moduleName: 'remirror/extension/positioner',
    exports: [
      'PositionerExtension',
      'bubblePositioner',
      'defaultPositioner',
      'floatingPositioner',
      'getInitialPosition',
      'popupMenuPositioner',
    ],
  },
  {
    moduleName: 'remirror/extension/react-ssr',
    exports: ['ReactSSRExtension'],
  },
  {
    moduleName: 'remirror/extension/search',
    exports: ['SearchExtension', 'rotateHighlightedIndex'],
  },
  {
    moduleName: 'remirror/extension/strike',
    exports: ['StrikeExtension'],
  },
  {
    moduleName: 'remirror/extension/text',
    exports: ['TextExtension'],
  },
  {
    moduleName: 'remirror/extension/track-changes',
    exports: ['TrackChangesExtension'],
  },
  {
    moduleName: 'remirror/extension/trailing-node',
    exports: ['TrailingNodeExtension'],
  },
  {
    moduleName: 'remirror/extension/underline',
    exports: ['UnderlineExtension'],
  },
  {
    moduleName: 'remirror/preset/core',
    exports: ['CorePreset'],
  },
  {
    moduleName: 'remirror/preset/embed',
    exports: ['EmbedPreset', 'IframeExtension'],
  },
  {
    moduleName: 'remirror/preset/list',
    exports: ['BulletListExtension', 'ListItemExtension', 'ListPreset', 'OrderedListExtension'],
  },
  {
    moduleName: 'remirror/preset/react',
    exports: ['ReactPreset'],
  },
  {
    moduleName: 'remirror/preset/table',
    exports: [
      'TableCellExtension',
      'TableExtension',
      'TableHeaderCell',
      'TablePreset',
      'TableRowExtension',
    ],
  },
];
