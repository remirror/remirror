import { OutlinedInput } from '@mui/material';
import React, { FC } from 'react';

export const ReplaceInput: FC<{
  replacement: string;
  setReplacement: (query: string) => void;
}> = ({ replacement, setReplacement }) => (
  <OutlinedInput
    fullWidth={true}
    margin='none'
    placeholder='Replace'
    value={replacement}
    onChange={(event) => setReplacement(event.target.value)}
    sx={{
      '& input': {
        paddingTop: '4px',
        paddingBottom: '4px',
      },
    }}
    size='small'
    inputProps={{ 'aria-label': 'Replace' }}
  />
);
