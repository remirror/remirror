// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../globals.d.ts" />

import 'jest-extended';

import diffHtml from 'diffable-html';
import { prosemirrorSerializer } from 'jest-prosemirror';
import { getSnapshotDiffSerializer, toMatchDiffSnapshot } from 'snapshot-diff';

expect.addSnapshotSerializer(getSnapshotDiffSerializer());
expect.extend({ toMatchDiffSnapshot });

/* Make unhandledRejection errors easier to debug */
process.on('unhandledRejection', (reason) => {
  console.error('REJECTION', reason);
});

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
  serialize: (val: string) => {
    return diffHtml(val).trim();
  },
});

expect.addSnapshotSerializer(prosemirrorSerializer);

interface PuppeteerHtml {
  _: 'HTML';
  html: string;
}

expect.addSnapshotSerializer({
  test: (val) => val?._ === 'HTML',
  serialize(val: PuppeteerHtml) {
    return diffHtml(val.html).trim();
  },
});
