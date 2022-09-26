import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { CodeExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleCodeProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleCode = <T extends ElementType>({
  as,
  ...rest
}: ToggleCodeProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleCode } = useCommands<CodeExtension>();

  const handleSelect = useCallback(() => {
    if (toggleCode.enabled()) {
      toggleCode();
    }
  }, [toggleCode]);

  const active = useActive<CodeExtension>().code();
  const enabled = toggleCode.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleCode'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
