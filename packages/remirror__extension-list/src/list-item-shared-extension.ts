import { CreateExtensionPlugin, KeyBindings, PlainExtension } from '@remirror/core';
import { chainCommands, deleteSelection } from '@remirror/pm/commands';

import {
  joinListBackward,
  maybeJoinList,
  sharedLiftListItem,
  sharedSinkListItem,
} from './list-commands';

const backspace = chainCommands(
  deleteSelection, //
  joinListBackward, //
);
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
      Backspace: (props) => {
        const result = backspace(props.state, props.dispatch, props.view);
        return result;
      },
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
