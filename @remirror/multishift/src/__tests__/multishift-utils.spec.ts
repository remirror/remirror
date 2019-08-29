import { callAllEventHandlers, range } from '../multishift-utils';

describe('callAllEventHandlers', () => {
  it('returns an event handler', () => {
    expect(callAllEventHandlers()).toEqual(expect.any(Function));
  });

  const args = [{} as any, 1, '2', true] as const;
  const handler1 = jest.fn();
  const handler2 = jest.fn();

  it('calls each handler with the given arguments', () => {
    const result = callAllEventHandlers(handler1, handler2);

    result(...args);

    expect(handler1).toBeCalledWith(...args);
    expect(handler2).toBeCalledWith(...args);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('ignores falsy values for handlers', () => {
    const result = callAllEventHandlers(undefined, handler1, false, handler2, null);

    result(...args);

    expect(handler1).toBeCalledWith(...args);
    expect(handler2).toBeCalledWith(...args);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('stops at `event.preventDownshiftDefault`', () => {
    const handler = jest.fn((event: any) => {
      event.preventDownshiftDefault = true;
    });
    const result = callAllEventHandlers(handler, handler1, handler2);
    result({} as any, 1, '2', true);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('stops at `event.native.preventDownshiftDefault`', () => {
    const handler = jest.fn((event: any) => {
      event.nativeEvent = { preventDownshiftDefault: true };
    });
    const result = callAllEventHandlers(handler, handler1, handler2);
    result({} as any, 1, '2', true);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });
});

test('range', () => {
  expect(range(5)).toEqual([0, 1, 2, 3, 4]);
  expect(range(-5)).toEqual([-0, -1, -2, -3, -4]);
  expect(range(0)).toEqual([]);
  expect(range(5, 5)).toEqual([5]);
  expect(range(-5, -5)).toEqual([-5]);
  expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(range(-5, -1)).toEqual([-5, -4, -3, -2, -1]);
  expect(range(10, 5)).toEqual([10, 9, 8, 7, 6, 5]);
});
