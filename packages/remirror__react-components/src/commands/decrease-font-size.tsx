import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { FontSizeExtension } from 'remirror/extensions';
import { useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type DecreaseFontSizeProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const DecreaseFontSize = <T extends ElementType>({
  as,
  ...rest
}: DecreaseFontSizeProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { decreaseFontSize } = useCommands<FontSizeExtension>();

  const handleSelect = useCallback(() => {
    if (decreaseFontSize.enabled()) {
      decreaseFontSize();
    }
  }, [decreaseFontSize]);

  const enabled = decreaseFontSize.enabled();

  return (
    <Component {...rest} commandName='decreaseFontSize' enabled={enabled} onSelect={handleSelect} />
  );
};
