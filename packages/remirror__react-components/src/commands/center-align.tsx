import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { NodeFormattingExtension } from 'remirror/extensions';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type CenterAlignProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const CenterAlign = <T extends ElementType>({
  as,
  ...rest
}: CenterAlignProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { centerAlign } = useCommands<NodeFormattingExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (centerAlign.enabled()) {
      centerAlign();
    }
  }, [centerAlign]);

  const active = centerAlign.active?.();
  const enabled = centerAlign.enabled();

  return (
    <Component
      {...rest}
      commandName='centerAlign'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
