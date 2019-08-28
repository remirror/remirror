import { capitalize } from '@remirror/core-helpers';
import { useRemirrorTheme } from '@remirror/ui';
import { storiesOf } from '@storybook/react';
import React, { FC, useState } from 'react';
import { Dropdown } from '../dropdown-button';
import { DropdownItem, DropdownProps } from '../dropdown-types';

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

const createItems = (onSelect: (item: DropdownItem) => void): DropdownItem[] => [
  { label: 'Normal Text', value: 'p', onSelect },
  { label: 'Heading 1', value: 'h1', onSelect },
  { label: 'Heading 2', value: 'h2', onSelect },
];

const DropdownWithPosition = ({
  dropdownPosition = 'below left',
}: Pick<DropdownProps, 'dropdownPosition'>) => {
  const [items, setItems] = useState(
    createItems(item => {
      console.log('setting item', item);
      setItems(
        items.map(ii => (ii.value === item.value ? { ...ii, active: true } : { ...ii, active: false })),
      );
    }),
  );

  return (
    <Dropdown
      items={items}
      label={dropdownPosition
        .split(' ')
        .map(capitalize)
        .join(' ')}
      initialItem={items[0]}
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
  </Grid>
));
