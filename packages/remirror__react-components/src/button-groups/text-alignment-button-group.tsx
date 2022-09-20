import React, { FC, ReactNode } from 'react';

import {
  CenterAlignButton,
  JustifyAlignButton,
  LeftAlignButton,
  RightAlignButton,
} from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface TextAlignmentButtonGroupProps {
  showAll?: boolean;
  children?: ReactNode | ReactNode[];
}

export const TextAlignmentButtonGroup: FC<TextAlignmentButtonGroupProps> = ({
  showAll = false,
  children,
}) => {
  return (
    <CommandButtonGroup>
      <LeftAlignButton />
      <CenterAlignButton />
      <RightAlignButton />
      {showAll && <JustifyAlignButton />}
      {children}
    </CommandButtonGroup>
  );
};
