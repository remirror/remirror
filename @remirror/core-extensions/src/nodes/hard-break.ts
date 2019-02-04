import { chainCommands, exitCode, NodeExtension, SchemaNodeTypeParams } from '@remirror/core';

export class HardBreak extends NodeExtension {
  get name() {
    return 'hard_break';
  }

  get schema() {
    return {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM: () => ['br'],
    };
  }

  public keys({ type }: SchemaNodeTypeParams) {
    const command = chainCommands(exitCode, (state, dispatch) => {
      if (!dispatch) {
        return false;
      }
      dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      return true;
    });
    return {
      'Mod-Enter': command,
      'Shift-Enter': command,
    };
  }
}
