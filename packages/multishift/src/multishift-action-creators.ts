import { MultishiftActionTypes } from './multishift-constants';
import {
  CreateMultishiftAction,
  ItemClickPayload,
  MultishiftStateProps,
  SpecialKeyDownPayload,
} from './multishift-types';

export interface ItemsPayload<GItem = any> {
  items: GItem[];

  /**
   * By default whenever a selection is made the highlights are reset.
   * Set this to true to hold onto the highlights
   */
  keepHighlights?: boolean;
}

/**
 * Select the provided items.
 */
export const selectItems = <GItem = any>(items: GItem[], keepHighlights = false) => ({
  type: MultishiftActionTypes.SelectItems,
  payload: { items, keepHighlights },
});

/**
 * Select the provided item.
 */
export const selectItem = <GItem = any>(item: GItem, keepHighlights = false) => ({
  type: MultishiftActionTypes.SelectItem,
  payload: { items: [item], keepHighlights },
});

/**
 * Remove the provided items from the current selection.
 */
export const removeSelectedItems = <GItem = any>(items: GItem[], keepHighlights = false) => ({
  type: MultishiftActionTypes.RemoveSelectedItems,
  payload: { items, keepHighlights },
});

/**
 * Remove the provided item from the current selection.
 */
export const removeSelectedItem = <GItem = any>(item: GItem, keepHighlights = false) => ({
  type: MultishiftActionTypes.RemoveSelectedItem,
  payload: { items: [item], keepHighlights },
});

/**
 * Remove the provided item from the current selection.
 */
export const clearSelection = () => ({
  type: MultishiftActionTypes.ClearSelection,
});

/**
 * Set the `hoverIndex` to a certain value.
 */
export const setHoverItemIndex = (payload: number) => ({
  type: MultishiftActionTypes.SetHoverItemIndex,
  payload,
});

/**
 * Toggle the `isOpen` status of the menu.
 */
export const toggleMenu = () => ({
  type: MultishiftActionTypes.ToggleMenu,
});

/**
 * Set isOpen to false (closing the menu).
 */
export const closeMenu = () => ({
  type: MultishiftActionTypes.CloseMenu,
});

/**
 * Set `isOpen` to true (opening the menu).
 */
export const openMenu = () => ({
  type: MultishiftActionTypes.OpenMenu,
});

/**
 * Set the highlighted item indexes.
 */
export const setHighlightedIndexes = (payload: number[]) => ({
  type: MultishiftActionTypes.SetHighlightedIndexes,
  payload,
});

/**
 * Set the highlighted item index.
 */
export const setHighlightedIndex = (index: number) => ({
  type: MultishiftActionTypes.SetHighlightedIndex,
  payload: [index],
});

/**
 * Removes all the highlighted items including the hover.
 */
export const clearHighlighted = () => ({
  type: MultishiftActionTypes.ClearHighlighted,
});

/**
 * Reset the state of the reducer.
 */
export const reset = () => ({
  type: MultishiftActionTypes.Reset,
});

/**
 * Dispatched when the mouse hovers over an item
 */
export const itemMouseMove = (payload: number) => ({
  type: MultishiftActionTypes.ItemMouseMove,
  payload,
});

export const itemMouseLeave = (payload: number) => ({
  type: MultishiftActionTypes.ItemMouseLeave,
  payload,
});

/**
 * Reports when a user has clicked on an item's element.
 */
export const itemClick = (payload: ItemClickPayload) => ({
  type: MultishiftActionTypes.ItemClick,
  payload,
});

/**
 * Called when the menu is blurred.
 */
export const menuBlur = () => ({
  type: MultishiftActionTypes.MenuBlur,
});

export const inputBlur = () => ({
  type: MultishiftActionTypes.InputBlur,
});

export const toggleButtonBlur = () => ({
  type: MultishiftActionTypes.ToggleButtonBlur,
});

/**
 * Clears the jump text value.
 */
export const clearJumpText = () => ({
  type: MultishiftActionTypes.ClearJumpText,
});

export const clearInputValue = () => ({
  type: MultishiftActionTypes.ClearInputValue,
});

/**
 * Dispatches the action for clicking the toggle button
 */
export const toggleButtonClick = () => ({
  type: MultishiftActionTypes.ToggleButtonClick,
});

export const outerTouchEnd = () => ({
  type: MultishiftActionTypes.OuterTouchEnd,
});

export const outerMouseUp = () => ({
  type: MultishiftActionTypes.OuterMouseUp,
});

/**
 * Handle the menu key down event.
 */
export const menuSpecialKeyDown = (payload: SpecialKeyDownPayload) => ({
  type: MultishiftActionTypes.MenuSpecialKeyDown,
  payload,
});

export const toggleButtonSpecialKeyDown = (payload: SpecialKeyDownPayload) => ({
  type: MultishiftActionTypes.ToggleButtonSpecialKeyDown,
  payload,
});

export const inputSpecialKeyDown = (payload: SpecialKeyDownPayload) => ({
  type: MultishiftActionTypes.InputSpecialKeyDown,
  payload,
});

export const menuCharacterKeyDown = (payload: string) => ({
  type: MultishiftActionTypes.MenuCharacterKeyDown,
  payload,
});

// export const toggleButtonCharacterKeyDown = (payload: string) => ({
//   type: MultishiftActionTypes.ToggleButtonCharacterKeyDown,
//   payload,
// });

export const inputValueChange = (payload: string) => ({
  type: MultishiftActionTypes.InputValueChange,
  payload,
});

export const setState = <GItem = any>(payload: MultishiftStateProps<GItem>) => ({
  type: MultishiftActionTypes.SetState,
  payload,
});

declare global {
  /**
   * This is an interface of actions available. Use declaration merging to
   * extend it with your own custom actions.
   */
  interface GlobalMultishiftActions<GItem = any> {
    itemMouseMove: typeof itemMouseMove;
    itemMouseLeave: typeof itemMouseLeave;
    itemClick: typeof itemClick;
    menuBlur: typeof menuBlur;
    toggleButtonBlur: typeof toggleButtonBlur;
    inputBlur: typeof inputBlur;
    toggleButtonClick: typeof toggleButtonClick;
    menuSpecialKeyDown: typeof menuSpecialKeyDown;
    toggleButtonSpecialKeyDown: typeof toggleButtonSpecialKeyDown;
    inputSpecialKeyDown: typeof inputSpecialKeyDown;
    menuCharacterKeyDown: typeof menuCharacterKeyDown;
    // toggleButtonCharacterKeyDown: typeof toggleButtonCharacterKeyDown;
    outerTouchEnd: typeof outerTouchEnd;
    outerMouseUp: typeof outerMouseUp;
  }

  interface MultishiftActions<GItem = any> {
    selectItems: CreateMultishiftAction<
      typeof MultishiftActionTypes.SelectItems,
      ItemsPayload<GItem>,
      [GItem[], boolean?]
    >;
    selectItem: CreateMultishiftAction<
      typeof MultishiftActionTypes.SelectItem,
      ItemsPayload<GItem>,
      [GItem, boolean?]
    >;
    removeSelectedItems: CreateMultishiftAction<
      typeof MultishiftActionTypes.RemoveSelectedItems,
      ItemsPayload<GItem>,
      [GItem[], boolean?]
    >;
    removeSelectedItem: CreateMultishiftAction<
      typeof MultishiftActionTypes.RemoveSelectedItem,
      ItemsPayload<GItem>,
      [GItem, boolean?]
    >;
    setState: CreateMultishiftAction<typeof MultishiftActionTypes.SetState, MultishiftStateProps<GItem>>;
    clearSelection: typeof clearSelection;
    setHoverItemIndex: typeof setHoverItemIndex;
    inputValueChange: typeof inputValueChange;
    clearInputValue: typeof clearInputValue;
    toggleMenu: typeof toggleMenu;
    closeMenu: typeof closeMenu;
    openMenu: typeof openMenu;
    setHighlightedIndexes: typeof setHighlightedIndexes;
    setHighlightedIndex: typeof setHighlightedIndex;
    clearHighlighted: typeof clearHighlighted;
    reset: typeof reset;
    clearJumpText: typeof clearJumpText;
  }
}
