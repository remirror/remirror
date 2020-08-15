import {
  ApplySchemaAttributes,
  extensionDecorator,
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

/**
 * The extension for adding strike-through marks to the editor.
 */
@extensionDecorator({})
export class StrikeExtension extends MarkExtension {
  get name() {
    return 'strike' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),
      group: MarkGroup.FontStyle,
      parseDOM: [
        {
          tag: 's',
          getAttrs: extra.parse,
        },
        {
          tag: 'del',
          getAttrs: extra.parse,
        },
        {
          tag: 'strike',
          getAttrs: extra.parse,
        },
        {
          style: 'text-decoration',
          getAttrs: (node) => (node === 'line-through' ? {} : false),
        },
      ],
      toDOM: (mark) => ['s', extra.dom(mark), 0],
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Mod-d': toggleMark({ type: this.type }),
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the strike through formatting annotation.
       */
      toggleStrike: () => toggleMark({ type: this.type }),
    };
  }

  createInputRules(): InputRule[] {
    return [markInputRule({ regexp: /~([^~]+)~$/, type: this.type, ignoreWhitespace: true })];
  }

  createPasteRules(): Plugin[] {
    return [markPasteRule({ regexp: /~([^~]+)~/g, type: this.type })];
  }
}
