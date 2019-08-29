// See https://github.com/Autodesk/hig/blob/54814ecfffa376cb4fe3f3a5adfce8169fce9fde/packages/multi-downshift/src/Multishift.js#L1-L211
// See https://codesandbox.io/s/github/kentcdodds/downshift-examples/tree/master/?module=%2Fsrc%2Fordered-examples%2F03-typeahead.js&moduleview=1
import { isEqual, isFunction, isNumber, isUndefined, keys, noop, omit } from '@remirror/core-helpers';
import { PartialWithRequiredKeys } from '@remirror/core-types';
import { usePrevious, useSetState } from '@remirror/react-hooks';
import Downshift, {
  ControllerStateAndHelpers,
  DownshiftProps,
  DownshiftState,
  StateChangeOptions,
} from 'downshift';
import React, { useRef } from 'react';
import {
  Callback,
  EventHandlerChangeSet,
  GetRemoveButtonOptions,
  GetRemoveButtonReturn,
  MultishiftActions,
  MultishiftControllerStateAndHelpers,
  MultishiftProps,
  MultishiftState,
  MultishiftStateChangeOptions,
  MultishiftStateChangeTypes,
  SetMultiHighlightIndexesParam,
} from './multishift-types';
import {
  callAllEventHandlers,
  checkItemHighlighted,
  defaultSelectedItemsToString,
  getAllMultiHighlightIndexes,
  getModifiers,
  isMac,
  pickStateKeysOnly,
  uniqueAndSortedIndexes,
  withType,
} from './multishift-utils';

type MultiStateChangeWithType<GItem = any> = PartialWithRequiredKeys<
  MultishiftStateChangeOptions<GItem>,
  'type'
>;

/**
 * A downshift component which supports multiple selection.
 */
export const Multishift = <GItem extends unknown = any>({
  selectedItemsToString = defaultSelectedItemsToString,
  initialHighlightIndexes: initialHighlightedIndexes,
  defaultMultiHighlightIndexes: defaultHighlightedIndexes = initialHighlightedIndexes || [],
  initialSelectedItems,
  defaultSelectedItems = initialSelectedItems || [],
  initialIsOpen,
  defaultIsOpen = initialIsOpen || false,
  initialHighlightedIndex,
  defaultHighlightedIndex = initialHighlightedIndex || null,
  initialMultiHighlightStartIndex,
  defaultMultiHighlightStartIndex = initialMultiHighlightStartIndex || null,
  initialMultiHighlightEndIndex,
  defaultMultiHighlightEndIndex = initialMultiHighlightEndIndex || defaultMultiHighlightStartIndex,
  initialInputValue = '',
  multiple,
  closeOnSelection,
  onInputValueChange = noop,
  stateReducer = (_, stateToSet) => stateToSet,
  onStateChange = noop,
  onSelect = noop,
  onChange = noop,
  ...props
}: MultishiftProps<GItem>) => {
  // Refs
  const disabledItemsRef = useRef<number[]>([]); // Disabled items should not be selectable and this keeps track so that arrow key events can skip them.
  const itemsRef = useRef<GItem[]>([]);
  const stateAndHelpersRef = useRef<ControllerStateAndHelpers<GItem>>();

  const [state, set] = useSetState<MultishiftState<GItem>>({
    highlightedIndex: defaultHighlightedIndex,
    multiHighlightStartIndex: defaultMultiHighlightStartIndex,
    multiHighlightEndIndex: defaultMultiHighlightStartIndex,
    multiHighlightIndexes: defaultHighlightedIndexes,
    inputValue: initialInputValue,
    isOpen: defaultIsOpen,
    selectedItems: defaultSelectedItems,
  });

  type Props = typeof props;
  /**
   * Check if the passed prop is a controlled prop.
   */
  const isControlledProp = (key: keyof Props) =>
    ['selectedItems', 'multiHighlightIndexes'].includes(key) ? !!props[key] : !isUndefined(props[key]);

  const selectedItems = props.selectedItems || state.selectedItems;
  const multiHighlightIndexes = props.multiHighlightIndexes || state.multiHighlightIndexes;
  const isOpen = !isUndefined(props.isOpen) ? props.isOpen : state.isOpen;
  const highlightedIndex = !isUndefined(props.highlightedIndex)
    ? props.highlightedIndex
    : state.highlightedIndex;
  const multiHighlightStartIndex = !isUndefined(props.multiHighlightStartIndex)
    ? props.multiHighlightStartIndex
    : state.multiHighlightStartIndex;
  const multiHighlightEndIndex = !isUndefined(props.multiHighlightEndIndex)
    ? props.multiHighlightEndIndex
    : state.multiHighlightEndIndex;
  const inputValue = !isUndefined(props.inputValue) ? props.inputValue : state.inputValue;

  const allState: MultishiftState<GItem> = {
    highlightedIndex,
    multiHighlightStartIndex,
    multiHighlightEndIndex,
    multiHighlightIndexes,
    inputValue,
    isOpen,
    selectedItems,
  };

  const controlledState: Partial<MultishiftState> = {};
  (['isOpen', 'inputValue', 'highlightedIndex'] as const).forEach(key => {
    if (isControlledProp(key)) {
      controlledState[key] = allState[key] as any;
    }
  });

  // Keeps a stored version of the selectedItems.
  const previousSelectedItems = usePrevious(selectedItems);

  const createChangeSet = (current: GItem[]): EventHandlerChangeSet<GItem> => {
    return {
      current,
      previous: previousSelectedItems || [],
    };
  };

  /**
   * Sets the state for the component Multishift component.
   */
  const setState: MultishiftActions<GItem>['setState'] = (stateToSet, callback) => {
    const onStateChangeArg: MultiStateChangeWithType<GItem> = withType({});
    let shouldTriggerOnSelect: boolean;
    let onChangeArg: GItem[] | undefined;
    let onSelectArg: GItem[];

    if (!isFunction(stateToSet) && stateToSet.hasOwnProperty('inputValue')) {
      onInputValueChange(stateToSet.inputValue!, {
        ...getStateAndHelpers(),
        ...stateToSet,
      });
    }

    let newStateToSet: MultiStateChangeWithType<GItem> = isFunction(stateToSet)
      ? withType(stateToSet(allState))
      : withType(stateToSet);

    newStateToSet = stateReducer(allState, newStateToSet);
    shouldTriggerOnSelect = newStateToSet.hasOwnProperty('selectedItems');

    // Hold the value to return from the state setting function
    const nextState: Partial<MultishiftState<GItem>> = {};

    onSelectArg = newStateToSet.selectedItems || [];
    onChangeArg =
      shouldTriggerOnSelect && !isEqual(newStateToSet.selectedItems, allState.selectedItems)
        ? newStateToSet.selectedItems
        : undefined;
    newStateToSet.type = newStateToSet.type || Downshift.stateChangeTypes.unknown;
    onStateChangeArg.type = newStateToSet.type;

    keys(omit(newStateToSet, 'type')).forEach(key => {
      if (allState[key] !== newStateToSet[key]) {
        onStateChangeArg[key] = newStateToSet[key] as any;
      }

      // if it's coming from props, then we don't care to set it internally
      if (!isControlledProp(key)) {
        nextState[key] = newStateToSet[key] as any;
      }
    });

    const setStateCallback = createSetStateCallback({
      callback,
      onStateChangeArg,
      onChangeArg,
      onSelectArg,
      shouldTriggerOnSelect,
    });

    set(nextState, setStateCallback);
  };

  interface CreateSetStateCallbackParams {
    callback?: Callback;
    onStateChangeArg: PartialWithRequiredKeys<MultishiftStateChangeOptions<GItem>, 'type'>;
    onChangeArg?: GItem[];
    onSelectArg: GItem[];
    shouldTriggerOnSelect: boolean;
  }

  const createSetStateCallback = ({
    callback,
    onStateChangeArg,
    onChangeArg,
    onSelectArg,
    shouldTriggerOnSelect,
  }: CreateSetStateCallbackParams) => () => {
    if (isFunction(callback)) {
      callback();

      const hasMoreStateThanType = Object.keys(onStateChangeArg).length > 1;
      if (hasMoreStateThanType) {
        onStateChange(onStateChangeArg, getStateAndHelpers());
      }

      if (shouldTriggerOnSelect) {
        onSelect(createChangeSet(onSelectArg), getStateAndHelpers());
      }

      if (onChangeArg !== undefined) {
        onChange(createChangeSet(onChangeArg), getStateAndHelpers());
      }
    }
  };

  /**
   * Overwrite the current selection with a new one.
   */
  const selectItems = (
    newSelectedItems: GItem[],
    otherStateToSet: Partial<MultishiftStateChangeOptions<GItem>> = {},
    callback?: Callback,
  ) => {
    setState(
      {
        selectedItems: newSelectedItems,
        isOpen: defaultIsOpen,
        inputValue: selectedItemsToString(selectedItems, props.itemToString),
        multiHighlightIndexes: defaultHighlightedIndexes,
        ...pickStateKeysOnly(otherStateToSet),
      },
      callback,
    );
  };

  /**
   * Remove selected items from the list.
   */
  const removeSelectedItems = (
    itemsToRemove: GItem[],
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => {
    const items = selectedItems.filter(selectedItem => !itemsToRemove.includes(selectedItem));
    selectItems(items, otherStateToSet, callback);
  };

  /**
   * Add a list of items to the selection.
   */
  const addSelectedItems = (
    itemsToAdd: GItem[],
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => {
    const items = [...selectedItems, ...itemsToAdd];
    selectItems(items, otherStateToSet, callback);
  };

  /**
   * Remove all items from the selection.
   */
  const clearSelectedItems = (
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => {
    selectItems([], otherStateToSet, callback);
  };

  /**
   * Select items by their index number.
   */
  const selectItemsAtIndexes = (
    indexes: number[],
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => {
    const items = indexes.map(index => itemsRef.current[index]);
    if (!items.length) {
      return;
    }
    selectItems(items, otherStateToSet, callback);
  };

  /**
   * Select all the highlighted items.
   */
  const selectHighlightedItems = (
    otherStateToSet?: Partial<MultishiftStateChangeOptions<GItem>>,
    callback?: Callback,
  ) => {
    selectItemsAtIndexes(multiHighlightIndexes, otherStateToSet, callback);
  };

  /**
   * Set highlighted indexes.
   */
  const setMultiHighlightIndexes = (
    { indexes, start, end }: SetMultiHighlightIndexesParam,
    otherStateToSet: Partial<MultishiftStateChangeOptions<GItem>> = {},
    callback?: Callback,
  ) => {
    setState(
      {
        multiHighlightIndexes: indexes,
        multiHighlightStartIndex: start,
        multiHighlightEndIndex: end,
        ...pickStateKeysOnly(otherStateToSet),
      },
      callback,
    );
  };

  /**
   * Get the remove button props.
   */
  const getRemoveButtonProps = <GElement extends HTMLElement = any>({
    onClick,
    item,
    ...options
  }: GetRemoveButtonOptions<GElement, GItem>): GetRemoveButtonReturn<GElement> => {
    return {
      onClick: callAllEventHandlers(onClick, event => {
        event.stopPropagation();
        removeSelectedItems([item]);
      }),
      role: 'button',
      ...options,
    };
  };

  const setIndividualIndexMultiSelect = (index: number) => {
    const type = isMac() ? MultishiftStateChangeTypes.CmdClickItem : MultishiftStateChangeTypes.CtrlClickItem;
    const indexes = getAllMultiHighlightIndexes({
      indexes: multiHighlightIndexes,
      start: multiHighlightStartIndex,
      end: multiHighlightEndIndex,
    });

    const isHighlighted = checkItemHighlighted(index, {
      indexes,
      start: multiHighlightStartIndex,
      end: multiHighlightEndIndex,
    });

    const params: SetMultiHighlightIndexesParam = isHighlighted
      ? { indexes: indexes.filter(ii => ii !== index), start: null, end: null }
      : { indexes, start: index };

    setMultiHighlightIndexes(params, { type });
  };

  const setMultipleIndexMultiSelect = (index: number) => {
    const indexes = uniqueAndSortedIndexes(multiHighlightIndexes);
    const params: SetMultiHighlightIndexesParam = isNumber(multiHighlightStartIndex)
      ? { indexes, start: multiHighlightStartIndex, end: index }
      : { indexes, start: index };

    setMultiHighlightIndexes(params, { type: MultishiftStateChangeTypes.ShiftClickItem });
  };

  /**
   * Check that the item is the current focus of the highlight.
   */
  const currentHighlight = (index: number) => index === highlightedIndex;

  /**
   * Check that the item is currently highlighted either individually or as part
   * of a multi selection highlight.
   */
  const itemHighlightedAtIndex = (index: number) =>
    checkItemHighlighted(index, {
      start: multiHighlightStartIndex,
      end: multiHighlightEndIndex,
      indexes: multiHighlightIndexes,
    }) || currentHighlight(index);

  type GetItemProps = MultishiftControllerStateAndHelpers<GItem>['getItemProps'];
  const getItemPropsCreator = (getItemProps: GetItemProps): GetItemProps => ({
    item,
    index: ii,
    disabled,
    onClick,
    ...rest
  }) => {
    let index: number;
    if (ii === undefined) {
      itemsRef.current.push(item);
      index = itemsRef.current.indexOf(item);
    } else {
      itemsRef.current[ii] = item;
      index = ii;
    }

    if (disabled) {
      disabledItemsRef.current.push(index);
    }

    return getItemProps({
      ...rest,
      item,
      index: ii,
      ...(currentHighlight(index) ? { 'aria-current': currentHighlight(index) } : {}),
      'aria-selected': itemHighlightedAtIndex(index) && !disabled,
      onClick: callAllEventHandlers(onClick, event => {
        const mods = getModifiers(event);

        // Check if the modifier for selecting multiple items is pressed.
        const selectMultiple = mods.includes('shiftKey') && mods.length === 1;

        // Check if the modifier for highlighting an additional
        const selectIndividual = mods.includes(isMac() ? 'metaKey' : 'ctrlKey') && mods.length === 1;

        if (!multiple || !(selectMultiple || selectIndividual)) {
          return;
        }

        event.nativeEvent.preventDownshiftDefault = true;

        // Do nothing when the item has been disabled.
        if (disabled) {
          return;
        }

        // The following are for soft clicks. When selecting an item with a shift or meta/ctrl click it adds
        // the item to the multi highlight list which can then be added all at once.

        if (selectIndividual) {
          setIndividualIndexMultiSelect(index);
          return;
        }

        // Logically this doesn't seem necessary, but haven't had time to test yet.
        if (selectMultiple) {
          setMultipleIndexMultiSelect(index);
          return;
        }
      }),
    });
  };

  type GetMenuProps = MultishiftControllerStateAndHelpers<GItem>['getMenuProps'];
  const getMenuPropsCreator = (getMenuProps: GetMenuProps): GetMenuProps => (options, otherOptions) => ({
    'aria-multiselectable': multiple,
    ...getMenuProps(options, otherOptions),
  });

  type GetToggleButtonProps = MultishiftControllerStateAndHelpers<GItem>['getToggleButtonProps'];
  const getToggleButtonPropsCreator = (
    getToggleButtonProps: GetToggleButtonProps,
  ): GetToggleButtonProps => options => {
    return getToggleButtonProps(options);
  };

  /**
   * Add the multi-downshift specific helpers to the stateAndHelpers.
   */
  const getStateAndHelpers = (
    {
      getMenuProps,
      getItemProps,
      getToggleButtonProps,
      ...stateAndHelpers
    }: ControllerStateAndHelpers<GItem> = stateAndHelpersRef.current!,
  ): MultishiftControllerStateAndHelpers<GItem> => {
    return {
      // Default
      ...stateAndHelpers,

      // Helpers
      itemHighlightedAtIndex,

      // Actions
      selectItems,
      clearSelectedItems,
      removeSelectedItems,
      addSelectedItems,
      selectItemsAtIndexes,
      selectHighlightedItems,
      setMultiHighlightIndexes,
      setState,

      // Getters
      getToggleButtonProps: getToggleButtonPropsCreator(getToggleButtonProps),
      getMenuProps: getMenuPropsCreator(getMenuProps),
      getItemProps: getItemPropsCreator(getItemProps),
      getRemoveButtonProps,

      // state
      selectedItems,
      multiHighlightIndexes,
      multiHighlightStartIndex,
      multiHighlightEndIndex,
      ...controlledState,
    };
  };

  const onStateChangeHandler = (
    options: StateChangeOptions<GItem>,
    stateAndHelpers: ControllerStateAndHelpers<GItem>,
  ) => {
    // Store a value of the state and helpers for use in the setState method.
    stateAndHelpersRef.current = stateAndHelpers;

    // Options don't need the selectedItem and instead wrap it in an array.
    const enhancedOptions: Partial<MultishiftState<GItem>> = {};
    if (options.hasOwnProperty('selectedItem')) {
      const { selectedItem } = options;
      enhancedOptions.selectedItems = selectedItem
        ? selectedItems.includes(selectedItem)
          ? selectedItems.filter(item => item !== selectedItem)
          : [...selectedItems, selectedItem]
        : [];
    }

    setState({ ...omit(options, ['selectedItem']), ...enhancedOptions });
  };

  /**
   * A downshift state reducer which can update the state based on certain
   * actions.
   *
   * In this case whenever an input is acted on (click or enterKey) the input value
   * is reset and we insure that the input is kept open.
   */
  const downshiftStateReducer = (
    downshiftState: DownshiftState<GItem>,
    changes: StateChangeOptions<GItem>,
  ): Partial<StateChangeOptions<GItem>> => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem: {
        return {
          ...changes,
          highlightedIndex: downshiftState.highlightedIndex,
          isOpen: !isUndefined(closeOnSelection) ? closeOnSelection : multiple,
          inputValue: '',
        };
      }
      default:
        return changes;
    }
  };

  const downshiftProps = (): DownshiftProps<GItem> => {
    const { children, ...otherProps } = props;

    return {
      ...otherProps,
      ...(controlledState as {}),
      selectedItem: null,
      onStateChange: onStateChangeHandler,
      stateReducer: downshiftStateReducer,
    };
  };

  const render = (stateAndHelpers: ControllerStateAndHelpers<GItem>) => {
    stateAndHelpersRef.current = stateAndHelpers;

    // Reset the refs to empty arrays.. They will be repopulated during
    // the render.
    itemsRef.current = [];
    disabledItemsRef.current = [];

    return props.children(getStateAndHelpers(stateAndHelpers));
  };

  return <Downshift {...downshiftProps()}>{render}</Downshift>;
};
