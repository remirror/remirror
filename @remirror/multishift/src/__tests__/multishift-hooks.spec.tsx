import { act, render } from '@testing-library/react';
import React from 'react';
import { useSetA11y } from '../multishift-hooks';
import { DEFAULT_STATE } from '../multishift-utils';

test('useSetA11y', () => {
  const defaultItems = ['a', 'b', 'c'];
  const defaultSelectedItems = ['a'];

  interface ComponentProps {
    message?: string;
    items?: string[];
    selectedItems?: string[];
    isOpen?: boolean;
  }

  let setStatus!: React.Dispatch<React.SetStateAction<string>>;

  const Component = ({
    message = '',
    isOpen = false,
    items = defaultItems,
    selectedItems = defaultSelectedItems,
  }: ComponentProps) => {
    const [element, set] = useSetA11y({
      items,
      state: { ...DEFAULT_STATE, selectedItems, isOpen },
      customA11yStatusMessage: message,
    });

    setStatus = set;

    return <>{element}</>;
  };

  const { rerender, getByRole } = render(<Component />);
  const statusElement = getByRole('status');

  expect(statusElement).toHaveTextContent('');
  expect(statusElement).toHaveStyle(
    `border: 0px; height: 1px; width: 1px; margin: -1px; padding: 0px; overflow: hidden; position: absolute;`,
  );

  const customMessage = 'A custom status update';
  rerender(<Component message={customMessage} />);
  expect(statusElement).toHaveTextContent(customMessage);

  rerender(<Component isOpen={true} />);
  expect(statusElement).toHaveTextContent('a has been selected');

  rerender(<Component selectedItems={['b', 'c']} />);
  expect(statusElement).toHaveTextContent('b, c has been selected');

  const manualMessage = 'Manual state update';
  act(() => {
    setStatus(manualMessage);
  });
  expect(statusElement).toHaveTextContent(manualMessage);
});
