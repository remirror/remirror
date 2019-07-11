import { NodeExtension, NodeType } from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { CodeBlockState } from './code-block-state';
import { CodeBlockExtensionOptions } from './code-block-types';

export default function createCodeBlockPlugin(ctx: NodeExtension<CodeBlockExtensionOptions>, type: NodeType) {
  const pluginState = new CodeBlockState(type);
  return new Plugin<CodeBlockState>({
    key: ctx.pluginKey,
    state: {
      init(_, state) {
        return pluginState.init(state);
      },
      apply(tr, _, prevState, newState) {
        return pluginState.apply({ tr, prevState, newState });
      },
    },
    props: {
      decorations() {
        return pluginState.decorationSet;
      },
    },
  });
}
