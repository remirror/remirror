import {
  ApplySchemaAttributes,
  extensionDecorator,
  FromToParameter,
  InputRule,
  KeyBindings,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
  markPasteRule,
  Plugin,
  toggleMark,
} from '@remirror/core';

@extensionDecorator({})
export class ItalicExtension extends MarkExtension {
  get name() {
    return 'italic' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),

      group: MarkGroup.FontStyle,
      parseDOM: [
        { tag: 'i', getAttrs: extra.parse },
        { tag: 'em', getAttrs: extra.parse },
        { style: 'font-style=italic' },
      ],
      toDOM: (mark) => ['em', extra.dom(mark), 0],
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Mod-i': toggleMark({ type: this.type }),
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the italic formatting on the selected text.
       */
      toggleItalic: (range?: FromToParameter) => toggleMark({ type: this.type, range }),
    };
  }

  createInputRules(): InputRule[] {
    return [
      markInputRule({
        regexp: /(?:^|[^*])\*([^*]+)\*/,
        type: this.type,
        ignoreWhitespace: true,
        updateCaptured: ({ fullMatch, start }) =>
          !fullMatch.startsWith('*') ? { fullMatch: fullMatch.slice(1), start: start + 1 } : {},
      }),
      markInputRule({
        regexp: /(?:^|[^_])_([^_]+)_/,
        type: this.type,
        ignoreWhitespace: true,
        updateCaptured: ({ fullMatch, start }) => {
          return !fullMatch.startsWith('_')
            ? { fullMatch: fullMatch.slice(1), start: start + 1 }
            : {};
        },
      }),
    ];
  }

  createPasteRules(): Plugin[] {
    return [
      markPasteRule({ regexp: /_([^_]+)_/g, type: this.type }),
      markPasteRule({ regexp: /\*([^*]+)\*/g, type: this.type }),
    ];
  }
}
