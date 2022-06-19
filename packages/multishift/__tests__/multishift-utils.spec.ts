import { jest } from '@jest/globals';
import type { SyntheticEvent } from 'react';
import { object } from '@remirror/core-helpers';

import { callAllEventHandlers } from '../src/multishift-utils';

describe('callAllEventHandlers', () => {
  it('returns an event handler', () => {
    expect(callAllEventHandlers()).toEqual(expect.any(Function));
  });

  const args = [object<SyntheticEvent>(), 1, '2', true] as const;
  const handler1: any = jest.fn();
  const handler2: any = jest.fn();

  it('calls each handler with the given arguments', () => {
    const result = callAllEventHandlers(handler1, handler2);

    result(...args);

    expect(handler1).toHaveBeenCalledWith(...args);
    expect(handler2).toHaveBeenCalledWith(...args);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('ignores falsy values for handlers', () => {
    const result = callAllEventHandlers(undefined, handler1, false, handler2, null);

    result(...args);

    expect(handler1).toHaveBeenCalledWith(...args);
    expect(handler2).toHaveBeenCalledWith(...args);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('stops when handler returns true', () => {
    const handler: any = jest.fn(() => {
      return true;
    });
    const result = callAllEventHandlers(handler, handler1, handler2);
    result(object(), 1, '2', true);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });
});
