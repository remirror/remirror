import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { NodeFormattingExtension } from 'remirror/extensions';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type LeftAlignProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const LeftAlign = <T extends ElementType>({
  as,
  ...rest
}: LeftAlignProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { leftAlign } = useCommands<NodeFormattingExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (leftAlign.enabled()) {
      leftAlign();
    }
  }, [leftAlign]);

  const active = leftAlign.active?.();
  const enabled = leftAlign.enabled();

  return (
    <Component
      {...rest}
      commandName='leftAlign'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
