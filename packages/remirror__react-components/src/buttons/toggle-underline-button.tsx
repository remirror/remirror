import React, { FC, useCallback } from 'react';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleUnderlineButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleUnderlineButton: FC<ToggleUnderlineButtonProps> = (props) => {
  const { toggleUnderline } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleUnderline.enabled()) {
      toggleUnderline();
    }
  }, [toggleUnderline]);

  const active = useActive().underline();
  const enabled = toggleUnderline.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleUnderline'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
