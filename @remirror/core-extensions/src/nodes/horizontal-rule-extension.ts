import {
  CommandFunction,
  CommandNodeTypeParams,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  NodeGroup,
  nodeInputRule,
  SchemaNodeTypeParams,
} from '@remirror/core';

export class HorizontalRuleExtension extends NodeExtension<NodeExtensionOptions, 'horizontalRule', {}> {
  get name() {
    return 'horizontalRule' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'hr' }],
      toDOM: () => ['hr'],
    };
  }

  public commands({ type }: CommandNodeTypeParams) {
    return {
      horizontalRule: (): CommandFunction => (state, dispatch) => {
        if (dispatch) {
          dispatch(state.tr.replaceSelectionWith(type.create()));
        }

        return true;
      },
    };
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [nodeInputRule({ regexp: /^(?:---|___\s|\*\*\*\s)$/, type })];
  }
}
