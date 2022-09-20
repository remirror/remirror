import React, { FC, ReactNode } from 'react';
import { TaskListExtension } from 'remirror/extensions';

import { ToggleBulletListButton, ToggleOrderedListButton, ToggleTaskListButton } from '../buttons';
import { IfExtensionPresent } from '../if-extension-present';
import { CommandButtonGroup } from './command-button-group';

export interface ListButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

export const ListButtonGroup: FC<ListButtonGroupProps> = ({ children }) => {
  return (
    <CommandButtonGroup>
      <ToggleBulletListButton />
      <ToggleOrderedListButton />
      <IfExtensionPresent extension={TaskListExtension}>
        <ToggleTaskListButton />
      </IfExtensionPresent>
      {children}
    </CommandButtonGroup>
  );
};
