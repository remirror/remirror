import { toHaveNoViolations } from 'jest-axe';
import 'jest-dom/extend-expect';
import { createSerializer, matchers } from 'jest-emotion';
import 'react-testing-library/cleanup-after-each';

expect.addSnapshotSerializer(createSerializer({}));

expect.extend(toHaveNoViolations);
expect.extend(matchers);

/* To fix Prosemirror tests in jsdom */
document.getSelection = () => {
  return {
    addRange: _ => {},
    removeAllRanges: () => {},
  } as Selection;
};

// Copied from react-beautiful-dnd/test/setup.js
if (typeof document !== 'undefined') {
  // overriding these properties in jsdom to allow them to be controlled
  Object.defineProperties(document.documentElement, {
    clientWidth: {
      writable: true,
      value: document.documentElement.clientWidth,
    },
    clientHeight: {
      writable: true,
      value: document.documentElement.clientHeight,
    },
    scrollWidth: {
      writable: true,
      value: document.documentElement.scrollWidth,
    },
    scrollHeight: {
      writable: true,
      value: document.documentElement.scrollHeight,
    },
  });
}

// Setting initial viewport
// Need to set clientWidth and clientHeight as jsdom does not set these properties
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  (document.documentElement as any).clientWidth = window.innerWidth;
  (document.documentElement as any).clientHeight = window.innerHeight;
}

if (document) {
  document.createRange = () =>
    ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      } as Node,
    } as any);
}
