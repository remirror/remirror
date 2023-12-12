import React, { FC, useCallback } from 'react';
import { NodeFormattingExtension } from '@remirror/extension-node-formatting';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface JustifyAlignButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const JustifyAlignButton: FC<JustifyAlignButtonProps> = (props) => {
  const { justifyAlign } = useCommands<NodeFormattingExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (justifyAlign.enabled()) {
      justifyAlign();
    }
  }, [justifyAlign]);

  const active = justifyAlign.active?.();
  const enabled = justifyAlign.enabled();

  return (
    <CommandButton
      {...props}
      commandName='justifyAlign'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
