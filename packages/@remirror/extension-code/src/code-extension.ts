import {
  ApplySchemaAttributes,
  extensionDecorator,
  InputRule,
  KeyBindings,
  LEAF_NODE_REPLACING_CHARACTER,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
  markPasteRule,
  Plugin,
  toggleMark,
} from '@remirror/core';

/**
 * Add a `code` mark to the editor. This is used to mark inline text as a code snippet.
 */
@extensionDecorator({})
export class CodeExtension extends MarkExtension {
  get name() {
    return 'code' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),
      group: MarkGroup.Code,
      parseDOM: [{ tag: 'code', getAttrs: extra.parse }],
      toDOM: (mark) => ['code', extra.dom(mark), 0],
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Mod-`': toggleMark({ type: this.type }),
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the current selection as a code mark.
       */
      toggleCode: () => toggleMark({ type: this.type }),
    };
  }

  createInputRules(): InputRule[] {
    return [
      markInputRule({
        regexp: new RegExp(`(?:\`)([^\`${LEAF_NODE_REPLACING_CHARACTER}]+)(?:\`)$`),
        type: this.type,
        ignoreWhitespace: true,
      }),
    ];
  }

  createPasteRules(): Plugin[] {
    return [markPasteRule({ regexp: /`([^`]+)`/g, type: this.type })];
  }
}
