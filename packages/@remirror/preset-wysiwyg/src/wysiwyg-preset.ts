import { isEmptyObject, OnSetOptionsParameter, Preset, presetDecorator } from '@remirror/core';
import { BidiExtension, BidiOptions } from '@remirror/extension-bidi';
import { BlockquoteExtension } from '@remirror/extension-blockquote';
import { BoldExtension, BoldOptions } from '@remirror/extension-bold';
import { CodeExtension } from '@remirror/extension-code';
import { CodeBlockExtension, CodeBlockOptions } from '@remirror/extension-code-block';
import { DropCursorExtension, DropCursorOptions } from '@remirror/extension-drop-cursor';
import { EpicModeExtension } from '@remirror/extension-epic-mode';
import { GapCursorExtension } from '@remirror/extension-gap-cursor';
import { HardBreakExtension } from '@remirror/extension-hard-break';
import { HeadingExtension, HeadingOptions } from '@remirror/extension-heading';
import { HorizontalRuleExtension } from '@remirror/extension-horizontal-rule';
import { ImageExtension } from '@remirror/extension-image';
import { ItalicExtension } from '@remirror/extension-italic';
import { LinkExtension, LinkOptions } from '@remirror/extension-link';
import { SearchExtension, SearchOptions } from '@remirror/extension-search';
import { StrikeExtension } from '@remirror/extension-strike';
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
    TrailingNodeOptions {}

@presetDecorator<WysiwygOptions>({
  defaultOptions: {
    ...BidiExtension.defaultOptions,
    ...BoldExtension.defaultOptions,
    ...CodeBlockExtension.defaultOptions,
    ...DropCursorExtension.defaultOptions,
    ...SearchExtension.defaultOptions,
    ...TrailingNodeExtension.defaultOptions,
    ...HeadingExtension.defaultOptions,
  },
  staticKeys: [
    'defaultLevel',
    'excludeNodes',
    'highlightedClass',
    'levels',
    'searchClass',
    'weight',
  ],
  handlerKeys: ['onActivateLink', 'onSearch'],
})
export class WysiwygPreset extends Preset<WysiwygOptions> {
  get name() {
    return 'wysiwyg' as const;
  }

  protected onSetOptions(parameter: OnSetOptionsParameter<WysiwygOptions>) {
    const { pickChanged } = parameter;
    const trailingNodeOptions = pickChanged(['disableTags', 'ignoredNodes', 'nodeName']);
    const bidiOptions = pickChanged(['defaultDirection', 'autoUpdate']);
    const codeBlockOptions = pickChanged([
      'defaultLanguage',
      'formatter',
      'toggleName',
      'syntaxTheme',
      'supportedLanguages',
      'keyboardShortcut',
    ]);
    const dropCursorOptions = pickChanged(['color', 'width']);
    const searchOptions = pickChanged([
      'alwaysSearch',
      'autoSelectNext',
      'caseSensitive',
      'clearOnEscape',
      'disableRegex',
      'searching',
      'searchForwardShortcut',
      'searchBackwardShortcut',
    ]);

    if (!isEmptyObject(bidiOptions)) {
      this.getExtension(BidiExtension).setOptions(bidiOptions);
    }

    if (!isEmptyObject(codeBlockOptions)) {
      this.getExtension(CodeBlockExtension).setOptions(codeBlockOptions);
    }

    if (!isEmptyObject(dropCursorOptions)) {
      this.getExtension(DropCursorExtension).setOptions(dropCursorOptions);
    }

    if (!isEmptyObject(searchOptions)) {
      this.getExtension(SearchExtension).setOptions(searchOptions);
    }

    if (!isEmptyObject(trailingNodeOptions)) {
      this.getExtension(TrailingNodeExtension).setOptions(trailingNodeOptions);
    }
  }

  createExtensions() {
    const gapCursorExtension = new GapCursorExtension();
    const hardBreakExtension = new HardBreakExtension();
    const horizontalRuleExtension = new HorizontalRuleExtension();
    const imageExtension = new ImageExtension();
    const italicExtension = new ItalicExtension();
    const strikeExtension = new StrikeExtension();
    const underlineExtension = new UnderlineExtension();
    const blockquoteExtension = new BlockquoteExtension();
    const codeExtension = new CodeExtension();

    const linkExtension = new LinkExtension();
    linkExtension.addHandler('onActivateLink', this.options.onActivateLink);

    const { autoUpdate, defaultDirection, excludeNodes } = this.options;
    const bidiExtension = new BidiExtension({ autoUpdate, defaultDirection, excludeNodes });

    const { weight } = this.options;
    const boldExtension = new BoldExtension({ weight });

    const {
      defaultLanguage,
      formatter,
      toggleName,
      syntaxTheme,
      supportedLanguages,
      keyboardShortcut,
    } = this.options;
    const codeBlockExtension = new CodeBlockExtension({
      defaultLanguage,
      formatter,
      toggleName,
      syntaxTheme,
      supportedLanguages,
      keyboardShortcut,
    });

    const { color, width } = this.options;
    const dropCursorExtension = new DropCursorExtension({
      color,
      width,
    });

    const epicModeExtension = new EpicModeExtension({ active: false });

    const { defaultLevel, levels } = this.options;
    const headingExtension = new HeadingExtension({ defaultLevel, levels });

    const {
      alwaysSearch,
      autoSelectNext,
      caseSensitive,
      clearOnEscape,
      disableRegex,
      highlightedClass,
      searching,
      searchForwardShortcut,
      searchClass,
      searchBackwardShortcut,
    } = this.options;
    const searchExtension = new SearchExtension({
      alwaysSearch,
      autoSelectNext,
      caseSensitive,
      clearOnEscape,
      disableRegex,
      highlightedClass,
      searching,
      searchForwardShortcut,
      searchClass,
      searchBackwardShortcut,
    });
    searchExtension.addHandler('onSearch', this.options.onSearch);

    const { disableTags, ignoredNodes, nodeName } = this.options;
    const trailingNodeExtension = new TrailingNodeExtension({
      disableTags,
      ignoredNodes,
      nodeName,
    });

    return [
      // Plain
      bidiExtension,
      dropCursorExtension,
      epicModeExtension,
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

      // Marks
      boldExtension,
      codeExtension,
      strikeExtension,
      italicExtension,
      linkExtension,
      underlineExtension,
    ];
  }
}
