import { hideConsoleError } from 'testing';
import { ErrorConstant } from '@remirror/core-constants';

import { freeze, invariant, RemirrorError } from '../';

const env = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = env;
});

describe('freeze', () => {
  hideConsoleError(true);

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
  const ref = hideConsoleError(true);

  it('logs to the console by default', () => {
    RemirrorError.create({ message: 'should log' });

    expect(ref.spy).toHaveBeenCalled();
  });

  it('can disable logging', () => {
    RemirrorError.create({ message: 'should log', disableLogging: true });

    expect(ref.spy).not.toHaveBeenCalled();
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
