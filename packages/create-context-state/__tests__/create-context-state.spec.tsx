import { useMemo } from 'react';
import { act, fireEvent, render } from 'testing/react';

import { createContextState } from '../';

test('creates a provider and context hook', () => {
  interface Context {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    message: () => string;
  }

  interface Props {
    defaultCount: number;
  }

  const [CountProvider, useCount] = createContextState<Context, Props>(
    ({ get, set, props, previousContext }) => ({
      count: previousContext?.count ?? props.defaultCount,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: props.defaultCount }),
      message: () => `${get((p) => p.count)} count`,
    }),
  );

  const Counter = () => {
    const { count, increment, decrement, reset, message } = useCount();

    return (
      <>
        <h1>{count}</h1>
        <button onClick={() => increment()}>+</button>
        <button onClick={() => decrement()}>-</button>
        <button onClick={() => reset()}>reset</button>
        <span title='message'>{message()}</span>
      </>
    );
  };

  const { rerender, getByText, getByRole, getByTitle } = render(
    <CountProvider defaultCount={50}>
      <Counter />
    </CountProvider>,
  );

  const incrementButton = getByText('+');
  const decrementButton = getByText('-');
  const resetButton = getByText('reset');
  const count = getByRole('heading');
  const message = getByTitle('message');

  expect(count.textContent).toBe('50');
  expect(message.textContent).toBe('50 count');

  act(() => {
    fireEvent.click(incrementButton);
  });

  expect(count.textContent).toBe('51');
  expect(message.textContent).toBe('51 count');

  rerender(
    <CountProvider defaultCount={100}>
      <Counter />
    </CountProvider>,
  );

  expect(count.textContent).toBe('51');
  expect(message.textContent).toBe('51 count');

  act(() => {
    fireEvent.click(resetButton);
  });

  expect(count.textContent).toBe('100');
  expect(message.textContent).toBe('100 count');

  act(() => {
    fireEvent.click(decrementButton);
  });

  expect(count.textContent).toBe('99');
  expect(message.textContent).toBe('99 count');
});

test('supports hooks state', () => {
  interface Context {
    count: number;
    increment: () => void;
    displayDoubled: () => number;
    displayOuter: () => string;
  }

  interface Props {
    defaultCount: number;
  }

  interface State {
    double: number;
    outer: string;
  }

  interface OuterContext {
    value: string;
    setValue: (value: string) => void;
  }
  const [OuterProvider, useOuter] = createContextState<OuterContext>(({ set }) => {
    return {
      value: 'initial',
      setValue: (value) => set({ value }),
    };
  });

  const [CountProvider, useCount] = createContextState<Context, Props, State>(
    ({ state, set, props, previousContext }) => ({
      count: previousContext?.count ?? props.defaultCount,
      increment: () => set((state) => ({ count: state.count + 1 })),
      displayDoubled: () => state.double,
      displayOuter: () => state.outer,
    }),
    (props) => {
      const double = props.defaultCount * 2;
      const outer = useOuter().value;

      return useMemo(() => ({ double, outer }), [outer, double]);
    },
  );

  const Counter = () => {
    const { count, increment, displayDoubled, displayOuter } = useCount();
    const { setValue } = useOuter();

    return (
      <>
        <h1>{count}</h1>
        <button onClick={() => increment()}>+</button>
        <button onClick={() => setValue('updated')}>update value</button>
        <span title='message'>{displayDoubled()}</span>
        <span title='value'>{displayOuter()}</span>
      </>
    );
  };

  const { rerender, getByText, getByRole, getByTitle } = render(
    <OuterProvider>
      <CountProvider defaultCount={50}>
        <Counter />
      </CountProvider>
    </OuterProvider>,
  );

  const valueButton = getByText('update value');
  const incrementButton = getByText('+');
  const count = getByRole('heading');
  const message = getByTitle('message');
  const value = getByTitle('value');

  expect(count.textContent).toBe('50');
  expect(message.textContent).toBe('100');
  expect(value.textContent).toBe('initial');

  act(() => {
    fireEvent.click(incrementButton);
  });

  expect(count.textContent).toBe('51');
  expect(message.textContent).toBe('100');
  expect(value.textContent).toBe('initial');

  rerender(
    <OuterProvider>
      <CountProvider defaultCount={100}>
        <Counter />
      </CountProvider>
    </OuterProvider>,
  );

  expect(count.textContent).toBe('51');
  expect(message.textContent).toBe('200');
  expect(value.textContent).toBe('initial');

  act(() => {
    fireEvent.click(valueButton);
  });

  expect(count.textContent).toBe('51');
  expect(message.textContent).toBe('200');
  expect(value.textContent).toBe('updated');
});
