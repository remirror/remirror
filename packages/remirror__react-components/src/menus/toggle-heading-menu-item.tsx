import React, { FC, useCallback } from 'react';
import { HeadingExtension, HeadingExtensionAttributes } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandMenuItem, CommandMenuItemProps } from './command-menu-item';

export interface ToggleHeadingMenuItemProps
  extends Omit<CommandMenuItemProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
  attrs?: Partial<HeadingExtensionAttributes>;
}

export const ToggleHeadingMenuItem: FC<ToggleHeadingMenuItemProps> = ({ attrs, ...rest }) => {
  const { toggleHeading } = useCommands<HeadingExtension>();

  const handleSelect = useCallback(() => {
    if (toggleHeading.enabled(attrs)) {
      toggleHeading(attrs);
    }
  }, [toggleHeading, attrs]);

  const active = useActive<HeadingExtension>().heading(attrs);
  const enabled = toggleHeading.enabled(attrs);

  return (
    <CommandMenuItem
      {...rest}
      commandName='toggleHeading'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
