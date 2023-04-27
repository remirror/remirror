type FunctionLike = (...args: any[]) => any;

interface MockInstance {
  getCalledTimes: () => number;
  getCalled: () => boolean;
}

interface Mock<T extends FunctionLike> extends Function, MockInstance {
  (...args: Parameters<T>): ReturnType<T>;
}

/**
 * A super simple mock for functions.
 *
 * Use this instead of `jest.fn` in public API, because some users may not using
 * Jest environment.
 */
export function simpleMockFn<T extends FunctionLike>(implementation: T): Mock<T> {
  let calledTimes = 0;

  const mocked = (...args: any[]) => {
    calledTimes++;
    return implementation(...args);
  };

  const getCalledTimes = () => calledTimes;

  const getCalled = () => calledTimes > 0;

  mocked.getCalledTimes = getCalledTimes;
  mocked.getCalled = getCalled;

  return mocked;
}
