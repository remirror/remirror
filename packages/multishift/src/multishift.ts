import { debounce, includes, isNullOrUndefined, isUndefined } from '@remirror/core-helpers';
import { useEffectOnce, useEffectOnUpdate, useTimeouts } from '@remirror/react-hooks';
import composeRefs from '@seznam/compose-react-refs';
import { ChangeEvent, HTMLProps, Ref, SyntheticEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import * as MultishiftActions from './multishift-action-creators';
import {
  SPECIAL_INPUT_KEYS,
  SPECIAL_MENU_KEYS,
  SPECIAL_TOGGLE_BUTTON_KEYS,
  Type,
} from './multishift-constants';
import {
  useElementIds,
  useElementRefs,
  useMultishiftReducer,
  useOuterEventListener,
  useSetA11y,
} from './multishift-hooks';
import {
  AllMultishiftDispatchActions,
  GetComboBoxPropsOptions,
  GetComboBoxPropsReturn,
  GetItemPropsOptions,
  GetLabelPropsWithRefReturn,
  GetPropsWithRefOptions,
  GetPropsWithRefReturn,
  GetRemoveButtonOptions,
  GetRemoveButtonReturn,
  IgnoredElementOptions,
  MultishiftFocusHelpers,
  MultishiftProps,
  MultishiftReturn,
} from './multishift-types';
import {
  bindActionCreators,
  callAllEventHandlers,
  checkItemHighlighted,
  createItemClickPayload,
  createKeyDownPayload,
  createStateHelpers,
  defaultGetItemId,
  getItemIndex,
  getKeyName,
  getMostRecentHighlightIndex,
  getState,
  isHTMLElement,
  isOrContainsNode,
  isValidCharacterKey,
  isValidIndex,
  scrollIntoView,
} from './multishift-utils';

/**
 * ### `useMultishift`
 *
 * Multishift is a hook that provides all the necessary tools for building
 * accessible dropdown components.
 *
 * It supports `select` and `autocomplete` drop down experiences with built in
 * support for multi-selection.
 *
 * The library borrows (and steals) heavily from `downshift` but also adds some features
 * which are really important for the `remirror` project.
 *
 * - Focus on typescript support
 * - No React Native support
 * - Multi selection support
 *
 * Eventually some of the code will be contributed back to the downshift library.
 */
export const useMultishift = <GItem = any>(props: MultishiftProps<GItem>): MultishiftReturn<GItem> => {
  const {
    type,
    customA11yStatusMessage,
    getA11yStatusMessage,
    a11yStatusTimeout,
    items,
    getItemId = defaultGetItemId,
  } = props;
  const [state, dispatch] = useMultishiftReducer<GItem>(props);
  const actions = useMemo(
    () => bindActionCreators(MultishiftActions, dispatch) as AllMultishiftDispatchActions<GItem>,
    [dispatch],
  );
  // const previousItems = usePrevious(items);

  // if (previousItems && previousItems.length !== items.length) {
  //   actions.clearHighlighted();
  // }

  const [a11yStatus, updateA11yStatus] = useSetA11y({
    state,
    items,
    customA11yStatusMessage,
    getA11yStatusMessage,
    timeout: a11yStatusTimeout,
  });

  const stateProps = getState(state, props);
  const {
    highlightedIndexes,
    highlightedGroupEndIndex,
    highlightedGroupStartIndex,
    selectedItems,
    hoveredIndex,
    inputValue,
    isOpen,
    jumpText,
  } = stateProps;

  const { getItemA11yId, labelId, menuId, toggleButtonId, inputId } = useElementIds(props);

  // const [setInternalTimeout] = useTimeouts();

  // Refs
  const refs = useElementRefs();
  const shouldScroll = useRef(true);
  const clearJumpText = debounce(500, actions.clearJumpText);
  const disabled = useRef<number[]>([]);
  disabled.current = [];

  const contextRef = useOuterEventListener(refs, stateProps, {
    outerMouseUp: actions.outerMouseUp,
    outerTouchEnd: actions.outerTouchEnd,
  });
  const [setInternalTimeout, clearTimeouts] = useTimeouts();

  // The most recently highlighted index.
  const mostRecentHighlightedIndex = getMostRecentHighlightIndex({
    highlightedGroupEndIndex,
    highlightedGroupStartIndex,
    highlightedIndexes,
  });

  useEffectOnce(() => clearTimeouts());

  useEffectOnUpdate(() => {
    if (!jumpText) {
      return;
    }

    clearJumpText();
  }, [jumpText]);

  // Focus on the menu if the starting position isOpen.
  useEffectOnce(() => {
    if (isOpen) {
      if (type === Type.ComboBox && refs.input.current) {
        refs.input.current.focus();
      } else if (refs.menu.current && type !== Type.ControlledMenu) {
        refs.menu.current.focus();
      }
    }
  });

  // Every time `isOpen` changes update the focus to the input / toggleButton
  // depending on the type of editor.
  useEffectOnUpdate(() => {
    if (isOpen) {
      if (type === Type.ComboBox && refs.input.current) {
        refs.input.current.focus();
      } else if (refs.menu.current && type !== Type.ControlledMenu) {
        refs.menu.current.focus();
      }
    } else if (!isOpen && document.activeElement === refs.menu.current) {
      if (type === Type.ComboBox && refs.input.current) {
        refs.input.current.focus();
      } else if (refs.toggleButton.current) {
        refs.toggleButton.current.focus();
      }
    }
  }, [isOpen]);

  // Scroll on highlighted item if change comes from keyboard.
  useEffect(() => {
    if (!isValidIndex(mostRecentHighlightedIndex) || !isOpen || !refs.items.current.length) {
      return;
    }

    if (shouldScroll.current === false) {
      shouldScroll.current = true;
    } else if (refs.menu.current) {
      scrollIntoView(refs.items.current[mostRecentHighlightedIndex], refs.menu.current);
    }
  }, [mostRecentHighlightedIndex]);

  const itemHighlightedAtIndex = (index: number) => {
    return checkItemHighlighted(index, {
      start: highlightedGroupStartIndex,
      end: highlightedGroupEndIndex,
      indexes: highlightedIndexes,
    });
  };

  const itemIsSelected = useCallback(
    (item: GItem) => selectedItems.map(getItemId).includes(getItemId(item)),
    [selectedItems],
  );
  const indexOfItem = useCallback((item: GItem) => items.map(getItemId).indexOf(getItemId(item)), [items]);

  const getComboBoxProps = <GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    { refKey = 'ref' as GRefKey, ref, ...rest }: GetComboBoxPropsOptions<GElement, GRefKey> = {
      refKey: 'ref' as GRefKey,
    },
  ): GetComboBoxPropsReturn<GElement, GRefKey> => {
    if (type !== Type.ComboBox) {
      throw new Error('`getComboBoxProps` is only available for the autocomplete dropdown');
    }

    const extra = isUndefined(rest['aria-label']) ? { 'aria-labelledby': labelId } : {};

    return {
      [refKey]: composeRefs(ref as Ref<GElement>, refs.comboBox),
      role: 'combobox',
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox',
      'aria-owns': isOpen ? menuId : null,
      ...extra,
      ...rest,
    } as GetComboBoxPropsReturn<GElement, GRefKey>;
  };

  const getInputProps = <GElement extends HTMLInputElement = any, GRefKey extends string = 'ref'>(
    {
      onKeyDown,
      onBlur,
      onChange,
      onInput,
      refKey = 'ref' as GRefKey,
      ref,
      ...rest
    }: GetPropsWithRefOptions<GElement, GRefKey> = { refKey: 'ref' as GRefKey },
  ): GetPropsWithRefReturn<GElement, GRefKey> => {
    if (type !== Type.ComboBox) {
      throw new Error('`getInputProps` is only available for the `autocomplete` dropdown');
    }

    const activeDescendant = isValidIndex(mostRecentHighlightedIndex)
      ? {
          'aria-activedescendant': getItemA11yId(mostRecentHighlightedIndex),
        }
      : {};

    let eventHandlers: HTMLProps<GElement> = {
      onChange: callAllEventHandlers(onChange, onInput, event => {
        actions.inputValueChange((event as ChangeEvent<GElement>).target.value);
      }),
      onKeyDown: callAllEventHandlers(onKeyDown, event => {
        const key = getKeyName(event);
        if (includes(SPECIAL_INPUT_KEYS, key)) {
          actions.inputSpecialKeyDown(createKeyDownPayload(event, key, disabled.current));
          event.preventDefault();
        }
      }),
      // TODO test this blur handler.
      onBlur: callAllEventHandlers(onBlur, () => {
        setInternalTimeout(() => {
          const multishiftActive =
            isHTMLElement(document.activeElement) &&
            refs.comboBox.current &&
            refs.comboBox.current.contains(document.activeElement);
          if (!contextRef.current.isMouseDown && !multishiftActive) {
            actions.inputBlur();
          }
        });
      }),
    };

    if (rest.disabled) {
      eventHandlers = {};
    }

    return {
      [refKey]: composeRefs(ref as Ref<GElement>, refs.input),
      'aria-autocomplete': 'list',
      ...activeDescendant,
      'aria-controls': isOpen ? menuId : null,
      'aria-labelledby': labelId,
      // https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
      // revert back since autocomplete="nope" is ignored on latest Chrome and Opera
      autoComplete: 'off',
      value: inputValue,
      id: inputId,
      ...eventHandlers,
      ...rest,
    } as any;
  };

  const getMenuProps = <GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    {
      onKeyDown,
      onBlur,
      refKey = 'ref' as GRefKey,
      ref,
      ...rest
    }: GetPropsWithRefOptions<GElement, GRefKey> = { refKey: 'ref' as GRefKey },
  ): GetPropsWithRefReturn<GElement, GRefKey> => {
    const multi = props.multiple ? { 'aria-multiselectable': props.multiple } : {};
    const activeDescendant = highlightedIndexes.length
      ? {
          'aria-activedescendant': getItemA11yId(mostRecentHighlightedIndex),
        }
      : {};

    let eventHandlers: HTMLProps<GElement> = {
      onKeyDown: callAllEventHandlers(onKeyDown, event => {
        const key = getKeyName(event);

        if (includes(SPECIAL_MENU_KEYS, key)) {
          actions.menuSpecialKeyDown(createKeyDownPayload(event, key, disabled.current));

          if (key !== 'Tab') {
            event.preventDefault();
          }
        } else if (isValidCharacterKey(key)) {
          actions.menuCharacterKeyDown(key);
        }
      }),
      onBlur: callAllEventHandlers(onBlur, event => {
        const blurTarget = event.target;
        setInternalTimeout(() => {
          if (
            !contextRef.current.isMouseDown &&
            (isNullOrUndefined(document.activeElement) ||
              (![
                refs.comboBox.current,
                refs.input.current,
                refs.toggleButton.current,
                ...refs.items.current,
                ...refs.ignored.current,
              ].some(node => node && isOrContainsNode(node, document.activeElement)) &&
                document.activeElement !== blurTarget))
          ) {
            actions.menuBlur();
          }
        });
      }),
    };

    if (rest.disabled) {
      eventHandlers = {};
    }

    return {
      [refKey]: composeRefs(ref as Ref<GElement>, refs.menu),
      id: menuId,
      role: 'listbox',
      'aria-labelledby': labelId,
      tabIndex: -1,
      ...multi,
      ...activeDescendant,
      ...eventHandlers,
      ...rest,
    } as GetPropsWithRefReturn<GElement, GRefKey>;
  };

  const getToggleButtonProps = <GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    {
      onClick,
      onKeyDown,
      onBlur,
      refKey = 'ref' as GRefKey,
      ref,
      ...rest
    }: GetPropsWithRefOptions<GElement, GRefKey> = { refKey: 'ref' as GRefKey },
  ): GetPropsWithRefReturn<GElement, GRefKey> => {
    if (type === Type.ControlledMenu) {
      throw new Error('The toggle button props should not be used for the controlled menu');
    }
    const isInternalEvent = <GEvent extends SyntheticEvent = any>(event: GEvent) =>
      [refs.input.current, refs.menu.current, ...refs.items.current].some(
        node => node && isOrContainsNode(node, event.target as Node),
      );
    let eventHandlers: HTMLProps<GElement> = {
      onClick: callAllEventHandlers(onClick, () => actions.toggleButtonClick()),
      onKeyDown: callAllEventHandlers(onKeyDown, event => {
        const key = getKeyName(event);

        if (isInternalEvent(event)) {
          return;
        }

        if (includes(SPECIAL_TOGGLE_BUTTON_KEYS, key)) {
          actions.toggleButtonSpecialKeyDown(createKeyDownPayload(event, key, disabled.current));
          event.preventDefault();
        }
      }),
      onBlur: callAllEventHandlers(onBlur, event => {
        if (isInternalEvent(event)) {
          return;
        }
        const blurTarget = event.target; // Save blur target for comparison with activeElement later
        // Need setTimeout, so that when the user presses Tab, the activeElement is the next focused element, not body element
        setInternalTimeout(() => {
          if (
            !contextRef.current.isMouseDown &&
            (isNullOrUndefined(document.activeElement) || document.activeElement.id !== menuId) &&
            document.activeElement !== blurTarget // Do nothing if we refocus the same element again (to solve issue in Safari on iOS)
          ) {
            actions.toggleButtonBlur();
          }
        });
      }),
    };

    if (rest.disabled) {
      eventHandlers = {};
    }

    const extra = Type.Select ? { 'aria-expanded': isOpen } : {};
    const ariaLabel = isUndefined(rest['aria-label'])
      ? { 'aria-labelledby': `${labelId} ${toggleButtonId}` }
      : {};

    return {
      [refKey]: composeRefs(ref as Ref<GElement>, refs.toggleButton),
      type: 'button',
      role: 'button',
      id: toggleButtonId,
      'aria-haspopup': Type.ComboBox ? true : 'listbox',
      ...ariaLabel,
      ...extra,
      ...eventHandlers,
      ...rest,
    } as any;
  };

  const getItemProps = <GElement extends HTMLElement = any, GRefKey extends string = 'ref'>({
    item,
    index,
    refKey = 'ref' as GRefKey,
    ref,
    onMouseMove,
    onMouseLeave,
    onClick,
    ...rest
  }: GetItemPropsOptions<GElement, GRefKey, GItem>): GetPropsWithRefReturn<GElement, GRefKey> => {
    const itemIndex = getItemIndex(index, item, items);
    if (!isValidIndex(itemIndex)) {
      throw new Error('Pass either item or item index in getItemProps!');
    }

    let eventHandlers: HTMLProps<GElement> = {
      onMouseMove: callAllEventHandlers(onMouseMove, () => actions.itemMouseMove(itemIndex)),
      onMouseLeave: callAllEventHandlers(onMouseLeave, () => actions.itemMouseLeave(itemIndex)),

      onClick: callAllEventHandlers(onClick, event => {
        event.preventDefault();
        actions.itemClick(createItemClickPayload(event, itemIndex));
      }),
    };

    if (rest.disabled) {
      disabled.current.push(itemIndex);
      eventHandlers = {};
    }

    return {
      [refKey]: composeRefs(ref as Ref<GElement>, itemNode => {
        if (itemNode) {
          refs.items.current.push(itemNode);
        }
      }),
      role: 'option',
      'aria-current': index === hoveredIndex || index === mostRecentHighlightedIndex,
      'aria-selected': (itemHighlightedAtIndex(index) || index === hoveredIndex) && !rest.disabled,
      id: getItemA11yId(itemIndex),
      ...eventHandlers,
      ...rest,
    } as GetPropsWithRefReturn<GElement, GRefKey>;
  };

  const getIgnoredElementProps = <GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    {
      refKey = 'ref' as GRefKey,
      ref,
      onMouseMove,
      onFocus,
      ...rest
    }: IgnoredElementOptions<GElement, GRefKey> = { refKey: 'ref' as GRefKey },
  ): GetPropsWithRefReturn<GElement, GRefKey> => {
    let eventHandlers: HTMLProps<GElement> = {};

    if (rest.disabled) {
      eventHandlers = {};
    }

    return {
      [refKey]: composeRefs(ref as Ref<GElement>, node => {
        if (node && !rest.disabled) {
          refs.ignored.current.push(node);
        }
      }),
      ...eventHandlers,
      ...rest,
    } as GetPropsWithRefReturn<GElement, GRefKey>;
  };

  const getLabelProps = <GElement extends HTMLElement = any, GRefKey extends string = 'ref'>(
    { refKey = 'ref' as GRefKey, ref, ...rest }: IgnoredElementOptions<GElement, GRefKey> = {
      refKey: 'ref' as GRefKey,
    },
  ): GetLabelPropsWithRefReturn<GElement, GRefKey> =>
    ({
      [refKey]: composeRefs(ref as Ref<GElement>, node => {
        if (node) {
          refs.ignored.current.push(node);
        }
      }),
      id: labelId,
      htmlFor: type === 'combobox' && refs.input.current ? inputId : menuId,
      ...rest,
    } as GetLabelPropsWithRefReturn<GElement, GRefKey>);

  const getRemoveButtonProps = <GElement extends HTMLElement = any>({
    onClick,
    item,
    ...rest
  }: GetRemoveButtonOptions<GElement, GItem>): GetRemoveButtonReturn<GElement> => {
    let eventHandlers: Pick<GetRemoveButtonReturn<GElement>, 'onClick'> = {
      onClick: callAllEventHandlers(onClick, () => {
        actions.removeSelectedItem(item);
      }),
    };

    if (rest.disabled) {
      eventHandlers = {};
    }

    return {
      ...eventHandlers,
      role: 'button',
      ...rest,
    };
  };

  const focusHelpers = useMemo(
    (): MultishiftFocusHelpers => ({
      focusInput() {
        if (type !== Type.ComboBox) {
          throw new Error(`The input element cannot be focused for this type of dropdown: ${type}`);
        }

        if (refs.input.current) {
          refs.input.current.focus();
        }
      },
      focusToggleButton() {
        if (refs.toggleButton.current) {
          refs.toggleButton.current.focus();
        }
      },
      focusMenu() {
        if (refs.menu.current) {
          refs.menu.current.focus();
        }
      },
      focusMenuItem(index: number) {
        if (refs.items.current[index]) {
          refs.items.current[index].focus();
        }
      },
    }),
    [],
  );

  const stateHelpers = createStateHelpers(props, state);

  return {
    // State
    highlightedIndexes,
    highlightedGroupEndIndex,
    highlightedGroupStartIndex,
    selectedItems,
    hoveredIndex,
    inputValue,
    isOpen,
    jumpText,

    // StateHelpers
    ...stateHelpers,

    // Data
    mostRecentHighlightedIndex,

    // Helpers
    itemHighlightedAtIndex,
    itemIsSelected,
    indexOfItem,

    // A11y
    a11yStatus,
    updateA11yStatus,

    // Actions
    dispatch,
    clearSelection: actions.clearSelection,
    selectItems: actions.selectItems,
    selectItem: actions.selectItem,
    clearHighlighted: actions.clearHighlighted,
    inputValueChange: actions.inputValueChange,
    removeSelectedItem: actions.removeSelectedItem,
    removeSelectedItems: actions.removeSelectedItems,
    setHoverItemIndex: actions.setHoverItemIndex,
    toggleMenu: actions.toggleMenu,
    closeMenu: actions.closeMenu,
    openMenu: actions.openMenu,
    setHighlightedIndexes: actions.setHighlightedIndexes,
    setHighlightedIndex: actions.setHighlightedIndex,
    reset: actions.reset,
    setState: actions.setState,
    clearInputValue: actions.clearInputValue,
    clearJumpText: actions.clearJumpText,

    // Prop Getters
    getMenuProps,
    getComboBoxProps,
    getToggleButtonProps,
    getItemProps,
    getInputProps,
    getRemoveButtonProps,
    getLabelProps,
    getIgnoredElementProps,

    // Focus Helpers
    ...focusHelpers,
  };
};
