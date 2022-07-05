import React, { FC, useCallback } from 'react';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleTaskListButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleTaskListButton: FC<ToggleTaskListButtonProps> = (props) => {
  const { toggleTaskList } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleTaskList.enabled()) {
      toggleTaskList();
    }
  }, [toggleTaskList]);

  const active = useActive().taskList();
  const enabled = toggleTaskList.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleTaskList'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
