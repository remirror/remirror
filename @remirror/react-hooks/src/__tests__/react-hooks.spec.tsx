import { act, render } from '@testing-library/react';
import { act as hookAct, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { fakeResizeObserverPolyfill, triggerChange } from '../../__mocks__/resize-observer-polyfill';
import { useMeasure, usePrevious, useSetState, useStateWithCallback } from '../react-hooks';

test('usePrevious', () => {
  const { result, rerender } = renderHook(({ initialValue }) => usePrevious(initialValue), {
    initialProps: { initialValue: 10 },
  });

  expect(result.current).toBe(undefined);
  rerender({ initialValue: 20 });
  expect(result.current).toBe(10);
  rerender({ initialValue: 30 });
  expect(result.current).toBe(20);
});

test('useMeasure', () => {
  const { result } = renderHook(() => useMeasure());
  expect(result.current[1].height).toBe(0);

  const Component = () => {
    const [bind, { height: measuredHeight }] = useMeasure();

    return (
      <div data-testid='test' {...bind}>
        Height: {measuredHeight}
      </div>
    );
  };

  const { getByTestId, rerender } = render(<Component />);
  const el = getByTestId('test');
  expect(fakeResizeObserverPolyfill.observe).toHaveBeenCalledWith(el);

  act(() => {
    triggerChange({ height: 100 }, el);
  });
  expect(getByTestId('test')).toHaveTextContent('Height: 100');

  rerender(<div />);
  expect(fakeResizeObserverPolyfill.disconnect).toHaveBeenCalled();
});

test('useStateWithCallback', () => {
  const mock = jest.fn();

  const { result } = renderHook(({ initialState }) => useStateWithCallback(initialState), {
    initialProps: { initialState: 10 },
  });

  expect(result.current[0]).toBe(10);

  hookAct(() => {
    const [, setState] = result.current;
    setState(20, mock);
  });

  expect(result.current[0]).toBe(20);
  expect(mock).toHaveBeenCalledTimes(1);

  hookAct(() => {
    const [, setState] = result.current;
    setState(prevState => prevState + 10);
  });

  expect(result.current[0]).toBe(30);
  expect(mock).toHaveBeenCalledTimes(1);
});

test('useSetState', () => {
  const mock = jest.fn();
  const initialState: { a: number; b: number; c?: number; d?: string } = { a: 10, b: 20, c: undefined };

  const { result } = renderHook(({ initialState: val }) => useSetState(val), {
    initialProps: { initialState },
  });

  expect(result.current[0]).toEqual(initialState);

  hookAct(() => {
    const [, setState] = result.current;
    setState({ a: 100, d: 'value' }, mock);
  });

  expect(result.current[0]).toEqual({ ...initialState, a: 100, d: 'value' });
  expect(mock).toHaveBeenCalledTimes(1);

  hookAct(() => {
    const [, setState] = result.current;
    setState(prevState => ({ a: prevState.a - 100, d: 'test' }), mock);
  });

  expect(result.current[0]).toEqual({ ...initialState, a: 0, d: 'test' });
  expect(mock).toHaveBeenCalledTimes(2);

  hookAct(() => {
    const [, , resetState] = result.current;
    resetState();
  });
});
