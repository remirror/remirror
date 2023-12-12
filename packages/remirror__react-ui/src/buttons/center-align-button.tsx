import React, { FC, useCallback } from 'react';
import { NodeFormattingExtension } from '@remirror/extension-node-formatting';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface CenterAlignButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const CenterAlignButton: FC<CenterAlignButtonProps> = (props) => {
  const { centerAlign } = useCommands<NodeFormattingExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (centerAlign.enabled()) {
      centerAlign();
    }
  }, [centerAlign]);

  const active = centerAlign.active?.();
  const enabled = centerAlign.enabled();

  return (
    <CommandButton
      {...props}
      commandName='centerAlign'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
