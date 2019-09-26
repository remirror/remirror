import {
  CommandFunction,
  CommandNodeTypeParams,
  ExtensionManagerNodeTypeParams,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  nodeInputRule,
} from '@remirror/core';

export class HorizontalRuleExtension extends NodeExtension {
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

  public inputRules({ type }: ExtensionManagerNodeTypeParams) {
    return [nodeInputRule({ regexp: /^(?:---|___\s|\*\*\*\s)$/, type })];
  }
}
