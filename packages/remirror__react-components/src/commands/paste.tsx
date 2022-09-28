import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { CommandsExtension } from '@remirror/core';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type PasteProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const Paste = <T extends ElementType>({ as, ...rest }: PasteProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { paste } = useCommands<CommandsExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (paste.enabled()) {
      paste();
    }
  }, [paste]);

  const enabled = paste.enabled();

  return (
    <Component
      {...rest}
      commandName='paste'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
