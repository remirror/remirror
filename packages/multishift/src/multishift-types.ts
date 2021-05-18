import type {
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  Ref,
} from 'react';

import type { DropdownType, SpecialKey } from './multishift-constants';

export interface MultishiftState<Item = any> {
  /**
   * Contains all the selected items.
   *
   * When `multiple` selection is enabled this can contain more than one item.
   *
   * @default []
   */
  selectedItems: Item[];

  /**
   * This tracks the text typed when no input is available for filtering.
   *
   * It allows the implementation of quick jump to item functionality.
   *
   * @default ''
   */
  jumpText: string;

  /**
   * Determines whether or not the menu items should be displayed.
   *
   * @default false
   */
  isOpen: boolean;

  /**
   * This tracks the input value when filtering the items to insert.
   *
   * @default ''
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
   * @default []
   */
  highlightedIndexes: number[];

  /**
   * Marks the position as the starting point for a new highlighted group.
   *
   * @default -1
   */
  highlightedGroupStartIndex: number;

  /**
   * Marks the position as the end point for a new highlighted group.
   *
   * @default undefined
   */
  highlightedGroupEndIndex: number | undefined;

  /**
   * Marks the index of the currently hovered item.
   *
   * @default -1
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
export interface Action<Type extends string = string> {
  type: Type;
}
/**
 * Type representing an Action with Payload
 */
export interface ActionWithPayload<Type extends string = string, Payload = any> {
  type: Type;
  payload: Payload;
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

export type ActionCreatorMapToDispatch<CreatorMap extends ActionCreatorsMapObject> = {
  [P in keyof CreatorMap]: (...args: Parameters<CreatorMap[P]>) => void;
};

/**
 * Infers Action union-type from action-creator map object
 */
type ActionType<ActionCreatorMap extends any> = ActionCreatorMap extends ActionCreator<any>
  ? ReturnType<ActionCreatorMap>
  : ActionCreatorMap extends Record<any, any>
  ? {
      [K in keyof ActionCreatorMap]: ActionType<ActionCreatorMap[K]>;
    }[keyof ActionCreatorMap]
  : never;

export type AllMultishiftActions<Item = any> = Multishift.Actions<Item> &
  Multishift.CoreActions<Item>;

export type MultishiftRootActions<Item = any> = ActionType<AllMultishiftActions<Item>>;

export interface MultishiftInitialValueProps<Item = any> {
  initialSelectedItems?: Item[];
  initialJumpText?: string;
  initialIsOpen?: boolean;
  initialInputValue?: string;
  initialHoveredIndex?: number;
  initialHighlightedIndexes?: number[];
  initialHighlightedGroupStartIndex?: number;
  initialHighlightedGroupEndIndex?: number;
}
export interface MultishiftDefaultValueProps<Item = any> {
  defaultSelectedItems?: Item[];
  defaultJumpText?: string;
  defaultIsOpen?: boolean;
  defaultInputValue?: string;
  defaultHoveredIndex?: number;
  defaultHighlightedIndexes?: number[];
  defaultHighlightedGroupStartIndex?: number;
  defaultHighlightedGroupEndIndex?: number;
}
export interface MultishiftChangeHandlerProps<Item = any> {
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
   * Tip: This function will be called any time any state is changed.
   *
   * NOTE: This is only called when state actually changes. You should not
   * attempt to use this to handle events. If you wish to handle events, put
   * your event handlers directly on the elements (make sure to use the prop
   * getters though!
   *
   * For example: `<input onBlur={handleBlur} />` should be `<input
   * {...getInputProps({onBlur: handleBlur})} />`).
   */
  onStateChange?: (changes: MultishiftStateProps<Item>, state: MultishiftState<Item>) => void;

  /**
   * Called when the selected items change, either by the user selecting an item
   * or the user clearing the selection. Called with the items that were
   * selected or an empty array when removed
   *
   * @param selectedItems - The currently selected items if an empty array then
   * the selection was cleared.
   * @param state - the list of all currently selected items.
   */
  onSelectedItemsChange?: (selectedItems: Item[], state: MultishiftState<Item>) => void;

  onOuterClick?: (state: MultishiftState<Item>) => void;
  onJumpTextChange?: (jumpText: string, state: MultishiftState<Item>) => void;
  onIsOpenChange?: (isOpen: boolean, state: MultishiftState<Item>) => void;
  onInputValueChange?: (inputValue: string, state: MultishiftState<Item>) => void;
  onHoveredIndexChange?: (hoveredIndex: number, state: MultishiftState<Item>) => void;
  onHighlightedIndexesChange?: (highlightedIndexes: number[], state: MultishiftState<Item>) => void;
  onHighlightedGroupStartIndexChange?: (
    highlightedGroupStartIndex: number,
    state: MultishiftState<Item>,
  ) => void;
  onHighlightedGroupEndIndexChange?: (
    highlightedGroupEndIndex: number | undefined,
    state: MultishiftState<Item>,
  ) => void;
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
   * @default 'vertical'
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
   * @default true
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
   * Set a custom message to render for the duration provided by the timeout.
   *
   * @default ''
   */
  customA11yStatusMessage?: string;

  /**
   * When true will include the hovered index in the next selection (whether on
   * blur) or active selection.
   *
   * @default false
   */
  includeHoveredIndexInSelection?: boolean;
}

export interface MultishiftBaseProps<Item = any> {
  /**
   * The list ot items which are visible in menu.
   *
   * This can be changed via filtering.
   */
  items: Item[];

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
  getItemId?: GetItemId<Item>;
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
    changesAndState: MultishiftStateChangeset<Item>,
    action: MultishiftRootActions<Item>,
    props: MultishiftProps<Item>,
  ) => MultishiftState<Item>;

  /**
   * Takes a list of items and transforms them into a string.
   *
   * This defaults to a comma separated list of the values.
   */
  itemsToString?: ItemsToString<Item>;
  itemToString?: ItemToString<Item>;

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

export type MultishiftStateProps<Item = any> = Partial<MultishiftState<Item>>;

export interface MultishiftProps<Item = any>
  extends MultishiftA11yIdProps,
    MultishiftBehaviorProps,
    MultishiftBaseProps<Item>,
    MultishiftStateProps<Item>,
    MultishiftDefaultValueProps<Item>,
    MultishiftInitialValueProps<Item>,
    MultishiftChangeHandlerProps<Item> {}

export type ItemsToString<Item = any> = (
  items: Item[],
  itemToString?: (item: Item) => string,
) => string;
export type GetItemId<Item = any> = (items: Item) => any;
export type ItemToString<Item = any> = (item: Item) => string;
export type GetA11yStatusMessage<Item = any> = (options: A11yStatusMessageProps<Item>) => string;

export interface A11yStatusMessageProps<Item = any> {
  state: MultishiftState<Item>;
  items: Item[];
  itemsToString: (items: Item[], itemToString?: (item: Item) => string) => string;
}

export interface MultishiftItemsChangeset<Item = any> {
  previous: Item[];
  current: Item[];
}

export interface MultishiftStateChangeset<Item = any> {
  /**
   * The changes accumulated so far.
   */
  changes: MultishiftStateProps<Item>;

  /**
   * The current state object
   */
  state: MultishiftState<Item>;

  /**
   * The previous state object.
   */
  prevState: MultishiftState<Item>;
}

export type CreateMultishiftAction<
  Type extends string,
  Payload = any,
  Args extends any[] = [Payload],
> = (...args: Args) => ActionWithPayload<Type, Payload>;

export interface GetRemoveButtonOptions<Element extends HTMLElement = any, Item = any>
  extends HTMLProps<Element> {
  /**
   * You must provide the selectedItem property.
   */
  item: Item;

  /**
   * Prevents this from being selected.
   */
  disabled?: boolean;
}

export interface GetRemoveButtonReturn<Element extends HTMLElement = any>
  extends DetailedHTMLProps<HTMLAttributes<Element>, Element> {
  /**
   * The aria role for the button. This can be overridden in the options.
   *
   * @default 'button'
   */
  role: string;
}

export interface GetComboBoxPropsOptions<
  Element extends HTMLElement = any,
  RefKey extends string = 'ref',
> extends RefProps<RefKey>,
    HTMLProps<Element> {}

export type GetComboBoxPropsReturn<
  Element extends HTMLElement = any,
  RefKey extends string = 'ref',
> = DetailedHTMLProps<HTMLAttributes<Element>, Element> &
  { [P in RefKey]: Ref<any> } & {
    /**
     * @default 'combobox'
     */
    role: string;
    'aria-expanded': boolean;
    'aria-haspopup': boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    'aria-owns': string | undefined;
    'aria-labelledby': string;
  };

export interface GetPropsWithRefOptions<
  Element extends HTMLElement = any,
  RefKey extends string = 'ref',
> extends RefProps<RefKey>,
    HTMLProps<Element> {
  /**
   * Determine whether or not the item can be highlighted and selected.
   */
  disabled?: boolean;
}

export type GetPropsWithRefReturn<
  Element extends HTMLElement = any,
  RefKey extends string = 'ref',
> = {
  [P in Exclude<RefKey, 'key'>]: Ref<any>;
} &
  DetailedHTMLProps<HTMLAttributes<Element>, Element>;

export type GetLabelPropsWithRefReturn<
  Element extends HTMLElement = any,
  RefKey extends string = 'ref',
> = {
  [P in Exclude<RefKey, 'key'>]: Ref<any>;
} &
  DetailedHTMLProps<HTMLAttributes<Element>, Element> & {
    htmlFor?: string;
  };

export interface GetItemPropsOptions<
  Element extends HTMLElement = any,
  RefKey extends string = 'ref',
  Item = any,
> extends GetPropsWithRefOptions<Element, RefKey> {
  /**
   * This is the item data that will be selected when the user selects a
   * particular item.
   */
  item: Item;

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
 *
 * @remarks
 *
 * You call these on the element in question For example:
 *
 * ```tsx
 * <input {...getInputProps()} />
 * ```
 *
 * It's advisable to pass all your props to that function rather than applying
 * them on the element yourself to avoid your props being overridden (or
 * overriding the props returned). For example:
 *
 * ```tsx
 * // Good
 * <input getInputProps({
 *   onKeyUp(event) {
 *    log(event);
 *   }
 * }) />
 *
 * // Bad
 * <input getInputProps() onKeyUp={event => {
 *   log(event);
 * } />
 * ```
 */
export interface MultishiftPropGetters<Item = any> {
  /**
   * Get the augmented props that will be used in the wrapper element on
   * autocomplete dropdowns.
   *
   * @remarks
   *
   * Return the props to be applied to the root element that is rendered. This
   * should always be used for `autocomplete` dropdowns but will throw an error
   * if used within a `select` dropdown.
   */
  getComboBoxProps: <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
    options?: GetComboBoxPropsOptions<Element, RefKey>,
  ) => GetComboBoxPropsReturn<Element, RefKey>;

  /**
   * Get the augmented props for the toggle button which typically opens and
   * closes the menu.
   *
   * @remarks
   *
   * Returns the props you should apply to any menu toggle button element you
   * render.
   */
  getToggleButtonProps: <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
    options?: GetPropsWithRefOptions<Element, RefKey>,
  ) => GetPropsWithRefReturn<Element, RefKey>;

  /**
   * Get the augmented props for your menu dropdown container element.
   *
   * @remarks
   *
   * This method should be applied to the element which contains your list of
   * items. Typically, this will be a `<div>` or a `<ul>` that surrounds a map
   * expression. This handles the proper ARIA roles and attributes.
   *
   * refKey: if you're rendering a composite component, that component will need
   * to accept a prop which it forwards to the root DOM element. Commonly, folks
   * call this innerRef. So you'd call: getMenuProps({refKey: 'innerRef'}) and
   * your composite component would forward like: `<ul ref={props.innerRef} />`.
   * However, if you are just rendering a primitive component like `<div>`, there
   * is no need to specify this property. Please keep in mind that menus, for
   * accessiblity purposes, should always be rendered, regardless of whether you
   * hide it or not. Otherwise, getMenuProps may throw error if you unmount and
   * remount the menu.
   *
   * aria-label: By default the menu will add an aria-labelledby that refers to
   * the `<label>` rendered with getLabelProps. However, if you provide aria-label
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
  getMenuProps: <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
    options?: GetPropsWithRefOptions<Element, RefKey>,
  ) => GetPropsWithRefReturn<Element, RefKey>;

  /**
   * Get the augmented props for each item being rendered.
   *
   * @remarks
   *
   * The props returned from calling this function should be applied to any menu
   * items you render.
   *
   * This is an impure function, so it should only be called when you will
   * actually be applying the props to an item.
   */
  getItemProps: <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
    options: GetItemPropsOptions<Element, RefKey, Item>,
  ) => GetPropsWithRefReturn<Element, RefKey>;

  /**
   * Get the augmented props for the autocomplete input element.
   *
   * @remarks
   *
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
  getInputProps: <Element extends HTMLInputElement = any, RefKey extends string = 'ref'>(
    options?: GetPropsWithRefOptions<Element, RefKey>,
  ) => GetPropsWithRefReturn<Element, RefKey>;

  /**
   * Gets the props to attach to a button that removes a selected item.
   */
  getRemoveButtonProps: <Element extends HTMLElement = any>(
    options: GetRemoveButtonOptions<Element, Item>,
  ) => GetRemoveButtonReturn<Element>;

  /**
   * This method should be applied to the label you render. It will generate an
   * id that will be used to label the toggle button and the menu.
   *
   * @remarks
   *
   * There are no required properties for this method.
   *
   * > Note: For accessibility purposes, calling this method is highly
   * recommended.
   */
  getLabelProps: <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
    options?: IgnoredElementOptions<Element, RefKey>,
  ) => GetLabelPropsWithRefReturn<Element, RefKey>;

  /**
   * Adds a ref to an element which will prevent blurring from happening when
   * the element is in focus.
   *
   * @remarks
   *
   * - Allows for autofocusing the input / toggle button or items when [a
   *   specific one] when focused.
   */
  getIgnoredElementProps: <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
    options?: IgnoredElementOptions<Element, RefKey>,
  ) => GetPropsWithRefReturn<Element, RefKey>;
}

export interface IgnoredElementOptions<
  Element extends HTMLElement = any,
  RefKey extends string = 'ref',
> extends GetPropsWithRefOptions<Element, RefKey> {}

export interface MultishiftHelpers<Item = any> {
  /**
   * Check if the item at the given index is highlighted.
   *
   * @remarks
   *
   * The highlight includes the current highlight (caused by hovers and the
   * arrow keys> as well as multi selection highlighting when the shift key is
   * pressed.
   */
  itemHighlightedAtIndex: (index: number) => boolean;

  /**
   * Return true when the provided item index is hovered.
   */
  indexIsHovered: (index: number) => boolean;

  /**
   * Return true when the provided item is hovered.
   */
  itemIsHovered: (item: Item) => boolean;

  /**
   * Return true when the provided item index is selected.
   */
  indexIsSelected: (index: number) => boolean;

  /**
   * Return true when the provided item is selected.
   */
  itemIsSelected: (item: Item) => boolean;

  /**
   * Return the index of the provided item within the list of items.
   *
   * @remarks
   *
   * `-1` when not found
   */
  indexOfItem: (item: Item) => number;

  /**
   * The most recently highlighted index which can be used when making a
   * multiple selection.
   *
   * When none is found it will return `-1`
   */
  mostRecentHighlightedIndex: number;
}

export type AllMultishiftDispatchActions<Item = any> = {
  [P in keyof AllMultishiftActions<Item>]: (
    ...args: Parameters<AllMultishiftActions<Item>[P]>
  ) => void;
};

export type MultishiftDispatchActions<Item = any> = {
  [P in keyof Multishift.CoreActions<Item>]: (
    ...args: Parameters<Multishift.CoreActions<Item>[P]>
  ) => void;
};

export interface MultishiftFocusHelpers {
  /**
   * Focus on the menu.
   */
  focusMenu: () => void;

  /**
   * Focus on a menu item by the provided index.
   */
  focusMenuItem: (index: number) => void;

  /**
   * Focus on the input element when defined.
   */
  focusInput: () => void;

  /**
   * Focus on the toggle button.
   */
  focusToggleButton: () => void;
}

/**
 * This provides utility methods which make updating the state for
 * _uncontrolled_ components a bit simpler.
 *
 * @template Item = the underlying item type.
 */
export interface MultishiftStateHelpers<Item = any> {
  /**
   * Add multiple items to the `selectedItems`.
   *
   * @param items - the items array to be added to the selection. When multiple
   * is not true only the first item will be used and replace any current
   * `selectedItems`.
   */
  addItems: (items: Item[]) => any[];

  /**
   * Add one item to the `selectedItems`.
   *
   * @param item - the item to be added to the selection. When multiple is not
   * true this will replace the current selected item.
   */
  addItem: (item: Item) => any[];

  /**
   * Remove items from the `selectedItems`.
   *
   * @param items - the items to be removed.
   */
  removeItems: (items: Item[]) => Item[];

  /**
   * Remove one item from the `selectedItems`
   *
   * @param item - the item to remove
   */
  removeItem: (item: Item) => Item[];

  /**
   * Toggle item selection
   */
  toggleItems: (items: Item[]) => Item[];
  toggleItem: (item: Item) => Item[];
}

export interface MultishiftReturn<Item = any>
  extends MultishiftState<Item>,
    MultishiftPropGetters<Item>,
    MultishiftDispatchActions<Item>,
    MultishiftStateHelpers<Item>,
    MultishiftHelpers,
    MultishiftFocusHelpers {
  /**
   * Manually dispatch an action into the state reducer.
   */
  dispatch: Dispatch<MultishiftRootActions<Item>>;
}

export interface RefProps<RefKey extends string = 'ref'> {
  /**
   * A custom ref key which allows a reference to be obtained from non standard
   * components.
   *
   * @default 'ref'
   */
  refKey?: RefKey;
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
