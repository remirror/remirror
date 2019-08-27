import { storiesOf } from '@storybook/react';
import React from 'react';
import { DropDown, DropdownItem } from '..';

const data: DropdownItem[] = [{ label: '' }];

storiesOf('dropdown', module).add('Menu Bar', () => <Dropdown></Dropdown>);
