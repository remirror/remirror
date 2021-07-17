import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  InputRule,
  keyBinding,
  KeyBindingProps,
  MarkExtension,
  MarkExtensionSpec,
  markInputRule,
  MarkSpecOverride,
  NamedShortcut,
  toggleMark,
} from '@remirror/core';
import { MarkPasteRule } from '@remirror/pm/paste-rules';

import { toggleStrikeOptions } from './strike-utils';
/**
 * The extension for adding strike-through marks to the editor.
 */
@extension({})
export class StrikeExtension extends MarkExtension {
  get name() {
    return 'strike' as const;
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
        ...(override.parseDOM ?? []),
      ],
      toDOM: (mark) => ['s', extra.dom(mark), 0],
    };
  }

  /**
   * Toggle the strike through formatting annotation.
   */
  @command(toggleStrikeOptions)
  toggleStrike(): CommandFunction {
    return toggleMark({ type: this.type });
  }

  /**
   * Attach the keyboard shortcut to format the text.
   */
  @keyBinding({ shortcut: NamedShortcut.Strike, command: 'toggleStrike' })
  shortcut(props: KeyBindingProps): boolean {
    return this.toggleStrike()(props);
  }

  createInputRules(): InputRule[] {
    return [markInputRule({ regexp: /~([^~]+)~$/, type: this.type, ignoreWhitespace: true })];
  }

  createPasteRules(): MarkPasteRule[] {
    return [{ regexp: /~([^~]+)~/g, type: 'mark', markType: this.type }];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      strike: StrikeExtension;
    }
  }
}
