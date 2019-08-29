import { HTMLProps, MouseEventHandler } from 'react';

export interface MultishiftState<GItem = any> {
  /**
   * Contains all the selected items.
   *
   * When `multiple` selection is enabled this can contain more than one item.
   *
   * @default []
   */
  selectedItems: GItem[];

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
   * Each index represents a position that is highlighted.
   * This is to allow the selection of multiple items in one sweep.
   *
   * Examples are
   * - Ctrl / Cmd click - toggle one position / or start a new highlight group
   * - Shift click - add start or complete a new highlighted group
   * - Click and drag - drag over multiple items to select each one
   *
   * - ArrowKey shift - Select multiple
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
 * Modifiers that are used to determine the behaviour of the click or key down action.
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
 * Type representing Generic ActionCreator
 */
export type ActionCreator<GType extends string> = (...args: any[]) => Action<GType>;

/**
 * Infers Action union-type from action-creator map object
 */
type ActionType<GActionCreatorOrMap extends any> = GActionCreatorOrMap extends ActionCreator<string>
  ? ReturnType<GActionCreatorOrMap>
  : GActionCreatorOrMap extends Record<any, any>
  ? {
      [K in keyof GActionCreatorOrMap]: ActionType<GActionCreatorOrMap[K]>;
    }[keyof GActionCreatorOrMap]
  : never;

export type MultishiftRootActions<GItem = any> = ActionType<
  GlobalMultishiftActions<GItem> & MultishiftActions<GItem>
>;

export type HandledKeys =
  | 'Enter'
  | 'Escape'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Home'
  | 'End';

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
   * This function is called anytime the internal state changes.
   * This can be useful if you're using multishift as a "controlled" component,
   * where you manage some or all of the state (e.g. isOpen, selectedItems, highlightedIndexes, etc)
   * and then pass it as props, rather than letting multishift control all its state itself.
   *
   * The parameters both take the shape of internal state
   * ({highlightedIndex: number, inputValue: string, isOpen: boolean, selectedItem: any})
   * but differ slightly.
   *
   * @param changes - These are the properties that actually have changed since the last state change.
   * This also has a type property which you can learn more about in the stateChangeTypes section.
   * @param state - This is the full state object.
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
  onStateChange?: (changes: MultishiftStateProps<GItem>, state: MultishiftState<GItem>) => void;

  /**
   * Called when the selected items change, either by the user selecting an item or the user clearing the selection.
   * Called with the items that were selected or an empty array when removed
   *
   * @param items - The currently selected items if an empty array then the selection was cleared.
   * @param state - the list of all currently selected items.
   */
  onSelectedItemsChange?(changeset: MultishiftItemsChangeset<GItem>, state: MultishiftState): void;

  onOuterClick?: (state: MultishiftState<GItem>) => void;
  onJumpTextChange?(jumpText: string, state: MultishiftState): void;
  onIsOpenChange?(isOpen: boolean, state: MultishiftState): void;
  onInputValueChange?(inputValue: string, state: MultishiftState): void;
  onHoveredIndexChange?(hoveredIndex: number, state: MultishiftState): void;
  onHighlightedIndexesChange?(highlightedIndexes: number[], state: MultishiftState): void;
  onHighlightedGroupStartIndexChange?(highlightedGroupStartIndex: number, state: MultishiftState): void;
  onHighlightedGroupEndIndexChange?(
    highlightedGroupEndIndex: number | undefined,
    state: MultishiftState,
  ): void;
}
export interface MultishiftIdProps {
  id?: string;
  inputId?: string;
  labelId?: string;
  menuId?: string;
  toggleButtonId?: string;
  getItemId?: (index?: number) => string;
}

export type Direction = 'horizontal' | 'vertical';

export interface MultishiftBehavioralProps {
  /**
   * Set to true to allow multiple items to be selected in the list.
   * When not specified (or set to false) only one item can be selected (and only one at a time.
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
  direction: 'horizontal' | 'vertical';

  /**
   * Whether the input should be closed when a selection is made.
   * This default to false when `multiple=true`.
   */
  closeOnSelection?: boolean;

  /**
   * By default typing into non text input combo-box will jump to the closest index.
   *
   * Setting this to false will ignore this behaviour
   */
  ignoreJumpText?: boolean;

  /**
   * Controls the circular keyboard navigation between items.
   * If set to true, when first item is highlighted, the `ArrowUp`
   * will move highlight to the last item, and vice versa using
   * `ArrowDown`.
   */
  circularNavigation?: boolean;

  /**
   * The timeout for the a11y status update in milliseconds.
   *
   * @default 500
   */
  a11yStatusTimeout?: number;

  /**
   * Set a custom message to render for the duration provided by the timeout.
   *
   * @default ''
   */
  customA11yStatusMessage?: string;
}

export interface MultishiftBaseProps<GItem = any> {
  /**
   * The list ot items which are visible in menu.
   *
   * This can be changed via filtering.
   */
  items: GItem[];
  /**
   * This function will be called each time multishift sets its internal state
   * (or calls the onStateChange handler for controlled props). It allows you to
   * modify the state change that will take place which can give you fine grained
   * control over how the component interacts with user updates without having to
   * use controlled Props. It gives you the current state and the state that will
   * be set, and you return the state that you want to set.
   *
   * @param changeSet - An object with the `prevState` before any changes, the `changes`.
   * created by the built in reducer and the current `state` it produced.
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
  itemsToString?: ItemsToString;
  itemToString?: ItemToString;
  selectedItemChanged?: (prevItem: GItem, item: GItem) => boolean;

  /**
   * This function is passed as props to a status component nested within and allows
   * you to create your own assertive ARIA statuses.
   *
   * A default getA11yStatusMessage function is provided that will check `items.current.length`
   * and return "No results." or if there are results but no item is highlighted,
   * "resultCount results are available, use up and down arrow keys to navigate."
   * If items are highlighted it will run `itemToString(highlightedItem)` and display
   * the value of the `highlightedItem`.
   */
  getA11yStatusMessage?: GetA11yStatusMessage;
}

export type MultishiftStateProps<GItem = any> = Partial<MultishiftState<GItem>>;

export interface MultishiftProps<GItem = any>
  extends MultishiftIdProps,
    MultishiftBehavioralProps,
    MultishiftBaseProps<GItem>,
    MultishiftStateProps<GItem>,
    MultishiftDefaultValueProps<GItem>,
    MultishiftInitialValueProps<GItem>,
    MultishiftChangeHandlerProps<GItem> {}

export type ItemsToString<GItem = any> = (items: GItem[], itemToString?: (item: GItem) => string) => string;
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
  changes: MultishiftStateProps<GItem>;
  state: MultishiftState<GItem>;
  prevState: MultishiftState<GItem>;
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

export type CreateMultishiftAction<GType extends string, GPayload = any, GParams = GPayload> = (
  params: GParams,
) => ActionWithPayload<GType, GPayload>;

export interface MultiPropGetters<GItem = any> {
  /**
   * Gets the props to attach to a button that removes a selected item.
   */
  getRemoveButtonProps<GElement extends HTMLElement = any>(
    options: GetRemoveButtonOptions<GElement, GItem>,
  ): GetRemoveButtonReturn<GElement>;
}

export interface MultishiftHelpers {
  /**
   * Check if the item at the given index is highlighted.
   *
   * The highlight includes the current highlight (caused by hovers and the arrow keys>
   * as well as multi selection highlighting when the shift key is pressed.
   */
  itemHighlightedAtIndex(index: number): boolean;
}

export interface MultishiftHookReturn<GItem = any>
  extends MultishiftState<GItem>,
    MultiPropGetters<GItem>,
    MultishiftActions<GItem>,
    MultishiftHelpers {}
