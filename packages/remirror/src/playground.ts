/**
 * @module
 *
 * This is an internal module which is only used for the playground. The purpose
 * is to provide all the scoped remirror packages to the playground without
 * needing to import them all within the `@remirror/playground`.
 *
 * Currently this is generated manually but it should be automated at some
 * point.
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
import * as remirrorExtensionIcons from '@remirror/extension-icons';
import * as remirrorExtensionImage from '@remirror/extension-image';
import * as remirrorExtensionItalic from '@remirror/extension-italic';
import * as remirrorExtensionLink from '@remirror/extension-link';
import * as remirrorExtensionList from '@remirror/extension-list';
import * as remirrorExtensionMarkdown from '@remirror/extension-markdown';
import * as remirrorExtensionMedia from '@remirror/extension-media';
import * as remirrorExtensionMention from '@remirror/extension-mention';
import * as remirrorExtensionMentionAtom from '@remirror/extension-mention-atom';
import * as remirrorExtensionNativeBridge from '@remirror/extension-native-bridge';
import * as remirrorExtensionParagraph from '@remirror/extension-paragraph';
import * as remirrorExtensionPlaceholder from '@remirror/extension-placeholder';
import * as remirrorExtensionPositioner from '@remirror/extension-positioner';
import * as remirrorExtensionReactComponent from '@remirror/extension-react-component';
import * as remirrorExtensionReactSsr from '@remirror/extension-react-ssr';
import * as remirrorExtensionSearch from '@remirror/extension-search';
import * as remirrorExtensionStrike from '@remirror/extension-strike';
import * as remirrorExtensionSub from '@remirror/extension-sub';
import * as remirrorExtensionSup from '@remirror/extension-sup';
import * as remirrorExtensionTables from '@remirror/extension-tables';
import * as remirrorExtensionText from '@remirror/extension-text';
import * as remirrorExtensionTextCase from '@remirror/extension-text-case';
import * as remirrorExtensionTextColor from '@remirror/extension-text-color';
import * as remirrorExtensionTextHighlight from '@remirror/extension-text-highlight';
import * as remirrorExtensionTextWrap from '@remirror/extension-text-wrap';
import * as remirrorExtensionTrailingNode from '@remirror/extension-trailing-node';
import * as remirrorExtensionUnderline from '@remirror/extension-underline';
import * as remirrorExtensionWhitespace from '@remirror/extension-whitespace';
import * as remirrorExtensionYjs from '@remirror/extension-yjs';
import * as remirrorPresetCore from '@remirror/preset-core';
import * as remirrorPresetFormatting from '@remirror/preset-formatting';
import * as remirrorPresetReact from '@remirror/preset-react';
import * as remirrorPresetSocial from '@remirror/preset-social';
import * as remirrorPresetWysiwyg from '@remirror/preset-wysiwyg';
import * as remirrorReact from '@remirror/react';
import * as remirrorReactRenderers from '@remirror/react/renderers';
import * as remirrorReactComponents from '@remirror/react-components';
import * as remirrorReactHooks from '@remirror/react-hooks';
import * as remirrorReactUtils from '@remirror/react-utils';
import * as remirrorTheme from '@remirror/theme';

const playgroundImports = {
  // Extensions
  '@remirror/extension-annotation': remirrorExtensionAnnotation,
  '@remirror/extension-bidi': remirrorExtensionBidi,
  '@remirror/extension-blockquote': remirrorExtensionBlockquote,
  '@remirror/extension-bold': remirrorExtensionBold,
  '@remirror/extension-callout': remirrorExtensionCallout,
  '@remirror/extension-code-block': remirrorExtensionCodeBlock,
  '@remirror/extension-code': remirrorExtensionCode,
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
  '@remirror/extension-html': remirrorExtensionHtml,
  '@remirror/extension-icons': remirrorExtensionIcons,
  '@remirror/extension-image': remirrorExtensionImage,
  '@remirror/extension-italic': remirrorExtensionItalic,
  '@remirror/extension-link': remirrorExtensionLink,
  '@remirror/extension-list': remirrorExtensionList,
  '@remirror/extension-markdown': remirrorExtensionMarkdown,
  '@remirror/extension-media': remirrorExtensionMedia,
  '@remirror/extension-mention-atom': remirrorExtensionMentionAtom,
  '@remirror/extension-mention': remirrorExtensionMention,
  '@remirror/extension-native-bridge': remirrorExtensionNativeBridge,
  '@remirror/extension-paragraph': remirrorExtensionParagraph,
  '@remirror/extension-placeholder': remirrorExtensionPlaceholder,
  '@remirror/extension-positioner': remirrorExtensionPositioner,
  '@remirror/extension-search': remirrorExtensionSearch,
  '@remirror/extension-strike': remirrorExtensionStrike,
  '@remirror/extension-sub': remirrorExtensionSub,
  '@remirror/extension-sup': remirrorExtensionSup,
  '@remirror/extension-tables': remirrorExtensionTables,
  '@remirror/extension-text-case': remirrorExtensionTextCase,
  '@remirror/extension-text-color': remirrorExtensionTextColor,
  '@remirror/extension-text-highlight': remirrorExtensionTextHighlight,
  '@remirror/extension-text-wrap': remirrorExtensionTextWrap,
  '@remirror/extension-text': remirrorExtensionText,
  '@remirror/extension-trailing-node': remirrorExtensionTrailingNode,
  '@remirror/extension-underline': remirrorExtensionUnderline,
  '@remirror/extension-whitespace': remirrorExtensionWhitespace,
  '@remirror/extension-yjs': remirrorExtensionYjs,

  // Presets
  '@remirror/preset-core': remirrorPresetCore,
  '@remirror/preset-formatting': remirrorPresetFormatting,
  '@remirror/preset-social': remirrorPresetSocial,
  '@remirror/preset-wysiwyg': remirrorPresetWysiwyg,

  // Core
  '@remirror/core-constants': remirrorCoreConstants,
  '@remirror/core-helpers': remirrorCoreHelpers,
  '@remirror/core-types': remirrorCoreTypes,
  '@remirror/core-utils': remirrorCoreUtils,
  '@remirror/core': remirrorCore,
  '@remirror/theme': remirrorTheme,

  // DOM
  '@remirror/dom': remirrorDom,

  // React
  '@remirror/extension-react-component': remirrorExtensionReactComponent,
  '@remirror/extension-react-ssr': remirrorExtensionReactSsr,
  '@remirror/preset-react': remirrorPresetReact,
  '@remirror/react-components': remirrorReactComponents,
  '@remirror/react-hooks': remirrorReactHooks,
  '@remirror/react-utils': remirrorReactUtils,
  '@remirror/react': remirrorReact,
  '@remirror/react/renderers': remirrorReactRenderers,
} as const;

export default playgroundImports;

export interface PlaygroundExportProps {
  /**
   * Use this component to add a debugger to the rendered editor.
   */
  DebugComponent: import('react').ComponentType<{ name?: string }>;
}
