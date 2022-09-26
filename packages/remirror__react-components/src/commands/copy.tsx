import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { CommandsExtension } from '@remirror/core';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type CopyProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const Copy = <T extends ElementType>({ as, ...rest }: CopyProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { copy } = useCommands<CommandsExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (copy.enabled()) {
      copy();
    }
  }, [copy]);

  const enabled = copy.enabled();

  return (
    <Component
      {...rest}
      commandName='copy'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
