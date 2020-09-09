import { renderHook } from '@testing-library/react-hooks';

import { usePrevious } from '../core-hooks';

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
