// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../globals.d.ts" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="jest-extended" />

import { defaultImport } from '@remirror/core-helpers';
import diffHtml from 'diffable-html';
import JestExtended from 'jest-extended';
import { prosemirrorSerializer } from 'jest-prosemirror';

const jestExtendedMatchers = defaultImport(JestExtended);

/* Make unhandledRejection errors easier to debug */
process.on('unhandledRejection', (reason) => {
  console.error('REJECTION', reason);
});

expect.extend(jestExtendedMatchers);

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
