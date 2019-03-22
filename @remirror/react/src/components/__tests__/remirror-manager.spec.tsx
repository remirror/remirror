import { Extension, ExtensionManager } from '@remirror/core';
import { Placeholder } from '@remirror/core-extensions';
import React, { FC } from 'react';
import { render } from 'react-testing-library';
import { useRemirrorManagerContext } from '../../hooks';
import { RemirrorExtension } from '../remirror-extension';
import { RemirrorManager } from '../remirror-manager';

test('a manager is created', () => {
  expect.assertions(1);
  const Component: FC = () => {
    const manager = useRemirrorManagerContext();
    expect(manager).toBeTruthy();
    return null;
  };

  render(
    <RemirrorManager>
      <Component />
    </RemirrorManager>,
  );
});

test('does not rerender the manager when nothing has changed', () => {
  expect.assertions(1);
  let manager: ExtensionManager;
  const Component: FC = () => {
    manager = useRemirrorManagerContext()!;
    return null;
  };

  const { rerender } = render(
    <RemirrorManager>
      <Component />
    </RemirrorManager>,
  );

  const firstManager = manager!;

  rerender(
    <RemirrorManager>
      <Component />
    </RemirrorManager>,
  );

  expect(manager!).toBe(firstManager);
});

class NewExtension extends Extension {
  get name() {
    return 'new';
  }
}

test('it supports <RemirrorExtension />', () => {
  const Component: FC = () => {
    const manager = useRemirrorManagerContext();
    expect(manager.extensions).toContainAnyValues([expect.any(NewExtension), expect.any(Placeholder)]);
    return null;
  };

  render(
    <RemirrorManager>
      <Component />
      <RemirrorExtension Constructor={NewExtension} />
      <RemirrorExtension Constructor={Placeholder} emptyNodeClass='empty' />
    </RemirrorManager>,
  );
});
