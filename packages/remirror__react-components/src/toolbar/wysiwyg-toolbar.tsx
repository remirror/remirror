import React, { FC } from 'react';

import {
  BasicFormattingButtonGroup,
  DataTransferButtonGroup,
  HeadingLevelButtonGroup,
  HistoryButtonGroup,
  ListButtonGroup,
} from '../button-groups';
import { CreateTableButton } from '../buttons';
import { Toolbar } from './base-toolbar';
import { VerticalDivider } from './vertical-divider';

export const WysiwygToolbar: FC = () => {
  return (
    <Toolbar>
      <HistoryButtonGroup />
      <VerticalDivider />
      <DataTransferButtonGroup />
      <VerticalDivider />
      <HeadingLevelButtonGroup />
      <VerticalDivider />
      <BasicFormattingButtonGroup />
      <VerticalDivider />
      <ListButtonGroup>
        <CreateTableButton />
      </ListButtonGroup>
    </Toolbar>
  );
};
