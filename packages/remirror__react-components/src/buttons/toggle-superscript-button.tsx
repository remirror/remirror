import React, { FC, useCallback } from 'react';
import { SupExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleSuperscriptButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleSuperscriptButton: FC<ToggleSuperscriptButtonProps> = (props) => {
  const { toggleSuperscript } = useCommands<SupExtension>();

  const handleSelect = useCallback(() => {
    if (toggleSuperscript.enabled()) {
      toggleSuperscript();
    }
  }, [toggleSuperscript]);

  const active = useActive<SupExtension>().sup();
  const enabled = toggleSuperscript.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleSuperscript'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
