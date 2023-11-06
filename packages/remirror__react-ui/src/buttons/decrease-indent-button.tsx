import React, { FC, useCallback } from 'react';
import { NodeFormattingExtension } from '@remirror/extension-node-formatting';
import { useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface DecreaseIndentButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const DecreaseIndentButton: FC<DecreaseIndentButtonProps> = (props) => {
  const { decreaseIndent } = useCommands<NodeFormattingExtension>();

  const handleSelect = useCallback(() => {
    if (decreaseIndent.enabled()) {
      decreaseIndent();
    }
  }, [decreaseIndent]);

  const enabled = decreaseIndent.enabled();

  return (
    <CommandButton
      {...props}
      commandName='decreaseIndent'
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
