import {
  ApplySchemaAttributes,
  extensionDecorator,
  ExtensionTag,
  InputRule,
  KeyBindings,
  MarkExtension,
  MarkExtensionSpec,
  markInputRule,
  markPasteRule,
  ProsemirrorPlugin,
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

  readonly tags = [ExtensionTag.FontStyle];

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),
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

  createPasteRules(): ProsemirrorPlugin[] {
    return [markPasteRule({ regexp: /~([^~]+)~/g, type: this.type })];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      strike: StrikeExtension;
    }
  }
}
