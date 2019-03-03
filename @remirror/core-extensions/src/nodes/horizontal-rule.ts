import {
  CommandFunction,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  SchemaNodeTypeParams,
} from '@remirror/core';

export class HorizontalRule extends NodeExtension {
  get name(): 'horizontalRule' {
    return 'horizontalRule';
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      group: 'block',
      parseDOM: [{ tag: 'hr' }],
      toDOM: () => ['hr'],
    };
  }

  public commands({ type }: SchemaNodeTypeParams) {
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
