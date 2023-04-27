import React, { FC, ReactNode } from 'react';

import { ToggleBoldButton, ToggleItalicButton, ToggleUnderlineButton } from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface BasicFormattingButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

export const BasicFormattingButtonGroup: FC<BasicFormattingButtonGroupProps> = ({ children }) => (
    <CommandButtonGroup>
      <ToggleBoldButton />
      <ToggleItalicButton />
      <ToggleUnderlineButton />
      {children}
    </CommandButtonGroup>
  );
