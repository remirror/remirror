import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { UnderlineExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleUnderlineProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleUnderline = <T extends ElementType>({
  as,
  ...rest
}: ToggleUnderlineProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleUnderline } = useCommands<UnderlineExtension>();

  const handleSelect = useCallback(() => {
    if (toggleUnderline.enabled()) {
      toggleUnderline();
    }
  }, [toggleUnderline]);

  const active = useActive<UnderlineExtension>().underline();
  const enabled = toggleUnderline.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleUnderline'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
