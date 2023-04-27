import React, { FC, ReactNode } from 'react';

import { CopyButton, CutButton, PasteButton } from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface DataTransferButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

export const DataTransferButtonGroup: FC<DataTransferButtonGroupProps> = ({ children }) => (
    <CommandButtonGroup>
      <CopyButton />
      <CutButton />
      <PasteButton />
      {children}
    </CommandButtonGroup>
  );
