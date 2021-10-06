import { CreateExtensionPlugin, KeyBindings, PlainExtension } from '@remirror/core';

import { maybeJoinList, sharedLiftListItem, sharedSinkListItem } from './list-commands';

/**
 * Provides some shared thing used by both `listItem` and `taskListItem`
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

  createPlugin(): CreateExtensionPlugin {
    return {
      appendTransaction: (_transactions, _oldState, newState) => {
        const tr = newState.tr;
        const updated = maybeJoinList(tr);
        return updated ? tr : null;
      },
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
