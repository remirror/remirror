import React, { FC, useCallback } from 'react';
import { useCommands, useHelpers } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface UndoButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const UndoButton: FC<UndoButtonProps> = (props) => {
  const { undo } = useCommands();
  const { undoDepth } = useHelpers(true);

  const handleSelect = useCallback(() => {
    if (undo.enabled()) {
      undo();
    }
  }, [undo]);

  const enabled = undoDepth() > 0;

  return (
    <CommandButton
      {...props}
      commandName='undo'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
