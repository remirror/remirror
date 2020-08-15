import { RemirrorTestChain } from 'jest-remirror';
import React, { FC } from 'react';

import { RemirrorManager } from '@remirror/core';
import { emptyCoords, emptyVirtualPosition } from '@remirror/extension-positioner';
import { EditorView } from '@remirror/pm/view';
import { act, createReactManager, render, strictRender } from '@remirror/testing/react';

import { RemirrorProvider } from '../components/providers';
import { useMultiPositioner, usePositioner, useRemirror } from '../hooks';

describe('useRemirror', () => {
  it('matches the expected shape', () => {
    const HookComponent: FC = () => {
      const injectedProps = useRemirror();
      expect(injectedProps).toMatchObject({
        view: expect.any(EditorView),
        manager: expect.any(RemirrorManager),
        commands: expect.any(Object),
        uid: expect.any(String),
        clearContent: expect.any(Function),
        setContent: expect.any(Function),
        getRootProps: expect.any(Function),
      });

      return <div />;
    };

    strictRender(
      <RemirrorProvider manager={createReactManager([])}>
        <HookComponent />
      </RemirrorProvider>,
    );
  });

  it('should auto update for each change in prosemirror state', () => {
    const mock = jest.fn();
    const chain = RemirrorTestChain.create(createReactManager([]));

    const HookComponent: FC = () => {
      useRemirror({ autoUpdate: true });
      mock();

      return <div />;
    };

    render(
      <RemirrorProvider manager={chain.manager}>
        <HookComponent />
      </RemirrorProvider>,
    );

    for (const char of 'Word') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(5);
  });

  it('should auto update when in strict mode', () => {
    const mock = jest.fn();

    const HookComponent: FC = () => {
      useRemirror({ autoUpdate: true });
      mock();

      return <div />;
    };

    const chain = RemirrorTestChain.create(createReactManager([]));

    strictRender(
      <RemirrorProvider manager={chain.manager}>
        <HookComponent />
      </RemirrorProvider>,
    );

    for (const char of 'Strict') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(14);
  });
});

test('`usePositioner` default values', () => {
  const HookComponent: FC = () => {
    const positionerProps = usePositioner('bubble');
    const positioners = useMultiPositioner('bubble');

    expect(positionerProps).toEqual({ active: false, ...emptyCoords, ...emptyVirtualPosition });
    expect(positioners).toEqual([]);

    return <div />;
  };

  strictRender(
    <RemirrorProvider manager={createReactManager([])}>
      <HookComponent />
    </RemirrorProvider>,
  );
});
