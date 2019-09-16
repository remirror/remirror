import { callAllEventHandlers } from '../multishift-utils';

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

  it('stops when handler returns true', () => {
    const handler = jest.fn(() => {
      return true;
    });
    const result = callAllEventHandlers(handler, handler1, handler2);
    result({} as any, 1, '2', true);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });
});
