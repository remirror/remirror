import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { BulletListExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleBulletListProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleBulletList = <T extends ElementType>({
  as,
  ...rest
}: ToggleBulletListProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleBulletList } = useCommands<BulletListExtension>();

  const handleSelect = useCallback(() => {
    if (toggleBulletList.enabled()) {
      toggleBulletList();
    }
  }, [toggleBulletList]);

  const active = useActive<BulletListExtension>().bulletList();
  const enabled = toggleBulletList.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleBulletList'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
