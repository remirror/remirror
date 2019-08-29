// tslint:disable: no-unused-expression
import {
  bool,
  clamp,
  isNumber,
  isUndefined,
  keys,
  last,
  pick,
  range,
  uniqueArray,
} from '@remirror/core-helpers';
import {
  HandledKeys,
  ItemToString,
  Modifier,
  MultishiftBehavioralProps,
  MultishiftChangeHandlerProps,
  MultishiftDefaultValueProps,
  MultishiftIdProps,
  MultishiftInitialValueProps,
  MultishiftProps,
  MultishiftState,
  MultishiftStateChangeset,
  MultishiftStateProps,
} from './multishift-hook-types';

/**
 * The default itemToString implementation.
 */
export const defaultItemToString = <GItem = any>(item: GItem) => {
  return item ? String(item) : '';
};

/**
 * The default itemsToString function.
 *
 * Creates a comma separated string of the item string values.
 *
 * @param items - the list of all selected items
 * @param itemToString - retrieve the string from an individual
 */
export const defaultItemsToString = <GItem = any>(
  selectedItems: GItem[],
  itemToString = defaultItemToString as ItemToString, // TypeCast needed to prevent errors in consumers
) => selectedItems.map(itemToString!).join(', ');

export interface GetInitialPropsParams<GItem = any>
  extends MultishiftBehavioralProps,
    MultishiftStateProps<GItem>,
    MultishiftDefaultValueProps<GItem>,
    MultishiftInitialValueProps<GItem> {}

export const DEFAULT_STATE: MultishiftState = {
  selectedItems: [],
  jumpText: '',
  isOpen: false,
  inputValue: '',
  hoveredIndex: -1,
  highlightedIndexes: [],
  highlightedGroupStartIndex: -1,
  highlightedGroupEndIndex: undefined,
};

const noUndefined = <GType = any>(fallback: GType, values: Array<GType | undefined>): GType => {
  for (const value of values) {
    if (!isUndefined(value)) {
      return value;
    }
  }

  return fallback;
};

/**
 * Get the initial state or props when provided.
 */
export const getInitialStateProps = <GItem = any>({
  initialSelectedItems,
  initialJumpText,
  initialIsOpen,
  initialInputValue,
  initialHoveredIndex,
  initialHighlightedIndexes,
  initialHighlightedGroupStartIndex,
  initialHighlightedGroupEndIndex,
  selectedItems,
  jumpText,
  isOpen,
  inputValue,
  hoveredIndex,
  highlightedIndexes,
  highlightedGroupStartIndex,
  highlightedGroupEndIndex,
  ...props
}: GetInitialPropsParams): MultishiftState<GItem> => {
  const fallback = getDefaultState(props);
  return {
    selectedItems: noUndefined(fallback.selectedItems, [selectedItems, initialSelectedItems]),
    jumpText: noUndefined(fallback.jumpText, [jumpText, initialJumpText]),
    isOpen: noUndefined(fallback.isOpen, [isOpen, initialIsOpen]),
    inputValue: noUndefined(fallback.inputValue, [inputValue, initialInputValue]),
    hoveredIndex: noUndefined(fallback.hoveredIndex, [hoveredIndex, initialHoveredIndex]),
    highlightedIndexes: noUndefined(fallback.highlightedIndexes, [
      highlightedIndexes,
      initialHighlightedIndexes,
    ]),
    highlightedGroupStartIndex: noUndefined(fallback.highlightedGroupStartIndex, [
      highlightedGroupStartIndex,
      initialHighlightedGroupStartIndex,
    ]),
    highlightedGroupEndIndex: noUndefined(fallback.highlightedGroupEndIndex, [
      highlightedGroupEndIndex,
      initialHighlightedGroupEndIndex,
    ]),
  };
};

export interface GetDefaultStateParams<GItem = any>
  extends MultishiftDefaultValueProps<GItem>,
    MultishiftBehavioralProps {}

/**
 * Get all the default state values.
 */
export const getDefaultState = <GItem = any>({
  defaultSelectedItems,
  defaultJumpText,
  defaultIsOpen,
  defaultInputValue,
  defaultHoveredIndex,
  defaultHighlightedIndexes,
  defaultHighlightedGroupStartIndex,
  defaultHighlightedGroupEndIndex,
  multiple,
  closeOnSelection,
}: GetDefaultStateParams<GItem>) => ({
  selectedItems: defaultSelectedItems || DEFAULT_STATE.selectedItems,
  jumpText: noUndefined(DEFAULT_STATE.jumpText, [defaultJumpText]),
  isOpen:
    multiple && !isUndefined(closeOnSelection)
      ? bool(closeOnSelection)
      : noUndefined(DEFAULT_STATE.isOpen, [defaultIsOpen]),
  inputValue: noUndefined(DEFAULT_STATE.inputValue, [defaultInputValue]),
  hoveredIndex: noUndefined(DEFAULT_STATE.hoveredIndex, [defaultHoveredIndex]),
  highlightedIndexes: defaultHighlightedIndexes || DEFAULT_STATE.highlightedIndexes,
  highlightedGroupStartIndex: noUndefined(DEFAULT_STATE.highlightedGroupStartIndex, [
    defaultHighlightedGroupStartIndex,
  ]),
  highlightedGroupEndIndex: noUndefined(DEFAULT_STATE.highlightedGroupEndIndex, [
    defaultHighlightedGroupEndIndex,
  ]),
});

export const getState = <GItem = any>(
  state: MultishiftState<GItem>,
  props: MultishiftStateProps<GItem>,
): MultishiftState<GItem> => ({
  selectedItems: props.selectedItems || state.selectedItems,
  jumpText: noUndefined(state.jumpText, [state.jumpText]),
  isOpen: noUndefined(state.isOpen, [state.isOpen]),
  inputValue: noUndefined(state.inputValue, [state.inputValue]),
  hoveredIndex: noUndefined(state.hoveredIndex, [state.hoveredIndex]),
  highlightedIndexes: props.highlightedIndexes || state.highlightedIndexes,
  highlightedGroupStartIndex: noUndefined(state.highlightedGroupStartIndex, [
    state.highlightedGroupStartIndex,
  ]),
  highlightedGroupEndIndex: noUndefined(state.highlightedGroupEndIndex, [state.highlightedGroupEndIndex]),
});

const changeHandlerMap = {
  selectedItems: <GItem = any>(
    { onSelectedItemsChange }: MultishiftChangeHandlerProps<GItem>,
    { state, prevState }: MultishiftStateChangeset<GItem>,
  ) =>
    onSelectedItemsChange &&
    onSelectedItemsChange({ current: state.selectedItems, previous: prevState.selectedItems }, state),
  jumpText: <GItem = any>(
    { onJumpTextChange }: MultishiftChangeHandlerProps<GItem>,
    { state }: MultishiftStateChangeset<GItem>,
  ) => onJumpTextChange && onJumpTextChange(state.jumpText, state),
  isOpen: <GItem = any>(
    { onIsOpenChange }: MultishiftChangeHandlerProps<GItem>,
    { state }: MultishiftStateChangeset<GItem>,
  ) => onIsOpenChange && onIsOpenChange(state.isOpen, state),
  inputValue: <GItem = any>(
    { onInputValueChange }: MultishiftChangeHandlerProps<GItem>,
    { state }: MultishiftStateChangeset<GItem>,
  ) => onInputValueChange && onInputValueChange(state.inputValue, state),
  hoveredIndex: <GItem = any>(
    { onHoveredIndexChange }: MultishiftChangeHandlerProps<GItem>,
    { state }: MultishiftStateChangeset<GItem>,
  ) => onHoveredIndexChange && onHoveredIndexChange(state.hoveredIndex, state),
  highlightedIndexes: <GItem = any>(
    { onHighlightedIndexesChange }: MultishiftChangeHandlerProps<GItem>,
    { state }: MultishiftStateChangeset<GItem>,
  ) => onHighlightedIndexesChange && onHighlightedIndexesChange(state.highlightedIndexes, state),
  highlightedGroupStartIndex: <GItem = any>(
    { onHighlightedGroupStartIndexChange }: MultishiftChangeHandlerProps<GItem>,
    { state }: MultishiftStateChangeset<GItem>,
  ) =>
    onHighlightedGroupStartIndexChange &&
    onHighlightedGroupStartIndexChange(state.highlightedGroupStartIndex, state),
  highlightedGroupEndIndex: <GItem = any>(
    { onHighlightedGroupEndIndexChange }: MultishiftChangeHandlerProps<GItem>,
    { state }: MultishiftStateChangeset<GItem>,
  ) =>
    onHighlightedGroupEndIndexChange &&
    onHighlightedGroupEndIndexChange(state.highlightedGroupEndIndex, state),
};
/**
 * Call all relevant change handlers.
 */
export const callChangeHandlers = (
  handlers: MultishiftChangeHandlerProps,
  { changes, state, prevState }: MultishiftStateChangeset,
) => {
  const changedKeys = keys(changes);
  const { onStateChange } = handlers;

  changedKeys.forEach(key => {
    changeHandlerMap[key](handlers, { changes, state, prevState });
  });

  if (changedKeys.length && onStateChange) {
    onStateChange(changes, state);
  }
};

/**
 * Get the ids for each element.
 */
export const getElementIds = (
  defaultId: string | number,
  { id, labelId, menuId, getItemId, toggleButtonId }: MultishiftIdProps = {},
) => {
  const uniqueId = id === undefined ? `multishift-${defaultId}` : id;

  return {
    labelId: labelId || `${uniqueId}-label`,
    menuId: menuId || `${uniqueId}-menu`,
    getItemId: getItemId || (index => `${uniqueId}-item-${index}`),
    toggleButtonId: toggleButtonId || `${uniqueId}-toggle-button`,
  };
};

interface GetHighlightedIndexOnOpenParams<GItem = any> {
  defaultValues: MultishiftDefaultValueProps<GItem>;
  initialValues: MultishiftInitialValueProps<GItem>;
  items: GItem[];
  state: MultishiftState<GItem>;
  offset: -1 | 1;
}

interface GetNextWrappingIndex {
  steps: number;
  start: number;
  size: number;
  circular: boolean;
}

/**
 * Get the next index when navigating with arrow keys.
 */
export const getNextWrappingIndex = ({
  start,
  steps,
  size,
  circular,
}: GetNextWrappingIndex): [number] | [] => {
  if (size === 0) {
    return [];
  }

  if (start === -1) {
    return [steps > 0 ? 0 : size - 1];
  }

  const nextIndex = start + steps;

  if (nextIndex < 0) {
    return [circular ? size - 1 : 0];
  }
  if (nextIndex >= size) {
    return [circular ? 0 : size - 1];
  }

  return [nextIndex];
};

const isValidIndex = (index: number | undefined): index is number => (isNumber(index) ? index > -1 : false);

interface GetItemIndexByJumpTextParams<GItem = any> {
  text: string;
  highlightedIndexes: number[];
  items: GItem[];
  itemToString?: ItemToString;
}

/**
 * Finds the nearest match when typing into a non input dropdown.
 */
export const getItemIndexesByJumpText = <GItem = any>({
  text,
  highlightedIndexes,
  items,
  itemToString = defaultItemToString,
}: GetItemIndexByJumpTextParams<GItem>): [number] | [] => {
  let newHighlightedIndex = -1;
  const finder = (str: string) => str.startsWith(text);
  const itemStrings = items.map(item => itemToString(item).toLowerCase());
  const startPosition = (Math.min(...highlightedIndexes) || -1) + 1;

  newHighlightedIndex = itemStrings.slice(startPosition).findIndex(finder);

  if (newHighlightedIndex > -1) {
    return [newHighlightedIndex + startPosition];
  } else {
    const index = itemStrings.slice(0, startPosition).findIndex(finder);
    return isValidIndex(index) ? [index] : [];
  }
};

export const getHighlightedIndexOnOpen = <GItem = any>(
  props: Pick<MultishiftProps<GItem>, 'items' | 'initialHighlightedIndexes' | 'defaultHighlightedIndexes'>,
  state: MultishiftState<GItem>,
  offset: number,
): number[] => {
  const { items, initialHighlightedIndexes, defaultHighlightedIndexes } = props;
  const { selectedItems, highlightedIndexes } = state;

  // initialHighlightedIndexes will give value to highlightedIndex on initial state only.
  if (initialHighlightedIndexes !== undefined && highlightedIndexes.length) {
    return initialHighlightedIndexes;
  }

  if (defaultHighlightedIndexes) {
    return defaultHighlightedIndexes;
  }

  if (selectedItems.length) {
    const index = selectedItems.map(selectedItem => items.indexOf(selectedItem)).findIndex(isValidIndex);

    if (!isValidIndex(index)) {
      return [];
    }

    if (offset === 0) {
      return [index];
    }

    return getNextWrappingIndex({ steps: offset, start: index, size: items.length, circular: false });
  }

  if (offset === 0) {
    return [];
  }

  return offset < 0 ? [items.length - 1] : [0];
};

/**
 * Get the item index from the items prop.
 */
export const getItemIndex = <GItem = any>(index: number, item: GItem, items: GItem[]) => {
  if (index !== undefined) {
    return index;
  }
  if (items.length === 0) {
    return -1;
  }
  return items.indexOf(item);
};

type GetLastHighlightParams = Pick<
  MultishiftState,
  'highlightedIndexes' | 'highlightedGroupEndIndex' | 'highlightedGroupStartIndex'
>;

/**
 * Get the most recently updated highlighted index.
 */
export const getLastHighlightIndex = ({
  highlightedGroupEndIndex,
  highlightedGroupStartIndex,
  highlightedIndexes,
}: GetLastHighlightParams) => {
  return isValidIndex(highlightedGroupEndIndex)
    ? highlightedGroupEndIndex
    : isValidIndex(highlightedGroupStartIndex)
    ? highlightedGroupStartIndex
    : last(highlightedIndexes) || -1;
};

/**
 * Check if the browser is a mac.
 */
export const isMac = () => /Mac/.test(navigator.platform);

interface GetChangesFromItemClickParams<GItem = any> {
  modifiers: Modifier[];
  index: number;
  items: GItem[];
  multiple?: boolean;
  defaultState: MultishiftState<GItem>;
  state: MultishiftState<GItem>;
}

type GetChangesFromItemClickReturn<GItem = any> = Pick<
  MultishiftState<GItem>,
  | 'highlightedIndexes'
  | 'selectedItems'
  | 'highlightedGroupStartIndex'
  | 'highlightedGroupEndIndex'
  | 'isOpen'
>;

/**
 * Create the desired change object when an item is clicked.
 */
export const getChangesFromItemClick = <GItem = any>({
  modifiers,
  items,
  defaultState,
  state,
  index,
  multiple,
}: GetChangesFromItemClickParams<GItem>): GetChangesFromItemClickReturn<GItem> => {
  const selectedItem = items[index];
  const defaultReturn: GetChangesFromItemClickReturn<GItem> = {
    ...state,
    isOpen: defaultState.isOpen,
    highlightedGroupEndIndex: undefined,
    highlightedGroupStartIndex: -1,
  };

  if (!selectedItem) {
    // TODO check if this logic is desirable
    return defaultReturn;
  }

  // Check if the modifier for selecting multiple items is pressed.
  const highlightMultiple = modifiers.includes('shiftKey') && modifiers.length === 1;

  // Check if the modifier for highlighting an additional
  const highlightIndividual = modifiers.includes(isMac() ? 'metaKey' : 'ctrlKey') && modifiers.length === 1;

  if (!multiple) {
    return {
      ...defaultReturn,
      highlightedIndexes: defaultState.highlightedIndexes,
      selectedItems: [items[index]],
    };
  }

  if (highlightIndividual) {
    const indexes = getHighlightedIndexes({
      indexes: state.highlightedIndexes,
      start: state.highlightedGroupStartIndex,
      end: state.highlightedGroupEndIndex,
      items,
    });

    const isHighlighted = checkItemHighlighted(index, {
      indexes,
      start: state.highlightedGroupStartIndex,
      end: state.highlightedGroupEndIndex,
      items,
    });

    const params = isHighlighted
      ? { highlightedIndexes: indexes.filter(ii => ii !== index) }
      : { highlightedIndexes: indexes, highlightedGroupStartIndex: index };

    return { ...defaultReturn, ...params };
  }

  if (highlightMultiple) {
    const indexes = uniqueArray(state.highlightedIndexes);
    const params: Partial<GetChangesFromItemClickReturn<GItem>> = isValidIndex(
      state.highlightedGroupStartIndex,
    )
      ? {
          highlightedIndexes: indexes,
          highlightedGroupStartIndex: state.highlightedGroupStartIndex,
          highlightedGroupEndIndex: index,
        }
      : { highlightedIndexes: indexes, highlightedGroupStartIndex: index };

    return { ...defaultReturn, ...params };
  }

  return {
    ...defaultReturn,
    highlightedIndexes: defaultState.highlightedIndexes,
    selectedItems: [...state.selectedItems, selectedItem],
  };
};

interface GetHighlightedIndexesParams<GItem = any> {
  /**
   * The current highlighted indexes
   */
  indexes: number[];

  /**
   * The start of the new highlight grouping.
   */
  start: number;

  /**
   * The end of the new highlight grouping.
   */
  end?: number;

  /**
   * The items being rendered right now.
   */
  items: GItem[];
}

/**
 * Get an array of all the highlighted items
 * Including any from the currently incomplete group.
 */
export const getHighlightedIndexes = <GItem = any>({
  start,
  end,
  indexes,
  items,
}: GetHighlightedIndexesParams<GItem>) => {
  const max = items.length - 1;
  const extra = isValidIndex(start)
    ? range(
        clamp({ min: 0, max, value: start }),
        clamp({ min: 0, max, value: isValidIndex(end) ? end : start }),
      )
    : [];

  return uniqueArray([...indexes, ...extra]);
};

/**
 * Checks whether the an index is highlighted within a set of indexes
 * and a highlighted group.
 */
export const checkItemHighlighted = (index: number, { start, end, indexes }: GetHighlightedIndexesParams) =>
  indexes.includes(index) || within(index, start, end);

/**
 * Check that a number is within the minimum and maximum bounds of a set of numbers.
 */
export const within = (value: number, ...rest: Array<number | undefined | null>) => {
  const numbers: number[] = rest.filter<number>(isNumber);
  return value >= Math.min(...numbers) && value <= Math.max(...numbers);
};

/**
 * Normalizes the 'key' property of a KeyboardEvent in IE/Edge
 *
 * @param event - the keyboard event
 */
export const normalizeArrowKey = <GEvent extends KeyboardEvent = any>(event: GEvent) => {
  // tslint:disable-next-line: deprecation
  const { key, keyCode } = event;

  if (keyCode >= 37 && keyCode <= 40 && key.indexOf('Arrow') !== 0) {
    return `Arrow${key}`;
  }

  if (key === 'Esc') {
    return 'Escape';
  }

  if (key === 'Del') {
    return 'Delete';
  }

  return key;
};

/**
 * Log a warning when using in an internal type that doesn't get resolved.
 */
export const warnIfInternalType = (type: string, message = '') => {
  if (type.startsWith('$$')) {
    console.warn(message);
  }
};

interface CreateChangesFromKeyDownParams<GItem = any> {
  state: MultishiftState<GItem>;
  modifiers: Modifier[];
  defaultState: MultishiftState<GItem>;
  key: HandledKeys;
  props: MultishiftBehavioralProps;
  items: GItem[];
}

export const createChangesFromMenuKeyDown = <GItem = any>({
  state,
}: CreateChangesFromKeyDownParams): MultishiftStateProps<GItem> => {
  return { ...state };
};

export const createChangesFromToggleButtonKeyDown = <GItem = any>({
  state,
}: CreateChangesFromKeyDownParams): MultishiftStateProps<GItem> => {
  return { ...state };
};

export const createChangesFromComboBoxKeyDown = <GItem = any>({
  state,
}: CreateChangesFromKeyDownParams): MultishiftStateProps<GItem> => {
  return { ...state };
};
