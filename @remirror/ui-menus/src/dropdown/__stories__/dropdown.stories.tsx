import { useRemirrorTheme } from '@remirror/ui';
import { storiesOf } from '@storybook/react';
import React, { FC, useState } from 'react';
import { Dropdown, DropdownItem } from '..';
import { DropdownProps } from '../dropdown';
import { capitalize } from '@remirror/core';

const Grid: FC = ({ children }) => {
  const { sx } = useRemirrorTheme();

  return (
    <div
      css={sx({
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridGap: 10,
        rowGap: 100,
        // justifyContent: 'center',
        // justifyItems: 'center',
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

const DropdownWithPosition = ({ dropdownPosition }: Required<Pick<DropdownProps, 'dropdownPosition'>>) => {
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
      defaultLabel={`Dropdown ${capitalize(dropdownPosition)}`}
      initialItem={items[0]}
      dropdownPosition={dropdownPosition}
    />
  );
};

storiesOf('Menus', module).add('Dropdown', () => (
  <Grid>
    <DropdownWithPosition dropdownPosition='below' />
    <DropdownWithPosition dropdownPosition='left' />
    <DropdownWithPosition dropdownPosition='right' />
    <DropdownWithPosition dropdownPosition='above' />
  </Grid>
));
