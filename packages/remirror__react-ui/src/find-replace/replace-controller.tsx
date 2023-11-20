import { Button, ButtonGroup } from '@mui/material';
import React, { FC } from 'react';

export const ReplaceController: FC<{
  replace: () => void;
  replaceAll: () => void;
}> = ({ replace, replaceAll }) => (
  <ButtonGroup variant='outlined' size='small'>
    <Button aria-label='Replace' sx={{ textTransform: 'none' }} onClick={replace}>
      Replace
    </Button>
    <Button aria-label='Replace all' sx={{ textTransform: 'none' }} onClick={replaceAll}>
      All
    </Button>
  </ButtonGroup>
);
