import { ExtensionManager } from '@remirror/core';
import { baseExtensions, ParagraphExtension, PlaceholderExtension } from '@remirror/core-extensions';
import { TestExtension } from '@test-fixtures/schema-helpers';
import { render, RenderResult } from '@testing-library/react';
import { EditorView } from 'prosemirror-view';
import React, { FC } from 'react';
import { useRemirrorManager } from '../../react-hooks';
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
        <RemirrorExtension Constructor={TestExtension} run={true} />
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
        <RemirrorExtension Constructor={TestExtension} run={true} />
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
        <RemirrorExtension Constructor={TestExtension} run={true} />
        <RemirrorExtension
          Constructor={PlaceholderExtension}
          emptyNodeClass='empty'
          placeholder='Type here'
        />
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
    expect(manager.extensions).toContainValues([expect.any(TestExtension), expect.any(PlaceholderExtension)]);
    return null;
  };

  render(
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
});

test('it supports <RemirrorExtension /> in child fragments', () => {
  const Component: FC = () => {
    const manager = useRemirrorManager();
    expect(manager.extensions).toContainValues([expect.any(TestExtension), expect.any(PlaceholderExtension)]);
    return null;
  };

  render(
    <RemirrorManager>
      <Component />
      <>
        <RemirrorExtension Constructor={TestExtension} run={true} />
      </>
      <RemirrorExtension
        Constructor={PlaceholderExtension}
        emptyNodeClass='empty'
        placeholder='Type here...'
      />
    </RemirrorManager>,
  );
});

test('it supports overriding base extensions', () => {
  const originalParagraph = baseExtensions.find(({ extension: { name } }) => name === 'paragraph');

  const Component: FC = () => {
    const manager = useRemirrorManager();
    expect(manager.extensions).not.toContain([originalParagraph]);
    expect(
      manager.extensions.find(({ options }) => {
        return options.indentLevels && options.indentLevels[1] === 1;
      }),
    ).toBeTruthy();
    return null;
  };

  render(
    <RemirrorManager>
      <Component />
      <RemirrorExtension Constructor={ParagraphExtension} indentLevels={[0, 1]} />
    </RemirrorManager>,
  );
});
