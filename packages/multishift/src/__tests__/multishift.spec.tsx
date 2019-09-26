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
    itemToString: item => item.id,
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
        <button {...getToggleButtonProps()}>Click</button>
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
      </nav>
    </div>
  );
};

test('uncontrolled editor with multiple selection enabled', () => {
  const { getByTestId, getByRole, getByText, getAllByTestId } = render(<Component multiple={true} />);
  expect(getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');

  const button = getByRole('button');
  fireEvent.click(button);

  const alphaItem = getByText('Alpha');
  const betaItem = getByText('Beta');
  const gammaItem = getByText('Gamma');
  const deltaItem = getByText('Delta');
  fireEvent.click(alphaItem);
  fireEvent.click(betaItem);

  fireEvent.mouseMove(gammaItem);
  expect(gammaItem).toHaveAttribute('aria-selected', 'true');
  fireEvent.mouseMove(deltaItem);
  expect(deltaItem).toHaveAttribute('aria-selected', 'false');

  const alphaDisplay = getByTestId('a');
  fireEvent.click(alphaDisplay);
  expect(alphaDisplay).not.toBeInTheDocument();

  // Previous item should lose hover once another item is selected / removed
  expect(gammaItem).toHaveAttribute('aria-selected', 'false');

  fireEvent.mouseMove(betaItem);
  expect(betaItem).toHaveAttribute('aria-selected', 'true');
  fireEvent.mouseLeave(betaItem);
  expect(betaItem).toHaveAttribute('aria-selected', 'false');

  fireEvent.click(betaItem);
  expect(() => getAllByTestId('b')).toThrow();
});

test('shift click highlights the element', () => {
  const { getByRole, getByText } = render(<Component multiple={true} />);

  const button = getByRole('button');
  fireEvent.click(button);

  const alphaItem = getByText('Alpha');
  const betaItem = getByText('Beta');
  const gammaItem = getByText('Gamma');
  const deltaItem = getByText('Delta');
  const epsilonItem = getByText('Epsilon');
  fireEvent.click(alphaItem, { shiftKey: true });
  fireEvent.click(epsilonItem, { shiftKey: true });

  expect(alphaItem).toHaveAttribute('aria-selected', 'true');
  expect(betaItem).toHaveAttribute('aria-selected', 'true');
  expect(gammaItem).toHaveAttribute('aria-selected', 'true');
  expect(epsilonItem).toHaveAttribute('aria-selected', 'true');
  expect(deltaItem).toHaveAttribute('aria-selected', 'false');
});

test('ctrl click highlights an individual element', () => {
  const { getByRole, getByText } = render(<Component multiple={true} />);

  const button = getByRole('button');
  fireEvent.click(button);

  const alphaItem = getByText('Alpha');
  const gammaItem = getByText('Gamma');
  const deltaItem = getByText('Delta');
  fireEvent.click(alphaItem, { ctrlKey: true });
  fireEvent.click(gammaItem, { ctrlKey: true });
  fireEvent.click(deltaItem, { ctrlKey: true });

  expect(alphaItem).toHaveAttribute('aria-selected', 'true');
  expect(gammaItem).toHaveAttribute('aria-selected', 'true');
  expect(deltaItem).toHaveAttribute('aria-selected', 'false');
});

test('ctrl click toggles the highlight for an individual element', () => {
  const { getByRole, getByText } = render(<Component multiple={true} />);

  const button = getByRole('button');
  fireEvent.click(button);

  const alphaItem = getByText('Alpha');
  const betaItem = getByText('Beta');
  const gammaItem = getByText('Gamma');
  const epsilonItem = getByText('Epsilon');
  fireEvent.click(alphaItem, { ctrlKey: true });
  fireEvent.click(alphaItem, { ctrlKey: true });

  expect(alphaItem).toHaveAttribute('aria-selected', 'false');

  fireEvent.click(gammaItem, { ctrlKey: true });
  fireEvent.click(betaItem, { ctrlKey: true });
  fireEvent.click(epsilonItem, { ctrlKey: true });
  fireEvent.click(alphaItem, { ctrlKey: true });
  fireEvent.click(betaItem, { ctrlKey: true });

  expect(betaItem).toHaveAttribute('aria-selected', 'false');
});

test('it combines ctrl and shift click highlights an individual element', () => {
  const { getByRole, getByText } = render(<Component multiple={true} />);

  const button = getByRole('button');
  fireEvent.click(button);

  const alphaItem = getByText('Alpha');
  const betaItem = getByText('Beta');
  const gammaItem = getByText('Gamma');
  const deltaItem = getByText('Delta');
  const epsilonItem = getByText('Epsilon');
  fireEvent.click(alphaItem, { shiftKey: true });
  fireEvent.click(betaItem, { shiftKey: true });
  fireEvent.click(epsilonItem, { ctrlKey: true });
  fireEvent.click(gammaItem, { shiftKey: true });

  expect(alphaItem).toHaveAttribute('aria-selected', 'true');
  expect(betaItem).toHaveAttribute('aria-selected', 'true');
  expect(gammaItem).toHaveAttribute('aria-selected', 'true');
  expect(epsilonItem).toHaveAttribute('aria-selected', 'true');
  expect(deltaItem).toHaveAttribute('aria-selected', 'false');
});

test('after selection shift click creates a new highlight group including index', () => {
  const { getByRole, getByText } = render(<Component multiple={true} />);

  const button = getByRole('button');
  fireEvent.click(button);

  const alphaItem = getByText('Alpha');
  const betaItem = getByText('Beta');
  const gammaItem = getByText('Gamma');
  // const epsilonItem = getByText('Epsilon');
  fireEvent.click(alphaItem);
  fireEvent.click(gammaItem, { shiftKey: true });

  // expect(alphaItem).toHaveAttribute('aria-selected', 'true');
  expect(betaItem).toHaveAttribute('aria-selected', 'true');
  expect(gammaItem).toHaveAttribute('aria-selected', 'true');
});

test('it supports arrow keys', () => {
  const { getByText, getByRole } = render(<Component multiple={false} />);
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

test('it supports multi highlight arrow keys', () => {
  const { getByText, getByRole, getByTestId } = render(<Component multiple={true} />);
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

  fireEvent.keyDown(menu, { key: 'ArrowDown', shiftKey: true });
  expect(alphaItem).toHaveAttribute('aria-selected', 'true');
  expect(betaItem).toHaveAttribute('aria-selected', 'true');

  fireEvent.keyDown(menu, { key: 'ArrowDown', shiftKey: true });
  expect(betaItem).toHaveAttribute('aria-selected', 'true');
  expect(gammaItem).toHaveAttribute('aria-selected', 'true');

  fireEvent.keyDown(menu, { key: 'ArrowDown', shiftKey: true });
  expect(gammaItem).toHaveAttribute('aria-selected', 'true');
  expect(deltaItem).toHaveAttribute('aria-selected', 'false');

  fireEvent.keyDown(menu, { key: 'ArrowDown', shiftKey: true });
  expect(epsilonItem).toHaveAttribute('aria-selected', 'true');

  fireEvent.keyDown(menu, { key: 'Enter' });
  ['a', 'b', 'c', 'e'].forEach(id => getByTestId(id));

  expect(() => getByTestId('d')).toThrow();
});
