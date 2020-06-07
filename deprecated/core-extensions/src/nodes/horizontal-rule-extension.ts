import {
  CommandNodeTypeParameter,
  ManagerNodeTypeParameter,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  nodeInputRule,
  ProsemirrorCommandFunction,
} from '@remirror/core';

export class HorizontalRuleExtension extends NodeExtension {
  get name() {
    return 'horizontalRule' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttributes(),
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'hr' }],
      toDOM: () => ['hr'],
    };
  }

  commands({ type }: CommandNodeTypeParameter) {
    return {
      horizontalRule: (): ProsemirrorCommandFunction => (state, dispatch) => {
        if (dispatch) {
          dispatch(state.tr.replaceSelectionWith(type.create()));
        }

        return true;
      },
    };
  }

  inputRules({ type }: ManagerNodeTypeParameter) {
    return [nodeInputRule({ regexp: /^(?:---|___\s|\*\*\*\s)$/, type })];
  }
}
