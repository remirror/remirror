import {
  ApplySchemaAttributes,
  chainCommands,
  CommandFunction,
  convertCommand,
  extensionDecorator,
  ExtensionPriority,
  ExtensionTag,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';
import { exitCode } from '@remirror/pm/commands';

export interface HardBreakOptions {
  /**
   * The a collection of nodes where the hard break is not available.
   */
  excludedNodes?: string[];

  /**
   *
   */
}

/**
 * An extension which provides the functionality for inserting a `hardBreak`
 * `<br />` tag into the editor.
 *
 * @remarks
 *
 * It will automatically exit when used inside a `codeClock`. To
 * prevent problems occurring when the codeblock is the last node in the
 * doc, you should add the `TrailingNodeExtension` which automatically appends a
 * paragraph node to the last node..
 */
@extensionDecorator({
  defaultPriority: ExtensionPriority.Low,
})
export class HardBreakExtension extends NodeExtension {
  get name() {
    return 'hardBreak' as const;
  }

  tags = [ExtensionTag.InlineNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: extra.defaults(),
      inline: true,
      selectable: false,
      parseDOM: [{ tag: 'br', getAttrs: extra.parse }],
      toDOM: (node) => ['br', extra.dom(node)],
    };
  }

  createKeymap(): KeyBindings {
    const command = chainCommands(convertCommand(exitCode), () => {
      this.store.commands.insertHardBreak();
      return true;
    });

    return {
      'Mod-Enter': command,
      'Shift-Enter': command,
    };
  }

  createCommands() {
    return {
      /**
       * Inserts a hardBreak `<br />` tag into the editor.
       */
      insertHardBreak: (): CommandFunction => (parameter) => {
        const { tr, dispatch } = parameter;

        // Create the `hardBreak`
        dispatch?.(tr.replaceSelectionWith(this.type.create()).scrollIntoView());

        return true;
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      hardBreak: HardBreakExtension;
    }
  }
}
