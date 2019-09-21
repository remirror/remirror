import { docNodeBasicJSON } from '@remirror/test-fixtures';
import { createBaseTestManager } from '@remirror/test-fixtures';
import { render } from '@testing-library/react';
import React, { FC } from 'react';
import { useRemirrorContext } from '../../hooks/context-hooks';
import { RemirrorManager } from '../remirror-manager';
import { ManagedRemirrorProvider, RemirrorProvider } from '../remirror-providers';

test('ManagedRemirrorProvider', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirrorContext();
    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const { getByRole, getByTestId } = render(
    <RemirrorManager>
      <ManagedRemirrorProvider initialContent={docNodeBasicJSON}>
        <TestComponent />
      </ManagedRemirrorProvider>
    </RemirrorManager>,
  );
  const target = getByTestId('target');
  const editor = getByRole('textbox');
  expect(target).toContainElement(editor);
});

test('RemirrorProvider', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirrorContext();
    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const manager = createBaseTestManager();

  const { getByRole, getByTestId } = render(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </RemirrorProvider>,
  );
  const target = getByTestId('target');
  const editor = getByRole('textbox');
  expect(target).toContainElement(editor);
});
