import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { ItalicExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleItalicProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleItalic = <T extends ElementType>({
  as,
  ...rest
}: ToggleItalicProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleItalic } = useCommands<ItalicExtension>();

  const handleSelect = useCallback(() => {
    if (toggleItalic.enabled()) {
      toggleItalic();
    }
  }, [toggleItalic]);

  const active = useActive<ItalicExtension>().italic();
  const enabled = toggleItalic.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleItalic'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
