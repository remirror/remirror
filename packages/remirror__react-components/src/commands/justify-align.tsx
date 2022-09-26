import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { NodeFormattingExtension } from 'remirror/extensions';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type JustifyAlignProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const JustifyAlign = <T extends ElementType>({
 as,
 ...rest
}: JustifyAlignProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { justifyAlign } = useCommands<NodeFormattingExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (justifyAlign.enabled()) {
      justifyAlign();
    }
  }, [justifyAlign]);

  const active = justifyAlign.active?.();
  const enabled = justifyAlign.enabled();

  return (
    <Component
      {...rest}
      commandName='justifyAlign'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
