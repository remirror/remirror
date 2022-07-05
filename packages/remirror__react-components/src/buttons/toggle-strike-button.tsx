import React, { FC, useCallback } from 'react';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleStrikeButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleStrikeButton: FC<ToggleStrikeButtonProps> = (props) => {
  const { toggleStrike } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleStrike.enabled()) {
      toggleStrike();
    }
  }, [toggleStrike]);

  const active = useActive().strike();
  const enabled = toggleStrike.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleStrike'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
