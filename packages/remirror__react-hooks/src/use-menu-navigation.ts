/**
 * @module
 *
 * Create menu navigation handlers when showing popup menus inside the editor.
 */

import {
  MultishiftHelpers,
  MultishiftPropGetters,
  MultishiftState,
  Type,
  useMultishift,
} from 'multishift';
import { useCallback, useMemo, useState } from 'react';
import { KeyBindingCommandFunction, KeyBindingNames, KeyBindings } from '@remirror/core';
import { useCommands } from '@remirror/react-core';

import { indexFromArrowPress } from './react-hook-utils';
import { useKeymap } from './use-keymap';
import { useKeymaps } from './use-keymaps';

interface MenuNavigationProps<Item = any> extends MenuNavigationOptions {
  /**
   * The items that will be rendered as part of the dropdown menu.
   *
   * When the items are an empty array then nothing will be shown.
   */
  items: Item[];

  /**
   * Set to `true` when the menu should be visible.
   */
  isOpen: boolean;

  /**
   * Called when submitting the inline menu via the keyboard.
   *
   * Currently the hardcoded submit key is `Enter`
   *
   * Return `true` to indicate the event was handled or false to indicated that
   * nothing has been done.
   */
  onSubmit: (item: Item, type: 'click' | 'keyPress') => boolean;

  /**
   * Called when dismissing the inline menu.
   *
   * Currently `Tab` and `Escape` dismiss the menu.
   *
   * Return `true` to indicate the event was handled or false to indicated that
   * nothing has been done.
   */
  onDismiss: () => boolean;
}

export interface MenuNavigationOptions {
  /**
   * The direction of the arrow key press.
   *
   * @default 'vertical';
   */
  direction?: MenuDirection;

  /**
   * Keys that can submit the selection.
   *
   * @default ['Enter']
   */
  submitKeys?: KeyBindingNames[];

  /**
   * Keys that can dismiss the menu.
   *
   * @default ['Escape', 'Tab', 'Shift-Tab']
   */
  dismissKeys?: KeyBindingNames[];

  /**
   * When true, refocus the editor when a click is made.
   *
   * @default true
   */
  focusOnClick?: boolean;
}

export type MenuDirection = 'horizontal' | 'vertical';

export interface UseMenuNavigationReturn<Item = any>
  extends Pick<MultishiftPropGetters<Item>, 'getMenuProps' | 'getItemProps'>,
    Pick<
      MultishiftHelpers<Item>,
      'itemIsSelected' | 'indexIsSelected' | 'indexIsHovered' | 'itemIsHovered'
    >,
    Pick<MultishiftState<Item>, 'hoveredIndex'> {
  /**
   * The selected index.
   */
  index: number;

  setIndex: (index: number) => void;
}

const DEFAULT_DISMISS_KEYS = ['Escape', 'Tab', 'Shift-Tab'];
const DEFAULT_SUBMIT_KEYS = ['Enter'];

/**
 * This hook provides the primitives for rendering a dropdown menu within
 */
export function useMenuNavigation<Item = any>(
  props: MenuNavigationProps,
): UseMenuNavigationReturn<Item> {
  const {
    items,
    direction = 'vertical',
    isOpen,
    onDismiss,
    onSubmit,
    focusOnClick = true,
    dismissKeys = DEFAULT_DISMISS_KEYS,
    submitKeys = DEFAULT_SUBMIT_KEYS,
  } = props;
  const [index, setIndex] = useState(0);
  const { focus } = useCommands();

  const nextShortcut = direction === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const previousShortcut = direction === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

  const {
    getMenuProps,
    getItemProps: _getItemProps,
    hoveredIndex,
    itemIsSelected,
    indexIsSelected,
    indexIsHovered,
    itemIsHovered,
  } = useMultishift<Item>({
    items,
    isOpen,
    highlightedIndexes: [index],
    type: Type.ControlledMenu,
  });

  /**
   * Callback used when pressing the next arrow key.
   */
  const homeCallback: KeyBindingCommandFunction = useCallback(() => {
    if (!isOpen) {
      return false;
    }

    if (index !== 0) {
      setIndex(0);
    }

    return true;
  }, [index, isOpen]);

  /**
   * Callback used when pressing the next arrow key.
   */
  const endCallback: KeyBindingCommandFunction = useCallback(() => {
    if (!isOpen) {
      return false;
    }

    if (index === items.length - 1) {
      setIndex(items.length - 1);
    }

    return true;
  }, [items, index, isOpen]);

  /**
   * Callback used when pressing the next arrow key.
   */
  const nextCallback: KeyBindingCommandFunction = useCallback(() => {
    if (!isOpen) {
      return false;
    }

    setIndex(
      indexFromArrowPress({
        direction: 'next',
        matchLength: items.length,
        previousIndex: index,
      }),
    );
    return true;
  }, [items, index, isOpen]);

  /**
   * Callback used when pressing the previous arrow key.
   */
  const previousCallback: KeyBindingCommandFunction = useCallback(() => {
    if (!isOpen) {
      return false;
    }

    setIndex(
      indexFromArrowPress({
        direction: 'previous',
        matchLength: items.length,
        previousIndex: index,
      }),
    );

    return true;
  }, [items, index, isOpen]);

  const submitCallback: KeyBindingCommandFunction = useCallback(() => {
    const item = items[index];

    if (!isOpen || !item) {
      return false;
    }

    return onSubmit(item, 'keyPress');
  }, [index, isOpen, items, onSubmit]);

  const dismissCallback: KeyBindingCommandFunction = useCallback(() => {
    if (!isOpen) {
      return false;
    }

    return onDismiss();
  }, [isOpen, onDismiss]);

  /**
   * Automatically select the item when clicked.
   */
  const getItemProps: MultishiftPropGetters<Item>['getItemProps'] = useCallback(
    (itemProps) => {
      return {
        ..._getItemProps({
          ...itemProps,
          onClick: (event) => {
            itemProps.onClick?.(event);
            onSubmit(itemProps.item, 'click');

            if (focusOnClick) {
              focus();
            }
          },
        }),
      };
    },
    [_getItemProps, onSubmit, focus, focusOnClick],
  );

  const submitBindings: KeyBindings = useMemo(() => {
    const bindings: KeyBindings = {};

    for (const key of submitKeys) {
      bindings[key] = submitCallback;
    }

    return bindings;
  }, [submitCallback, submitKeys]);

  const dismissBindings: KeyBindings = useMemo(() => {
    const bindings: KeyBindings = {};

    for (const key of dismissKeys) {
      bindings[key] = dismissCallback;
    }

    return bindings;
  }, [dismissCallback, dismissKeys]);

  // Navigation callbacks
  useKeymap(nextShortcut, nextCallback);
  useKeymap(previousShortcut, previousCallback);
  useKeymap('Home', homeCallback);
  useKeymap(`Cmd-${nextShortcut}`, homeCallback);
  useKeymap('End', nextCallback);
  useKeymap(`Cmd-${previousShortcut}`, endCallback);

  // Handle the submit keybindings
  useKeymaps(submitBindings);

  // Handle the dismiss bindings.
  useKeymaps(dismissBindings);

  return useMemo(
    () => ({
      getMenuProps,
      getItemProps,
      hoveredIndex,
      indexIsSelected,
      itemIsSelected,
      indexIsHovered,
      itemIsHovered,
      index,
      setIndex,
    }),
    [
      getItemProps,
      getMenuProps,
      hoveredIndex,
      indexIsHovered,
      indexIsSelected,
      itemIsHovered,
      itemIsSelected,
      index,
    ],
  );
}
