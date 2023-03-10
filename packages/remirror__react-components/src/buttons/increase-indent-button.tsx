import React, { FC, useCallback } from 'react';
import { NodeFormattingExtension } from '@remirror/extension-node-formatting';
import { useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface IncreaseIndentButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const IncreaseIndentButton: FC<IncreaseIndentButtonProps> = (props) => {
  const { increaseIndent } = useCommands<NodeFormattingExtension>();

  const handleSelect = useCallback(() => {
    if (increaseIndent.enabled()) {
      increaseIndent();
    }
  }, [increaseIndent]);

  const enabled = increaseIndent.enabled();

  return (
    <CommandButton
      {...props}
      commandName='increaseIndent'
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
