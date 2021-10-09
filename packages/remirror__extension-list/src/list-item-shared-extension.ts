import { CreateExtensionPlugin, environment, KeyBindings, PlainExtension } from '@remirror/core';

import {
  listBackspace,
  maybeJoinList,
  sharedLiftListItem,
  sharedSinkListItem,
} from './list-commands';

/**
 * Provides some shared thing used by both `listItem` and `taskListItem`
 */
export class ListItemSharedExtension extends PlainExtension {
  get name() {
    return 'listItemShared' as const;
  }

  createKeymap(): KeyBindings {
    const pcKeymap = {
      Tab: sharedSinkListItem(this.store.extensions),
      'Shift-Tab': sharedLiftListItem(this.store.extensions),
      Backspace: listBackspace,
      'Mod-Backspace': listBackspace,
    };

    if (environment.isMac) {
      const macKeymap = {
        'Ctrl-h': pcKeymap['Backspace'],
        'Alt-Backspace': pcKeymap['Mod-Backspace'],
      };
      return { ...pcKeymap, ...macKeymap };
    }

    return pcKeymap;
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
