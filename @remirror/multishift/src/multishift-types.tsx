import { PartialWithRequiredKeys } from '@remirror/core-types';
import { Actions, DownshiftProps, PropGetters, StateChangeTypes } from 'downshift';
import React, { HTMLProps, MouseEventHandler } from 'react';

export interface MultishiftState<GItem = any> {
  /**
   * The position that shift highlight should start from.
   */
  multiHighlightStartIndex: number | null;

  /**
   * The position that shift highlight should end at.
   */
  multiHighlightEndIndex: number | null;

  /**
   * The currently highlighted items which will be selected
   * when pressing enter (or other custom triggers).
   *
   * When empty the value is `[]`
   */
  multiHighlightIndexes: number[];

  /**
   * The currently highlighted item.
   */
  highlightedIndex: number | null;

  /**
   * The value the input should currently have.
   */
  inputValue: string | null;

  /**
   * Whether the menu should be considered open or closed.
   * Some aspects of the downshift component respond differently
   * based on this value (for example, if isOpen is true when
   * the user hits "Enter" on the input field, then the item at
   * the highlightedIndex item is selected).
   */
  isOpen: boolean | null;

  /**
   * A list of all selected items. In single select mode this is still an array with only one
   * item.
   *
   * When the component is created with `multiple=true` this can hold multiple values.
   *
   * An empty value is represented by `[]`.
   */
  selectedItems: GItem[];

  /**
   * This is a list of all the indexes of highlighted selected items.
   *
   * It can be used to group `highlightedSelectedIndexes`.
   */
  // highlightedSelectedIndexes: number[];
}

export type Callback = () => void;

export interface MultishiftActions<GItem = any>
  extends Omit<Actions<GItem>, 'reset' | 'openMenu' | 'closeMenu' | 'toggleMenu' | 'setState'> {
  /**
   * Select one ore more items.
   *
   * This overwrites the current selection
   *
   * @param items - an array of items to select
   * @param otherStateToSet - set the state values
   * @param callback - called once the state is set
   */
  selectItems: (
    items: GItem[],
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => void;

  /**
   * Remove selected items.
   *
   * @param itemsToRemove - an array of items to removed
   * @param otherStateToSet - set the state values
   * @param callback - called once the state is set
   */
  removeSelectedItems: (
    itemsToRemove: GItem[],
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => void;

  /**
   * Add selected items.
   *
   * @param items - an array of items to added
   * @param otherStateToSet - set the state values
   * @param callback - called once the state is set
   */
  addSelectedItems: (
    itemsToAdd: GItem[],
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => void;

  /**
   * Clear all selected items.
   *
   * @param otherStateToSet - set the state values
   * @param callback - called once the state is set
   */
  clearSelectedItems: (
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => void;

  /**
   * Select the items at the given indexes.
   *
   * @param indexes - indexes to select
   * @param otherStateToSet - set other state values
   * @param callback - called once the state is set
   */
  selectItemsAtIndexes: (
    indexes: number[],
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => void;

  /**
   * Select the items that are currently active.
   *
   * @param otherStateToSet - set other state values
   * @param callback - called once the state is set
   */
  selectHighlightedItems: (
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => void;

  /**
   * Set highlights at the given indexes.
   *
   * @param indexes - indexes to select
   * @param multiHighlightTuple - the start and end value for a multi selection
   * @param otherStateToSet - set other state values
   * @param callback - called once the state is set
   */
  setMultiHighlightIndexes: (
    value: SetMultiHighlightIndexesParam,
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => void;

  /**
   * This is a general setState function. It uses multi downshift's internalSetState
   * function which works with control props and calls your onSelect, onChange, etc.
   *
   * (Note, you can specify a type which you can reference in some other APIs like the stateReducer).
   *
   * @param stateToSet - set other state values including a type for usage
   * in the stateReducer
   * @param callback - a callback called once the state is set
   */
  setState: (
    stateToSet: Partial<MultishiftStateChangeOptions<GItem>> | MultiStateChangeFunction<GItem>,
    callback?: Callback,
  ) => void;
}

export interface SetMultiHighlightIndexesParam {
  /**
   * The current highlighted indexes
   */
  indexes: number[];

  /**
   * The start of the new highlight grouping.
   */
  start?: number | null;

  /**
   * The end of the new highlight grouping.
   */
  end?: number | null;
}

export interface MultiPropGetters<GItem = any> extends PropGetters<GItem> {
  /**
   * Gets the props to attach to a button that removes an item.
   */
  getRemoveButtonProps<GElement extends HTMLElement = any>(
    options: GetRemoveButtonOptions<GElement, GItem>,
  ): GetRemoveButtonReturn<GElement>;
}

export interface MultishiftHelpers {
  /**
   * Check if the item index is highlighted.
   *
   * The highlight includes the current highlight (caused by hovers and the arrow keys>
   * as well as multi selection highlighting when the shift key is pressed.
   */
  itemHighlightedAtIndex(index: number): boolean;
}

export interface MultishiftControllerStateAndHelpers<GItem = any>
  extends MultishiftState<GItem>,
    MultiPropGetters<GItem>,
    MultishiftActions<GItem>,
    MultishiftHelpers {}

export type MultishiftChildrenFunction<GItem = any> = (
  options: MultishiftControllerStateAndHelpers<GItem>,
) => React.ReactNode;

export interface MultishiftProps<GItem = any>
  extends Omit<
    DownshiftProps<GItem>,
    'children' | 'onChange' | 'onSelect' | 'onStateChange' | 'onInputValueChange' | 'stateReducer'
  > {
  /**
   * Set to true to allow multiple items to be selected in the list.
   * When not specified (or set to false) only one option can be selected at a time.
   */
  multiple?: boolean;

  /**
   * Set this to take control of the selected items when rendering the list.
   */
  selectedItems?: GItem[];

  /**
   * Items selected by default
   */
  defaultSelectedItems?: GItem[];

  /**
   * Alias of `defaultSelectedItems` for consistency with Downshift
   */
  initialSelectedItems?: GItem[];

  /**
   * The currently highlighted indexes on the component.
   */
  multiHighlightIndexes?: number[];

  /**
   * The default highlighted indexes to use whenever the state is reset.
   */
  defaultMultiHighlightIndexes?: number[];

  /**
   * The initial highlighted indexes on the component.
   */
  initialHighlightIndexes?: number[];

  /**
   * The start position for a multiple highlight selection.
   *
   * This allows for the highlighted position to be used as an anchor for long selections.
   */
  multiHighlightStartIndex?: number | null;

  /**
   * The default value for a multi highlight start index.
   *
   * This should probably always be kept as undefined.
   *
   * @default undefined
   */
  defaultMultiHighlightStartIndex?: number | null;

  /**
   * The initial value for a multi highlight start index.
   *
   * @default undefined
   */
  initialMultiHighlightStartIndex?: number | null;

  /**
   * The end position for a multiple highlight selection.
   */
  multiHighlightEndIndex?: number | null;

  /**
   * The default value for a multi highlight end index.
   *
   * This should probably always be kept as undefined.
   *
   * @default undefined
   */
  defaultMultiHighlightEndIndex?: number | null;

  /**
   * The initial value for a multi highlight end index.
   *
   * @default undefined
   */
  initialMultiHighlightEndIndex?: number | null;

  /**
   * The child element as a render prop.
   */
  children: MultishiftChildrenFunction<GItem>;

  /**
   * Called when the selected item changes, either by the user selecting an item or the user clearing the selection.
   * Called with the item that was selected or null and the new state of downshift.
   * (see onStateChange for more info on stateAndHelpers).
   *
   * @param item - The item that was just selected. null if the selection was cleared.
   * @param selectedItems - the list of all currently selected items.
   * @param stateAndHelpers - This is the same thing your children function is called with.
   */
  onChange?: (
    changeSet: EventHandlerChangeSet<GItem>,
    stateAndHelpers: MultishiftControllerStateAndHelpers<GItem>,
  ) => void;

  /**
   * Called when the user selects an item, regardless of the previous selected item.
   * Called with the item that was selected and the new state of downshift.
   * (see onStateChange for more info on stateAndHelpers).
   *
   * @param item - The item that was just selected.
   * @param selectedItems - the list of all currently selected items.
   * @param stateAndHelpers - This is the same thing your children function is called with.
   */
  onSelect?: (
    changeSet: EventHandlerChangeSet<GItem>,
    stateAndHelpers: MultishiftControllerStateAndHelpers<GItem>,
  ) => void;

  /**
   * This function is called anytime the internal state changes.
   * This can be useful if you're using downshift as a "controlled" component,
   * where you manage some or all of the state (e.g. isOpen, selectedItem, highlightedIndex, etc)
   * and then pass it as props, rather than letting downshift control all its state itself.
   *
   * The parameters both take the shape of internal state
   * ({highlightedIndex: number, inputValue: string, isOpen: boolean, selectedItem: any})
   * but differ slightly.
   *
   * @param changes - These are the properties that actually have changed since the last state change.
   * This also has a type property which you can learn more about in the stateChangeTypes section.
   * @param stateAndHelpers - This is the exact same thing your children function is called with.
   *
   * Tip: This function will be called any time any state is changed.
   * The best way to determine whether any particular state was changed, you
   * can use changes.hasOwnProperty('propName').
   *
   * NOTE: This is only called when state actually changes. You should not
   * attempt to use this to handle events. If you wish to handle events,
   * put your event handlers directly on the elements (make sure to use the prop
   * getters though!
   *
   * For example: `<input onBlur={handleBlur} />` should be `<input {...getInputProps({onBlur: handleBlur})} />`).
   */
  onStateChange?: (
    options: MultishiftStateChangeOptions<GItem>,
    stateAndHelpers: MultishiftControllerStateAndHelpers<GItem>,
  ) => void;

  /**
   * Called whenever the input value changes. Useful to use instead or in combination of
   * onStateChange when inputValue is a controlled prop to avoid issues with cursor positions.
   *
   * @param inputValue - The current value of the input
   * @param stateAndHelpers: This is the same thing your children function is called with.
   */
  onInputValueChange?: (
    inputValue: string,
    stateAndHelpers: MultishiftControllerStateAndHelpers<GItem>,
  ) => void;

  /**
   * This function will be called each time downshift sets its internal state
   * (or calls your onStateChange handler for control props). It allows you to
   * modify the state change that will take place which can give you fine grained
   * control over how the component interacts with user updates without having to
   * use Control Props. It gives you the current state and the state that will
   * be set, and you return the state that you want to set.
   *
   * @param state - the full current state of the multi downshift component
   * @param changes - these are the properties that are about to change. This also has a type property which you can learn more about in the stateChangeTypes section.
   *
   * ```ts
   * const ui = (
   *   <Downshift stateReducer={stateReducer}>{
   *   // your callback
   *   }</Downshift>
   * )
   *
   * function stateReducer(state, changes) {
   *   // this prevents the menu from being closed when the user
   *   // selects an item with a keyboard or mouse
   *   switch (changes.type) {
   *     case Downshift.stateChangeTypes.keyDownEnter:
   *     case Downshift.stateChangeTypes.clickItem:
   *       return {
   *         ...changes,
   *         isOpen: state.isOpen,
   *         highlightedIndex: state.highlightedIndex,
   *       }
   *     default:
   *       return changes
   *   }
   * }
   * ```
   *
   * NOTE: This is only called when state actually changes. You should not attempt to use this to handle events. If you wish to handle events, put your event handlers directly on the elements (make sure to use the prop getters though! For example: <input onBlur={handleBlur} /> should be <input {...getInputProps({onBlur: handleBlur})} />). Also, your reducer function should be "pure." This means it should do nothing other than return the state changes you want to have happen.
   */
  stateReducer?: (
    state: MultishiftState<GItem>,
    changes: PartialWithRequiredKeys<MultishiftStateChangeOptions<GItem>, 'type'>,
  ) => PartialWithRequiredKeys<MultishiftStateChangeOptions<GItem>, 'type'>;

  /**
   * Whether the input should be closed when a selection is made.
   * This default to false when `multiselect=true`.
   */
  closeOnSelection?: boolean;

  /**
   * Takes a list of the selected items and transforms them into a string.
   *
   * This defaults to a comma seperated list of the values.
   */
  selectedItemsToString?: (selectedItems: GItem[], itemToString?: (item: GItem) => string) => string;
}

export interface EventHandlerChangeSet<GItem = any> {
  /**
   * The items added in the most recent change
   */
  // added: GItem[];

  /**
   * The items removed in the most recent changeset.
   */
  // removed: GItem[];

  /**
   * The selected items after the most recent change.
   */
  current: GItem[];

  /**
   * The selected items before the most recent update.
   */
  previous: GItem[];
}

export interface GetRemoveButtonOptions<GElement extends HTMLElement = any, GItem = any>
  extends HTMLProps<GElement> {
  /**
   * You must provide the selectedItem property.
   */
  item: GItem;

  /**
   * Prevents this from being selected.
   */
  disabled?: boolean;
}

export interface GetRemoveButtonReturn<GElement extends HTMLElement = any> extends HTMLProps<GElement> {
  /**
   * The click handler which is attached to your component.
   *
   * This is automatically merged with any provided onClick handlers that you provide.
   */
  onClick: MouseEventHandler<GElement>;

  /**
   * The aria role for the button. This can be overriden in the options.
   *
   * @default 'button'
   */
  role: string;
}

export type AllStateChangeTypes =
  | StateChangeTypes
  | MultishiftStateChangeTypes
  | keyof CustomMultishiftStateChangeTypes;

export interface MultishiftStateChangeOptions<GItem = any> extends Partial<MultishiftState<GItem>> {
  type: AllStateChangeTypes;
}

export type MultiStateChangeFunction<GItem = any> = (
  state: MultishiftState<GItem>,
) => Partial<MultishiftStateChangeOptions<GItem>>;

export enum MultishiftStateChangeTypes {
  CtrlClickItem = '__CTRL_CLICK_ITEM__',
  CmdClickItem = '__CMD_CLICK_ITEM__',
  ShiftClickItem = '__SHIFT_CLICK_ITEM__',
}

declare global {
  /**
   * Set the keys of this global type to add extra keys to the StateChangeTypes
   */
  interface CustomMultishiftStateChangeTypes {
    [MultishiftStateChangeTypes.CtrlClickItem]: boolean;
    [MultishiftStateChangeTypes.ShiftClickItem]: boolean;
  }
}

declare module 'react' {
  interface BaseSyntheticEvent<E = object, C = any, T = any> {
    preventDownshiftDefault?: boolean;
  }
}

declare global {
  interface Event {
    preventDownshiftDefault?: boolean;
  }
}
