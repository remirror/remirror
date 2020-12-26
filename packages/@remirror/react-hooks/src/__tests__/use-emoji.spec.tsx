import { act, renderHook } from '@testing-library/react-hooks';
import { RemirrorTestChain } from 'jest-remirror';
import { FC } from 'react';
import { EmojiExtension } from 'remirror/extensions';
import { createReactManager, Remirror, useRemirrorContext } from 'remirror/react';

import { act as renderAct, strictRender } from '@remirror/testing/react';

import { EmojiState, useEmoji } from '../use-emoji';

function createChain() {
  const manager = createReactManager(() => [new EmojiExtension()]);
  const chain = RemirrorTestChain.create(manager);
  const { doc, p } = chain.nodes;

  const Wrapper: FC = ({ children }) => {
    return (
      <Remirror manager={manager} initialContent={[doc(p('Initial content ')), 'end']} autoRender>
        {children}
      </Remirror>
    );
  };

  return { chain, Wrapper };
}

function acts(methods: Array<() => void | undefined>) {
  for (const method of methods) {
    act(method);
  }
}

describe('useEmoji', () => {
  it('should respond to emoji changes', () => {
    const { chain, Wrapper } = createChain();

    const { result } = renderHook(() => useEmoji(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBeNull();

    act(() => {
      chain.insertText(':a');
    });

    expect(result.current).toEqual({
      range: { from: 17, to: 19, cursor: 19 },
      command: expect.any(Function),
      list: expect.any(Array),
      index: 0,
    });
    expect(result.current?.list.length).toBeGreaterThan(0);
  });

  it('should correctly add the emoji when the command is called', () => {
    const { Wrapper, chain } = createChain();

    const { result } = renderHook(() => useEmoji(), {
      wrapper: Wrapper,
    });

    acts([
      () => {
        chain.insertText(':');
      },
      () => result.current?.command?.(result.current.list[0]),
    ]);

    expect(chain.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content 👍
      </p>
    `);
  });

  it('should clear suggestions when the `Escape` key is pressed', () => {
    const { chain, Wrapper } = createChain();

    const { result } = renderHook(() => useEmoji(), {
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

    expect(result.current).toBeNull();

    acts([
      () => {
        chain.insertText('a');
      },
    ]);

    expect(result.current).toBeNull();
  });

  it('should choose selection when `Enter` key is pressed', () => {
    const { Wrapper, chain } = createChain();

    renderHook(() => useEmoji(), {
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

    const { result } = renderHook(() => useEmoji(), {
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

    expect(result.current?.index).toBe(1);

    acts([
      () => {
        chain.press('ArrowUp');
      },
      () => {
        chain.press('ArrowUp');
      },
    ]);

    expect(result.current?.index).toBe(result.current!.list.length - 1);
  });

  it('can be used with `autoUpdate`', () => {
    const { Wrapper, chain } = createChain();
    const ref: { current: EmojiState | null } = { current: null };

    const Component = () => {
      useRemirrorContext({ autoUpdate: true });
      ref.current = useEmoji();

      return null;
    };

    strictRender(
      <Wrapper>
        <Component />
      </Wrapper>,
    );

    renderAct(() => {
      chain.insertText(':');
    });

    expect(ref.current).toEqual(expect.objectContaining({ index: 0 }));
  });
});
