import { Extension, ProsemirrorPlugin } from '@remirror/core';
import { CompositionExtensionOptions } from '../types';
import { createCompositionPlugin, patchDeleteContentBackward } from './plugin';

/**
 * @deprecated - Composition works much better in `prosemirror-view@1.9.x`
 */
export class CompositionExtension extends Extension<CompositionExtensionOptions> {
  get name() {
    return 'composition' as const;
  }

  get defaultOptions() {
    return {
      ensureNodeDeletion: ['emoji', (name: string) => name.includes('mentions')],
    };
  }

  public plugin(): ProsemirrorPlugin {
    return createCompositionPlugin(this);
  }
}

export { patchDeleteContentBackward };
