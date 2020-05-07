/**
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createTestManager, docNodeBasicJSON } from '@remirror/test-fixtures';

import { useRemirror } from '../../hooks/use-remirror';
import { RemirrorProvider } from '../remirror-provider';

test('RemirrorProvider', () => {
  const TestComponent = () => {
    const { getRootProps } = useRemirror();
    const rootProps = getRootProps();
    return (
      <div data-testid='1'>
        <div data-testid='2'>
          <div data-testid='target' {...rootProps} />
        </div>
      </div>
    );
  };

  const element = (
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={createTestManager()}>
      <TestComponent />
    </RemirrorProvider>
  );
  const reactString = renderToStaticMarkup(element);

  expect(reactString).toInclude('basic');
});
