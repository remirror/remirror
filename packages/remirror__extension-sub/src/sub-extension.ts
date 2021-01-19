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
export class SubExtension extends MarkExtension {
  get name() {
    return 'sub' as const;
  }

  readonly tags = [ExtensionTag.FontStyle];

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),
      parseDOM: [
        {
          tag: 'sub',
          getAttrs: extra.parse,
        },
      ],
      toDOM: (mark) => ['sub', extra.dom(mark), 0],
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Ctrl-Cmd--': toggleMark({ type: this.type }),
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the subscript formatting of the selected text.
       */
      toggleSub: (): CommandFunction => toggleMark({ type: this.type }),
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      sub: SubExtension;
    }
  }
}
