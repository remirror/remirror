/**
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { docNodeBasicJSON } from '@remirror/testing';
import { createReactManager } from '@remirror/testing/react';

import { useRemirror } from '../../hooks';
import { RemirrorProvider } from '../providers';

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
    <RemirrorProvider initialContent={docNodeBasicJSON} manager={createReactManager([])}>
      <TestComponent />
    </RemirrorProvider>
  );
  const reactString = renderToStaticMarkup(element);

  expect(reactString).toInclude('basic');
});
