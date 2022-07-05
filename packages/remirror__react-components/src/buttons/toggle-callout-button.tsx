import React, { FC, useCallback } from 'react';
import { ProsemirrorAttributes } from '@remirror/core';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleCalloutButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
  attrs?: Partial<ProsemirrorAttributes>;
}

export const ToggleCalloutButton: FC<ToggleCalloutButtonProps> = ({ attrs = {}, ...rest }) => {
  const { toggleCallout } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleCallout.enabled(attrs)) {
      toggleCallout(attrs);
    }
  }, [toggleCallout, attrs]);

  const active = useActive().callout(attrs);
  const enabled = toggleCallout.enabled(attrs);

  return (
    <CommandButton
      {...rest}
      commandName='toggleCallout'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
