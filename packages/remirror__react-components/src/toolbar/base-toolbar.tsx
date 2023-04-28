import { Stack, StackProps } from '@mui/material';
import React, { FC } from 'react';

export const Toolbar: FC<StackProps> = (props) => (
  <Stack
    direction='row'
    spacing={1}
    sx={{ backgroundColor: 'background.paper', overflowX: 'auto' }}
    {...props}
  />
);
