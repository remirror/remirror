import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { SupExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleSubscriptProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleSubscript = <T extends ElementType>({
  as,
  ...rest
}: ToggleSubscriptProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleSubscript } = useCommands<SupExtension>();

  const handleSelect = useCallback(() => {
    if (toggleSubscript.enabled()) {
      toggleSubscript();
    }
  }, [toggleSubscript]);

  const active = useActive<SupExtension>().sub();
  const enabled = toggleSubscript.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleSubscript'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
