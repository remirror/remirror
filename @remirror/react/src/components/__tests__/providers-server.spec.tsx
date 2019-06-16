/**
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { useRemirror } from '../../hooks';
import { ManagedRemirrorProvider, RemirrorProvider } from '../providers';
import { RemirrorManager } from '../remirror-manager';

test('RemirrorProvider', () => {
  const TestComponent = () => {
    return <div data-testid='target' />;
  };

  const reactString = renderToStaticMarkup(
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={createTestManager()}>
      <TestComponent />
    </RemirrorProvider>,
  );
  expect(reactString).toInclude('basic');
});

test('ManagedRemirrorProvider', () => {
  // global.render = renderToStaticMarkup;
  const TestComponent = () => {
    const { getRootProps } = useRemirror();
    const rootProps = getRootProps();
    return (
      <div>
        <div data-testid='target' {...rootProps} />
      </div>
    );
  };

  const reactString = renderToStaticMarkup(
    <RemirrorManager>
      <ManagedRemirrorProvider initialContent={docNodeBasicJSON}>
        <TestComponent />
      </ManagedRemirrorProvider>
    </RemirrorManager>,
  );
  expect(reactString).toInclude('basic');
});
