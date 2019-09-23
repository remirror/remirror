import { capitalize } from '@remirror/core-helpers';
import { useRemirrorTheme } from '@remirror/ui';
import { storiesOf } from '@storybook/react';
import React, { FC } from 'react';
import { DropdownSelect } from '../dropdown';
import { DropdownProps } from '../dropdown-types';

const Grid: FC = ({ children }) => {
  const { sx } = useRemirrorTheme();

  return (
    <div
      css={sx({
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridGap: 10,
        rowGap: 20,
        p: 3,
      })}
    >
      {children}
    </div>
  );
};

const items = [
  { label: 'Normal Text', id: 'p' },
  { label: 'Heading 1', id: 'h1' },
  { label: 'Heading 2', id: 'h2' },
];

const DropdownWithPosition = ({
  dropdownPosition = 'below left',
}: Pick<DropdownProps, 'dropdownPosition'>) => {
  return (
    <DropdownSelect
      items={items}
      label={dropdownPosition
        .split(' ')
        .map(capitalize)
        .join(' ')}
      dropdownPosition={dropdownPosition}
    />
  );
};

storiesOf('Dropdown', module).add('Buttons', () => (
  <Grid>
    <DropdownWithPosition dropdownPosition='below right' />
    <DropdownWithPosition dropdownPosition='below left' />
    <DropdownWithPosition dropdownPosition='below inline right' />
    <DropdownWithPosition dropdownPosition='below inline left' />
    <DropdownWithPosition dropdownPosition='below wide right' />
    <DropdownWithPosition dropdownPosition='below wide left' />
    <DropdownWithPosition dropdownPosition='above right' />
    <DropdownWithPosition dropdownPosition='above left' />
    <DropdownWithPosition dropdownPosition='above inline right' />
    <DropdownWithPosition dropdownPosition='above inline left' />
    <DropdownWithPosition dropdownPosition='above wide right' />
    <DropdownWithPosition dropdownPosition='above wide left' />
    <DropdownSelect items={items} label='Auto Positioned' autoPositionY={true} />
  </Grid>
));
