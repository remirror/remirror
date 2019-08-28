import { act, render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { RefObject, useRef } from 'react';
import { fakeResizeObserverPolyfill, triggerChange } from '../../__mocks__/resize-observer-polyfill';
import { useCombinedRefs, useMeasure, usePrevious } from '../react-hooks';

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

test('useCombinedRefs', () => {
  const ref1 = jest.fn();
  let ref2!: RefObject<any>;

  const Component = ({ extraRef }: { extraRef?: any }) => {
    const combineRefs = useCombinedRefs();
    ref2 = useRef();
    return (
      <div data-testid='test' {...combineRefs({ ref: ref1 }, { ref: ref2, style: {} }, { ref: extraRef })} />
    );
  };

  const { getByTestId, rerender } = render(<Component />);
  const el = getByTestId('test');
  expect(ref2.current).toEqual(el);
  expect(ref1).toHaveBeenCalledWith(el);

  rerender(<Component />);
  rerender(<Component />);
  expect(ref1).toHaveBeenCalledTimes(1);
});
