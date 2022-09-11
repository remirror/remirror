import { Box, BoxProps } from '@mui/material';
import React, { FC, ReactNode } from 'react';

export interface CommandButtonGroupProps extends Omit<BoxProps, 'children'> {
  children: ReactNode | ReactNode[];
}

export const CommandButtonGroup: FC<CommandButtonGroupProps> = (props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
        bgcolor: 'background.paper',
        color: 'text.secondary',
      }}
      {...props}
    />
  );
};
