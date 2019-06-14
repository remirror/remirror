import { BaseExtensionOptions, Extension, ExtensionManager } from '@remirror/core';
import { PlaceholderExtension } from '@remirror/core-extensions';
import { render, RenderResult } from '@testing-library/react';
import { EditorView } from 'prosemirror-view';
import React, { FC } from 'react';
import { useRemirrorManager } from '../../hooks';
import { ManagedRemirrorProvider } from '../providers';
import { RemirrorExtension } from '../remirror-extension';
import { RemirrorManager } from '../remirror-manager';

test('a manager is created', () => {
  expect.assertions(1);
  const Component: FC = () => {
    const manager = useRemirrorManager();
    expect(manager).toBeTruthy();
    return null;
  };

  render(
    <RemirrorManager>
      <Component />
    </RemirrorManager>,
  );
});

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

describe('manager prop', () => {
  let manager!: ExtensionManager;
  let rerender: RenderResult['rerender'];
  const Component: FC = () => {
    manager = useRemirrorManager()!;
    return null;
  };

  beforeEach(() => {
    ({ rerender } = render(
      <RemirrorManager>
        <RemirrorExtension Constructor={NewExtension} />
        <ManagedRemirrorProvider>
          <Component />
        </ManagedRemirrorProvider>
      </RemirrorManager>,
    ));
  });

  it('does not rerender the manager when nothing has changed', () => {
    const firstManager = manager;

    rerender(
      <RemirrorManager>
        <RemirrorExtension Constructor={NewExtension} />
        <ManagedRemirrorProvider>
          <Component />
        </ManagedRemirrorProvider>
      </RemirrorManager>,
    );

    expect(manager).toBe(firstManager);
  });

  test('it supports reconfiguring extensions', () => {
    const firstManager = manager;
    const initSpy = jest.spyOn(ExtensionManager.prototype, 'init');
    const initViewSpy = jest.spyOn(ExtensionManager.prototype, 'initView');
    rerender(
      <RemirrorManager>
        <ManagedRemirrorProvider>
          <Component />
        </ManagedRemirrorProvider>
        <RemirrorExtension Constructor={NewExtension} />
        <RemirrorExtension Constructor={PlaceholderExtension} emptyNodeClass='empty' />
      </RemirrorManager>,
    );

    expect(manager).not.toEqual(firstManager);
    expect(manager.data.directPlugins).not.toEqual(firstManager.data.directPlugins);
    expect(initSpy).toHaveBeenCalled();
    expect(initViewSpy).toHaveBeenCalledWith(expect.any(EditorView));
  });
});

test('it supports <RemirrorExtension />', () => {
  const Component: FC = () => {
    const manager = useRemirrorManager();
    expect(manager.extensions).toContainAnyValues([
      expect.any(NewExtension),
      expect.any(PlaceholderExtension),
    ]);
    return null;
  };

  render(
    <RemirrorManager>
      <Component />
      <RemirrorExtension Constructor={NewExtension} />
      <RemirrorExtension Constructor={PlaceholderExtension} emptyNodeClass='empty' />
    </RemirrorManager>,
  );
});
