import { IconButton } from '@mui/material';
import React, { FC } from 'react';

import { Icon } from '../icons';
import { MdiFormatLetterCase } from './letter-icon';

export const FindController: FC<{
  findPrev: () => void;
  findNext: () => void;
  toggleCaseSensitive: () => void;
  caseSensitive: boolean;
  stopFind: () => void;
  onDismiss: (() => void) | undefined;
}> = ({ findPrev, findNext, toggleCaseSensitive, caseSensitive, stopFind, onDismiss }) => {
  return (
    <>
      <IconButton
        onClick={findPrev}
        size='small'
        title='Next Match (Enter)'
        aria-label='Next Match (Enter)'
      >
        <Icon name={'arrowLeftSFill'} />
      </IconButton>
      <IconButton
        onClick={findNext}
        size='small'
        title='Previous Match (Shift+Enter)'
        aria-label='Previous Match (Shift+Enter)'
      >
        <Icon name={'arrowRightSFill'} />
      </IconButton>
      <IconButton
        onClick={toggleCaseSensitive}
        size='small'
        color={caseSensitive ? 'primary' : 'default'}
        title='Match Case'
        aria-label='Match Case'
      >
        <MdiFormatLetterCase />
      </IconButton>
      <IconButton
        onClick={() => {
          stopFind();
          onDismiss?.();
        }}
        size='small'
      >
        <Icon name={'closeFill'} />
      </IconButton>
    </>
  );
};
