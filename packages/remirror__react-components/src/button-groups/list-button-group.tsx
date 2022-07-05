import React, { FC, ReactNode } from 'react';

import { ToggleBulletListButton, ToggleOrderedListButton, ToggleTaskListButton } from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface ListButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

export const ListButtonGroup: FC<ListButtonGroupProps> = ({ children }) => {
  return (
    <CommandButtonGroup>
      <ToggleBulletListButton />
      <ToggleOrderedListButton />
      <ToggleTaskListButton />
      {children}
    </CommandButtonGroup>
  );
};
