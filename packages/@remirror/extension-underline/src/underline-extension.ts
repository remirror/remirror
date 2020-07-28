import {
  ApplySchemaAttributes,
  convertCommand,
  extensionDecorator,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
} from '@remirror/core';
import { toggleMark } from '@remirror/pm/commands';

@extensionDecorator({})
export class UnderlineExtension extends MarkExtension {
  get name() {
    return 'underline' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),
      group: MarkGroup.FontStyle,
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

  createKeymap() {
    return {
      'Mod-u': convertCommand(toggleMark(this.type)),
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the underline formatting of the selected text.
       */
      toggleUnderline: () => convertCommand(toggleMark(this.type)),
    };
  }
}
