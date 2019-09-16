import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { useMultishift } from '../multishift';

const Component = ({ multiple }: { multiple: boolean }) => {
  const items = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma' },
    { id: 'd', label: 'Delta' },
    { id: 'e', label: 'Epsilon' },
  ];

  const {
    getLabelProps,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    isOpen,
    selectedItems,
    getRemoveButtonProps,
  } = useMultishift({
    multiple,
    type: 'select',
    itemToString: item => (item ? item.id : ''),
    items,
    getItemId: item => item.id,
  });

  return (
    <div>
      <nav>
        <label {...getLabelProps()}>Label</label>
        {selectedItems.length && (
          <ul>
            {selectedItems.map(item => {
              return (
                <li key={item.id} {...getRemoveButtonProps({ item })} data-testid={item.id}>
                  {item.label}
                </li>
              );
            })}
          </ul>
        )}
        <button {...getToggleButtonProps()}>
          Click
          <ul {...getMenuProps()}>
            {isOpen &&
              items.map((item, index) => {
                return (
                  <li key={item.id} {...getItemProps({ index, item, disabled: item.id === 'd' })}>
                    {item.label}
                  </li>
                );
              })}
          </ul>
        </button>
      </nav>
    </div>
  );
};

test('it supports arrow keys when the button contains the menu', () => {
  const { getByText, getByRole } = render(<Component multiple={true} />);
  const button = getByRole('button');
  const menu = getByRole('listbox');
  fireEvent.focus(button);
  fireEvent.keyDown(button, { key: 'ArrowDown' });

  const alphaItem = getByText('Alpha');
  const betaItem = getByText('Beta');
  const gammaItem = getByText('Gamma');
  const deltaItem = getByText('Delta');
  const epsilonItem = getByText('Epsilon');

  expect(alphaItem).toHaveAttribute('aria-selected', 'true');

  fireEvent.keyDown(menu, { key: 'ArrowDown' });
  expect(alphaItem).toHaveAttribute('aria-selected', 'false');
  expect(betaItem).toHaveAttribute('aria-selected', 'true');

  fireEvent.keyDown(menu, { key: 'ArrowDown' });
  expect(betaItem).toHaveAttribute('aria-selected', 'false');
  expect(gammaItem).toHaveAttribute('aria-selected', 'true');

  fireEvent.keyDown(menu, { key: 'ArrowDown' });
  expect(gammaItem).toHaveAttribute('aria-selected', 'false');
  expect(deltaItem).toHaveAttribute('aria-selected', 'false');

  fireEvent.keyDown(menu, { key: 'ArrowDown' });
  expect(epsilonItem).toHaveAttribute('aria-selected', 'true');

  fireEvent.keyDown(menu, { key: 'ArrowDown' });
  expect(alphaItem).toHaveAttribute('aria-selected', 'true');
});
