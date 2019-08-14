import { Extension } from '@remirror/core';
import { ProsemirrorPlugin } from '@remirror/core-types';
import { NODE_CURSOR_DEFAULTS } from '../../core-extension-constants';
import { CompositionExtensionOptions } from '../../core-extension-types';
import { createCompositionPlugin } from './composition-plugin';

/**
 * This allow composition events to delete inline nodes using gboard on Android devices.
 *
 * @builtin
 */
export class CompositionExtension extends Extension<CompositionExtensionOptions> {
  get name() {
    return 'composition' as const;
  }

  get defaultOptions() {
    return {
      ensureNodeDeletion: NODE_CURSOR_DEFAULTS,
    };
  }

  public plugin(): ProsemirrorPlugin {
    return createCompositionPlugin(this);
  }
}
