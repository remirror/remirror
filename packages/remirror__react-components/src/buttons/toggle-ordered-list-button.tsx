import React, { FC, useCallback } from 'react';
import { OrderedListExtension } from '@remirror/extension-list';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleOrderedListButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleOrderedListButton: FC<ToggleOrderedListButtonProps> = (props) => {
  const { toggleOrderedList } = useCommands<OrderedListExtension>();

  const handleSelect = useCallback(() => {
    if (toggleOrderedList.enabled()) {
      toggleOrderedList();
    }
  }, [toggleOrderedList]);

  const active = useActive<OrderedListExtension>().orderedList();
  const enabled = toggleOrderedList.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleOrderedList'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
