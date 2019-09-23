/**
 * @jest-environment node
 */

import { PlaceholderExtension } from '@remirror/core-extensions';
import { docNodeBasicJSON } from '@remirror/test-fixtures';
import { TestExtension } from '@remirror/test-fixtures';
import React, { FC } from 'react';
import { renderToString } from 'react-dom/server';
import { useRemirrorManager } from '../../hooks/context-hooks';
import { RemirrorExtension } from '../remirror-extension';
import { RemirrorManager } from '../remirror-manager';
import { ManagedRemirrorProvider } from '../remirror-providers';

test('it supports <RemirrorExtension />', () => {
  expect.assertions(2);

  const Component: FC = () => {
    const manager = useRemirrorManager();
    expect(manager.extensions).toContainAnyValues([
      expect.any(TestExtension),
      expect.any(PlaceholderExtension),
    ]);

    return (
      <ManagedRemirrorProvider initialContent={docNodeBasicJSON} childAsRoot={true}>
        <div>I am alive</div>
      </ManagedRemirrorProvider>
    );
  };

  const htmlString = renderToString(
    <RemirrorManager>
      <Component />
      <RemirrorExtension Constructor={TestExtension} run={true} />
      <RemirrorExtension
        Constructor={PlaceholderExtension}
        emptyNodeClass='empty'
        placeholder='Type here...'
      />
    </RemirrorManager>,
  );

  expect(htmlString).toInclude('basic');
});
