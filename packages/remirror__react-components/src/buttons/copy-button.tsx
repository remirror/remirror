import React, { FC, useCallback } from 'react';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface CopyButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const CopyButton: FC<CopyButtonProps> = (props) => {
  const { copy } = useCommands();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (copy.enabled()) {
      copy();
    }
  }, [copy]);

  const enabled = copy.enabled();

  return (
    <CommandButton
      {...props}
      commandName='copy'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
