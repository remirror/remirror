/**
 * @jest-environment node
 */

import { docNodeBasicJSON } from '@remirror/test-fixtures';
import { createTestManager } from '@remirror/test-fixtures';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useRemirrorContext } from '../../hooks/context-hooks';
import { RemirrorManager } from '../remirror-manager';
import { ManagedRemirrorProvider, RemirrorProvider } from '../remirror-providers';

test('RemirrorProvider', () => {
  const TestComponent = () => {
    const { getRootProps } = useRemirrorContext();
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
    const { getRootProps } = useRemirrorContext();
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
