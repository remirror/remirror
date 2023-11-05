import React, { FC, useCallback } from 'react';
import { WhitespaceExtension } from '@remirror/extension-whitespace';
import { useCommands, useHelpers } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleWhitespaceButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleWhitespaceButton: FC<ToggleWhitespaceButtonProps> = (props) => {
  const { toggleWhitespace } = useCommands<WhitespaceExtension>();
  const { isWhitespaceVisible } = useHelpers<WhitespaceExtension>(true);

  const handleSelect = useCallback(() => {
    if (toggleWhitespace.enabled()) {
      toggleWhitespace();
    }
  }, [toggleWhitespace]);

  const active = isWhitespaceVisible();
  const enabled = toggleWhitespace.enabled();

  return (
    <CommandButton
      {...props}
      commandName='toggleWhitespace'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
