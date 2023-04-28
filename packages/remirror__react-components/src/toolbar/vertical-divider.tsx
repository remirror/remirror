import { Divider, DividerProps } from '@mui/material';
import React, { FC } from 'react';

export type VerticalDividerProps = Omit<DividerProps, 'orientation'>;

export const VerticalDivider: FC<VerticalDividerProps> = (props) => (
  <Divider flexItem sx={{ mx: 0.5 }} {...props} orientation='vertical' />
);
