import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Multishift } from '../multishift';

const Component = ({ multiple }: { multiple: boolean }) => {
  const items = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma' },
    { id: 'd', label: 'Delta' },
    { id: 'e', label: 'Epsilon' },
  ];

  return (
    <Multishift
      multiple={multiple}
      itemToString={(item: typeof items[number] | null) => (item ? item.id : '')}
    >
      {({
        getLabelProps,
        getToggleButtonProps,
        getMenuProps,
        getItemProps,
        isOpen,
        selectedItems,
        getRemoveButtonProps,
      }) => {
        return (
          <menu>
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
          </menu>
        );
      }}
    </Multishift>
  );
};

test('uncontrolled editor with multiple selection enabled', () => {
  const { getByTestId, getByRole, getByText } = render(<Component multiple={true} />);
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

  fireEvent.click(betaItem);
  expect(() => getByTestId('b')).toThrow();
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
