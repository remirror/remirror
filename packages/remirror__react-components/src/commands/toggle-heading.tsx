import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { HeadingExtension, HeadingExtensionAttributes } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleHeadingProps<T extends ElementType> = {
  attrs?: Partial<HeadingExtensionAttributes>;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleHeading = <T extends ElementType>({
  as,
  attrs = {},
  ...rest
}: ToggleHeadingProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleHeading } = useCommands<HeadingExtension>();

  const handleSelect = useCallback(() => {
    if (toggleHeading.enabled(attrs)) {
      toggleHeading(attrs);
    }
  }, [toggleHeading, attrs]);

  const active = useActive<HeadingExtension>().heading(attrs);
  const enabled = toggleHeading.enabled(attrs);

  return (
    <Component
      {...rest}
      commandName='toggleHeading'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
