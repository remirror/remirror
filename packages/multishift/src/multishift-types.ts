
/// <reference path="../globals.d.ts" />

import {
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  Ref,
  SetStateAction,
} from 'react';
import { DropdownType, SpecialKey } from './multishift-constants';

export interface MultishiftState<GItem = any> {
  /**
   * Contains all the selected items.
   *
   * When `multiple` selection is enabled this can contain more than one item.
   *
   * @defaultValue []
   */
  selectedItems: GItem[];

  /**
   * This tracks the text typed when no input is available for filtering.
   *
   * It allows the implementation of quick jump to item functionality.
   *
   * @defaultValue ''
   */
  jumpText: string;

  /**
   * Determines whether or not the menu items should be displayed.
   *
   * @defaultValue false
   */
  isOpen: boolean;

  /**
   * This tracks the input value when filtering the items to insert.
   *
   * @defaultValue ''
   */
  inputValue: string;

  /**
   * Each index represents a position that is highlighted. This is to allow the
   * selection of multiple items in one sweep.
   *
   * Examples are
   * - Ctrl / Cmd click - toggle one position / or start a new highlight group
   * - Shift click - add start or complete a new highlighted group
   * - Click and drag - drag over multiple items to select each one
   * - ArrowKey shift - Select multiple highlighted items
   *
   * @defaultValue []
   */
  highlightedIndexes: number[];

  /**
   * Marks the position as the starting point for a new highlighted group.
   *
   * @defaultValue -1
   */
  highlightedGroupStartIndex: number;

  /**
   * Marks the position as the end point for a new highlighted group.
   *
   * @defaultValue undefined
   */
  highlightedGroupEndIndex: number | undefined;

  /**
   * Marks the index of the currently hovered item.
   *
   * @defaultValue -1
   */
  hoveredIndex: number;
}

/**
 * Modifiers that are used to determine the behaviour of the click or key down
 * action.
 */
export type Modifier = 'shiftKey' | 'altKey' | 'metaKey' | 'ctrlKey';

/**
 * Type representing Generic Action
 */
export interface Action<GType extends string = string> {
  type: GType;
}
/**
 * Type representing an Action with Payload
 */
export interface ActionWithPayload<GType extends string = string, GPayload = any> {
  type: GType;
  payload: GPayload;
}

/**
 * An *action creator* is, quite simply, a function that creates an action. Do
 * not confuse the two terms—again, an action is a payload of information, and
 * an action creator is a factory that creates an action.
 *
 * Calling an action creator only produces an action, but does not dispatch it.
 * You need to call the store's `dispatch` function to actually cause the
 * mutation. Sometimes we say *bound action creators* to mean functions that
 * call an action creator and immediately dispatch its result to a specific
 * store instance.
 *
 * If an action creator needs to read the current state, perform an API call, or
 * cause a side effect, like a routing transition, it should return an async
 * action instead of an action.
 *
 * @template A Returned action type.
 */
export type ActionCreator<A> = (...args: any[]) => A;

/**
 * Object whose values are action creator functions.
 */
export interface ActionCreatorsMapObject<A = any> {
  [key: string]: ActionCreator<A>;
}

export type ActionCreatorMapToDispatch<GCreatorMap extends ActionCreatorsMapObject> = {
  [P in keyof GCreatorMap]: (...args: Parameters<GCreatorMap[P]>) => void;
};

/**
 * Infers Action union-type from action-creator map object
 */
type ActionType<GActionCreatorOrMap extends any> = GActionCreatorOrMap extends ActionCreator<any>
  ? ReturnType<GActionCreatorOrMap>
  : GActionCreatorOrMap extends Record<any, any>
  ? {
      [K in keyof GActionCreatorOrMap]: ActionType<GActionCreatorOrMap[K]>;
    }[keyof GActionCreatorOrMap]
  : never;

export type AllMultishiftActions<GItem = any> = GlobalMultishiftActions<GItem> & MultishiftActions<GItem>;

export type MultishiftRootActions<GItem = any> = ActionType<AllMultishiftActions<GItem>>;

export interface MultishiftInitialValueProps<GItem = any> {
  initialSelectedItems?: GItem[];
  initialJumpText?: string;
  initialIsOpen?: boolean;
  initialInputValue?: string;
  initialHoveredIndex?: number;
  initialHighlightedIndexes?: number[];
  initialHighlightedGroupStartIndex?: number;
  initialHighlightedGroupEndIndex?: number;
}
export interface MultishiftDefaultValueProps<GItem = any> {
  defaultSelectedItems?: GItem[];
  defaultJumpText?: string;
  defaultIsOpen?: boolean;
  defaultInputValue?: string;
  defaultHoveredIndex?: number;
  defaultHighlightedIndexes?: number[];
  defaultHighlightedGroupStartIndex?: number;
  defaultHighlightedGroupEndIndex?: number;
}
export interface MultishiftChangeHandlerProps<GItem = any> {
  /**
   * This function is called anytime the internal state changes. This can be
   * useful if you're using multishift as a "controlled" component, where you
   * manage some or all of the state (e.g. isOpen, selectedItems,
   * highlightedIndexes, etc) and then pass it as props, rather than letting
   * multishift control all its state itself.
   *
   * The parameters both take the shape of internal state ({highlightedIndex:
   * number, inputValue: string, isOpen: boolean, selectedItem: any}) but differ
   * slightly.
   *
   * @param changes - These are the properties that actually have changed since
   * the last state change. This also has a type property which you can learn
   * more about in the stateChangeTypes section.
   * @param state - This is the full state object.
   *
   * Tip: This function will be called any time any state is changed. The best
   * way to determine whether any particular state was changed, you can use
   * changes.hasOwnProperty('propName').
   *
   * NOTE: This is only called when state actually changes. You should not
   * attempt to use this to handle events. If you wish to handle events, put
   * your event handlers directly on the elements (make sure to use the prop
   * getters though!
   *
   * For example: `<input onBlur={handleBlur} />` should be `<input
   * {...getInputProps({onBlur: handleBlur})} />`).
   */
  onStateChange?: (changes: MultishiftStateProps<GItem>, state: MultishiftState<GItem>) => void;

  /**
   * Called when the selected items change, either by the user selecting an item
   * or the user clearing the selection. Called with the items that were
   * selected or an empty array when removed
   *
   * @param selectedItems - The currently selected items if an empty array then the
   * selection was cleared.
   * @param state - the list of all currently selected items.
   */
  onSelectedItemsChange?(selectedItems: GItem[], state: MultishiftState<GItem>): void;

  onOuterClick?: (state: MultishiftState<GItem>) => void;
  onJumpTextChange?(jumpText: string, state: MultishiftState<GItem>): void;
  onIsOpenChange?(isOpen: boolean, state: MultishiftState<GItem>): void;
  onInputValueChange?(inputValue: string, state: MultishiftState<GItem>): void;
  onHoveredIndexChange?(hoveredIndex: number, state: MultishiftState<GItem>): void;
  onHighlightedIndexesChange?(highlightedIndexes: number[], state: MultishiftState<GItem>): void;
  onHighlightedGroupStartIndexChange?(
    highlightedGroupStartIndex: number,
    state: MultishiftState<GItem>,
  ): void;
  onHighlightedGroupEndIndexChange?(
    highlightedGroupEndIndex: number | undefined,
    state: MultishiftState<GItem>,
  ): void;
}
export interface MultishiftA11yIdProps {
  id?: string;
  inputId?: string;
  labelId?: string;
  menuId?: string;
  toggleButtonId?: string;

  /**
   * Get the item id which will be used to identifying the item in the dom for
   * accessibility purposes.
   */
  getItemA11yId?: (index?: number) => string;
}

export type Direction = 'horizontal' | 'vertical';

export interface MultishiftBehaviorProps {
  /**
   * The dropdown type affects how the dropdown should be set up.
   *
   * ### `select`
   *
   * Use this to implement a selection drop down. With a toggle button and
   * items. There is no autocomplete functionality and items typically don't
   * change.
   *
   * ```tsx
   * const items ['a', 'b', 'c'];
   * const { getToggleButtonProps, getMenuProps, getItemProps, getLabelProps } = useMultishift({ type: 'select', items });
   *
   * return (
   *   <div>
   *     <label {...getLabelProps()}>Choose an element:</label>
   *     <button {...getToggleButtonProps()}>{selectedItems[0] || 'Names'}</button>
   *     <button onClick={() => clearSelection()}>Clear</button>
   *     <ul {...getMenuProps()}>
   *     {isOpen &&
   *       items.map((option, index) => (
   *         <li
   *           style={{
   *             userSelect:'none',
   *             fontWeight: selectedItems.includes(option) ? 'bold' : 'normal',
   *             ...(itemHighlightedAtIndex(index) || hoveredIndex === index
   *               ? { backgroundColor: '#bde4ff' }
   *               : {}),
   *           }}
   *           key={`${option}${index}`}
   *           {...getItemProps({ item: option, index })}
   *         >
   *           {option}
   *         </li>
   *       ))}
   *     </ul>
   *   </div>
   * )
   * ```
   *
   * ### `combobox`
   *
   * The combination of a select dropdown paired with an input for filtering the
   * results.
   *
   * The combobox usually will include both a toggle button and input box.
   *
   * ```tsx
   * const items ['a', 'b', 'c'];
   * const {
   *   getToggleButtonProps,
   *   getMenuProps,
   *   getItemProps,
   *   getLabelProps,
   *   getComboBoxProps,
   *   getInputProps
   * } = useMultishift({ type: 'autocomplete', items });
   *
   * return (
   *   <div {...getComboBoxProps()}>
   *     <label {...getLabelProps()}>Choose an element:</label>
   *     <button {...getToggleButtonProps()}>{selectedItems[0] || 'Names'}</button>
   *     <input {...getInputProps()}
   *     <button onClick={() => clearSelection()}>Clear</button>
   *     <ul {...getMenuProps()}>
   *     {isOpen &&
   *       items.map((item, index) => (
   *         <li
   *           key={`${item}${index}`}
   *           {...getItemProps({ item: item, index })}
   *         >
   *           {item}
   *         </li>
   *       ))}
   *     </ul>
   *   </div>
   * )
   * ```
   */
  type: DropdownType;

  /**
   * Set to true to allow multiple items to be selected in the list. When not
   * specified (or set to false) only one item can be selected (and only one at
   * a time.
   */
  multiple?: boolean;

  /**
   * The direction which drop down should be rendered.
   *
   * - When `vertical` the `ArrowUp` and `ArrowDown` keyDown handlers are used.
   * - When `horizontal` the `ArrowLeft` and `ArrowRight` handlers are used.
   *
   * @defaultValue 'vertical'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Whether the input should be closed when a selection is made. This default
   * to false when `multiple=true`.
   */
  closeOnSelection?: boolean;

  /**
   * When true will automatically selected the higlightedIndexes on blur.
   *
   * @defaultValue true
   */
  autoSelectOnBlur?: boolean;

  /**
   * By default typing into non text input combo-box will jump to the closest
   * index.
   *
   * Setting this to false will ignore this behaviour
   */
  ignoreJumpText?: boolean;

  /**
   * Controls the circular keyboard navigation between items. If set to true,
   * when first item is highlighted, the `ArrowUp` will move highlight to the
   * last item, and vice versa using `ArrowDown`.
   */
  circularNavigation?: boolean;

  /**
   * The timeout for the a11y status update in milliseconds.
   *
   * @defaultValue 500
   */
  a11yStatusTimeout?: number;

  /**
   * Set a custom message to render for the duration provided by the timeout.
   *
   * @defaultValue ''
   */
  customA11yStatusMessage?: string;

  /**
   * When true will include the hovered index in the next selection (whether on
   * blur) or active selection.
   *
   * @defaultValue false
   */
  includeHoveredIndexInSelection?: boolean;
}

export interface MultishiftBaseProps<GItem = any> {
  /**
   * The list ot items which are visible in menu.
   *
   * This can be changed via filtering.
   */
  items: GItem[];

  /**
   * A unique id for the item which is used to compare between two items.
   *
   * This defaults to just returning the item directly which means items are
   * identical when `item === item`.
   *
   * The primary use case is when items are objects and the equality check above
   * is always false even for objects with the same values. In that case you can
   * define the `getItemId` prop.
   *
   * ```ts
   * const items = [{value: 'A', id: 'a'}, {value: 'B', id: 'b'}];
   * const getItemId = (item: typeof items[0]) => item.id;
   * ```
   *
   * This is very useful when an item is selected. By default multishift will
   * run a uniqueness check and use the function provided above to prevent
   * duplication.
   */
  getItemId?: GetItemId<GItem>;
  /**
   * This function will be called each time multishift sets its internal state
   * (or calls the onStateChange handler for controlled props). It allows you to
   * modify the state change that will take place which can give you fine
   * grained control over how the component interacts with user updates without
   * having to use controlled Props. It gives you the current state and the
   * state that will be set, and you return the state that you want to set.
   *
   * @param changeSet - An object with the `prevState` before any changes, the
   * `changes`. created by the built in reducer and the current `state` it
   * produced.
   * @param action - The action that was dispatched.
   * @param props - The latest props passed into the hook.
   *
   */
  stateReducer?: (
    changesAndState: MultishiftStateChangeset<GItem>,
    action: MultishiftRootActions<GItem>,
    props: MultishiftProps<GItem>,
  ) => MultishiftState<GItem>;

  /**
   * Takes a list of items and transforms them into a string.
   *
   * This defaults to a comma separated list of the values.
   */
  itemsToString?: ItemsToString<GItem>;
  itemToString?: ItemToString<GItem>;

  /**
   * This function is passed as props to a status component nested within and
   * allows you to create your own assertive ARIA statuses.
   *
   * A default getA11yStatusMessage function is provided that will check
   * `items.current.length` and return "No results." or if there are results but
   * no item is highlighted, "resultCount results are available, use up and down
   * arrow keys to navigate." If items are highlighted it will run
   * `itemToString(highlightedItem)` and display the value of the
   * `highlightedItem`.
   */
  getA11yStatusMessage?: GetA11yStatusMessage;
}

export type MultishiftStateProps<GItem = any> = Partial<MultishiftState<GItem>>;

export interface MultishiftProps<GItem = any>
  extends MultishiftA11yIdProps,
    MultishiftBehaviorProps,
    MultishiftBaseProps<GItem>,
    MultishiftStateProps<GItem>,
    MultishiftDefaultValueProps<GItem>,
    MultishiftInitialValueProps<GItem>,
    MultishiftChangeHandlerProps<GItem> {}

export type ItemsToString<GItem = any> = (items: GItem[], itemToString?: (item: GItem) => string) => string;
export type GetItemId<GItem = any> = (items: GItem) => any;
export type ItemToString<GItem = any> = (item: GItem) => string;
export type GetA11yStatusMessage<GItem = any> = (options: A11yStatusMessageParams<GItem>) => string;

export interface A11yStatusMessageParams<GItem = any> {
  state: MultishiftState<GItem>;
  items: GItem[];
  itemsToString(items: GItem[], itemToString?: (item: GItem) => string): string;
}

export interface MultishiftItemsChangeset<GItem = any> {
  previous: GItem[];
  current: GItem[];
}

export interface MultishiftStateChangeset<GItem = any> {
  /**
   * The changes accumulated so far.
   */
  changes: MultishiftStateProps<GItem>;

  /**
   * The current state object
   */
  state: MultishiftState<GItem>;

  /**
   * The previous state object.
   */
  prevState: MultishiftState<GItem>;
}

export type CreateMultishiftAction<GType extends string, GPayload = any, GArgs extends any[] = [GPayload]> = (
  ...args: GArgs
) => ActionWithPayload<GType, GPayload>;

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

export interface GetRemoveButtonReturn<GElement extends HTMLElement = any>
  extends DetailedHTMLProps<HTMLAttributes<GElement>, GElement> {
  /**
   * The aria role for the button. This can be overriden in the options.
   *
   * @defaultValue 'button'
   */
  role: string;
}

export interface GetComboBoxPropsOptions<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>
  extends RefParams<GRefKey>,
    HTMLProps<GElement> {}

export type GetComboBoxPropsReturn<
  GElement extends HTMLElement = any,
  GRefKey extends string = 'ref'
> = DetailedHTMLProps<HTMLAttributes<GElement>, GElement> &
  { [P in GRefKey]: Ref<any> } & {
    /**
     * @defaultValue 'combobox'
     */
    role: string;
    'aria-expanded': boolean;
    'aria-haspopup': boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    'aria-owns': string | undefined;
    'aria-labelledby': string;
  };

export interface GetPropsWithRefOptions<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>
  extends RefParams<GRefKey>,
    HTMLProps<GElement> {
  /**
   * Determine whether or not the item can be highlighted and selected.
   */
  disabled?: boolean;
}

export type GetPropsWithRefReturn<GElement extends HTMLElement = any, GRefKey extends string = 'ref'> = {
  [P in Exclude<GRefKey, 'key'>]: Ref<any>;
} &
  DetailedHTMLProps<HTMLAttributes<GElement>, GElement>;

export type GetLabelPropsWithRefReturn<GElement extends HTMLElement = any, GRefKey extends string = 'ref'> = {
  [P in Exclude<GRefKey, 'key'>]: Ref<any>;
} &
  DetailedHTMLProps<HTMLAttributes<GElement>, GElement> & {
    htmlFor?: string;
  };

export interface GetItemPropsOptions<
  GElement extends HTMLElement = any,
  GRefKey extends string = 'ref',
  GItem = any
> extends GetPropsWithRefOptions<GElement, GRefKey> {
  /**
   * This is the item data that will be selected when the user selects a
   * particular item.
   */
  item: GItem;

  /**
   * This is how downshift keeps track of your item when updating the
   * highlightedIndex as the user keys around. By default, downshift will assume
   * the index is the order in which you're calling getItemProps. This is often
   * good enough, but if you find odd behavior, try setting this explicitly.
   * It's probably best to be explicit about index when using a windowing
   * library like react-virtualized.
   */
  index: number;
}

/**
 * These functions are used to apply props to the elements that you render. This
 * gives you maximum flexibility to render what, when, and wherever you like.
 * You call these on the element in question For example: `<input
 * {...getInputProps()} />`.
 *
 * It's advisable to pass all your props to that function rather than applying
 * them on the element yourself to avoid your props being overridden (or
 * overriding the props returned). For example: `getInputProps({onKeyUp(event)
 * {console.log(event)}})`.
 */
export interface MultishiftPropGetters<GItem = any> {
  /**
   * Return the props to be applied to the root element that is rendered. This
   * should always be used for `autocomplete` dropdowns but will throw an error
   * if used within a `select` dropdown.
   */
  getComboBoxProps<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    options?: GetComboBoxPropsOptions<GElement, GRefKey>,
  ): GetComboBoxPropsReturn<GElement, GRefKey>;

  /**
   * Returns the props you should apply to any menu toggle button element you
   * render.
   */
  getToggleButtonProps<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    options?: GetPropsWithRefOptions<GElement, GRefKey>,
  ): GetPropsWithRefReturn<GElement, GRefKey>;

  /**
   * This method should be applied to the element which contains your list of
   * items. Typically, this will be a <div> or a <ul> that surrounds a map
   * expression. This handles the proper ARIA roles and attributes.
   *
   * refKey: if you're rendering a composite component, that component will need
   * to accept a prop which it forwards to the root DOM element. Commonly, folks
   * call this innerRef. So you'd call: getMenuProps({refKey: 'innerRef'}) and
   * your composite component would forward like: <ul ref={props.innerRef} />.
   * However, if you are just rendering a primitive component like <div>, there
   * is no need to specify this property. Please keep in mind that menus, for
   * accessiblity purposes, should always be rendered, regardless of whether you
   * hide it or not. Otherwise, getMenuProps may throw error if you unmount and
   * remount the menu.
   *
   * aria-label: By default the menu will add an aria-labelledby that refers to
   * the <label> rendered with getLabelProps. However, if you provide aria-label
   * to give a more specific label that describes the options available, then
   * aria-labelledby will not be provided and screen readers can use your
   * aria-label instead. In some cases, you might want to completely bypass the
   * refKey check. Then you can provide the object {suppressRefError : true} as
   * the second argument to getMenuProps. Please use it with extreme care and
   * only if you are absolutely sure that the ref is correctly forwarded
   * otherwise Downshift will unexpectedly fail.
   *
   * ```tsx
   * const {getMenuProps} = useMultishift({items})
   * const ui = (
   *   <ul {...getMenuProps()}>
   *     {!isOpen
   *       ? null
   *       : items.map((item, index) => (
   *           <li {...getItemProps({item, index, key: item.id})}>{item.name}</li>
   *         ))}
   *   </ul>
   * )
   * ```
   *
   * > Note that for accessibility reasons it's best if you always render this
   * > element whether or not downshift is in an isOpen state.
   */
  getMenuProps<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    options?: GetPropsWithRefOptions<GElement, GRefKey>,
  ): GetPropsWithRefReturn<GElement, GRefKey>;

  /**
   * The props returned from calling this function should be applied to any menu
   * items you render.
   *
   * This is an impure function, so it should only be called when you will
   * actually be applying the props to an item.
   */
  getItemProps<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    options: GetItemPropsOptions<GElement, GRefKey, GItem>,
  ): GetPropsWithRefReturn<GElement, GRefKey>;

  /**
   * This method should be applied to the input you render. It is recommended
   * that you pass all props as an object to this method which will compose
   * together any of the event handlers you need to apply to the input while
   * preserving the ones that downshift needs to apply to make the input behave.
   *
   * There are no required properties for this method.
   *
   * Optional properties:
   *
   * disabled: If this is set to true, then no event handlers will be returned
   * from getInputProps and a disabled prop will be returned (effectively
   * disabling the input).
   *
   */
  getInputProps<GElement extends HTMLInputElement = any, GRefKey extends string = 'ref'>(
    options?: GetPropsWithRefOptions<GElement, GRefKey>,
  ): GetPropsWithRefReturn<GElement, GRefKey>;

  /**
   * Gets the props to attach to a button that removes a selected item.
   */
  getRemoveButtonProps<GElement extends HTMLElement = any>(
    options: GetRemoveButtonOptions<GElement, GItem>,
  ): GetRemoveButtonReturn<GElement>;

  /**
   * This method should be applied to the label you render. It will generate an
   * id that will be used to label the toggle button and the menu.
   *
   * There are no required properties for this method.
   *
   * > Note: For accessibility purposes, calling this method is highly
   * recommended.
   */
  getLabelProps<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    options?: IgnoredElementOptions<GElement, GRefKey>,
  ): GetLabelPropsWithRefReturn<GElement, GRefKey>;

  /**
   * Adds a ref to an element which will prevent blurring from happening when the
   * element is in focus.
   *
   * - Allows for autofocusing the input / toggle button or items when [a specific one] when focused.
   */
  getIgnoredElementProps<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    options?: IgnoredElementOptions<GElement, GRefKey>,
  ): GetPropsWithRefReturn<GElement, GRefKey>;
}

export interface IgnoredElementOptions<GElement extends HTMLElement = any, GRefKey extends string = 'ref'>
  extends GetPropsWithRefOptions<GElement, GRefKey> {
  /**
   * When this element is focused it can automatically divert the focus to the provided element type.
   *
   * - The input
   * - The toggle button
   * - A specific item
   * - The menu
   */
  // autoFocusElement?: 'input' | 'toggleButton' | 'item' | 'menu';
  /**
   * If the auto focus element option is set to item you can provide the item index here.
   *
   * This will set the item ind
   */
  // itemIndex?: number;
}

export interface MultishiftHelpers<GItem = any> {
  /**
   * Check if the item at the given index is highlighted.
   *
   * The highlight includes the current highlight (caused by hovers and the
   * arrow keys> as well as multi selection highlighting when the shift key is
   * pressed.
   */
  itemHighlightedAtIndex(index: number): boolean;

  /**
   * Return true when the provided item is selected.
   */
  itemIsSelected(item: GItem): boolean;

  /**
   * Return the index of the provided item within the list of items.
   * `-1` when not found
   */
  indexOfItem(item: GItem): number;

  /**
   * The most recently highlighted index which can be used when making a
   * multiple selection.
   *
   * When none is found it will return `-1`
   */
  mostRecentHighlightedIndex: number;
}

export type AllMultishiftDispatchActions<GItem = any> = {
  [P in keyof AllMultishiftActions<GItem>]: (...args: Parameters<AllMultishiftActions<GItem>[P]>) => void;
};

export type MultishiftDispatchActions<GItem = any> = {
  [P in keyof MultishiftActions<GItem>]: (...args: Parameters<MultishiftActions<GItem>[P]>) => void;
};

export interface MultishiftFocusHelpers {
  /**
   * Focus on the menu.
   */
  focusMenu(): void;

  /**
   * Focus on a menu item by the provided index.
   */
  focusMenuItem(index: number): void;

  /**
   * Focus on the input element when defined.
   */
  focusInput(): void;

  /**
   * Focus on the toggle button.
   */
  focusToggleButton(): void;
}

export interface MultishiftStateHelpers<GItem = any> {
  addItems: (itemsToAdd: GItem[]) => any[];
  addItem: (itemToAdd: GItem) => any[];
  removeItems: (itemsToRemove: GItem[]) => GItem[];
  removeItem: (itemToRemove: GItem) => GItem[];
  toggleItems: (itemsToToggle: GItem[]) => GItem[];
  toggleItem: (itemToToggle: GItem) => GItem[];
}

export interface MultishiftReturn<GItem = any>
  extends MultishiftState<GItem>,
    MultishiftPropGetters<GItem>,
    MultishiftDispatchActions<GItem>,
    MultishiftStateHelpers<GItem>,
    MultishiftHelpers,
    MultishiftFocusHelpers {
  /**
   * Manually dispatch an action into the state reducer.
   */
  dispatch: Dispatch<MultishiftRootActions<GItem>>;

  /**
   * This renders the status element which notifies the screen reader of changes
   * in the text dropdown.
   *
   * **Important**: This should always be included for accessibility purposes.
   * **Note** it is spelled `a-(one one)-yStatus`.
   *
   * ```tsx
   * const { getComboBoxProps, allStatus } = useMultishift({ ... });
   *
   * return (
   *   <div {...getComboBoxProps()}>
   *     {a11yStatus}
   *     // Other stuff here
   *   </div>
   * )
   * ```
   */
  a11yStatus: ReactElement;

  /**
   * Trigger a status update in the a11y element. Screen readers will read this
   * message out.
   */
  updateA11yStatus: Dispatch<SetStateAction<string>>;
}

export interface RefParams<GRefKey extends string = 'ref'> {
  /**
   * A custom ref key which allows a reference to be obtained from non standard
   * components.
   *
   * @defaultValue 'ref'
   */
  refKey?: GRefKey;
}

export interface ItemClickPayload {
  index: number;
  modifiers: Modifier[];
  /**
   * This is provided so that the state reducer has access to the event. It
   * should not be stored.
   */
  event: MouseEvent<any>;
}

export interface SpecialKeyDownPayload {
  modifiers: Modifier[];
  key: SpecialKey;
  /**
   * This is provided so that the state reducer has access to the event. It
   * should not be stored.
   */
  event: KeyboardEvent<any>;

  /**
   * The indexes of disabled items.
   */
  disabled: number[];
}
