import React, { FC, useCallback } from 'react';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleBoldButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleBoldButton: FC<ToggleBoldButtonProps> = (props) => {
  const { toggleBold } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleBold.enabled()) {
      toggleBold();
    }
  }, [toggleBold]);

  const active = useActive().bold();
  const enabled = toggleBold.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleBold'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
