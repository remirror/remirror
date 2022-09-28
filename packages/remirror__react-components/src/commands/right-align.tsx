import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { NodeFormattingExtension } from 'remirror/extensions';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type RightAlignProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const RightAlign = <T extends ElementType>({
  as,
  ...rest
}: RightAlignProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { rightAlign } = useCommands<NodeFormattingExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (rightAlign.enabled()) {
      rightAlign();
    }
  }, [rightAlign]);

  const active = rightAlign.active?.();
  const enabled = rightAlign.enabled();

  return (
    <Component
      {...rest}
      commandName='rightAlign'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
