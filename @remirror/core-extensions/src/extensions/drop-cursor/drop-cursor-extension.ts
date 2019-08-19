import { Extension, ExtensionManagerParams, getPluginState, Plugin } from '@remirror/core';
import { dropCursorPlugin, DropCursorState } from './drop-cursor-plugin';
import { DropCursorExtensionOptions } from './drop-cursor-types';

/**
 * This is a custom drop cursor that allows for customising what is shown in the
 * document with a rendered view.
 */
export class DropCursorExtension extends Extension<DropCursorExtensionOptions> {
  get name() {
    return 'dropCursor' as const;
  }

  get defaultOptions(): DropCursorExtensionOptions {
    return {
      inlineWidth: '2px',
      inlineSpacing: '10px',
      blockWidth: '100%',
      blockHeight: '10px',
      color: 'primary',
      blockClassName: 'remirror-drop-cursor-block',
      beforeBlockClassName: 'remirror-drop-cursor-before-block',
      afterBlockClassName: 'remirror-drop-cursor-after-block',
      inlineClassName: 'remirror-drop-cursor-inline',
      beforeInlineClassName: 'remirror-drop-cursor-before-inline',
      afterInlineClassName: 'remirror-drop-cursor-after-inline',
    };
  }

  public helpers({ getState }: ExtensionManagerParams) {
    return {
      /**
       * Check if the editor is currently being dragged
       */
      isDragging: () => {
        return !!getPluginState<DropCursorState>(this.pluginKey, getState()).isDragging();
      },
    };
  }

  /**
   * Use the dropCursor plugin with provided options.
   */
  public plugin(params: ExtensionManagerParams): Plugin {
    return dropCursorPlugin(params, this);
  }
}
