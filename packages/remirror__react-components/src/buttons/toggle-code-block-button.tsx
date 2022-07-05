import React, { FC, useCallback } from 'react';
import { ProsemirrorAttributes } from '@remirror/core';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleCodeBlockButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
  attrs?: Partial<ProsemirrorAttributes>;
}

export const ToggleCodeBlockButton: FC<ToggleCodeBlockButtonProps> = ({ attrs = {}, ...rest }) => {
  const { toggleCodeBlock } = useCommands();

  const handleSelect = useCallback(() => {
    if (toggleCodeBlock.enabled(attrs)) {
      toggleCodeBlock(attrs);
    }
  }, [toggleCodeBlock, attrs]);

  const active = useActive().codeBlock();
  const enabled = toggleCodeBlock.enabled(attrs);

  return (
    <CommandButton
      {...rest}
      commandName='toggleCodeBlock'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
