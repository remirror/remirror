import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { OrderedListExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleOrderedListProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleOrderedList = <T extends ElementType>({
  as,
  ...rest
}: ToggleOrderedListProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleOrderedList } = useCommands<OrderedListExtension>();

  const handleSelect = useCallback(() => {
    if (toggleOrderedList.enabled()) {
      toggleOrderedList();
    }
  }, [toggleOrderedList]);

  const active = useActive<OrderedListExtension>().orderedList();
  const enabled = toggleOrderedList.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleOrderedList'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
