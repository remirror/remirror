import {
  ApplySchemaAttributes,
  convertCommand,
  extensionDecorator,
  KeyBindings,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
  markPasteRule,
} from '@remirror/core';
import { toggleMark } from '@remirror/pm/commands';

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
      'Mod-d': convertCommand(toggleMark(this.type)),
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the strike through formatting annotation.
       */
      toggleStrike: () => convertCommand(toggleMark(this.type)),
    };
  }

  createInputRules() {
    return [markInputRule({ regexp: /~([^~]+)~$/, type: this.type })];
  }

  createPasteRules() {
    return [markPasteRule({ regexp: /~([^~]+)~/g, type: this.type })];
  }
}
