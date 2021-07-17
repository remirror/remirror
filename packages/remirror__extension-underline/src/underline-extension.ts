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
  MarkSpecOverride,
  NamedShortcut,
  PrimitiveSelection,
  toggleMark,
} from '@remirror/core';

import { toggleUnderlineOptions } from './underline-utils';

/**
 * Add underline formatting support to the editor.
 */
@extension({})
export class UnderlineExtension extends MarkExtension {
  get name() {
    return 'underline' as const;
  }

  createTags() {
    return [ExtensionTag.FontStyle, ExtensionTag.FormattingMark];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      ...override,
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
        ...(override.parseDOM ?? []),
      ],
      toDOM: (mark) => ['u', extra.dom(mark), 0],
    };
  }

  /**
   * Toggle the underline formatting of the selected text.
   *
   * This command is provided by the `UnderlineExtension`.
   */
  @command(toggleUnderlineOptions)
  toggleUnderline(selection?: PrimitiveSelection): CommandFunction {
    return toggleMark({ type: this.type, selection });
  }

  /**
   * Attach the keyboard shortcut for formatting the text.
   */
  @keyBinding({ shortcut: NamedShortcut.Underline, command: 'toggleUnderline' })
  shortcut(props: KeyBindingProps): boolean {
    return this.toggleUnderline()(props);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      underline: UnderlineExtension;
    }
  }
}
