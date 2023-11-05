import React, { FC, useCallback } from 'react';
import { SubExtension } from '@remirror/extension-sub';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleSubscriptButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleSubscriptButton: FC<ToggleSubscriptButtonProps> = (props) => {
  const { toggleSubscript } = useCommands<SubExtension>();

  const handleSelect = useCallback(() => {
    if (toggleSubscript.enabled()) {
      toggleSubscript();
    }
  }, [toggleSubscript]);

  const active = useActive<SubExtension>().sub();
  const enabled = toggleSubscript.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleSubscript'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
