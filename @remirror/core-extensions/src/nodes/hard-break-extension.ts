import { exitCode } from 'prosemirror-commands';

import {
  chainCommands,
  convertCommand,
  ManagerNodeTypeParams,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';

export class HardBreakExtension extends NodeExtension {
  get name() {
    return 'hardBreak' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttributes(),
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM: () => ['br'],
    };
  }

  public keys({ type }: ManagerNodeTypeParams): KeyBindings {
    const command = chainCommands(convertCommand(exitCode), ({ state, dispatch }) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      }

      return true;
    });

    return {
      'Mod-Enter': command,
      'Shift-Enter': command,
    };
  }
}
