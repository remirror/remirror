/******************************************************************************\
*                                                                              *
*                       THIS FILE IS AUTO-GENERATED                            *
*                                                                              *
*           See @remirror/playground/scripts/import-remirror.ts.               *
*                                                                              *
\******************************************************************************/

import { useRemirrorPlayground } from './use-remirror-playground';

export const IMPORT_CACHE: { [moduleName: string]: any } = {
  // Auto-imported
  'remirror/extension/annotation': require('remirror/extension/annotation'),
  'remirror/extension/auto-link': require('remirror/extension/auto-link'),
  'remirror/extension/bidi': require('remirror/extension/bidi'),
  'remirror/extension/blockquote': require('remirror/extension/blockquote'),
  'remirror/extension/bold': require('remirror/extension/bold'),
  'remirror/extension/callout': require('remirror/extension/callout'),
  'remirror/extension/code': require('remirror/extension/code'),
  'remirror/extension/code-block': require('remirror/extension/code-block'),
  'remirror/extension/collaboration': require('remirror/extension/collaboration'),
  'remirror/extension/diff': require('remirror/extension/diff'),
  'remirror/extension/doc': require('remirror/extension/doc'),
  'remirror/extension/drop-cursor': require('remirror/extension/drop-cursor'),
  'remirror/extension/emoji': require('remirror/extension/emoji'),
  'remirror/extension/epic-mode': require('remirror/extension/epic-mode'),
  'remirror/extension/events': require('remirror/extension/events'),
  'remirror/extension/gap-cursor': require('remirror/extension/gap-cursor'),
  'remirror/extension/hard-break': require('remirror/extension/hard-break'),
  'remirror/extension/heading': require('remirror/extension/heading'),
  'remirror/extension/history': require('remirror/extension/history'),
  'remirror/extension/horizontal-rule': require('remirror/extension/horizontal-rule'),
  'remirror/extension/image': require('remirror/extension/image'),
  'remirror/extension/italic': require('remirror/extension/italic'),
  'remirror/extension/link': require('remirror/extension/link'),
  'remirror/extension/mention': require('remirror/extension/mention'),
  'remirror/extension/mention-atom': require('remirror/extension/mention-atom'),
  'remirror/extension/paragraph': require('remirror/extension/paragraph'),
  'remirror/extension/placeholder': require('remirror/extension/placeholder'),
  'remirror/extension/positioner': require('remirror/extension/positioner'),
  'remirror/extension/react-component': require('remirror/extension/react-component'),
  'remirror/extension/react-ssr': require('remirror/extension/react-ssr'),
  'remirror/extension/search': require('remirror/extension/search'),
  'remirror/extension/strike': require('remirror/extension/strike'),
  'remirror/extension/text': require('remirror/extension/text'),
  'remirror/extension/trailing-node': require('remirror/extension/trailing-node'),
  'remirror/extension/underline': require('remirror/extension/underline'),
  'remirror/extension/yjs': require('remirror/extension/yjs'),
  'remirror/preset/core': require('remirror/preset/core'),
  'remirror/preset/embed': require('remirror/preset/embed'),
  'remirror/preset/list': require('remirror/preset/list'),
  'remirror/preset/react': require('remirror/preset/react'),
  'remirror/preset/social': require('remirror/preset/social'),
  'remirror/preset/table': require('remirror/preset/table'),
  'remirror/preset/wysiwyg': require('remirror/preset/wysiwyg'),

  // Manually -imported
  remirror: require('remirror'),
  'remirror/react': require('remirror/react'),
  '@remirror/dev': require('@remirror/dev'),
  '@remirror/playground': { useRemirrorPlayground },
  '@remirror/pm/commands': require('@remirror/pm/commands'),
  '@remirror/pm/dropcursor': require('@remirror/pm/dropcursor'),
  '@remirror/pm/gapcursor': require('@remirror/pm/gapcursor'),
  '@remirror/pm/history': require('@remirror/pm/history'),
  '@remirror/pm/inputrules': require('@remirror/pm/inputrules'),
  '@remirror/pm/keymap': require('@remirror/pm/keymap'),
  '@remirror/pm/model': require('@remirror/pm/model'),
  '@remirror/pm/schema-list': require('@remirror/pm/schema-list'),
  '@remirror/pm/state': require('@remirror/pm/state'),
  '@remirror/pm/suggest': require('@remirror/pm/suggest'),
  '@remirror/pm/tables': require('@remirror/pm/tables'),
  '@remirror/pm/transform': require('@remirror/pm/transform'),
  '@remirror/pm/view': require('@remirror/pm/view'),

  // External dependencies
  '@babel/runtime/helpers/interopRequireDefault': require('@babel/runtime/helpers/interopRequireDefault'),
  '@babel/runtime/helpers/interopRequireWildcard': require('@babel/runtime/helpers/interopRequireWildcard'),
  '@babel/runtime/helpers/slicedToArray': require('@babel/runtime/helpers/slicedToArray'),
  '@babel/runtime/helpers/createClass': require('@babel/runtime/helpers/createClass'),
  '@babel/runtime/helpers/possibleConstructorReturn': require('@babel/runtime/helpers/possibleConstructorReturn'),
  '@babel/runtime/helpers/extends': require('@babel/runtime/helpers/extends'),
  '@babel/runtime/helpers/assertThisInitialized': require('@babel/runtime/helpers/assertThisInitialized'),
  '@babel/runtime/helpers/classCallCheck': require('@babel/runtime/helpers/classCallCheck'),
  '@babel/runtime/helpers/inherits': require('@babel/runtime/helpers/inherits'),
  '@babel/runtime/helpers/defineProperty': require('@babel/runtime/helpers/defineProperty'),
  react: require('react'),
  'react-dom': require('react-dom'),
  'react-dom/server': require('react-dom/server'),
};

export const INTERNAL_MODULES: Array<{ moduleName: string; exports: string[] }> = [
  {
    moduleName: 'remirror/extensions',
    exports: ['AnnotationExtension', 'createCenteredAnnotationPositioner'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['AutoLinkExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['BidiExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['BlockquoteExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['BoldExtension'],
  },
  {
    moduleName: 'remirror/extension/callout',
    exports: ['CalloutExtension'],
  },
  {
    moduleName: 'remirror/extension/code',
    exports: ['CodeExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['CodeBlockExtension', 'getLanguage'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['CollaborationExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['DiffExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['DocExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['DropCursorExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['DEFAULT_FREQUENTLY_USED', 'EmojiExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['COLORS', 'EpicModeExtension', 'defaultEffect', 'heartEffect', 'spawningEffect'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['EventsExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['GapCursorExtension', 'isGapCursorSelection'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['HardBreakExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['HeadingExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['HistoryExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['HorizontalRuleExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['ImageExtension', 'isImageFileType'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['ItalicExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['LinkExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['MentionExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['MentionAtomExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['ParagraphExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['EMPTY_NODE_CLASS_NAME', 'EMPTY_NODE_CLASS_SELECTOR', 'PlaceholderExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: [
      'isEmptyBlockNode',
      'Positioner',
      'PositionerExtension',
      'centeredSelectionPositioner',
      'cursorPopupPositioner',
      'emptyCoords',
      'emptyVirtualPosition',
      'floatingSelectionPositioner',
      'getPositioner',
      'hasStateChanged',
    ],
  },
  {
    moduleName: 'remirror/extensions',
    exports: [
      'PortalContainer',
      'ReactComponentExtension',
      'RemirrorPortals',
      'usePortalContext',
      'usePortals',
    ],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['ReactSsrExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['SearchExtension', 'rotateHighlightedIndex'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['StrikeExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['TextExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['TrailingNodeExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['UnderlineExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['YjsExtension', 'defaultDestroyProvider'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['CorePreset', 'createCoreManager'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['EmbedPreset', 'IframeExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['BulletListExtension', 'ListItemExtension', 'ListPreset', 'OrderedListExtension'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['ReactPreset'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: ['SocialPreset'],
  },
  {
    moduleName: 'remirror/extensions',
    exports: [
      'TableCellExtension',
      'TableExtension',
      'TableHeaderCellExtension',
      'TablePreset',
      'TableRowExtension',
    ],
  },
  {
    moduleName: 'remirror/extensions',
    exports: [
      'EmbedPreset',
      'ListPreset',
      'TablePreset',
      'WysiwygPreset',
      'createWysiwygPresetList',
    ],
  },
];
