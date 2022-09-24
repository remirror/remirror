import React, { FC } from 'react';

import { ToggleCallout, ToggleCalloutProps } from '../commands/toggle-callout';
import { CommandButton } from './command-button';

export type ToggleCalloutButtonProps = Omit<ToggleCalloutProps<typeof CommandButton>, 'as'>;

export const ToggleCalloutButton: FC<ToggleCalloutButtonProps> = (props) => {
  return <ToggleCallout as={CommandButton} {...props} />;
};
