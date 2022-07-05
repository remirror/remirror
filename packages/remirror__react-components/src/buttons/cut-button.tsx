import React, { FC, useCallback } from 'react';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface CutButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const CutButton: FC<CutButtonProps> = (props) => {
  const { cut } = useCommands();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (cut.enabled()) {
      cut();
    }
  }, [cut]);

  const enabled = cut.enabled();

  return (
    <CommandButton
      {...props}
      commandName='cut'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
