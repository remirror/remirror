import React, { FC, useCallback } from 'react';
import { HorizontalRuleExtension } from 'remirror/extensions';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface InsertHorizontalRuleButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const InsertHorizontalRuleButton: FC<InsertHorizontalRuleButtonProps> = (props) => {
  const { insertHorizontalRule } = useCommands<HorizontalRuleExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (insertHorizontalRule.enabled()) {
      insertHorizontalRule();
    }
  }, [insertHorizontalRule]);

  const enabled = insertHorizontalRule.enabled();

  return (
    <CommandButton
      {...props}
      commandName='insertHorizontalRule'
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
