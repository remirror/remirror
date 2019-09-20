import 'jest-extended';

import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

if (__E2E__) {
  jest.setTimeout(120000);
  //jest.retryTimes(2);

  /* A failureThreshold of 1 will pass tests that have > 2 percent failing pixels */
  const customConfig = { threshold: 0.3 };
  const toMatchImageSnapshot = configureToMatchImageSnapshot({
    customDiffConfig: customConfig,
    failureThreshold: 5000,
    failureThresholdType: 'pixel',
  });

  expect.extend({ toMatchImageSnapshot });
}

/* Make unhandledRejection errors easier to debug */
process.on('unhandledRejection', reason => {
  console.error('REJECTION', reason);
});
