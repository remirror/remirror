import { Value } from '@remirror/core-types';

export const MultishiftActionTypes = {
  /**
   * Select the items provided. This is one of the base action.
   */
  SelectItems: '$$__SELECT_ITEMS__',
  SelectItem: '$$__SELECT_ITEM__',
  /**
   * An action representing when an item is hovered over.
   */
  SetHoverItemIndex: '$$__SET_HOVER_ITEM_INDEX__',
  ToggleMenu: '$$__TOGGLE_MENU__',
  CloseMenu: '$$__CLOSE_MENU__',
  OpenMenu: '$$__OPEN_MENU__',
  SetHighlightedIndexes: '$$__SET_HIGHLIGHTED_INDEXES__',
  SetHighlightedIndex: '$$__SET_HIGHLIGHTED_INDEX__',
  Reset: '$$__RESET__',

  ItemMouseMove: '$$__ITEM_MOUSE_MOVE__',
  ItemClick: '$$__ITEM_CLICK__',
  ToggleButtonClick: '$$__TOGGLE_BUTTON_CLICK__',
  MenuBlur: '$$__MENU_BLUR__',
  MenuKeyDown: '$$__MENU_KEY_DOWN__',
  ToggleButtonKeyDown: '$$__TOGGLE_BUTTON_KEY_DOWN__',
  ClearJumpText: '$$__CLEAR_JUMP_TEXT__',
} as const;

type MultishiftActionTypes = typeof MultishiftActionTypes;
type MultishiftTypesInterface = { [P in Value<MultishiftActionTypes>]: any };

declare global {
  /**
   * This is an interface of all the actionTypes available. Use declaration merging to
   * extend it with your own custom actionTypes.
   */
  // tslint:disable-next-line: no-empty-interface
  interface GlobalMultishiftActionTypes extends MultishiftTypesInterface {}
}
