import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { BoldExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleBoldProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleBold = <T extends ElementType>({
  as,
  ...rest
}: ToggleBoldProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleBold } = useCommands<BoldExtension>();

  const handleSelect = useCallback(() => {
    if (toggleBold.enabled()) {
      toggleBold();
    }
  }, [toggleBold]);

  const active = useActive<BoldExtension>().bold();
  const enabled = toggleBold.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleBold'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
