import { act, renderHook } from '@testing-library/react-hooks';
import { RemirrorTestChain } from 'jest-remirror';
import React, { FC } from 'react';

import { createReactManager } from '@remirror/testing/react';

import { SocialProvider } from '../../components/social-provider';
import { socialManagerArgs } from '../../social-utils';
import { useSocialRemirror } from '../use-social';
import { useSocialEmoji } from '../use-social-emoji';

function createChain() {
  const manager = createReactManager(...socialManagerArgs([]));
  const chain = RemirrorTestChain.create(manager);
  const { doc, p } = chain.nodes;

  const InnerComponent: FC = ({ children }) => {
    const { getRootProps } = useSocialRemirror();

    return (
      <>
        {children}
        <div {...getRootProps()} />
      </>
    );
  };

  const Wrapper: FC = ({ children }) => {
    return (
      <SocialProvider manager={manager} initialContent={[doc(p('Initial content ')), 'end']}>
        <InnerComponent>{children}</InnerComponent>
      </SocialProvider>
    );
  };

  return { chain, Wrapper };
}

function acts(methods: Array<() => void | undefined>) {
  for (const method of methods) {
    act(method);
  }
}

describe('useSocialEmoji', () => {
  it('should respond to emoji changes', () => {
    const { chain, Wrapper } = createChain();

    const { result } = renderHook(() => useSocialEmoji(), {
      wrapper: Wrapper,
    });

    expect(result.current).toEqual({
      list: [],
      command: undefined,
      index: 0,
    });

    act(() => {
      chain.insertText(':a');
    });

    expect(result.current.command).toBeFunction();
    expect(result.current.list.length > 0).toBeTrue();
  });

  it('should correctly add the emoji when the command is called', () => {
    const { Wrapper, chain } = createChain();

    const { result } = renderHook(() => useSocialEmoji(), {
      wrapper: Wrapper,
    });

    acts([
      () => {
        chain.insertText(':');
      },
      () => result.current.command?.(result.current.list[0]),
    ]);

    expect(chain.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content 👍
      </p>
    `);
  });

  it('should clear suggestions when the `Escape` key is pressed', () => {
    const { chain, Wrapper } = createChain();

    const { result } = renderHook(() => useSocialEmoji(), {
      wrapper: Wrapper,
    });

    acts([
      () => {
        chain.insertText(':');
      },
      () => {
        chain.press('Escape');
      },
    ]);

    expect(result.current).toEqual({
      list: [],
      command: undefined,
      index: 0,
    });
  });

  it('should choose selection when `Enter` key is pressed', () => {
    const { Wrapper, chain } = createChain();

    renderHook(() => useSocialEmoji(), {
      wrapper: Wrapper,
    });

    acts([
      () => {
        chain.insertText(':');
      },
      () => {
        chain.press('Enter');
      },
    ]);

    expect(chain.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content 👍
      </p>
    `);
  });

  it('should update index when `Arrow` keys are used', () => {
    const { Wrapper, chain } = createChain();

    const { result } = renderHook(() => useSocialEmoji(), {
      wrapper: Wrapper,
    });

    acts([
      () => {
        chain.insertText(':');
      },
      () => {
        chain.press('ArrowDown');
      },
    ]);

    expect(result.current.index).toBe(1);

    acts([
      () => {
        chain.press('ArrowUp');
      },
      () => {
        chain.press('ArrowUp');
      },
    ]);

    expect(result.current.index).toBe(result.current.list.length - 1);
  });
});
