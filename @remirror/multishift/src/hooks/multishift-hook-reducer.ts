import { isUndefined } from '@remirror/core-helpers';
import {} from './multishift-hook-actions';
import { MultishiftActionTypes } from './multishift-hook-constants';
import {
  MultishiftProps,
  MultishiftRootActions,
  MultishiftState,
  MultishiftStateProps,
} from './multishift-hook-types';
import {
  getChangesFromItemClick,
  getDefaultState,
  getHighlightedIndexOnOpen,
  warnIfInternalType,
} from './multishift-hook-utils';

export const multishiftReducer = <GItem = any>(
  state: MultishiftState<GItem>,
  action: MultishiftRootActions<GItem>,
  { multiple, closeOnSelection, items, ...props }: MultishiftProps,
): [MultishiftState<GItem>, MultishiftStateProps<GItem>] => {
  let changes: MultishiftStateProps<GItem> = {};
  const defaultState = getDefaultState(props);

  switch (action.type) {
    case MultishiftActionTypes.SelectItems:
      changes = {
        ...state,
        selectedItems: action.payload,
      };
      break;

    case MultishiftActionTypes.SetHoverItemIndex:
      changes = {
        ...state,
        hoveredIndex: action.payload,
      };
      break;

    case MultishiftActionTypes.ItemMouseMove:
      changes = {
        hoveredIndex: action.payload,
      };
      break;

    case MultishiftActionTypes.ItemClick: {
      const { modifiers, index } = action.payload;
      changes = getChangesFromItemClick({
        defaultState,
        state,
        index,
        items,
        modifiers,
        multiple,
      });

      break;
    }

    case MultishiftActionTypes.MenuBlur: {
      const { highlightedIndexes: indexes, selectedItems: selected } = state;
      const extra = indexes.length
        ? { selectedItems: [...selected, ...indexes.map(index => items[index])] }
        : {};
      changes = {
        isOpen: defaultState.isOpen,
        highlightedIndexes: defaultState.highlightedIndexes,
        highlightedGroupEndIndex: defaultState.highlightedGroupEndIndex,
        highlightedGroupStartIndex: defaultState.highlightedGroupStartIndex,
        hoveredIndex: defaultState.hoveredIndex,
        jumpText: defaultState.jumpText,
        ...extra,
      };
      break;
    }

    case MultishiftActionTypes.MenuKeyDownArrowDown:
      changes = {
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? 5 : 1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      };
      break;

    case MultishiftActionTypes.MenuKeyDownArrowUp:
      changes = {
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? -5 : -1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      };
      break;
    case MultishiftActionTypes.MenuKeyDownHome:
      changes = {
        highlightedIndex: 0,
      };
      break;
    case MultishiftActionTypes.MenuKeyDownEnd:
      changes = {
        highlightedIndex: props.items.length - 1,
      };
      break;
    case MultishiftActionTypes.MenuKeyDownEscape:
      changes = {
        isOpen: false,
        highlightedIndex: -1,
      };
      break;
    case MultishiftActionTypes.MenuKeyDownEnter:
      changes = {
        isOpen: getDefaultValue(props, 'isOpen'),
        highlightedIndex: getDefaultValue(props, 'highlightedIndex'),
        selectedItem: props.items[state.highlightedIndex],
      };
      break;
    case MultishiftActionTypes.MenuKeyDownCharacter:
      {
        const lowercasedKey = action.key;
        const keysSoFar = `${state.keysSoFar}${lowercasedKey}`;
        const highlightedIndex = getItemIndexByCharacterKey(
          keysSoFar,
          state.highlightedIndex,
          props.items,
          props.itemToString,
        );
        changes = {
          keysSoFar,
          ...(highlightedIndex >= 0 && {
            highlightedIndex,
          }),
        };
      }
      break;
    case MultishiftActionTypes.ToggleButtonKeyDownCharacter:
      {
        const lowercasedKey = action.key;
        const keysSoFar = `${state.keysSoFar}${lowercasedKey}`;
        const itemIndex = getItemIndexByCharacterKey(
          keysSoFar,
          state.selectedItem ? props.items.indexOf(state.selectedItem) : -1,
          props.items,
          props.itemToString,
        );
        changes = {
          keysSoFar,
          ...(itemIndex >= 0 && {
            selectedItem: props.items[itemIndex],
          }),
        };
      }
      break;
    case MultishiftActionTypes.ToggleButtonKeyDownArrowDown: {
      changes = {
        isOpen: true,
        highlightedIndex: getHighlightedIndexOnOpen(props, state, 1),
      };
      break;
    }
    case MultishiftActionTypes.ToggleButtonKeyDownArrowUp:
      changes = {
        isOpen: true,
        highlightedIndex: getHighlightedIndexOnOpen(props, state, -1),
      };
      break;
    case MultishiftActionTypes.ToggleButtonClick: {
      break;
    }
    case MultishiftActionTypes.ToggleMenu: {
      const indexes = getHighlightedIndexOnOpen(
        {
          defaultHighlightedIndexes: defaultState.highlightedIndexes,
          initialHighlightedIndexes: props.initialHighlightedIndexes,
          items,
        },
        state,
        0,
      );

      changes = {
        isOpen: !state.isOpen,
        highlightedIndexes: state.isOpen ? [] : indexes,
      };

      break;
    }
    case MultishiftActionTypes.OpenMenu: {
      const highlightedIndexes = getHighlightedIndexOnOpen(
        {
          defaultHighlightedIndexes: defaultState.highlightedIndexes,
          initialHighlightedIndexes: props.initialHighlightedIndexes,
          items,
        },
        state,
        0,
      );
      changes = {
        isOpen: true,
        highlightedIndexes,
        highlightedGroupEndIndex: undefined,
        highlightedGroupStartIndex: -1,
      };
      break;
    }
    case MultishiftActionTypes.CloseMenu:
      changes = {
        isOpen: false,
      };
      break;

    case MultishiftActionTypes.SetHighlightedIndexes:
    case MultishiftActionTypes.SetHighlightedIndex:
      changes = {
        highlightedIndexes: action.payload,
      };
      break;

    case MultishiftActionTypes.ClearJumpText:
      changes = {
        jumpText: '',
      };
      break;

    case MultishiftActionTypes.Reset:
      changes = defaultState;
      break;

    default:
      warnIfInternalType((action as any).type, 'All internal action types need to be managed');
  }

  return [{ ...state, ...changes }, changes];
};
