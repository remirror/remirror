import React, { FC, useCallback } from 'react';
import { CalloutExtension, CalloutExtensionAttributes } from '@remirror/extension-callout';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandMenuItem, CommandMenuItemProps } from './command-menu-item';

export interface ToggleCalloutMenuItemProps
  extends Omit<CommandMenuItemProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
  attrs?: Partial<CalloutExtensionAttributes>;
}

export const ToggleCalloutMenuItem: FC<ToggleCalloutMenuItemProps> = ({ attrs, ...rest }) => {
  const { toggleCallout } = useCommands<CalloutExtension>();

  const handleSelect = useCallback(() => {
    if (toggleCallout.enabled(attrs)) {
      toggleCallout(attrs);
    }
  }, [toggleCallout, attrs]);

  const active = useActive<CalloutExtension>().callout(attrs);
  const enabled = toggleCallout.enabled(attrs);

  return (
    <CommandMenuItem
      {...rest}
      commandName='toggleCallout'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
