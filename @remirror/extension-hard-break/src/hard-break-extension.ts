import {
  ApplyExtraAttributes,
  chainCommands,
  convertCommand,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';
import { exitCode } from '@remirror/pm/commands';

export class HardBreakExtension extends NodeExtension {
  get name() {
    return 'hardBreak' as const;
  }

  createNodeSpec(extra: ApplyExtraAttributes): NodeExtensionSpec {
    return {
      attrs: extra.defaults(),
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br', getAttrs: extra.parse }],
      toDOM: (node) => ['br', extra.dom(node.attrs)],
    };
  }

  createKeymap = (): KeyBindings => {
    const command = chainCommands(convertCommand(exitCode), ({ state, dispatch }) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(this.type.create()).scrollIntoView());
      }

      return true;
    });

    return {
      'Mod-Enter': command,
      'Shift-Enter': command,
    };
  };
}
