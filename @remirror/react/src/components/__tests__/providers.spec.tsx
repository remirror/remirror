import { render } from '@testing-library/react';
import React, { FC } from 'react';

import { createBaseManager, docNodeBasicJSON } from '@remirror/test-fixtures';

import { useRemirror } from '../../hooks';
import { RemirrorProvider } from '../remirror-provider';

test('RemirrorProvider', () => {
  const TestComponent: FC = () => {
    const { getRootProps } = useRemirror();
    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const manager = createBaseManager();

  const { getByRole, getByTestId } = render(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={manager}>
      <TestComponent />
    </RemirrorProvider>,
  );
  const target = getByTestId('target');
  const editor = getByRole('textbox');

  expect(target).toContainElement(editor);
});
