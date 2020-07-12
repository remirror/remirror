import React, { FC } from 'react';

import { docNodeBasicJSON } from '@remirror/testing';
import { createReactManager, render } from '@remirror/testing/react';

import { useRemirror } from '../../hooks';
import { RemirrorProvider } from '../providers';

test('`RemirrorProvider`', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirror();
    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const manager = createReactManager([]);

  const { getByRole, getByTestId } = render(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </RemirrorProvider>,
  );
  const target = getByTestId('target');
  const editor = getByRole('textbox');

  expect(target).toContainElement(editor);
});

test('multiple `getRootProps` applied to dom throw an error', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const manager = createReactManager([]);
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirror();

    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
        <div data-testid='target1' {...getRootProps()} />
      </div>
    );
  };

  expect(() =>
    render(
      <RemirrorProvider manager={manager}>
        <TestComponent />
      </RemirrorProvider>,
    ),
  ).toThrowErrorMatchingSnapshot();

  spy.mockRestore();
});
