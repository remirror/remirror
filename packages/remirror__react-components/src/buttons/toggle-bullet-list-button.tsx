import React, { FC, useCallback } from 'react';
import { BulletListExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleBulletListButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleBulletListButton: FC<ToggleBulletListButtonProps> = (props) => {
  const { toggleBulletList } = useCommands<BulletListExtension>();

  const handleSelect = useCallback(() => {
    if (toggleBulletList.enabled()) {
      toggleBulletList();
    }
  }, [toggleBulletList]);

  const active = useActive<BulletListExtension>().bulletList();
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
