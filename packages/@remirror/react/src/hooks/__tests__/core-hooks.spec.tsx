import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { act, strictRender } from '@remirror/testing/react';

import {
  fakeResizeObserverPolyfill,
  triggerChange,
} from '../../__mocks__/resize-observer-polyfill';
import { useMeasure, usePrevious } from '../core-hooks';

test('usePrevious', () => {
  const { result, rerender } = renderHook(({ initialValue }) => usePrevious(initialValue), {
    initialProps: { initialValue: 10 },
  });

  const noValue = undefined;
  expect(result.current).toBe(noValue);

  rerender({ initialValue: 20 });
  expect(result.current).toBe(10);

  rerender({ initialValue: 30 });
  expect(result.current).toBe(20);
});

test('useMeasure', () => {
  const { result } = renderHook(() => useMeasure());

  expect(result.current[1].height).toBe(0);

  const Component = () => {
    const [bind, { height: measuredHeight }] = useMeasure<HTMLDivElement>();

    return (
      <div data-testid='test' {...bind}>
        Height: {measuredHeight}
      </div>
    );
  };

  const { getByTestId, rerender } = strictRender(<Component />);
  const el = getByTestId('test');

  expect(fakeResizeObserverPolyfill.observe).toHaveBeenCalledWith(el);

  act(() => {
    triggerChange({ height: 100 }, el);
  });

  expect(getByTestId('test')).toHaveTextContent('Height: 100');

  rerender(<div />);
  expect(fakeResizeObserverPolyfill.disconnect).toHaveBeenCalled();
});
