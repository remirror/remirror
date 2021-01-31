import { act, renderHook } from '@testing-library/react-hooks';
import { RemirrorTestChain } from 'jest-remirror';
import { FC } from 'react';
import { EmojiExtension } from 'remirror/extensions';
import data from 'svgmoji/emoji.json';
import { act as renderAct, strictRender } from 'testing/react';
import { createReactManager, Remirror, useRemirrorContext } from '@remirror/react';

import { useEmoji, UseEmojiReturn } from '../use-emoji';

function createChain() {
  const manager = createReactManager(() => [new EmojiExtension({ data })]);
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

    expect(result.current?.state).toBeNull();

    act(() => {
      chain.insertText(':a');
    });

    expect(result.current?.state).toEqual({
      range: { from: 17, to: 19, cursor: 19 },
      apply: expect.any(Function),
      list: expect.any(Array),
      query: 'a',
    });

    expect(result.current?.index).toBe(0);

    expect(result.current?.state?.list.length).toBeGreaterThan(0);
  });

  it('should correctly add the emoji when the command is called', () => {
    const { Wrapper, chain } = createChain();

    const { result } = renderHook(() => useEmoji(), {
      wrapper: Wrapper,
    });

    acts([
      () => {
        chain.insertText(':red_heart');
      },
      () => result.current?.state?.apply(result.current.state?.list[0]?.emoji ?? ''),
    ]);

    expect(chain.innerHTML).toMatchSnapshot();
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

    expect(result.current?.state).toBeNull();

    acts([
      () => {
        chain.insertText('a');
      },
    ]);

    expect(result.current?.state).toBeNull();
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

    expect(chain.innerHTML).toMatchSnapshot();
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

    expect(result.current?.index).toBe(result.current!.state!.list.length - 1);
  });

  it('should update index when `Arrow` keys are used with `horizontal` direction', () => {
    const { Wrapper, chain } = createChain();

    const { result } = renderHook(() => useEmoji({ direction: 'horizontal' }), {
      wrapper: Wrapper,
    });

    acts([
      () => {
        chain.insertText(':');
      },
      () => {
        chain.press('ArrowRight');
      },
    ]);

    expect(result.current?.index).toBe(1);

    acts([
      () => {
        chain.press('ArrowLeft');
      },
      () => {
        chain.press('ArrowLeft');
      },
    ]);

    expect(result.current?.index).toBe(result.current!.state!.list.length - 1);
  });

  it('can be used with `autoUpdate`', () => {
    const { Wrapper, chain } = createChain();
    const ref: { current: UseEmojiReturn | null } = { current: null };

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

    expect(ref.current).toEqual(expect.objectContaining({ state: expect.any(Object) }));
  });
});
