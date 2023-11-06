import { Stack, StackProps } from '@mui/material';
import React, { FC } from 'react';

import { UiThemeProvider } from '../providers/ui-theme-provider';

export const Toolbar: FC<StackProps> = (props) => (
  <UiThemeProvider>
    <Stack
      direction='row'
      spacing={1}
      sx={{ backgroundColor: 'background.paper', overflowX: 'auto' }}
      {...props}
    />
  </UiThemeProvider>
);
