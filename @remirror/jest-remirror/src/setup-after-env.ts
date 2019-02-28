import { PMNode } from '@remirror/core';
import { toMatchSnapshot } from 'jest-snapshot';
import SnapshotState from 'jest-snapshot/State';

expect.extend({
  toEqualDocument(actual, expected) {
    // Because schema is created dynamically, expected value is a function (schema) => PMNode;
    // That's why this magic is necessary. It simplifies writing assertions, so
    // instead of expect(doc).toEqualDocument(doc(p())(schema)) we can just do:
    // expect(doc).toEqualDocument(doc(p())).
    //
    // Also it fixes issues that happens sometimes when actual schema and expected schema
    // are different objects, making this case impossible by always using actual schema to create expected node.
    expected =
      typeof expected === 'function' && actual.type && actual.type.schema
        ? expected(actual.type.schema)
        : expected;

    if (!(expected instanceof PMNode) || !(actual instanceof PMNode)) {
      return {
        pass: false,
        actual,
        expected,
        name: 'toEqualDocument',
        message: 'Expected both values to be instance of prosemirror-model Node.',
      };
    }

    if (expected.type.schema !== actual.type.schema) {
      return {
        pass: false,
        actual,
        expected,
        name: 'toEqualDocument',
        message: 'Expected both values to be using the same schema.',
      };
    }

    const pass = this.equals(actual.toJSON(), expected.toJSON());
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toEqualDocument')}\n\n` +
          `Expected JSON value of document to not equal:\n  ${this.utils.printExpected(expected)}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(actual)}`
      : () => {
          const diffString = this.utils.diff(expected, actual, {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toEqualDocument')}\n\n` +
            `Expected JSON value of document to equal:\n${this.utils.printExpected(expected)}\n` +
            `Actual JSON:\n  ${this.utils.printReceived(actual)}` +
            `${diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
          );
        };

    return {
      pass,
      actual,
      expected,
      message,
      name: 'toEqualDocument',
    };
  },

  toMatchDocSnapshot(actual) {
    const { currentTestName, snapshotState } = this;

    const removeFirstWord = (sentence?: string) =>
      sentence
        ? sentence
            .split(' ')
            .slice(1)
            .join(' ')
        : '';

    // this change is to ensure we are mentioning test file name only once in snapshot file
    // for integration tests only
    const newTestName = removeFirstWord(currentTestName);

    // remove ids that may change from the document so snapshots are repeatable
    const transformedDoc = actual;

    // since the test runner fires off multiple browsers for a single test, map each snapshot to the same one
    // (otherwise we'll try to create as many snapshots as there are browsers)
    const oldCounters = (snapshotState as any)._counters;
    (snapshotState as any)._counters = Object.create(oldCounters, {
      set: {
        value: (key: string) => oldCounters.set(key, 1),
      },
      get: {
        value: (key: string) => oldCounters.get(key),
      },
    });

    // In `jest-snapshot@22`, passing the optional testName doesn't override test name anymore.
    // Instead it appends the passed name with original name.
    const oldTestName = this.currentTestName;
    this.currentTestName = newTestName;

    const ret = toMatchSnapshot.call(this, transformedDoc);

    this.currentTestName = oldTestName;
    return ret;
  },
});

declare global {
  namespace jest {
    interface MatcherUtils {
      currentTestName?: string;
      snapshotState: SnapshotState;
    }
  }
}
