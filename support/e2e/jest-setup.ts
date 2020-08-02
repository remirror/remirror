import type { Circus } from '@jest/types';

const { CI } = process.env;

declare global {
  const jestCircus: {
    currentTest: NonNullable<Circus.State['currentlyRunningTest']>;
    currentTestName: string;
  };
}

if (CI === 'true') {
  jest.retryTimes(3);
}
