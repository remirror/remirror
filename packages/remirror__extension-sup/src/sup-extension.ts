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
export class SupExtension extends MarkExtension {
  get name() {
    return 'sup' as const;
  }

  readonly tags = [ExtensionTag.FontStyle];

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),
      parseDOM: [
        {
          tag: 'sup',
          getAttrs: extra.parse,
        },
      ],
      toDOM: (mark) => ['sup', extra.dom(mark), 0],
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Ctrl-Cmd-+': toggleMark({ type: this.type }),
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the superscript formatting of the selected text.
       */
      toggleSup: (): CommandFunction => toggleMark({ type: this.type }),
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      sup: SupExtension;
    }
  }
}
