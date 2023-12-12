import React, { FC, ReactNode } from 'react';

import { ToggleCalloutButton } from '../buttons';
import { CommandButtonGroup } from './command-button-group';

export interface CalloutTypeButtonGroupProps {
  children?: ReactNode | ReactNode[];
}

const INFO_CALLOUT = { type: 'info' };
const WARNING_CALLOUT = { type: 'warning' };
const ERROR_CALLOUT = { type: 'error' };
const SUCCESS_CALLOUT = { type: 'success' };

export const CalloutTypeButtonGroup: FC<CalloutTypeButtonGroupProps> = ({ children }) => (
  <CommandButtonGroup>
    <ToggleCalloutButton attrs={INFO_CALLOUT} />
    <ToggleCalloutButton attrs={WARNING_CALLOUT} />
    <ToggleCalloutButton attrs={ERROR_CALLOUT} />
    <ToggleCalloutButton attrs={SUCCESS_CALLOUT} />
    {children}
  </CommandButtonGroup>
);
