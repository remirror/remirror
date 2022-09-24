import React, { FC } from 'react';

import { ToggleCallout, ToggleCalloutProps } from '../commands/toggle-callout';
import { CommandMenuItem } from './command-menu-item';

export type ToggleCalloutMenuItemProps = Omit<ToggleCalloutProps<typeof CommandMenuItem>, 'as'>;

export const ToggleCalloutMenuItem: FC<ToggleCalloutMenuItemProps> = (props) => {
  return <ToggleCallout as={CommandMenuItem} {...props} />;
};
