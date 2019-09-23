import { Value } from '@remirror/core-types';

export const SPECIAL_KEYS = [
  'Tab',
  'Space',
  'Enter',
  'Escape',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'SelectAll',
] as const;

export type SpecialKey = (typeof SPECIAL_KEYS)[number];

export const SPECIAL_INPUT_KEYS = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'] as const;
export const SPECIAL_MENU_KEYS = [
  'ArrowDown',
  'ArrowUp',
  'Space',
  'Tab',
  'Enter',
  'Escape',
  'Home',
  'End',
  'SelectAll',
] as const;
export const SPECIAL_TOGGLE_BUTTON_KEYS = ['ArrowDown', 'ArrowUp', 'Space'] as const;

export const Type = {
  /**
   * Describes a selection only drop down. There is no input for filtering
   * longer lists.
   */
  Select: 'select',

  /**
   * Describes the combination of a selection drop down with an input for
   * filtering potential options.
   */
  ComboBox: 'combobox',

  /**
   * A menu rendered without a toggleButton, combobox or input element. It is up
   * to you to provide the input value and manage the focus.
   */
  ControlledMenu: 'controlled-menu',
} as const;

export type DropdownType = Value<typeof Type>;

export const MultishiftActionTypes = {
  SelectItems: '$$__SELECT_ITEMS__',
  SelectItem: '$$__SELECT_ITEM__',
  RemoveSelectedItems: '$$_REMOVE__SELECTED_ITEMS__',
  RemoveSelectedItem: '$$__REMOVE_SELECTED_ITEM__',
  ClearSelection: '$$__CLEAR_SELECTION__',
  SetHoverItemIndex: '$$__SET_HOVER_ITEM_INDEX__',
  ToggleMenu: '$$__TOGGLE_MENU__',
  CloseMenu: '$$__CLOSE_MENU__',
  OpenMenu: '$$__OPEN_MENU__',
  SetHighlightedIndexes: '$$__SET_HIGHLIGHTED_INDEXES__',
  SetHighlightedIndex: '$$__SET_HIGHLIGHTED_INDEX__',
  ClearHighlighted: '$$__CLEAR_HIGHLIGHTED__',
  ClearHover: '$$__CLEAR_HOVER__',
  Reset: '$$__RESET__',
  SetState: '$$__SET_STATE__',

  ItemMouseMove: '$$__ITEM_MOUSE_MOVE__',
  ItemMouseLeave: '$$__ITEM_MOUSE_LEAVE__',
  ItemClick: '$$__ITEM_CLICK__',
  ToggleButtonClick: '$$__TOGGLE_BUTTON_CLICK__',
  ToggleButtonBlur: '$$__TOGGLE_BUTTON_BLUR__',
  ToggleButtonSpecialKeyDown: '$$__TOGGLE_BUTTON_SPECIAL_KEY_DOWN__',
  // ToggleButtonCharacterKeyDown: '$$__TOGGLE_BUTTON_CHARACTER_KEY_DOWN__',
  MenuBlur: '$$__MENU_BLUR__',
  MenuSpecialKeyDown: '$$__MENU_SPECIAL_KEY_DOWN__',
  MenuCharacterKeyDown: '$$__MENU_CHARACTER_KEY_DOWN__',
  InputBlur: '$$__INPUT_BLUR__',
  InputSpecialKeyDown: '$$__INPUT_SPECIAL_KEY_DOWN__',
  ClearJumpText: '$$__CLEAR_JUMP_TEXT__',
  InputValueChange: '$$__INPUT_VALUE_CHANGE__',
  ClearInputValue: '$$__CLEAR_INPUT_VALUE__',
  OuterMouseUp: '$$__OUTER_MOUSE_UP__',
  OuterTouchEnd: '$$__OUTER_TOUCH_END__',
} as const;

type MultishiftActionTypes = typeof MultishiftActionTypes;
type MultishiftTypesInterface = { [P in Value<MultishiftActionTypes>]: any };

declare global {
  /**
   * This is an interface of all the actionTypes available. Use declaration merging to
   * extend it with your own custom actionTypes.
   */

  interface GlobalMultishiftActionTypes extends MultishiftTypesInterface {}
}
