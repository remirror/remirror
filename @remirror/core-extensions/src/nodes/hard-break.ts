import { NodeExtension, NodeExtensionSpec, SchemaNodeTypeParams } from '@remirror/core';
import { chainCommands, exitCode } from 'prosemirror-commands';

export class HardBreak extends NodeExtension {
  get name() {
    return 'hardBreak' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
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
