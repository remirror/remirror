import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { FontSizeExtension } from 'remirror/extensions';
import { useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type IncreaseFontSizeProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const IncreaseFontSize = <T extends ElementType>({
  as,
  ...rest
}: IncreaseFontSizeProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { increaseFontSize } = useCommands<FontSizeExtension>();

  const handleSelect = useCallback(() => {
    if (increaseFontSize.enabled()) {
      increaseFontSize();
    }
  }, [increaseFontSize]);

  const enabled = increaseFontSize.enabled();

  return (
    <Component
      {...rest}
      commandName='increaseFontSize'
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
