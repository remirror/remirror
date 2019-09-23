import { fireEvent, render } from '@testing-library/react';
import React, { useState } from 'react';
import { DropdownSelect } from '../dropdown';
import { DropdownItem } from '../dropdown-types';

const items = [
  { label: 'Normal Text', id: 'p' },
  { label: 'Heading 1', id: 'h1' },
  { label: 'Heading 2', id: 'h2' },
];

test('Dropdown', () => {
  const label = 'Test';
  const Component = () => {
    const [selectedItems, setSelectedItems] = useState<DropdownItem[]>([]);
    return (
      <DropdownSelect
        items={items}
        label={label}
        initialItem={items[0]}
        selectedItems={selectedItems}
        onSelect={selected => {
          setSelectedItems(selected);
        }}
      />
    );
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
