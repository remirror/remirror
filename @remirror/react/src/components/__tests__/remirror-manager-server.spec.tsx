/**
 * @jest-environment node
 */

import { BaseExtensionOptions, Extension } from '@remirror/core';
import { PlaceholderExtension } from '@remirror/core-extensions';
import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import React, { FC } from 'react';
import { renderToString } from 'react-dom/server';
import { useRemirrorManager } from '../../hooks';
import { ManagedRemirrorProvider } from '../providers';
import { RemirrorExtension } from '../remirror-extension';
import { RemirrorManager } from '../remirror-manager';

class NewExtension extends Extension<{ run: boolean } & BaseExtensionOptions> {
  get name() {
    return 'new' as const;
  }

  get defaultOptions() {
    return {
      run: true,
    };
  }
}

test('it supports <RemirrorExtension />', () => {
  expect.assertions(2);

  const Component: FC = () => {
    const manager = useRemirrorManager();
    expect(manager.extensions).toContainAnyValues([
      expect.any(NewExtension),
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
      <RemirrorExtension Constructor={NewExtension} />
      <RemirrorExtension Constructor={PlaceholderExtension} emptyNodeClass='empty' />
    </RemirrorManager>,
  );

  expect(htmlString).toInclude('basic');
});
