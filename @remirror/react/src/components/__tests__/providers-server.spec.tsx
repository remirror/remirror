/**
 * @jest-environment node
 */

import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { createTestManager } from '@test-fixtures/schema-helpers';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useRemirror } from '../../react-hooks';
import { ManagedRemirrorProvider, RemirrorProvider } from '../providers';
import { RemirrorManager } from '../remirror-manager';

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
