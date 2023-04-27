import React, { FC, ReactNode } from 'react';

import {
  ToggleBoldButton,
  ToggleCodeButton,
  ToggleItalicButton,
  ToggleStrikeButton,
  ToggleUnderlineButton,
} from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface FormattingButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

export const FormattingButtonGroup: FC<FormattingButtonGroupProps> = ({ children }) => (
    <CommandButtonGroup>
      <ToggleBoldButton />
      <ToggleItalicButton />
      <ToggleUnderlineButton />
      <ToggleStrikeButton />
      <ToggleCodeButton />
      {children}
    </CommandButtonGroup>
  );
