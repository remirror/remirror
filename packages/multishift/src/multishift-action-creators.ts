/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { MultishiftActionTypes } from './multishift-constants';
import type {
  CreateMultishiftAction,
  ItemClickPayload,
  MultishiftStateProps,
  SpecialKeyDownPayload,
} from './multishift-types';

export interface ItemsPayload<Item = any> {
  items: Item[];

  /**
   * By default whenever a selection is made the highlights are reset.
   * Set this to true to hold onto the highlights
   */
  keepHighlights?: boolean;
}

/**
 * Select the provided items.
 */
function selectItems<Item = any>(items: Item[], keepHighlights = false) {
  return {
    type: MultishiftActionTypes.SelectItems,
    payload: { items, keepHighlights },
  };
}

/**
 * Select the provided item.
 */
function selectItem<Item = any>(item: Item, keepHighlights = false) {
  return {
    type: MultishiftActionTypes.SelectItem,
    payload: { items: [item], keepHighlights },
  };
}

/**
 * Remove the provided items from the current selection.
 */
function removeSelectedItems<Item = any>(items: Item[], keepHighlights = false) {
  return {
    type: MultishiftActionTypes.RemoveSelectedItems,
    payload: { items, keepHighlights },
  };
}

/**
 * Remove the provided item from the current selection.
 */
function removeSelectedItem<Item = any>(item: Item, keepHighlights = false) {
  return {
    type: MultishiftActionTypes.RemoveSelectedItem,
    payload: { items: [item], keepHighlights },
  };
}

/**
 * Remove the provided item from the current selection.
 */
function clearSelection() {
  return {
    type: MultishiftActionTypes.ClearSelection,
  };
}

/**
 * Set the `hoverIndex` to a certain value.
 */
function setHoverItemIndex(payload: number) {
  return {
    type: MultishiftActionTypes.SetHoverItemIndex,
    payload,
  };
}

/**
 * Toggle the `isOpen` status of the menu.
 */
function toggleMenu() {
  return {
    type: MultishiftActionTypes.ToggleMenu,
  };
}

/**
 * Set isOpen to false (closing the menu).
 */
function closeMenu() {
  return {
    type: MultishiftActionTypes.CloseMenu,
  };
}

/**
 * Set `isOpen` to true (opening the menu).
 */
function openMenu() {
  return {
    type: MultishiftActionTypes.OpenMenu,
  };
}

/**
 * Set the highlighted item indexes.
 */
function setHighlightedIndexes(payload: number[]) {
  return {
    type: MultishiftActionTypes.SetHighlightedIndexes,
    payload,
  };
}

/**
 * Set the highlighted item index.
 */
function setHighlightedIndex(index: number) {
  return {
    type: MultishiftActionTypes.SetHighlightedIndex,
    payload: [index],
  };
}

/**
 * Removes all the highlighted items including the hover.
 */
function clearHighlighted() {
  return {
    type: MultishiftActionTypes.ClearHighlighted,
  };
}

/**
 * Reset the state of the reducer.
 */
function reset() {
  return {
    type: MultishiftActionTypes.Reset,
  };
}

/**
 * Dispatched when the mouse hovers over an item
 */
function itemMouseMove(payload: number) {
  return {
    type: MultishiftActionTypes.ItemMouseMove,
    payload,
  };
}

function itemMouseLeave(payload: number) {
  return {
    type: MultishiftActionTypes.ItemMouseLeave,
    payload,
  };
}

/**
 * Reports when a user has clicked on an item's element.
 */
function itemClick(payload: ItemClickPayload) {
  return {
    type: MultishiftActionTypes.ItemClick,
    payload,
  };
}

/**
 * Called when the menu is blurred.
 */
function menuBlur() {
  return {
    type: MultishiftActionTypes.MenuBlur,
  };
}

function inputBlur() {
  return {
    type: MultishiftActionTypes.InputBlur,
  };
}

function toggleButtonBlur() {
  return {
    type: MultishiftActionTypes.ToggleButtonBlur,
  };
}

/**
 * Clears the jump text value.
 */
function clearJumpText() {
  return {
    type: MultishiftActionTypes.ClearJumpText,
  };
}

function clearInputValue() {
  return {
    type: MultishiftActionTypes.ClearInputValue,
  };
}

/**
 * Dispatches the action for clicking the toggle button
 */
function toggleButtonClick() {
  return {
    type: MultishiftActionTypes.ToggleButtonClick,
  };
}

function outerTouchEnd() {
  return {
    type: MultishiftActionTypes.OuterTouchEnd,
  };
}

function outerMouseUp() {
  return {
    type: MultishiftActionTypes.OuterMouseUp,
  };
}

/**
 * Handle the menu key down event.
 */
function menuSpecialKeyDown(payload: SpecialKeyDownPayload) {
  return {
    type: MultishiftActionTypes.MenuSpecialKeyDown,
    payload,
  };
}

function toggleButtonSpecialKeyDown(payload: SpecialKeyDownPayload) {
  return {
    type: MultishiftActionTypes.ToggleButtonSpecialKeyDown,
    payload,
  };
}

function inputSpecialKeyDown(payload: SpecialKeyDownPayload) {
  return {
    type: MultishiftActionTypes.InputSpecialKeyDown,
    payload,
  };
}

function menuCharacterKeyDown(payload: string) {
  return {
    type: MultishiftActionTypes.MenuCharacterKeyDown,
    payload,
  };
}

function inputValueChange(payload: string) {
  return {
    type: MultishiftActionTypes.InputValueChange,
    payload,
  };
}

function setState<Item = any>(payload: MultishiftStateProps<Item>) {
  return {
    type: MultishiftActionTypes.SetState,
    payload,
  };
}

/* eslint-enable @typescript-eslint/explicit-module-boundary-types */

/**
 * The action creators which can be dispatched via the reducer.
 */
export const Actions = {
  itemMouseMove,
  itemMouseLeave,
  itemClick,
  menuBlur,
  toggleButtonBlur,
  inputBlur,
  toggleButtonClick,
  menuSpecialKeyDown,
  toggleButtonSpecialKeyDown,
  inputSpecialKeyDown,
  menuCharacterKeyDown,
  outerTouchEnd,
  outerMouseUp,
  selectItems,
  selectItem,
  removeSelectedItems,
  removeSelectedItem,
  setState,
  clearSelection,
  setHoverItemIndex,
  inputValueChange,
  clearInputValue,
  toggleMenu,
  closeMenu,
  openMenu,
  setHighlightedIndexes,
  setHighlightedIndex,
  clearHighlighted,
  reset,
  clearJumpText,
};

declare global {
  namespace Multishift {
    /**
     * This is an interface of actions available. Use declaration merging to
     * extend it with your own custom actions.
     */
    interface Actions<Item = any> {
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
      outerTouchEnd: typeof outerTouchEnd;
      outerMouseUp: typeof outerMouseUp;
    }

    interface CoreActions<Item = any> {
      selectItems: CreateMultishiftAction<
        typeof MultishiftActionTypes.SelectItems,
        ItemsPayload<Item>,
        [Item[], boolean?]
      >;
      selectItem: CreateMultishiftAction<
        typeof MultishiftActionTypes.SelectItem,
        ItemsPayload<Item>,
        [Item, boolean?]
      >;
      removeSelectedItems: CreateMultishiftAction<
        typeof MultishiftActionTypes.RemoveSelectedItems,
        ItemsPayload<Item>,
        [Item[], boolean?]
      >;
      removeSelectedItem: CreateMultishiftAction<
        typeof MultishiftActionTypes.RemoveSelectedItem,
        ItemsPayload<Item>,
        [Item, boolean?]
      >;
      setState: CreateMultishiftAction<
        typeof MultishiftActionTypes.SetState,
        MultishiftStateProps<Item>
      >;
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
}
