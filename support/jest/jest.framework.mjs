// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../globals.d.ts" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="jest-extended" />
// @ts-expect-error
import diffHtml from 'diffable-html';
import { default as matchers } from 'jest-extended';
import { prosemirrorSerializer } from 'jest-prosemirror';

/* Make unhandledRejection errors easier to debug */
process.on('unhandledRejection', (reason) => {
  console.error('REJECTION', reason);
});

expect.extend(matchers);

/**
 * Serializer for HTML content.
 */
expect.addSnapshotSerializer({
  test: (object) => {
    if (typeof object !== 'string') {
      return false;
    }

    const trimmed = object.trim();
    return trimmed.length > 2 && trimmed.startsWith('<') && trimmed.endsWith('>');
  },
  serialize: (val) => {
    return diffHtml(val).trim();
  },
});

expect.addSnapshotSerializer(prosemirrorSerializer);

expect.addSnapshotSerializer({
  test: (val) => val?._ === 'HTML',
  serialize(val) {
    return diffHtml(val.html).trim();
  },
});
