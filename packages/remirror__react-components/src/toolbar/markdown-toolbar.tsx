import React, { FC } from 'react';

import { CommandButtonGroup, HeadingLevelButtonGroup, HistoryButtonGroup } from '../button-groups';
import {
  ToggleBlockquoteButton,
  ToggleBoldButton,
  ToggleCodeBlockButton,
  ToggleCodeButton,
  ToggleItalicButton,
  ToggleStrikeButton,
} from '../buttons';
import { Toolbar } from './base-toolbar';
import { VerticalDivider } from './vertical-divider';

export const MarkdownToolbar: FC = () => (
    <Toolbar>
      <CommandButtonGroup>
        <ToggleBoldButton />
        <ToggleItalicButton />
        <ToggleStrikeButton />
        <ToggleCodeButton />
      </CommandButtonGroup>
      <VerticalDivider />
      <HeadingLevelButtonGroup showAll />
      <VerticalDivider />
      <CommandButtonGroup>
        <ToggleBlockquoteButton />
        <ToggleCodeBlockButton />
      </CommandButtonGroup>
      <VerticalDivider />
      <HistoryButtonGroup />
    </Toolbar>
  );
