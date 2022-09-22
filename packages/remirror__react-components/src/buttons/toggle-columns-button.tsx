import React, { FC, useCallback } from 'react';
import { ColumnAttributes, ColumnsExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleColumnsButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
  attrs?: Partial<ColumnAttributes>;
}

export const ToggleColumnsButton: FC<ToggleColumnsButtonProps> = ({ attrs = {}, ...rest }) => {
  const { toggleColumns } = useCommands<ColumnsExtension>();

  const handleSelect = useCallback(() => {
    if (toggleColumns.enabled(attrs)) {
      toggleColumns(attrs);
    }
  }, [toggleColumns, attrs]);

  const active = useActive<ColumnsExtension>().columns(attrs);
  const enabled = toggleColumns.enabled(attrs);

  return (
    <CommandButton
      {...rest}
      commandName='toggleColumns'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
