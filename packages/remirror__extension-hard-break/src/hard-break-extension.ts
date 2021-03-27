import {
  ApplySchemaAttributes,
  chainCommands,
  command,
  CommandFunction,
  convertCommand,
  extension,
  ExtensionPriority,
  ExtensionTag,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';
import { exitCode } from '@remirror/pm/commands';

export interface HardBreakOptions {
  /**
   * The a collection of nodes where the hard break is not available.
   */
  excludedNodes?: string[];
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
@extension({
  defaultPriority: ExtensionPriority.Low,
})
export class HardBreakExtension extends NodeExtension {
  get name() {
    return 'hardBreak' as const;
  }

  createTags() {
    return [ExtensionTag.InlineNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      inline: true,
      selectable: false,
      atom: true,
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'br', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
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

  /**
   * Inserts a hardBreak `<br />` tag into the editor.
   */
  @command()
  insertHardBreak(): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;

      // Create the `hardBreak`
      dispatch?.(tr.replaceSelectionWith(this.type.create()).scrollIntoView());

      return true;
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
