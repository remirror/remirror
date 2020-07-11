import { AnyCombinedUnion, RemirrorManager } from '@remirror/core';
import { createWysiwygPresetList } from '@remirror/preset-wysiwyg';
import { createReactManager } from '@remirror/react';

import { CreateWysiwygManagerOptions, WysiwygCombinedUnion } from './wysiwyg-types';

/**
 * Create a wysiwyg remirror manager with all the default react presets and
 * required extensions.
 *
 * @remarks
 *
 * This is the recommended way to use the wysiwyg editor.
 */
export function createWysiwygManager<Combined extends AnyCombinedUnion>(
  combined: readonly Combined[],
  options: CreateWysiwygManagerOptions = {},
): RemirrorManager<WysiwygCombinedUnion | Combined> {
  const { wysiwyg, embed, table, ...rest } = options;
  const presets = createWysiwygPresetList({ wysiwyg, embed, table });

  return createReactManager([...combined, ...presets], { ...rest });
}
