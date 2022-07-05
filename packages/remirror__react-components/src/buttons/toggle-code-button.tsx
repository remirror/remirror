import React, { FC, useCallback } from 'react';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleCodeButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleCodeButton: FC<ToggleCodeButtonProps> = (props) => {
  const { toggleCode } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleCode.enabled()) {
      toggleCode();
    }
  }, [toggleCode]);

  const active = useActive().code();
  const enabled = toggleCode.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleCode'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
