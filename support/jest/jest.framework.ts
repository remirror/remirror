// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../globals.d.ts" />

import 'jest-extended';
import toDiffableHtml from 'diffable-html';
import { toMatchDiffSnapshot, getSnapshotDiffSerializer } from 'snapshot-diff';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { prosemirrorSerializer } from 'jest-prosemirror';

expect.addSnapshotSerializer(getSnapshotDiffSerializer());
expect.extend({ toMatchDiffSnapshot });

if (__E2E__) {
  jest.setTimeout(120000);
  // jest.retryTimes(2);

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

/**
 * Serializer for HTML content.
 */
expect.addSnapshotSerializer({
  test: object => {
    if (typeof object !== 'string') {
      return false;
    }

    const trimmed = object.trim();
    return trimmed.length > 2 && trimmed.startsWith('<') && trimmed.endsWith('>');
  },
  print: val => {
    return toDiffableHtml(val).trim();
  },
});

expect.addSnapshotSerializer(prosemirrorSerializer);
