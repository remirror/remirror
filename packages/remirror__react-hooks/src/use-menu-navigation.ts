/**
 * @module
 *
 * Create menu navigation handlers when within the editor.
 */

import {
  MultishiftHelpers,
  MultishiftPropGetters,
  MultishiftState,
  Type,
  useMultishift,
} from 'multishift';
import { useCallback, useMemo, useState } from 'react';
import { ValueOf } from 'type-fest';
import { KeyBindingCommandFunction } from '@remirror/core';

import { indexFromArrowPress } from './react-hook-utils';
import { useKeymap } from './use-keymap';

export const MenuNavigationAction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
  Enter: 'enter',
  Escape: 'escape',
  Tab: 'tab',
  BackTab: 'backTab',
} as const;
export type MenuNavigationActionType = ValueOf<typeof MenuNavigationAction>;

type MenuNavigationHandler = (type: 'submit' | 'cancel') => void;

interface MenuNavigationProps<Item = any> {
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

  /**
   * The direction of the arrow key press.
   *
   * @default 'vertical';
   */
  direction?: 'horizontal' | 'vertical';
}

export interface UseMenuNavigationReturn<Item = any>
  extends Pick<MultishiftPropGetters<Item>, 'getMenuProps' | 'getItemProps'>,
    Pick<
      MultishiftHelpers<Item>,
      'itemIsSelected' | 'indexIsSelected' | 'indexIsHovered' | 'itemIsHovered'
    >,
    Pick<MultishiftState<Item>, 'hoveredIndex'> {}

/**
 * This hook provides the primitives for rendering a dropdown menu within
 */
export function useMenuNavigation<Item = any>(
  props: MenuNavigationProps,
): UseMenuNavigationReturn<Item> {
  const { items, direction = 'vertical', isOpen, onDismiss, onSubmit } = props;
  const [index, setIndex] = useState(0);

  const nextShortcut = direction === 'vertical' ? 'ArrowUp' : 'ArrowRight';
  const previousShortcut = direction === 'vertical' ? 'ArrowDown' : 'ArrowLeft';

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
          },
        }),
      };
    },
    [_getItemProps, onSubmit],
  );

  // Navigation callbacks
  useKeymap(nextShortcut, nextCallback);
  useKeymap(previousShortcut, previousCallback);

  // Callbacks which submit the action
  useKeymap('Enter', submitCallback);

  // Callbacks which dismiss the action
  useKeymap('Escape', dismissCallback);
  useKeymap('Tab', dismissCallback);
  useKeymap('Shift-Tab', dismissCallback);

  return useMemo(
    () => ({
      getMenuProps,
      getItemProps,
      hoveredIndex,
      indexIsSelected,
      itemIsSelected,
      indexIsHovered,
      itemIsHovered,
    }),
    [
      getItemProps,
      getMenuProps,
      hoveredIndex,
      indexIsHovered,
      indexIsSelected,
      itemIsHovered,
      itemIsSelected,
    ],
  );
}
