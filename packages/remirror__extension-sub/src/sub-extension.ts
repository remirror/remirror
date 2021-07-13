import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  keyBinding,
  KeyBindingProps,
  MarkExtension,
  MarkExtensionSpec,
  NamedShortcut,
  toggleMark,
} from '@remirror/core';
import { ExtensionSubMessages as Messages } from '@remirror/messages';

const toggleSubscriptOptions: Remirror.CommandDecoratorOptions = {
  icon: 'subscript',
  label: ({ t }) => t(Messages.LABEL),
};

@extension({})
export class SubExtension extends MarkExtension {
  get name() {
    return 'sub' as const;
  }

  createTags() {
    return [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];
  }

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

  /**
   * Toggle the subscript formatting of the selected text.
   */
  @command(toggleSubscriptOptions)
  toggleSubscript(): CommandFunction {
    return toggleMark({ type: this.type });
  }

  /**
   * Attach the keyboard shortcut for making text bold to this mark and also to
   * the `toggleBold` command.
   */
  @keyBinding({ shortcut: NamedShortcut.Subscript, command: 'toggleSubscript' })
  shortcut(props: KeyBindingProps): boolean {
    return this.toggleSubscript()(props);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      sub: SubExtension;
    }
  }
}
