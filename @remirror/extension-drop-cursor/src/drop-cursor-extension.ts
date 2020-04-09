import { Extension, getPluginState, ManagerParameter, Plugin } from '@remirror/core';

import { defaultDropCursorExtensionOptions } from './drop-cursor-constants';
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
    return defaultDropCursorExtensionOptions;
  }

  public helpers({ getState }: ManagerParameter) {
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
  public plugin(parameters: ManagerParameter): Plugin {
    return dropCursorPlugin(parameters, this);
  }
}
