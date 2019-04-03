import { getPluginState, NodeExtension, NodeType } from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { CodeBlockState } from './state';
import { CodeBlockOptions } from './types';

export default function createCodeBlockPlugin(ctx: NodeExtension<CodeBlockOptions>, type: NodeType) {
  return new Plugin<CodeBlockState>({
    key: ctx.pluginKey,
    state: {
      init(_, state) {
        const pluginState = new CodeBlockState(type);
        return pluginState.init(state);
      },
      apply(tr, pluginState, prevState, newState) {
        return pluginState.apply({ tr, prevState, newState });
      },
    },
    props: {
      decorations(state) {
        const pluginState = getPluginState<CodeBlockState>(ctx.pluginKey, state);
        return pluginState.decorationSet;
      },
    },
  });
}
