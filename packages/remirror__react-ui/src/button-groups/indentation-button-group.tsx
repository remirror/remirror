import React, { FC, ReactNode } from 'react';

import { DecreaseIndentButton, IncreaseIndentButton } from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface IndentationButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

export const IndentationButtonGroup: FC<IndentationButtonGroupProps> = ({ children }) => (
  <CommandButtonGroup>
    <DecreaseIndentButton />
    <IncreaseIndentButton />
    {children}
  </CommandButtonGroup>
);
