import computeScrollIntoView from 'compute-scroll-into-view';
import type { Dispatch, KeyboardEvent, SyntheticEvent } from 'react';
import { keyName } from 'w3c-keyname';

import {
  clamp,
  isArray,
  isEmptyArray,
  isNumber,
  isObject,
  isString,
  isUndefined,
  keys,
  last,
  object,
  omit,
  range,
  take,
  uniqueArray,
  uniqueBy,
  within,
} from '@remirror/core-helpers';
import type { AnyFunction, Nullable } from '@remirror/core-types';

import { SpecialKey, Type } from './multishift-constants';
import type {
  ActionCreator,
  ActionCreatorMapToDispatch,
  ActionCreatorsMapObject,
  GetItemId,
  ItemClickPayload,
  ItemToString,
  Modifier,
  MultishiftA11yIdProps,
  MultishiftBehaviorProps,
  MultishiftChangeHandlerProps,
  MultishiftDefaultValueProps,
  MultishiftInitialValueProps,
  MultishiftProps,
  MultishiftState,
  MultishiftStateChangeset,
  MultishiftStateProps,
  SpecialKeyDownPayload,
} from './multishift-types';

/**
 * The default unique identifier getter function.
 */
export const defaultGetItemId = (item: any) => item;

/**
 * The default itemToString implementation.
 */
export const defaultItemToString = <Item = any>(item: Item | undefined) => {
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
export const defaultItemsToString = <Item = any>(
  selectedItems: Item[],
  itemToString = defaultItemToString as ItemToString, // TypeCast needed to prevent errors in consumers
) => selectedItems.map(itemToString).join(', ');

export interface GetInitialPropsParameter<Item = any>
  extends MultishiftBehaviorProps,
    MultishiftStateProps<Item>,
    MultishiftDefaultValueProps<Item>,
    MultishiftInitialValueProps<Item> {}

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

const noUndefined = <Type = any>(fallback: Type, values: Array<Type | undefined>): Type => {
  for (const value of values) {
    if (!isUndefined(value)) {
      return value;
    }
  }

  return fallback;
};

/**
 * Get all the default state values.
 */
export const getDefaultState = <Item = any>({
  defaultSelectedItems,
  defaultJumpText,
  defaultIsOpen,
  defaultInputValue,
  defaultHoveredIndex,
  defaultHighlightedIndexes,
  defaultHighlightedGroupStartIndex,
  defaultHighlightedGroupEndIndex,
}: GetDefaultStateParameter<Item>) => ({
  selectedItems: defaultSelectedItems ?? DEFAULT_STATE.selectedItems,
  jumpText: noUndefined(DEFAULT_STATE.jumpText, [defaultJumpText]),
  isOpen: noUndefined(DEFAULT_STATE.isOpen, [defaultIsOpen]),
  inputValue: noUndefined(DEFAULT_STATE.inputValue, [defaultInputValue]),
  hoveredIndex: noUndefined(DEFAULT_STATE.hoveredIndex, [defaultHoveredIndex]),
  highlightedIndexes: defaultHighlightedIndexes ?? DEFAULT_STATE.highlightedIndexes,
  highlightedGroupStartIndex: noUndefined(DEFAULT_STATE.highlightedGroupStartIndex, [
    defaultHighlightedGroupStartIndex,
  ]),
  highlightedGroupEndIndex: noUndefined(DEFAULT_STATE.highlightedGroupEndIndex, [
    defaultHighlightedGroupEndIndex,
  ]),
});

/**
 * Get the initial state or props when provided.
 */
export const getInitialStateProps = <Item = any>({
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
}: GetInitialPropsParameter): MultishiftState<Item> => {
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

export interface GetDefaultStateParameter<Item = any>
  extends MultishiftDefaultValueProps<Item>,
    MultishiftBehaviorProps {}

/**
 * The state that corresponds to the default highlight state. Useful when the
 * highlighted values need to be reset.
 */
export const getHighlightReset = <Item = any>(defaultState: MultishiftState<Item>) => ({
  highlightedGroupEndIndex: defaultState.highlightedGroupEndIndex,
  highlightedGroupStartIndex: defaultState.highlightedGroupStartIndex,
  highlightedIndexes: defaultState.highlightedIndexes,
  hoveredIndex: defaultState.hoveredIndex,
});
/**
 * Uses controlled props where available otherwise fallbacks back to internal
 * state.
 */
export const getState = <Item = any>(
  state: MultishiftState<Item>,
  props: MultishiftStateProps<Item>,
): MultishiftState<Item> => ({
  selectedItems: props.selectedItems ?? state.selectedItems,
  jumpText: noUndefined(state.jumpText, [props.jumpText]),
  isOpen: noUndefined(state.isOpen, [props.isOpen]),
  inputValue: noUndefined(state.inputValue, [props.inputValue]),
  hoveredIndex: noUndefined(state.hoveredIndex, [props.hoveredIndex]),
  highlightedIndexes: props.highlightedIndexes ?? state.highlightedIndexes,
  highlightedGroupStartIndex: noUndefined(state.highlightedGroupStartIndex, [
    props.highlightedGroupStartIndex,
  ]),
  highlightedGroupEndIndex: noUndefined(state.highlightedGroupEndIndex, [
    props.highlightedGroupEndIndex,
  ]),
});

const changeHandlerMap = {
  selectedItems: <Item = any>(
    { onSelectedItemsChange }: MultishiftChangeHandlerProps<Item>,
    { state }: MultishiftStateChangeset<Item>,
  ) => onSelectedItemsChange?.(state.selectedItems, state),

  jumpText: <Item = any>(
    { onJumpTextChange }: MultishiftChangeHandlerProps<Item>,
    { state }: MultishiftStateChangeset<Item>,
  ) => onJumpTextChange?.(state.jumpText, state),

  isOpen: <Item = any>(
    { onIsOpenChange }: MultishiftChangeHandlerProps<Item>,
    { state }: MultishiftStateChangeset<Item>,
  ) => onIsOpenChange?.(state.isOpen, state),

  inputValue: <Item = any>(
    { onInputValueChange }: MultishiftChangeHandlerProps<Item>,
    { state }: MultishiftStateChangeset<Item>,
  ) => onInputValueChange?.(state.inputValue, state),

  hoveredIndex: <Item = any>(
    { onHoveredIndexChange }: MultishiftChangeHandlerProps<Item>,
    { state }: MultishiftStateChangeset<Item>,
  ) => onHoveredIndexChange?.(state.hoveredIndex, state),

  highlightedIndexes: <Item = any>(
    { onHighlightedIndexesChange }: MultishiftChangeHandlerProps<Item>,
    { state }: MultishiftStateChangeset<Item>,
  ) => onHighlightedIndexesChange?.(state.highlightedIndexes, state),

  highlightedGroupStartIndex: <Item = any>(
    { onHighlightedGroupStartIndexChange }: MultishiftChangeHandlerProps<Item>,
    { state }: MultishiftStateChangeset<Item>,
  ) => onHighlightedGroupStartIndexChange?.(state.highlightedGroupStartIndex, state),

  highlightedGroupEndIndex: <Item = any>(
    { onHighlightedGroupEndIndexChange }: MultishiftChangeHandlerProps<Item>,
    { state }: MultishiftStateChangeset<Item>,
  ) => onHighlightedGroupEndIndexChange?.(state.highlightedGroupEndIndex, state),
};

/**
 * Call all relevant change handlers.
 */
export const callChangeHandlers = <Item = any>(
  handlers: MultishiftChangeHandlerProps<Item>,
  { changes, state, prevState }: MultishiftStateChangeset<Item>,
) => {
  const changedKeys = keys(changes);
  const { onStateChange } = handlers;

  changedKeys.forEach((key) => {
    changeHandlerMap[key](handlers, { changes, state, prevState });
  });

  if (!isEmptyArray(changedKeys.length) && onStateChange) {
    onStateChange(changes, state);
  }
};

/**
 * Get the ids for each element.
 */
export const getElementIds = (
  defaultId: string | number,
  {
    id,
    labelId,
    menuId,
    getItemA11yId,
    toggleButtonId,
    inputId,
  }: MultishiftA11yIdProps = Object.create(null),
) => {
  const uniqueId = id === undefined ? `multishift-${defaultId}` : id;

  return {
    labelId: labelId ?? `${uniqueId}-label`,
    inputId: inputId ?? `${uniqueId}-input`,
    menuId: menuId ?? `${uniqueId}-menu`,
    getItemA11yId: getItemA11yId ?? ((index) => `${uniqueId}-item-${index ?? 0}`),
    toggleButtonId: toggleButtonId ?? `${uniqueId}-toggle-button`,
  };
};

interface GetNextWrappingIndexParameter {
  steps: number;
  start: number;
  size: number;
  circular: boolean;
}

export const getNextWrappingIndex = ({
  start,
  steps,
  size,
  circular,
}: GetNextWrappingIndexParameter): number | undefined => {
  if (size === 0) {
    return;
  }

  if (start === -1) {
    return steps > 0 ? 0 : size - 1;
  }

  const nextIndex = start + steps;

  if (nextIndex < 0) {
    return circular ? size - 1 : 0;
  }

  if (nextIndex >= size) {
    return circular ? 0 : size - 1;
  }

  return nextIndex;
};

/**
 * Check whether the provided value is a valid index.
 */
export const isValidIndex = (index: number | undefined | null): index is number =>
  isNumber(index) && index > -1;

/**
 * Get the next index when navigating with arrow keys.
 */
export const getNextWrappingIndexes = (params: GetNextWrappingIndexParameter): [number] | [] => {
  const index = getNextWrappingIndex(params);
  return isValidIndex(index) ? [index] : [];
};

export const isValidIndexAndNotDisabled = (
  index: number | undefined,
  disabled: number[],
): index is number => isValidIndex(index) && !disabled.includes(index);

interface GetItemIndexByJumpTextParameter<Item = any> {
  text: string;
  highlightedIndexes: number[];
  items: Item[];
  itemToString?: ItemToString;
}

/**
 * Finds the nearest match when typing into a non input dropdown.
 */
export const getItemIndexesByJumpText = <Item = any>({
  text,
  highlightedIndexes,
  items,
  itemToString = defaultItemToString,
}: GetItemIndexByJumpTextParameter<Item>): [number] | [] => {
  let newHighlightedIndex = -1;
  const finder = (str: string) => str.startsWith(text);
  const itemStrings = items.map((item) => itemToString(item).toLowerCase());
  const startPosition = (Math.min(...highlightedIndexes) || -1) + 1;

  newHighlightedIndex = itemStrings.slice(startPosition).findIndex(finder);

  if (newHighlightedIndex > -1) {
    return [newHighlightedIndex + startPosition];
  }

  const index = itemStrings.slice(0, startPosition).findIndex(finder);
  return isValidIndex(index) ? [index] : [];
};

/**
 * Determines which highlighted indexes should be available on first open.
 */
export const getHighlightedIndexOnOpen = <Item = any>(
  props: Pick<
    MultishiftProps<Item>,
    'items' | 'initialHighlightedIndexes' | 'defaultHighlightedIndexes'
  >,
  state: MultishiftState<Item>,
  offset: number,
  getItemId: GetItemId<Item>,
): number[] => {
  const { items, initialHighlightedIndexes, defaultHighlightedIndexes } = props;
  const { selectedItems, highlightedIndexes } = state;

  // initialHighlightedIndexes will give value to highlightedIndex on initial
  // state only.
  if (!isUndefined(initialHighlightedIndexes) && !isEmptyArray(highlightedIndexes)) {
    return initialHighlightedIndexes;
  }

  if (defaultHighlightedIndexes) {
    return defaultHighlightedIndexes;
  }

  if (!isEmptyArray(selectedItems)) {
    const idsOfItems = items.map(getItemId);
    const index = selectedItems
      .map((selectedItem) => idsOfItems.indexOf(getItemId(selectedItem)))
      .findIndex(isValidIndex);

    if (!isValidIndex(index)) {
      return [];
    }

    if (offset === 0) {
      return [index];
    }

    return getNextWrappingIndexes({
      steps: offset,
      start: index,
      size: items.length,
      circular: false,
    });
  }

  if (offset === 0) {
    return [0];
  }

  return offset < 0 ? [items.length - 1] : [0];
};

/**
 * Get the item index from the items prop.
 */
export const getItemIndex = <Item = any>(index: number, item: Item, items: Item[]) => {
  if (index !== undefined) {
    return index;
  }

  if (items.length === 0) {
    return -1;
  }

  return items.indexOf(item);
};

type GetLastHighlightParameter = Pick<
  MultishiftState,
  'highlightedIndexes' | 'highlightedGroupEndIndex' | 'highlightedGroupStartIndex'
>;

/**
 * Get the most recently updated highlighted index.
 *
 * Returns -1 when no highlighted index is found.
 */
export const getMostRecentHighlightIndex = ({
  highlightedGroupEndIndex,
  highlightedGroupStartIndex,
  highlightedIndexes,
}: GetLastHighlightParameter) => {
  const lastIndex = last(highlightedIndexes);
  return isValidIndex(highlightedGroupEndIndex)
    ? highlightedGroupEndIndex
    : isValidIndex(highlightedGroupStartIndex)
    ? highlightedGroupStartIndex
    : isValidIndex(lastIndex)
    ? lastIndex
    : -1;
};

/**
 * Check if the browser is running on a mac.
 */
export const isMac = () => /Mac|iPod|iPhone|iPad/.test(navigator.platform);

interface GetChangesFromItemClickParameter<Item = any> {
  modifiers: Modifier[];
  index: number;
  items: Item[];
  props: MultishiftBehaviorProps;
  defaultState: MultishiftState<Item>;
  state: MultishiftState<Item>;
  getItemId: GetItemId<Item>;
}

/**
 * Returns true when all items are selected within the list.
 */
export const allItemsSelected = <Item = any>(
  currentItems: Item[],
  newItems: Item[],
  getItemId: GetItemId<Item>,
) =>
  !isEmptyArray(newItems)
    ? newItems.every((newItem) =>
        currentItems.some((item) => getItemId(item) === getItemId(newItem)),
      )
    : false;

/**
 * Adds the list of `newItems` to the list of `prevItems`. If `multiple` is
 * false (or undefined) then simply replace the array with the first item from
 * the `newItems` list.
 */
export const addItems = <Item = any>(
  currentItems: Item[],
  newItems: Item[],
  getItemId: GetItemId<Item>,
  multiple?: boolean,
) => (multiple ? uniqueBy([...currentItems, ...newItems], getItemId, true) : take(newItems, 1));

/**
 * Remove all `removalItems` from the `prevItems` array.
 */
export const removeItems = <Item = any>(
  currentItems: Item[],
  removalItems: Item[],
  getItemId: GetItemId<Item>,
) =>
  currentItems.filter(
    (prevItem) => !removalItems.some((newItem) => getItemId(newItem) === getItemId(prevItem)),
  );

/**
 * Toggles the selected items.
 *
 * Firstly check whether all the items provided are already part of the current
 * items
 *  - If this is the case then remove all the toggleItems.
 *  - If this is not the case then add all the items (without duplication)
 *
 * When multiple is false or undefined it will only return one element.
 */
export const toggleSelectedItems = <Item = any>(
  currentItems: Item[],
  toggleItems: Item[],
  getItemId: GetItemId<Item>,
  multiple?: boolean,
) =>
  allItemsSelected(currentItems, toggleItems, getItemId)
    ? removeItems(currentItems, toggleItems, getItemId)
    : addItems(currentItems, toggleItems, getItemId, multiple);

/**
 * Get an array of all the highlighted items Including any from the currently
 * incomplete group.
 */
export const getHighlightedIndexes = <Item = any>({
  start,
  end,
  indexes,
  items,
  hoveredIndex,
}: GetHighlightedIndexesParameter<Item>) => {
  const max = items.length - 1;
  const groupIndexes = isValidIndex(start)
    ? range(
        clamp({ min: 0, max, value: start }),
        clamp({ min: 0, max, value: isValidIndex(end) ? end : start }),
      )
    : [];

  const hoveredIndexes = isValidIndex(hoveredIndex) ? [hoveredIndex] : [];

  return uniqueArray([...hoveredIndexes, ...indexes, ...groupIndexes], true);
};

/**
 * Checks whether the an index is highlighted within a set of indexes and a
 * highlighted group.
 */
export const checkItemHighlighted = (
  index: number,
  { start, end, indexes }: Omit<GetHighlightedIndexesParameter, 'items'>,
) => indexes.includes(index) || within(index, start, end);

/**
 * Removes any unchanged values from the changes object so that only the correct
 * callbacks are triggered.
 */
export const omitUnchangedState = <Item = any>(
  changes: MultishiftStateProps<Item>,
  { state, getItemId }: OmitUnchangedParameter<Item>,
): MultishiftStateProps<Item> => {
  return omit(changes, (value, key) => {
    if (isArray(value)) {
      if (key === 'selectedItems') {
        return (
          value.length !== state.selectedItems.length ||
          (value as Item[]).some(
            (item, index) => getItemId(item) !== getItemId(state.selectedItems[index]),
          )
        );
      }

      if (key === 'highlightedIndexes') {
        return (
          value.length !== state.highlightedIndexes.length ||
          (value as number[]).some((val, index) => val !== state.highlightedIndexes[index])
        );
      }
    }

    return value !== state[key];
  });
};

/**
 * Create the desired change object when an item is clicked.
 */
export const getChangesFromItemClick = <Item = any>({
  modifiers,
  items,
  defaultState,
  state,
  index,
  props,
  getItemId,
}: GetChangesFromItemClickParameter<Item>): MultishiftStateProps<Item> => {
  const selectedItem = items[index];
  const selectedItems = toggleSelectedItems(
    state.selectedItems,
    [selectedItem],
    getItemId,
    props.multiple,
  );
  const isOpen = props.multiple ? true : defaultState.isOpen;
  const defaultReturn: MultishiftStateProps<Item> = {
    highlightedGroupEndIndex: defaultState.highlightedGroupEndIndex,
    highlightedGroupStartIndex: props.multiple ? index : defaultState.highlightedGroupStartIndex,
  };

  const params = { state, getItemId };

  if (!selectedItem) {
    // TODO check if this logic is desirable
    return { ...defaultReturn, isOpen };
  }

  // Check if the modifier for selecting multiple items is pressed.
  const shiftKeyPressed = modifiers.includes('shiftKey');

  // Check if the modifier for highlighting an additional item is pressed.
  const singleHighlightKeyPressed =
    modifiers.includes(isMac() ? 'metaKey' : 'ctrlKey') && modifiers.length === 1;

  if (!props.multiple) {
    return {
      ...defaultReturn,
      highlightedIndexes: defaultState.highlightedIndexes,
      selectedItems,
    };
  }

  if (singleHighlightKeyPressed) {
    const indexes = getHighlightedIndexes({
      indexes: state.highlightedIndexes,
      start: state.highlightedGroupStartIndex,
      end: state.highlightedGroupEndIndex,
      hoveredIndex: props.includeHoveredIndexInSelection ? state.hoveredIndex : undefined,
      items,
    });

    const isHighlighted = checkItemHighlighted(index, {
      indexes,
      start: state.highlightedGroupStartIndex,
      end: state.highlightedGroupEndIndex,
    });

    const extra = isHighlighted
      ? {
          highlightedIndexes: indexes.filter((ii) => ii !== index),
          highlightedGroupEndIndex: undefined,
          highlightedGroupStartIndex: -1,
        }
      : { highlightedIndexes: indexes, highlightedGroupStartIndex: index };
    const changes = { ...defaultReturn, ...extra };

    return omitUnchangedState(changes, params);
  }

  if (shiftKeyPressed) {
    const indexes = uniqueArray(state.highlightedIndexes, true);
    const extra = isValidIndex(state.highlightedGroupStartIndex)
      ? {
          highlightedIndexes: indexes,
          highlightedGroupStartIndex: state.highlightedGroupStartIndex,
          highlightedGroupEndIndex: index,
        }
      : { highlightedIndexes: indexes, highlightedGroupStartIndex: index };

    const changes = { ...defaultReturn, ...extra };

    return omitUnchangedState(changes, params);
  }

  return omitUnchangedState(
    {
      ...defaultReturn,
      selectedItems,
      isOpen,
      highlightedIndexes: defaultState.highlightedIndexes,
    },
    params,
  );
};

interface GetHighlightedIndexesParameter<Item = any> {
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
  items: Item[];

  /**
   * If included will also include the hovered index.
   */
  hoveredIndex?: number;
}

/**
 * Normalizes the 'key' property of a KeyboardEvent in IE/Edge
 *
 * @param event - the keyboard event
 */
export function getKeyName(event: KeyboardEvent<HTMLElement>) {
  const key = keyName(event.nativeEvent);

  if (key === ' ') {
    return 'Space';
  }

  if (key.toLowerCase() === 'a' && isMac() ? event.metaKey : event.ctrlKey) {
    return 'SelectAll';
  }

  return key;
}

/**
 * Log a warning when using in an internal type that doesn't get resolved.
 */
export const warnIfInternalType = (type: string, message = '') => {
  if (type.startsWith('$$')) {
    console.warn(message);
  }
};

interface CreateChangesFromKeyDownParameter<Item = any> {
  state: MultishiftState<Item>;
  modifiers: Modifier[];
  defaultState: MultishiftState<Item>;
  key: SpecialKey;
  props: MultishiftProps<Item>;
  items: Item[];
  getItemId: GetItemId<Item>;
  disabled: number[];
}

/**
 * Get the changes that have happened when a menu key is pressed.
 */
export function getChangesFromMenuKeyDown<Item = any>(
  parameter: CreateChangesFromKeyDownParameter<Item>,
): MultishiftStateProps<Item> {
  const { modifiers, defaultState, state, key, items, getItemId, props, disabled } = parameter;

  // Check if the modifier for selecting multiple items is pressed.
  const shiftKeyPressed = modifiers.includes('shiftKey');
  const metaKeyPressed = modifiers.includes('metaKey'); // Mac only
  const params = { state, getItemId };
  const mostRecentHighlightIndex = getMostRecentHighlightIndex(state);
  const highlightReset = getHighlightReset(defaultState);

  const indexes = getHighlightedIndexes({
    start: state.highlightedGroupStartIndex,
    end: state.highlightedGroupEndIndex,
    indexes: state.highlightedIndexes,
    hoveredIndex: props.includeHoveredIndexInSelection ? state.hoveredIndex : undefined,
    items,
  }).filter((index) => !disabled.includes(index));

  if (key === 'Escape') {
    return omitUnchangedState(
      {
        ...getHighlightReset(defaultState),
        isOpen: false,
      },
      params,
    );
  }

  if (key === 'Enter' || key === 'Space') {
    const highlightedItems = indexes.map((index) => items[index]);
    const highlights = props.multiple
      ? {}
      : { ...highlightReset, highlightedIndexes: [mostRecentHighlightIndex] };
    const selectedItems = toggleSelectedItems(
      state.selectedItems,
      highlightedItems,
      getItemId,
      props.multiple,
    );

    const changes = {
      ...highlights,
      isOpen: props.multiple ? true : defaultState.isOpen,
      jumpText: defaultState.jumpText,
      selectedItems,
    };

    return omitUnchangedState(changes, params);
  }

  if (key === 'SelectAll') {
    // Create a new indexes array with all the selected item and set the
    // starting index to the previous highlighted index so that it retains that
    // for the next render.
    const changes = {
      highlightedIndexes: range(0, items.length - 1).filter((index) => !disabled.includes(index)),
      highlightedGroupStartIndex: mostRecentHighlightIndex,
      highlightedGroupEndIndex: defaultState.highlightedGroupEndIndex,
    };

    return omitUnchangedState(changes, params);
  }

  if (props.multiple && (key === 'ArrowDown' || key === 'ArrowUp') && shiftKeyPressed) {
    const isDown = key === 'ArrowDown';
    const index = getNextWrappingIndex({
      start: mostRecentHighlightIndex,
      size: items.length,
      circular: false,
      steps: isDown ? 1 : -1,
    });
    const endIndex = !metaKeyPressed ? index : isDown ? items.length - 1 : 0;
    const changes = isValidIndex(state.highlightedGroupStartIndex)
      ? {
          highlightedGroupEndIndex: endIndex,
        }
      : isValidIndex(mostRecentHighlightIndex)
      ? {
          highlightedGroupStartIndex: mostRecentHighlightIndex,
          highlightedGroupEndIndex: endIndex,
        }
      : { highlightedGroupStartIndex: index, highlightedGroupEndIndex: endIndex };

    return omitUnchangedState(changes, params);
  }

  if (
    key === 'Home' ||
    (key === 'ArrowUp' && metaKeyPressed) ||
    key === 'End' ||
    (key === 'ArrowDown' && metaKeyPressed)
  ) {
    const changes = {
      highlightedIndexes: key === 'Home' || key === 'ArrowUp' ? [0] : [items.length - 1],
    };

    return omitUnchangedState(changes, params);
  }

  if (key === 'ArrowDown' || key === 'ArrowUp') {
    const isDown = key === 'ArrowDown';
    const highlightedIndexes = getNextWrappingIndexes({
      start: mostRecentHighlightIndex,
      size: items.length,
      circular: true,
      steps: isDown ? 1 : -1,
    });

    const changes = {
      ...getHighlightReset(defaultState),
      highlightedIndexes,
    };

    return omitUnchangedState(changes, params);
  }

  if (key === 'Tab') {
    const changes = {
      isOpen: false,
    };

    return omitUnchangedState(changes, params);
  }

  return {};
}

export const getChangesFromToggleButtonKeyDown = <Item = any>({
  key,
  defaultState,
  props,
  getItemId,
  state,
}: CreateChangesFromKeyDownParameter<Item>): MultishiftStateProps<Item> => {
  const params = { state, getItemId };

  if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === 'Space') {
    const isNext = key === 'ArrowDown';
    const isPrev = key === 'ArrowUp';
    const highlights =
      props.type === Type.Select
        ? {
            highlightedIndexes: getHighlightedIndexOnOpen(
              props,
              state,
              isNext ? 1 : isPrev ? -1 : 0,
              getItemId,
            ),
          }
        : {};
    const changes = {
      isOpen: true,
      ...highlights,
    };

    return omitUnchangedState(changes, params);
  }

  if (key === 'Escape') {
    return omitUnchangedState(
      {
        ...getHighlightReset(defaultState),
        isOpen: false,
      },
      params,
    );
  }

  return {};
};

export const getChangesFromInputKeyDown = <Item = any>(
  params: CreateChangesFromKeyDownParameter<Item>,
): MultishiftStateProps<Item> => {
  return getChangesFromMenuKeyDown(params);
};

/**
 * Get an array of the event modifiers
 */
export const getModifiers = (event: {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}) => (['altKey', 'shiftKey', 'metaKey', 'ctrlKey'] as const).filter((key) => event[key]);

/**
 * This is intended to be used to compose event handlers. They are executed in
 * order until one of them returns a truthy value.
 */
export function callAllEventHandlers<
  Type extends Event = any,
  Node extends Element = any,
  Synth extends SyntheticEvent<Element, Type> = SyntheticEvent<Node, Type>,
  Method extends (event: Synth, ...args: any[]) => void | undefined | false | true = AnyFunction
>(...fns: Array<Method | undefined | null | false>) {
  return (event: Synth, ...args: any[]) => {
    fns.some((fn) => {
      if (fn) {
        return fn(event, ...args) === true;
      }

      return false;
    });
  };
}

const bindActionCreator = <
  Action,
  Creator extends ActionCreator<Action>,
  ActionDispatch extends Dispatch<any>
>(
  actionCreator: Creator,
  dispatch: ActionDispatch,
) => (...args: Parameters<Creator>) => dispatch(actionCreator(...args));

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they may
 * be invoked directly.
 */
export const bindActionCreators = <
  Action,
  CreatorMap extends ActionCreatorsMapObject<Action>,
  ActionDispatch extends Dispatch<any>
>(
  actionCreators: CreatorMap,
  dispatch: ActionDispatch,
): ActionCreatorMapToDispatch<CreatorMap> => {
  const boundActionCreators: ActionCreatorMapToDispatch<CreatorMap> = object();
  const creatorKeys = keys(actionCreators);

  for (const key of creatorKeys) {
    const actionCreator = actionCreators[key];
    boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
  }

  return boundActionCreators;
};

/**
 * Create a payload for the keydown event.
 */
export function createKeyDownPayload(
  event: KeyboardEvent,
  key: SpecialKey,
  disabled: number[],
): SpecialKeyDownPayload {
  return {
    event,
    key,
    modifiers: getModifiers(event),
    disabled,
  };
}

/**
 * Create a payload for the item click event.
 */
export function createItemClickPayload(event: any, index: number): ItemClickPayload {
  return {
    event,
    modifiers: getModifiers(event),
    index,
  };
}

/**
 * Check that the character is valid for jumpText.
 */
export function isValidCharacterKey(key: string) {
  return /^\S$/.test(key);
}

/**
 * Scroll node into view if necessary
 * @param element - the element that should scroll into view
 * @param menuElement - the menu element of the component
 */
export function scrollIntoView(
  element: Nullable<HTMLElement> | null | undefined,
  menuElement: Nullable<HTMLElement>,
) {
  if (!element || !menuElement) {
    return;
  }

  const actions = computeScrollIntoView(element, {
    boundary: menuElement,
    block: 'nearest',
    scrollMode: 'if-needed',
  });

  actions.forEach(({ el, top, left }) => {
    el.scrollTop = top;
    el.scrollLeft = left;
  });
}

/**
 * Checks whether the passed value is a valid dom node
 *
 * @param domNode - the dom node
 */
export function isNode(domNode: unknown): domNode is Node {
  return isObject(Node)
    ? domNode instanceof Node
    : isObject(domNode) &&
        isNumber((domNode as any).nodeType) &&
        isString((domNode as any).nodeName);
}

/**
 * Checks for an element node like `<p>` or `<div>`.
 *
 * @param domNode - the dom node
 */
export const isHTMLElement = (domNode: unknown): domNode is HTMLElement =>
  isNode(domNode) && domNode.nodeType === Node.ELEMENT_NODE;

/**
 * Checks that this is a browser environment.
 */
export const isBrowser = () =>
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  window.navigator &&
  window.navigator.userAgent;

/**
 * Checks whether the parent contains (or is the same as) the child node.
 */
export const isOrContainsNode = (parent: Node, child: Node | null): child is Node => {
  return parent === child || parent.contains(child);
};

interface OmitUnchangedParameter<Item = any> {
  state: MultishiftState<Item>;
  getItemId: GetItemId<Item>;
}

/**
 * Helpers for transforming the state object.
 */
export const createStateHelpers = <Item = any>(
  { getItemId = defaultGetItemId, multiple }: MultishiftProps<Item>,
  state: MultishiftState<Item>,
) => ({
  addItems: (itemsToAdd: Item[]) => addItems(state.selectedItems, itemsToAdd, getItemId, multiple),
  addItem: (itemToAdd: Item) => addItems(state.selectedItems, [itemToAdd], getItemId, multiple),
  removeItems: (itemsToRemove: Item[]) =>
    removeItems(state.selectedItems, itemsToRemove, getItemId),
  removeItem: (itemToRemove: Item) => removeItems(state.selectedItems, [itemToRemove], getItemId),
  toggleItems: (itemsToToggle: Item[]) =>
    removeItems(state.selectedItems, itemsToToggle, getItemId),
  toggleItem: (itemToToggle: Item) => removeItems(state.selectedItems, [itemToToggle], getItemId),
});
