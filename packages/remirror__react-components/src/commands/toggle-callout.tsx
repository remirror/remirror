import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { CalloutExtension, CalloutExtensionAttributes } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleCalloutProps<T extends ElementType> = {
  attrs?: Partial<CalloutExtensionAttributes>;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleCallout = <T extends ElementType>({
  as,
  attrs = {},
  ...rest
}: ToggleCalloutProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleCallout } = useCommands<CalloutExtension>();

  const handleSelect = useCallback(() => {
    if (toggleCallout.enabled(attrs)) {
      toggleCallout(attrs);
    }
  }, [toggleCallout, attrs]);

  const active = useActive<CalloutExtension>().callout(attrs);
  const enabled = toggleCallout.enabled(attrs);

  return (
    <Component
      {...rest}
      commandName='toggleCallout'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
