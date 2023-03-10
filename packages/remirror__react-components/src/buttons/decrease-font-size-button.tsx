import React, { FC, useCallback } from 'react';
import { FontSizeExtension } from '@remirror/extension-font-size';
import { useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface DecreaseFontSizeButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const DecreaseFontSizeButton: FC<DecreaseFontSizeButtonProps> = (props) => {
  const { decreaseFontSize } = useCommands<FontSizeExtension>();

  const handleSelect = useCallback(() => {
    if (decreaseFontSize.enabled()) {
      decreaseFontSize();
    }
  }, [decreaseFontSize]);

  const enabled = decreaseFontSize.enabled();

  return (
    <CommandButton
      {...props}
      commandName='decreaseFontSize'
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
