import { InputAdornment, OutlinedInput } from '@mui/material';
import React, { FC } from 'react';

export const FindInput: FC<{
  query: string;
  setQuery: (query: string) => void;
  total: number;
  activeIndex?: number | null;
}> = ({ query, setQuery, total, activeIndex }) => {
  const counterLabel = `${total && activeIndex != null ? activeIndex + 1 : 0} of ${total}`;

  return (
    <OutlinedInput
      fullWidth={true}
      margin='none'
      placeholder='Find'
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      sx={{
        '& input': {
          paddingTop: '4px',
          paddingBottom: '4px',
        },
      }}
      size='small'
      inputProps={{ 'aria-label': 'Find' }}
      endAdornment={<InputAdornment position='end'>{counterLabel}</InputAdornment>}
    />
  );
};
