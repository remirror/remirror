import React, { FC, useCallback } from 'react';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleBulletListButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleBulletListButton: FC<ToggleBulletListButtonProps> = (props) => {
  const { toggleBulletList } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleBulletList.enabled()) {
      toggleBulletList();
    }
  }, [toggleBulletList]);

  const active = useActive().bulletList();
  const enabled = toggleBulletList.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleBulletList'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
