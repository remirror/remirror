import React, { FC, useCallback } from 'react';
import { UnderlineExtension } from '@remirror/extension-underline';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleUnderlineButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleUnderlineButton: FC<ToggleUnderlineButtonProps> = (props) => {
  const { toggleUnderline } = useCommands<UnderlineExtension>();

  const handleSelect = useCallback(() => {
    if (toggleUnderline.enabled()) {
      toggleUnderline();
    }
  }, [toggleUnderline]);

  const active = useActive<UnderlineExtension>().underline();
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
