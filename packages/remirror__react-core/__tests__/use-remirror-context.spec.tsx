import { jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-hooks';
import { RemirrorTestChain } from 'jest-remirror';
import React, { FC, PropsWithChildren } from 'react';
import { BoldExtension } from 'remirror/extensions';
import { act as renderAct, strictRender } from 'testing/react';

import { createReactManager, Remirror, useRemirrorContext } from '../';

describe('useRemirrorContext', () => {
  it('returns the provider context', () => {
    const { wrapper } = createTestChain();
    const { result } = renderHook(() => useRemirrorContext({ autoUpdate: true }), { wrapper });

    expect(Object.keys(result.current).sort()).toMatchSnapshot();
    expect(result.current.getState()).toEqual(result.current.getPreviousState());
  });

  it('can listen to updates', () => {
    const { chain, wrapper } = createTestChain();
    const { doc, p } = chain.nodes;
    const { result } = renderHook(() => useRemirrorContext<BoldExtension>({ autoUpdate: true }), {
      wrapper,
    });
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
    const mock: any = jest.fn();
    renderHook(() => useRemirrorContext<BoldExtension>(mock), { wrapper });
    act(() => {
      chain.overwrite(doc(p('Welcome <start>friend<end>')));
    });
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('should auto update when in strict mode', () => {
    const mock: any = jest.fn();
    const HookComponent: FC = () => {
      useRemirrorContext({ autoUpdate: true });
      mock();
      return <div />;
    };
    const chain = RemirrorTestChain.create(createReactManager([]));
    strictRender(
      <Remirror manager={chain.manager}>
        <HookComponent />
      </Remirror>,
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

  const Wrapper: FC<PropsWithChildren<object>> = ({ children }) => (
    <Remirror manager={chain.manager} autoRender>
      {children}
    </Remirror>
  );

  return { chain, wrapper: Wrapper };
}
