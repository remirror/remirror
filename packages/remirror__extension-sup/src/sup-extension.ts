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
import { ExtensionSupMessages as Messages } from '@remirror/messages';

const toggleSuperscriptOptions: Remirror.CommandDecoratorOptions = {
  icon: 'superscript',
  label: ({ t }) => t(Messages.LABEL),
};

@extension({})
export class SupExtension extends MarkExtension {
  get name() {
    return 'sup' as const;
  }

  createTags() {
    return [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];
  }

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

  /**
   * Toggle the subscript formatting of the selected text.
   */
  @command(toggleSuperscriptOptions)
  toggleSuperscript(): CommandFunction {
    return toggleMark({ type: this.type });
  }

  /**
   * Attach the keyboard shortcut for making text bold to this mark and also to
   * the `toggleBold` command.
   */
  @keyBinding({ shortcut: NamedShortcut.Superscript, command: 'toggleSuperscript' })
  shortcut(props: KeyBindingProps): boolean {
    return this.toggleSuperscript()(props);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      sup: SupExtension;
    }
  }
}
