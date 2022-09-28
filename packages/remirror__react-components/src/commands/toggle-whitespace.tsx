import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { WhitespaceExtension } from 'remirror/extensions';
import { useCommands, useHelpers } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleWhitespaceProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleWhitespace = <T extends ElementType>({
  as,
  ...rest
}: ToggleWhitespaceProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleWhitespace } = useCommands<WhitespaceExtension>();
  const { isWhitespaceVisible } = useHelpers<WhitespaceExtension>(true);

  const handleSelect = useCallback(() => {
    if (toggleWhitespace.enabled()) {
      toggleWhitespace();
    }
  }, [toggleWhitespace]);

  const active = isWhitespaceVisible();
  const enabled = toggleWhitespace.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleWhitespace'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
