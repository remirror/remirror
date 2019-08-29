import { fireEvent, render } from '@testing-library/react';
import React, { useState } from 'react';
import { Dropdown } from '../dropdown';
import { DropdownItem } from '../dropdown-types';

const createItems = (onSelect: (item: DropdownItem) => void): DropdownItem[] => [
  { label: 'Normal Text', value: 'p', onSelect },
  { label: 'Heading 1', value: 'h1', onSelect },
  { label: 'Heading 2', value: 'h2', onSelect },
];

test('Dropdown', () => {
  const label = 'Test';
  const Component = () => {
    const [items, setItems] = useState(
      createItems(item => {
        setItems(
          items.map(ii => (ii.value === item.value ? { ...ii, active: true } : { ...ii, active: false })),
        );
      }),
    );

    return <Dropdown items={items} label={label} initialItem={items[0]} />;
  };

  const { getByRole, getAllByRole } = render(<Component />);
  const button = getByRole('button');
  const menu = getByRole('listbox');
  expect(button).toHaveTextContent(label);
  expect(menu).toBeEmpty();

  fireEvent.click(button);
  const normalText = getAllByRole('option');
  fireEvent.click(normalText[0]);
});
