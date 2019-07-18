import { Extension, isTextSelection, setPluginMeta } from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { MulticursorMeta } from './constants';
import { isMulticursorSelection } from './multicursor-selection';
import { MulticursorExtensionCommands, MulticursorExtensionOptions } from './multicursor-types';

/**
 * This creates a plugin responsible for
 * - Adding cursor decorations
 * - Responding to click events and checking for whether a multicursor should be added / removed
 */
export const createMulticursorPlugin = (
  ctx: Extension<MulticursorExtensionOptions, MulticursorExtensionCommands>,
) => {
  return new Plugin({
    key: ctx.pluginKey,
    props: {
      handleClick(view, _pos, event) {
        if (event[ctx.options.clickActivationKey] && isTextSelection(view.state.selection)) {
          setPluginMeta(ctx.pluginKey, view.state.tr, MulticursorMeta.Add);
        } else if (isMulticursorSelection(view.state.selection)) {
          setPluginMeta(ctx.pluginKey, view.state.tr, MulticursorMeta.Remove);
        }
        return false;
      },
      handleDOMEvents: {},
    },
  });
};
