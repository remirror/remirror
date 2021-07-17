import composeRefs from '@seznam/compose-react-refs';
import {
  ChangeEvent,
  HTMLProps,
  Ref,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {
  debounce,
  includes,
  isEmptyArray,
  isNullOrUndefined,
  isUndefined,
  object,
} from '@remirror/core-helpers';

import { Actions } from './multishift-action-creators';
import {
  SPECIAL_INPUT_KEYS,
  SPECIAL_MENU_KEYS,
  SPECIAL_TOGGLE_BUTTON_KEYS,
  Type,
} from './multishift-constants';
import {
  useEffectOnUpdate,
  useElementIds,
  useElementRefs,
  useMultishiftReducer,
  useOuterEventListener,
  useSetA11y,
  useTimeouts,
} from './multishift-hooks';
import type {
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
 * Multishift is a hook that provides all the necessary tools for building
 * accessible dropdown components.
 *
 * @remarks
 *
 * It supports `select` and `autocomplete` drop down experiences with built in
 * support for multi-selection.
 *
 * The library borrows (and steals) heavily from `downshift` but also adds some
 * features which are really important for the `remirror` project.
 *
 * - Focus on typescript support
 * - No React Native support
 * - Multi selection support
 * - Render with **only** menu support (fully controlled)
 *
 * Eventually some of the code will be contributed back to the downshift
 * library.
 */
export const useMultishift = <Item = any>(props: MultishiftProps<Item>): MultishiftReturn<Item> => {
  const {
    type,
    customA11yStatusMessage,
    getA11yStatusMessage,
    items,
    getItemId = defaultGetItemId,
    multiple,
  } = props;
  const [state, dispatch] = useMultishiftReducer<Item>(props);
  const actions = useMemo(() => bindActionCreators(Actions, dispatch), [dispatch]);

  useSetA11y({ state, items, customA11yStatusMessage, getA11yStatusMessage });

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
    } else if (document.activeElement === refs.menu.current) {
      if (type === Type.ComboBox && refs.input.current) {
        refs.input.current.focus();
      } else if (refs.toggleButton.current) {
        refs.toggleButton.current.focus();
      }
    }
  }, [isOpen]);

  // Scroll on highlighted item if change comes from keyboard.
  useEffect(() => {
    if (!isValidIndex(mostRecentHighlightedIndex) || !isOpen || isEmptyArray(refs.items.current)) {
      return;
    }

    if (shouldScroll.current === false) {
      shouldScroll.current = true;
    } else if (refs.menu.current) {
      scrollIntoView(refs.items.current[mostRecentHighlightedIndex], refs.menu.current);
    }
  }, [isOpen, mostRecentHighlightedIndex, refs.items, refs.menu]);

  const itemHighlightedAtIndex = useCallback(
    (index: number) => {
      const isHovered = index === hoveredIndex;
      return (
        checkItemHighlighted(index, {
          start: highlightedGroupStartIndex,
          end: highlightedGroupEndIndex,
          indexes: highlightedIndexes,
        }) || (multiple ? isHovered : !isValidIndex(mostRecentHighlightedIndex) && isHovered)
      );
    },
    [
      highlightedGroupEndIndex,
      highlightedGroupStartIndex,
      highlightedIndexes,
      hoveredIndex,
      mostRecentHighlightedIndex,
      multiple,
    ],
  );

  const indexIsHovered = useCallback(
    (index: number) => {
      return index === hoveredIndex;
    },
    [hoveredIndex],
  );

  const itemIsHovered = useCallback(
    (item: Item) => {
      return item === items[hoveredIndex];
    },
    [hoveredIndex, items],
  );

  const indexIsSelected = useCallback(
    (index: number) =>
      checkItemHighlighted(index, {
        start: highlightedGroupStartIndex,
        end: highlightedGroupEndIndex,
        indexes: highlightedIndexes,
      }),
    [highlightedGroupEndIndex, highlightedGroupStartIndex, highlightedIndexes],
  );
  const itemIsSelected = useCallback(
    (item: Item) => selectedItems.map(getItemId).includes(getItemId(item)),
    [getItemId, selectedItems],
  );
  const indexOfItem = useCallback(
    (item: Item) => items.map(getItemId).indexOf(getItemId(item)),
    [getItemId, items],
  );

  const getComboBoxProps = useCallback(
    <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
      options: GetComboBoxPropsOptions<Element, RefKey> = {
        refKey: 'ref' as RefKey,
      },
    ): GetComboBoxPropsReturn<Element, RefKey> => {
      const { refKey = 'ref' as RefKey, ref, ...rest } = options;

      if (type !== Type.ComboBox) {
        throw new Error('`getComboBoxProps` is only available for the autocomplete dropdown');
      }

      const extra = isUndefined(rest['aria-label']) ? { 'aria-labelledby': labelId } : {};

      return {
        [refKey]: composeRefs(ref as Ref<Element>, refs.comboBox),
        role: 'combobox',
        'aria-expanded': isOpen,
        'aria-haspopup': 'listbox',
        'aria-owns': isOpen ? menuId : null,
        ...extra,
        ...rest,
      } as GetComboBoxPropsReturn<Element, RefKey>;
    },
    [isOpen, labelId, menuId, refs.comboBox, type],
  );

  const getInputProps = useCallback(
    <DomElement extends HTMLInputElement = any, RefKey extends string = 'ref'>(
      options: GetPropsWithRefOptions<DomElement, RefKey> = { refKey: 'ref' as RefKey },
    ): GetPropsWithRefReturn<DomElement, RefKey> => {
      const {
        onKeyDown,
        onBlur,
        onChange,
        onInput,
        refKey = 'ref' as RefKey,
        ref,
        ...rest
      } = options;

      if (type !== Type.ComboBox) {
        throw new Error('`getInputProps` is only available for the `autocomplete` dropdown');
      }

      const activeDescendant = isValidIndex(mostRecentHighlightedIndex)
        ? {
            'aria-activedescendant': getItemA11yId(mostRecentHighlightedIndex),
          }
        : {};

      let eventHandlers: HTMLProps<DomElement> = {
        onChange: callAllEventHandlers(onChange, onInput, (event) => {
          actions.inputValueChange((event as ChangeEvent<DomElement>).target.value);
        }),
        onKeyDown: callAllEventHandlers(onKeyDown, (event) => {
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
        eventHandlers = object();
      }

      return {
        [refKey]: composeRefs(ref as Ref<DomElement>, refs.input),
        'aria-autocomplete': 'list',
        ...activeDescendant,
        'aria-controls': isOpen ? menuId : null,
        'aria-labelledby': labelId,
        // https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
        // revert back since autocomplete="nope" is ignored on latest Chrome and
        // Opera
        autoComplete: 'off',
        value: inputValue,
        id: inputId,
        ...eventHandlers,
        ...rest,
      } as any;
    },
    [
      actions,
      contextRef,
      getItemA11yId,
      inputId,
      inputValue,
      isOpen,
      labelId,
      menuId,
      mostRecentHighlightedIndex,
      refs,
      setInternalTimeout,
      type,
    ],
  );

  const getMenuProps = useCallback(
    <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
      options: GetPropsWithRefOptions<Element, RefKey> = { refKey: 'ref' as RefKey },
    ): GetPropsWithRefReturn<Element, RefKey> => {
      const { onKeyDown, onBlur, refKey = 'ref' as RefKey, ref, ...rest } = options;

      const multi = multiple ? { 'aria-multiselectable': multiple } : {};
      const activeDescendant = !isEmptyArray(highlightedIndexes)
        ? {
            'aria-activedescendant': getItemA11yId(mostRecentHighlightedIndex),
          }
        : {};

      let eventHandlers: HTMLProps<Element> = {
        onKeyDown: callAllEventHandlers(onKeyDown, (event) => {
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
        onBlur: callAllEventHandlers(onBlur, (event) => {
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
                ].some((node) => node && isOrContainsNode(node, document.activeElement)) &&
                  document.activeElement !== blurTarget))
            ) {
              actions.menuBlur();
            }
          });
        }),
      };

      if (rest.disabled) {
        eventHandlers = object();
      }

      return {
        [refKey]: composeRefs(ref as Ref<Element>, refs.menu),
        id: menuId,
        role: type === Type.ControlledMenu ? 'menu' : 'listbox',
        'aria-labelledby': labelId,
        tabIndex: -1,
        ...multi,
        ...activeDescendant,
        ...eventHandlers,
        ...rest,
      } as GetPropsWithRefReturn<Element, RefKey>;
    },
    [
      actions,
      contextRef,
      getItemA11yId,
      highlightedIndexes,
      labelId,
      menuId,
      mostRecentHighlightedIndex,
      multiple,
      refs,
      setInternalTimeout,
      type,
    ],
  );

  const getToggleButtonProps = useCallback(
    <DomElement extends HTMLElement = any, RefKey extends string = 'ref'>(
      options: GetPropsWithRefOptions<DomElement, RefKey> = { refKey: 'ref' as RefKey },
    ): GetPropsWithRefReturn<DomElement, RefKey> => {
      const { onClick, onKeyDown, onBlur, refKey = 'ref' as RefKey, ref, ...rest } = options;

      if (type === Type.ControlledMenu) {
        throw new Error('The toggle button props should not be used for the controlled menu');
      }

      const isInternalEvent = <Synth extends SyntheticEvent = any>(event: Synth) =>
        [refs.input.current, refs.menu.current, ...refs.items.current].some(
          (node) => node && isOrContainsNode(node, event.target as Node),
        );

      let eventHandlers: HTMLProps<DomElement> = {
        onClick: callAllEventHandlers(onClick, () => actions.toggleButtonClick()),
        onKeyDown: callAllEventHandlers(onKeyDown, (event) => {
          const key = getKeyName(event);

          if (isInternalEvent(event)) {
            return;
          }

          if (includes(SPECIAL_TOGGLE_BUTTON_KEYS, key)) {
            actions.toggleButtonSpecialKeyDown(createKeyDownPayload(event, key, disabled.current));
            event.preventDefault();
          }
        }),
        onBlur: callAllEventHandlers(onBlur, (event) => {
          if (isInternalEvent(event)) {
            return;
          }

          const blurTarget = event.target; // Save blur target for comparison with activeElement later
          // Need setTimeout, so that when the user presses Tab, the activeElement
          // is the next focused element, not body element
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
        eventHandlers = object();
      }

      const extra = type === Type.Select ? { 'aria-expanded': isOpen } : {};
      const ariaLabel = isUndefined(rest['aria-label'])
        ? { 'aria-labelledby': `${labelId} ${toggleButtonId}` }
        : {};

      return {
        [refKey]: composeRefs(ref as Ref<DomElement>, refs.toggleButton),
        type: 'button',
        role: 'button',
        id: toggleButtonId,
        'aria-haspopup': type === Type.ComboBox ? true : 'listbox',
        ...ariaLabel,
        ...extra,
        ...eventHandlers,
        ...rest,
      } as any;
    },
    [actions, contextRef, isOpen, labelId, menuId, refs, setInternalTimeout, toggleButtonId, type],
  );

  const getItemProps = useCallback(
    <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
      options: GetItemPropsOptions<Element, RefKey, Item>,
    ): GetPropsWithRefReturn<Element, RefKey> => {
      const {
        item,
        index,
        refKey = 'ref' as RefKey,
        ref,
        onMouseMove,
        onMouseLeave,
        onClick,
        ...rest
      } = options;

      const itemIndex = getItemIndex(index, item, items);

      if (!isValidIndex(itemIndex)) {
        throw new Error('Pass either item or item index in getItemProps!');
      }

      let eventHandlers: HTMLProps<Element> = {
        onMouseMove: callAllEventHandlers(onMouseMove, () => actions.itemMouseMove(itemIndex)),
        onMouseLeave: callAllEventHandlers(onMouseLeave, () => actions.itemMouseLeave(itemIndex)),

        onClick: callAllEventHandlers(onClick, (event) => {
          event.preventDefault();
          actions.itemClick(createItemClickPayload(event, itemIndex));
        }),
      };

      if (rest.disabled) {
        disabled.current.push(itemIndex);
        eventHandlers = object();
      }

      return {
        [refKey]: composeRefs(ref as Ref<Element>, (itemNode) => {
          if (itemNode) {
            refs.items.current.push(itemNode);
          }
        }),
        role:
          type === Type.ControlledMenu
            ? multiple
              ? 'menuitemcheckbox'
              : 'menuitemradio'
            : 'option',
        'aria-current': index === hoveredIndex || index === mostRecentHighlightedIndex,
        'aria-selected': itemHighlightedAtIndex(index) && !rest.disabled,
        id: getItemA11yId(itemIndex),
        ...eventHandlers,
        ...rest,
      } as GetPropsWithRefReturn<Element, RefKey>;
    },
    [
      actions,
      getItemA11yId,
      hoveredIndex,
      itemHighlightedAtIndex,
      items,
      mostRecentHighlightedIndex,
      multiple,
      refs.items,
      type,
    ],
  );

  const getIgnoredElementProps = useCallback(
    <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
      options: IgnoredElementOptions<Element, RefKey> = { refKey: 'ref' as RefKey },
    ): GetPropsWithRefReturn<Element, RefKey> => {
      const { refKey = 'ref' as RefKey, ref, onMouseMove, onFocus, ...rest } = options;
      let eventHandlers: HTMLProps<Element> = object();

      if (rest.disabled) {
        eventHandlers = object();
      }

      return {
        [refKey]: composeRefs(ref as Ref<Element>, (node) => {
          if (node && !rest.disabled) {
            refs.ignored.current.push(node);
          }
        }),
        ...eventHandlers,
        ...rest,
      } as GetPropsWithRefReturn<Element, RefKey>;
    },
    [refs.ignored],
  );

  const getLabelProps = useCallback(
    <Element extends HTMLElement = any, RefKey extends string = 'ref'>(
      options: IgnoredElementOptions<Element, RefKey> = {
        refKey: 'ref' as RefKey,
      },
    ): GetLabelPropsWithRefReturn<Element, RefKey> => {
      const { refKey = 'ref' as RefKey, ref, ...rest } = options;

      return {
        [refKey]: composeRefs(ref as Ref<Element>, (node) => {
          if (node) {
            refs.ignored.current.push(node);
          }
        }),
        id: labelId,
        htmlFor: type === 'combobox' && refs.input.current ? inputId : menuId,
        ...rest,
      } as GetLabelPropsWithRefReturn<Element, RefKey>;
    },
    [inputId, labelId, menuId, refs, type],
  );

  const getRemoveButtonProps = useCallback(
    <Element extends HTMLElement = any>(
      options: GetRemoveButtonOptions<Element, Item>,
    ): GetRemoveButtonReturn<Element> => {
      const { onClick, item, ...rest } = options;

      let eventHandlers: Pick<GetRemoveButtonReturn<Element>, 'onClick'> = {
        onClick: callAllEventHandlers(onClick, () => {
          actions.removeSelectedItem(item);
        }),
      };

      if (rest.disabled) {
        eventHandlers = object();
      }

      return {
        ...eventHandlers,
        role: 'button',
        ...rest,
      };
    },
    [actions],
  );

  const focusHelpers = useMemo(
    (): MultishiftFocusHelpers => ({
      focusInput: () => {
        if (type !== Type.ComboBox) {
          throw new Error(`The input element cannot be focused for this type of dropdown: ${type}`);
        }

        if (refs.input.current) {
          refs.input.current.focus();
        }
      },
      focusToggleButton: () => {
        if (refs.toggleButton.current) {
          refs.toggleButton.current.focus();
        }
      },
      focusMenu: () => {
        if (refs.menu.current) {
          refs.menu.current.focus();
        }
      },
      focusMenuItem: (index: number) => {
        if (refs.items.current[index]) {
          refs.items.current[index]?.focus();
        }
      },
    }),
    [refs.input, refs.items, refs.menu, refs.toggleButton, type],
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
    indexIsHovered,
    itemIsHovered,
    indexIsSelected,
    itemIsSelected,
    indexOfItem,

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

    // Props Getters
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
