import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { TableExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type CreateTableProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const CreateTable = <T extends ElementType>({
  as,
  ...rest
}: CreateTableProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { createTable } = useCommands<TableExtension>();

  const handleSelect = useCallback(() => {
    if (createTable.enabled()) {
      createTable();
    }
  }, [createTable]);

  const active = useActive<TableExtension>().table();
  const enabled = createTable.enabled();

  return (
    <Component
      {...rest}
      commandName='createTable'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
