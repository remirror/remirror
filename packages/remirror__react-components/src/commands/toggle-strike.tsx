import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { StrikeExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleStrikeProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleStrike = <T extends ElementType>({
  as,
  ...rest
}: ToggleStrikeProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleStrike } = useCommands<StrikeExtension>();

  const handleSelect = useCallback(() => {
    if (toggleStrike.enabled()) {
      toggleStrike();
    }
  }, [toggleStrike]);

  const active = useActive<StrikeExtension>().strike();
  const enabled = toggleStrike.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleStrike'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
