import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionTag,
  KeyBindings,
  MarkExtension,
  MarkExtensionSpec,
  toggleMark,
} from '@remirror/core';

@extensionDecorator({})
export class UnderlineExtension extends MarkExtension {
  get name() {
    return 'underline' as const;
  }

  readonly tags = [ExtensionTag.FontStyle];

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),
      parseDOM: [
        {
          tag: 'u',
          getAttrs: extra.parse,
        },
        {
          style: 'text-decoration',
          getAttrs: (node) => (node === 'underline' ? {} : false),
        },
      ],
      toDOM: (mark) => ['u', extra.dom(mark), 0],
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Mod-u': toggleMark({ type: this.type }),
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the underline formatting of the selected text.
       */
      toggleUnderline: (): CommandFunction => toggleMark({ type: this.type }),
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      underline: UnderlineExtension;
    }
  }
}
