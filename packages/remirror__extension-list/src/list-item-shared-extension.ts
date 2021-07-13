import { KeyBindings, PlainExtension } from '@remirror/core';

import { sharedLiftListItem, sharedSinkListItem } from './list-commands';

/**
 * Provides some shared keymaps used by both `listItem` and `taskListItem`
 */
export class ListItemSharedExtension extends PlainExtension {
  get name() {
    return 'listItemShared' as const;
  }

  createKeymap(): KeyBindings {
    return {
      Tab: sharedSinkListItem(this.store.extensions),
      'Shift-Tab': sharedLiftListItem(this.store.extensions),
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      listItemShared: ListItemSharedExtension;
    }
  }
}
