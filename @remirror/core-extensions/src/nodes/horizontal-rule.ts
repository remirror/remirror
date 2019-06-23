import {
  CommandFunction,
  CommandNodeTypeParams,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  SchemaNodeTypeParams,
} from '@remirror/core';

export class HorizontalRuleExtension extends NodeExtension {
  get name() {
    return 'horizontalRule' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      group: 'block',
      parseDOM: [{ tag: 'hr' }],
      toDOM: () => ['hr'],
    };
  }

  public commands({ type }: CommandNodeTypeParams) {
    return (): CommandFunction => (state, dispatch) => {
      if (!dispatch) {
        return false;
      }
      dispatch(state.tr.replaceSelectionWith(type.create()));
      return true;
    };
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, type)];
  }
}
