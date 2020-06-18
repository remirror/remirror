import {
  ApplyExtraAttributes,
  convertCommand,
  KeyBindings,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
  markPasteRule,
} from '@remirror/core';
import { toggleMark } from '@remirror/pm/commands';

export class ItalicExtension extends MarkExtension {
  get name() {
    return 'italic' as const;
  }

  createMarkSpec(extra: ApplyExtraAttributes): MarkExtensionSpec {
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

  createKeymap = (): KeyBindings => {
    return {
      'Mod-i': convertCommand(toggleMark(this.type)),
    };
  };

  createCommands = () => {
    return {
      /**
       * Toggle the italic formatting on the selected text.
       */
      toggleItalic: () => convertCommand(toggleMark(this.type)),
    };
  };

  createInputRules = () => {
    return [markInputRule({ regexp: /(?:^|[^*_])[*_]([^*_]+)[*_]$/, type: this.type })];
  };

  createPasteRules = () => {
    return [markPasteRule({ regexp: /(?:^|[^*_])[*_]([^*_]+)[*_]/g, type: this.type })];
  };
}
