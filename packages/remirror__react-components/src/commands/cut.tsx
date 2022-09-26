import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { CommandsExtension } from '@remirror/core';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type CutProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const Cut = <T extends ElementType>({
  as,
  ...rest
}: CutProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { cut } = useCommands<CommandsExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (cut.enabled()) {
      cut();
    }
  }, [cut]);

  const enabled = cut.enabled();

  return (
    <Component
      {...rest}
      commandName='cut'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
