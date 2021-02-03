/**
 * @module
 *
 * This is an internal module which is only used for the playground. The purpose
 * is to provide all the scoped remirror packages to the playground without
 * needing to import them all within the `@remirror/playground`.
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see `support/scripts/src/generate-playground.ts`
 */

import * as remirrorCore from '@remirror/core';
import * as remirrorCoreConstants from '@remirror/core-constants';
import * as remirrorCoreHelpers from '@remirror/core-helpers';
import * as remirrorCoreTypes from '@remirror/core-types';
import * as remirrorCoreUtils from '@remirror/core-utils';
import * as remirrorDom from '@remirror/dom';
import * as remirrorExtensionAnnotation from '@remirror/extension-annotation';
import * as remirrorExtensionBidi from '@remirror/extension-bidi';
import * as remirrorExtensionBlockquote from '@remirror/extension-blockquote';
import * as remirrorExtensionBold from '@remirror/extension-bold';
import * as remirrorExtensionCallout from '@remirror/extension-callout';
import * as remirrorExtensionCode from '@remirror/extension-code';
import * as remirrorExtensionCodeBlock from '@remirror/extension-code-block';
import * as remirrorExtensionCodemirror5 from '@remirror/extension-codemirror5';
import * as remirrorExtensionCollaboration from '@remirror/extension-collaboration';
import * as remirrorExtensionColumns from '@remirror/extension-columns';
import * as remirrorExtensionDiff from '@remirror/extension-diff';
import * as remirrorExtensionDoc from '@remirror/extension-doc';
import * as remirrorExtensionDropCursor from '@remirror/extension-drop-cursor';
import * as remirrorExtensionEmbed from '@remirror/extension-embed';
import * as remirrorExtensionEmoji from '@remirror/extension-emoji';
import * as remirrorExtensionEpicMode from '@remirror/extension-epic-mode';
import * as remirrorExtensionEvents from '@remirror/extension-events';
import * as remirrorExtensionFontFamily from '@remirror/extension-font-family';
import * as remirrorExtensionFontSize from '@remirror/extension-font-size';
import * as remirrorExtensionGapCursor from '@remirror/extension-gap-cursor';
import * as remirrorExtensionHardBreak from '@remirror/extension-hard-break';
import * as remirrorExtensionHeading from '@remirror/extension-heading';
import * as remirrorExtensionHistory from '@remirror/extension-history';
import * as remirrorExtensionHorizontalRule from '@remirror/extension-horizontal-rule';
import * as remirrorExtensionImage from '@remirror/extension-image';
import * as remirrorExtensionItalic from '@remirror/extension-italic';
import * as remirrorExtensionLink from '@remirror/extension-link';
import * as remirrorExtensionList from '@remirror/extension-list';
import * as remirrorExtensionMarkdown from '@remirror/extension-markdown';
import * as remirrorExtensionMention from '@remirror/extension-mention';
import * as remirrorExtensionMentionAtom from '@remirror/extension-mention-atom';
import * as remirrorExtensionNodeFormatting from '@remirror/extension-node-formatting';
import * as remirrorExtensionParagraph from '@remirror/extension-paragraph';
import * as remirrorExtensionPlaceholder from '@remirror/extension-placeholder';
import * as remirrorExtensionPositioner from '@remirror/extension-positioner';
import * as remirrorExtensionSearch from '@remirror/extension-search';
import * as remirrorExtensionStrike from '@remirror/extension-strike';
import * as remirrorExtensionSub from '@remirror/extension-sub';
import * as remirrorExtensionSup from '@remirror/extension-sup';
import * as remirrorExtensionTables from '@remirror/extension-tables';
import * as remirrorExtensionText from '@remirror/extension-text';
import * as remirrorExtensionTextCase from '@remirror/extension-text-case';
import * as remirrorExtensionTextColor from '@remirror/extension-text-color';
import * as remirrorExtensionTextHighlight from '@remirror/extension-text-highlight';
import * as remirrorExtensionTrailingNode from '@remirror/extension-trailing-node';
import * as remirrorExtensionUnderline from '@remirror/extension-underline';
import * as remirrorExtensionWhitespace from '@remirror/extension-whitespace';
import * as remirrorExtensionYjs from '@remirror/extension-yjs';
import * as remirrorIcons from '@remirror/icons';
import * as remirrorPresetCore from '@remirror/preset-core';
import * as remirrorPresetFormatting from '@remirror/preset-formatting';
import * as remirrorPresetWysiwyg from '@remirror/preset-wysiwyg';
import * as remirrorTheme from '@remirror/theme';

export const PlaygroundImports = {
  '@remirror/core': remirrorCore,
  '@remirror/core-constants': remirrorCoreConstants,
  '@remirror/core-helpers': remirrorCoreHelpers,
  '@remirror/core-types': remirrorCoreTypes,
  '@remirror/core-utils': remirrorCoreUtils,
  '@remirror/dom': remirrorDom,
  '@remirror/extension-annotation': remirrorExtensionAnnotation,
  '@remirror/extension-bidi': remirrorExtensionBidi,
  '@remirror/extension-blockquote': remirrorExtensionBlockquote,
  '@remirror/extension-bold': remirrorExtensionBold,
  '@remirror/extension-callout': remirrorExtensionCallout,
  '@remirror/extension-code': remirrorExtensionCode,
  '@remirror/extension-code-block': remirrorExtensionCodeBlock,
  '@remirror/extension-codemirror5': remirrorExtensionCodemirror5,
  '@remirror/extension-collaboration': remirrorExtensionCollaboration,
  '@remirror/extension-columns': remirrorExtensionColumns,
  '@remirror/extension-diff': remirrorExtensionDiff,
  '@remirror/extension-doc': remirrorExtensionDoc,
  '@remirror/extension-drop-cursor': remirrorExtensionDropCursor,
  '@remirror/extension-embed': remirrorExtensionEmbed,
  '@remirror/extension-emoji': remirrorExtensionEmoji,
  '@remirror/extension-epic-mode': remirrorExtensionEpicMode,
  '@remirror/extension-events': remirrorExtensionEvents,
  '@remirror/extension-font-family': remirrorExtensionFontFamily,
  '@remirror/extension-font-size': remirrorExtensionFontSize,
  '@remirror/extension-gap-cursor': remirrorExtensionGapCursor,
  '@remirror/extension-hard-break': remirrorExtensionHardBreak,
  '@remirror/extension-heading': remirrorExtensionHeading,
  '@remirror/extension-history': remirrorExtensionHistory,
  '@remirror/extension-horizontal-rule': remirrorExtensionHorizontalRule,
  '@remirror/extension-image': remirrorExtensionImage,
  '@remirror/extension-italic': remirrorExtensionItalic,
  '@remirror/extension-link': remirrorExtensionLink,
  '@remirror/extension-list': remirrorExtensionList,
  '@remirror/extension-markdown': remirrorExtensionMarkdown,
  '@remirror/extension-mention': remirrorExtensionMention,
  '@remirror/extension-mention-atom': remirrorExtensionMentionAtom,
  '@remirror/extension-node-formatting': remirrorExtensionNodeFormatting,
  '@remirror/extension-paragraph': remirrorExtensionParagraph,
  '@remirror/extension-placeholder': remirrorExtensionPlaceholder,
  '@remirror/extension-positioner': remirrorExtensionPositioner,
  '@remirror/extension-search': remirrorExtensionSearch,
  '@remirror/extension-strike': remirrorExtensionStrike,
  '@remirror/extension-sub': remirrorExtensionSub,
  '@remirror/extension-sup': remirrorExtensionSup,
  '@remirror/extension-tables': remirrorExtensionTables,
  '@remirror/extension-text': remirrorExtensionText,
  '@remirror/extension-text-case': remirrorExtensionTextCase,
  '@remirror/extension-text-color': remirrorExtensionTextColor,
  '@remirror/extension-text-highlight': remirrorExtensionTextHighlight,
  '@remirror/extension-trailing-node': remirrorExtensionTrailingNode,
  '@remirror/extension-underline': remirrorExtensionUnderline,
  '@remirror/extension-whitespace': remirrorExtensionWhitespace,
  '@remirror/extension-yjs': remirrorExtensionYjs,
  '@remirror/icons': remirrorIcons,
  '@remirror/preset-core': remirrorPresetCore,
  '@remirror/preset-formatting': remirrorPresetFormatting,
  '@remirror/preset-wysiwyg': remirrorPresetWysiwyg,
  '@remirror/theme': remirrorTheme,
} as const;
