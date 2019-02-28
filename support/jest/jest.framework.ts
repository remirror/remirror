import 'jest-extended';

import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

if (process.env.TEST_ENV) {
  jest.setTimeout(600000);

  // A failureThreshold of 1 will pass tests that have > 2 percent failing pixels
  const customConfig = { threshold: 0.3 };
  const toMatchProdImageSnapshot = configureToMatchImageSnapshot({
    customDiffConfig: customConfig,
    failureThreshold: 3800,
    failureThresholdType: 'pixel',
  });

  expect.extend({ toMatchProdImageSnapshot });
}

/* Make unhandledRejection errors easier to debug */

process.on('unhandledRejection', reason => {
  console.error('REJECTION', reason);
});

if (process.env.CI) {
  jest.retryTimes(3);

  const consoleError = console.error;
  const consoleWarn = console.warn;
  const consoleLog = console.log;
  beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.error = consoleError;
    console.warn = consoleWarn;
    console.log = consoleLog;
  });
}
