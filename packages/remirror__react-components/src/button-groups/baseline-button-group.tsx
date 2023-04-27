import React, { FC, ReactNode } from 'react';

import { ToggleSubscriptButton, ToggleSuperscriptButton } from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface BaselineButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

export const BaselineButtonGroup: FC<BaselineButtonGroupProps> = ({ children }) => (
    <CommandButtonGroup>
      <ToggleSubscriptButton />
      <ToggleSuperscriptButton />
      {children}
    </CommandButtonGroup>
  );
