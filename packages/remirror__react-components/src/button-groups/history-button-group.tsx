import React, { FC, ReactNode } from 'react';

import { RedoButton, UndoButton } from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface HistoryButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

export const HistoryButtonGroup: FC<HistoryButtonGroupProps> = ({ children }) => (
    <CommandButtonGroup>
      <UndoButton />
      <RedoButton />
      {children}
    </CommandButtonGroup>
  );
