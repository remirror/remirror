import React, { FC, useCallback } from 'react';
import { NodeFormattingExtension } from '@remirror/extension-node-formatting';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface LeftAlignButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const LeftAlignButton: FC<LeftAlignButtonProps> = (props) => {
  const { leftAlign } = useCommands<NodeFormattingExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (leftAlign.enabled()) {
      leftAlign();
    }
  }, [leftAlign]);

  const active = leftAlign.active?.();
  const enabled = leftAlign.enabled();

  return (
    <CommandButton
      {...props}
      commandName='leftAlign'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
