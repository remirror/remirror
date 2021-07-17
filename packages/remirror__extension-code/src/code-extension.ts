import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  InputRule,
  keyBinding,
  KeyBindingProps,
  KeyBindings,
  LEAF_NODE_REPLACING_CHARACTER,
  MarkExtension,
  MarkExtensionSpec,
  markInputRule,
  MarkSpecOverride,
  NamedShortcut,
  toggleMark,
} from '@remirror/core';
import { ExtensionCodeMessages } from '@remirror/messages';
import { MarkPasteRule } from '@remirror/pm/paste-rules';

const { DESCRIPTION, LABEL } = ExtensionCodeMessages;
const toggleCodeOptions: Remirror.CommandDecoratorOptions = {
  icon: 'codeLine',
  description: ({ t }) => t(DESCRIPTION),
  label: ({ t }) => t(LABEL),
};

/**
 * Add a `code` mark to the editor. This is used to mark inline text as a code
 * snippet.
 */
@extension({})
export class CodeExtension extends MarkExtension {
  get name() {
    return 'code' as const;
  }

  createTags() {
    return [ExtensionTag.Code, ExtensionTag.ExcludeInputRules];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      excludes: '_',
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'code', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (mark) => ['code', extra.dom(mark), 0],
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Mod-`': toggleMark({ type: this.type }),
    };
  }

  @keyBinding({ shortcut: NamedShortcut.Code, command: 'toggleCode' })
  keyboardShortcut(props: KeyBindingProps): boolean {
    return this.toggleCode()(props);
  }

  /**
   * Toggle the current selection as a code mark.
   */
  @command(toggleCodeOptions)
  toggleCode(): CommandFunction {
    return toggleMark({ type: this.type });
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

  createPasteRules(): MarkPasteRule[] {
    return [{ type: 'mark', regexp: /`([^`]+)`/g, markType: this.type }];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      code: CodeExtension;
    }
  }
}
