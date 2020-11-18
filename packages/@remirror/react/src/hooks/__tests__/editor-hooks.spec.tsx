import { act, renderHook } from '@testing-library/react-hooks';
import { RemirrorTestChain } from 'jest-remirror';
import React, { FC } from 'react';

import type { AnyRemirrorManager } from '@remirror/core';
import { ReactPreset } from '@remirror/preset-react';
import { BoldExtension } from '@remirror/testing';
import { act as renderAct, render, strictRender } from '@remirror/testing/react';

import { createReactManager, RemirrorProvider, useManager, useRemirror } from '../../..';

jest.mock('@remirror/preset-react', () => {
  const actual = jest.requireActual('@remirror/preset-react');
  return {
    ...actual,
    ReactPreset: jest.fn().mockImplementation((...args: any[]) => new actual.ReactPreset(...args)),
  };
});

describe('useManager', () => {
  it('does not recreate the react preset for every rerender', () => {
    const Component = (_: { options?: object }) => {
      useManager([], {});

      return null;
    };

    const { rerender } = render(<Component />);
    rerender(<Component options={{}} />);
    rerender(<Component options={{}} />);

    expect(ReactPreset).toHaveBeenCalledTimes(1);
  });

  it('rerenders when the manager is destroyed', () => {
    let manager: AnyRemirrorManager;
    const Component = (_: { options?: object }) => {
      manager = useManager([], {});

      return null;
    };

    const { rerender } = render(<Component />);

    rerender(<Component options={{}} />);
    rerender(<Component options={{}} />);

    renderAct(() => manager.destroy());
    expect(ReactPreset).toHaveBeenCalledTimes(2);

    rerender(<Component options={{}} />);
    expect(ReactPreset).toHaveBeenCalledTimes(2);
  });
});

describe('useRemirror', () => {
  it('returns the provider context', () => {
    const { wrapper } = createTestChain();
    const { result } = renderHook(() => useRemirror({ autoUpdate: true }), { wrapper });

    expect(result.current).toEqual(
      expect.objectContaining({
        nodes: expect.any(Object),
        marks: expect.any(Object),
        schema: expect.any(Object),
        tags: expect.any(Object),
        plugins: expect.any(Array),
        pluginKeys: expect.any(Object),
        getPluginState: expect.any(Function),
        getForcedUpdates: expect.any(Function),
        components: expect.any(Object),
        ssrTransformer: expect.any(Function),
        portalContainer: expect.any(Object),
        attributes: expect.any(Object),
        nodeViews: expect.any(Object),
        view: expect.any(Object),
        commands: expect.any(Object),
        chain: expect.any(Object),
        active: expect.any(Object),
        helpers: expect.any(Object),
        addHandler: expect.any(Function),
        uid: expect.any(String),
        getState: expect.any(Function),
        getPreviousState: expect.any(Function),
        getExtension: expect.any(Function),
        getPreset: expect.any(Function),
        clearContent: expect.any(Function),
        setContent: expect.any(Function),
        focus: expect.any(Function),
        blur: expect.any(Function),
        getRootProps: expect.any(Function),
      }),
    );
    expect(result.current.getState()).toEqual(result.current.getPreviousState());
  });

  it('can listen to updates', () => {
    const { chain, wrapper } = createTestChain();
    const { doc, p } = chain.nodes;
    const { result } = renderHook(
      () => useRemirror<BoldExtension>({ autoUpdate: true }),
      { wrapper },
    );
    expect(result.current.active.bold()).toBe(false);
    act(() => {
      chain.overwrite(doc(p('Welcome <start>friend<end>')));
    });
    expect(result.current.active.bold()).toBe(false);
    act(() => {
      result.current.commands.toggleBold();
    });
    expect(result.current.active.bold()).toBe(true);
  });

  it('can listen to updates with handler', () => {
    const { chain, wrapper } = createTestChain();
    const { doc, p } = chain.nodes;
    const mock = jest.fn();
    renderHook(() => useRemirror<BoldExtension>(mock), { wrapper });
    act(() => {
      chain.overwrite(doc(p('Welcome <start>friend<end>')));
    });
    expect(mock).toHaveBeenCalledTimes(2);
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
      renderAct(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(14);
  });
});

/**
 * A helper function for creating the editor setup when testing the editor
 * hooks.
 */
function createTestChain() {
  const chain = RemirrorTestChain.create(createReactManager(() => [new BoldExtension()]));

  const InnerComponent: FC = ({ children }) => {
    const { getRootProps } = useRemirror();

    return (
      <>
        {children}
        <div {...getRootProps()} />
      </>
    );
  };

  const Wrapper: FC = ({ children }) => {
    return (
      <RemirrorProvider manager={chain.manager}>
        <InnerComponent></InnerComponent>
        {children}
      </RemirrorProvider>
    );
  };

  return { chain, wrapper: Wrapper };
}
