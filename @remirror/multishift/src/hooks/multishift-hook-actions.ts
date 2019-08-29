import { MultishiftActionTypes } from './multishift-hook-constants';
import { CreateMultishiftAction, Modifier } from './multishift-hook-types';

/**
 * Select the provided items.
 */
export const selectItems = <GItem = any>(payload: GItem[]) => ({
  type: MultishiftActionTypes.SelectItems,
  payload,
});

/**
 * Select the provided item.
 */
export const selectItem = <GItem = any>(item: GItem) => ({
  type: MultishiftActionTypes.SelectItem,
  payload: [item],
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
 * Reset the state of the reducer.
 */
export const reset = () => ({
  type: MultishiftActionTypes.Reset,
});

/**
 * Dispatched when the mouse hoevers over an item
 */
export const itemMouseMove = (payload: number) => ({
  type: MultishiftActionTypes.ItemMouseMove,
  payload,
});

export interface ItemClickPayload {
  index: number;
  modifiers: Modifier[];
}

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

export const menuKeyDownArrowDown = (payload: Modifier[]) => ({
  type: MultishiftActionTypes.MenuKeyDownArrowDown,
  payload,
});

export const clearJumpText = () => ({
  type: MultishiftActionTypes.ClearJumpText,
});

declare global {
  /**
   * This is an interface of actions available. Use declaration merging to
   * extend it with your own custom actions.
   */
  interface GlobalMultishiftActions<GItem = any> {
    itemMouseMove: typeof itemMouseMove;
    itemClick: typeof itemClick;
    menuBlur: typeof menuBlur;
    menuKeyDownArrowDown: typeof menuKeyDownArrowDown;
    clearJumpText: typeof clearJumpText;
  }

  interface MultishiftActions<GItem = any> {
    selectItems: CreateMultishiftAction<typeof MultishiftActionTypes.SelectItems, GItem[]>;
    selectItem: CreateMultishiftAction<typeof MultishiftActionTypes.SelectItem, GItem>;
    setHoverItemIndex: typeof setHoverItemIndex;
    toggleMenu: typeof toggleMenu;
    closeMenu: typeof closeMenu;
    openMenu: typeof openMenu;
    setHighlightedIndexes: typeof setHighlightedIndexes;
    setHighlightedIndex: typeof setHighlightedIndex;
    reset: typeof reset;
  }
}
