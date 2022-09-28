import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { SupExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleSuperscriptProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleSuperscript = <T extends ElementType>({
  as,
  ...rest
}: ToggleSuperscriptProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleSuperscript } = useCommands<SupExtension>();

  const handleSelect = useCallback(() => {
    if (toggleSuperscript.enabled()) {
      toggleSuperscript();
    }
  }, [toggleSuperscript]);

  const active = useActive<SupExtension>().sup();
  const enabled = toggleSuperscript.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleSuperscript'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
