import React, { FC, useCallback } from 'react';
import { NodeFormattingExtension } from 'remirror/extensions';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface RightAlignButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const RightAlignButton: FC<RightAlignButtonProps> = (props) => {
  const { rightAlign } = useCommands<NodeFormattingExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (rightAlign.enabled()) {
      rightAlign();
    }
  }, [rightAlign]);

  const active = rightAlign.active?.();
  const enabled = rightAlign.enabled();

  return (
    <CommandButton
      {...props}
      commandName='rightAlign'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
