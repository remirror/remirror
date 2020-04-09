/** @jsx jsx */

import { jsx } from '@emotion/core';
import { render } from '@testing-library/react';
import { FC } from 'react';

import { createBaseTestManager, docNodeBasicJSON } from '@remirror/test-fixtures';

import { useRemirror } from '../../hooks/use-remirror';
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
