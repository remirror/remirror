import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { ColumnAttributes, ColumnsExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleColumnsProps<T extends ElementType> = {
  attrs?: Partial<ColumnAttributes>;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleColumns = <T extends ElementType>({
  as,
  attrs = {},
  ...rest
}: ToggleColumnsProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleColumns } = useCommands<ColumnsExtension>();

  const handleSelect = useCallback(() => {
    if (toggleColumns.enabled(attrs)) {
      toggleColumns(attrs);
    }
  }, [toggleColumns, attrs]);

  const active = useActive<ColumnsExtension>().columns(attrs);
  const enabled = toggleColumns.enabled(attrs);

  return (
    <Component
      {...rest}
      commandName='toggleColumns'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
