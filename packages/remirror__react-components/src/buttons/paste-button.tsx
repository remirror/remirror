import React, { FC, useCallback } from 'react';
import { CommandsExtension } from '@remirror/core';
import { useCommands, useEditorState } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface PasteButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const PasteButton: FC<PasteButtonProps> = (props) => {
  const { paste } = useCommands<CommandsExtension>();
  // Force component update on state change
  useEditorState();

  const handleSelect = useCallback(() => {
    if (paste.enabled()) {
      paste();
    }
  }, [paste]);

  const enabled = paste.enabled();

  return (
    <CommandButton
      {...props}
      commandName='paste'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
