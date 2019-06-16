/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';

import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { useRemirror } from '../../hooks';
import { ManagedRemirrorProvider, RemirrorProvider } from '../providers';
import { RemirrorManager } from '../remirror-manager';

test('RemirrorProvider', () => {
  const TestComponent = () => {
    return <div data-testid='target' />;
  };

  const reactString = renderToString(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={createTestManager()}>
      <TestComponent />
    </RemirrorProvider>,
  );
  expect(reactString).toInclude('basic');
});

test('ManagedRemirrorProvider', () => {
  const TestComponent = () => {
    const { getRootProps } = useRemirror();

    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
      </div>
    );
  };

  const reactString = renderToString(
    <RemirrorManager>
      <ManagedRemirrorProvider initialContent={docNodeBasicJSON}>
        <TestComponent />
      </ManagedRemirrorProvider>
    </RemirrorManager>,
  );
  expect(reactString).toInclude('basic');
});
