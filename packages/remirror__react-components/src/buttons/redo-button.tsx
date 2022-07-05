import React, { FC, useCallback } from 'react';
import { useCommands, useHelpers } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface RedoButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const RedoButton: FC<RedoButtonProps> = (props) => {
  const { redo } = useCommands();
  const { redoDepth } = useHelpers(true);

  const handleSelect = useCallback(() => {
    if (redo.enabled()) {
      redo();
    }
  }, [redo]);

  const enabled = redoDepth() > 0;

  return (
    <CommandButton
      {...props}
      commandName='redo'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
