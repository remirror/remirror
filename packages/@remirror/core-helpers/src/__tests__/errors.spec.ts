import { ErrorConstant } from '@remirror/core-constants';
import { hideConsoleError } from '@remirror/testing';

import { invariant, RemirrorError } from '../..';
import { freeze } from '../freeze';

const env = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = env;
});

describe('freeze', () => {
  it('should freeze in development', () => {
    const obj = { a: 'a', b: 'b' };
    const frozenObject = freeze(obj);

    expect(() => {
      // @ts-expect-error
      frozenObject.a = '123';
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not freeze in production', () => {
    process.env.NODE_ENV = 'production';
    const obj = { a: 'a', b: 'b' };
    const frozenObject = freeze(obj);

    expect(() => {
      // @ts-expect-error
      frozenObject.a = '123';
    }).not.toThrow();
  });
});

describe('invariant', () => {
  it('logs to the console when called', () => {
    const spy = hideConsoleError(true);
    RemirrorError.create({ message: 'should log' }).logError();

    expect(spy).toHaveBeenCalled();
  });

  it('throws specific errors', () => {
    expect(() => invariant(false, { message: 'always falsy' })).toThrowErrorMatchingSnapshot();
  });

  it('should not throw when the test case is true', () => {
    expect(() => invariant(true, { message: 'Never throws' })).not.toThrow();
  });

  it('should throw with a code', () => {
    expect(() =>
      invariant(false, { code: ErrorConstant.DUPLICATE_COMMAND_NAMES }),
    ).toThrowErrorMatchingSnapshot();
  });

  it('should throw generic error in production', () => {
    process.env.NODE_ENV = 'production';

    expect(() =>
      invariant(false, { code: ErrorConstant.DUPLICATE_COMMAND_NAMES, message: 'Never shown' }),
    ).toThrowErrorMatchingSnapshot();
  });
});
