import React, { FC, useCallback } from 'react';
import { TableExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface CreateTableButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const CreateTableButton: FC<CreateTableButtonProps> = (props) => {
  const { createTable } = useCommands<TableExtension>();

  const handleSelect = useCallback(() => {
    if (createTable.enabled()) {
      createTable();
    }
  }, [createTable]);

  const active = useActive<TableExtension>().table();
  const enabled = createTable.enabled();

  return (
    <CommandButton
      {...props}
      commandName='createTable'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
