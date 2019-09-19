import { bool, Cast, CommandFunction, ProsemirrorNode } from '@remirror/core';
import { TaggedProsemirrorNode } from 'prosemirror-test-builder';
import { apply } from './jest-prosemirror-editor';
import { transformsNodeFailMessage, transformsNodePassMessage } from './jest-prosemirror-messages';
import { CommandTransformation } from './jest-prosemirror-types';

export const prosemirrorMatchers = {
  toTransformNode(
    this: jest.MatcherUtils,
    command: CommandFunction,
    { from, to }: CommandTransformation = Cast({}),
  ) {
    if (typeof command !== 'function') {
      return {
        message: () => `Please specify a valid command`,
        pass: false,
      };
    }
    if (!from) {
      return {
        message: () => `Please specify the 'from' node which this command: ${command.name} should transform`,
        pass: false,
      };
    }
    const expected = to ? to : from;
    const shouldChange = bool(to);
    const [pass, actual] = apply(from, command, to);
    const properties = { actual, expected, name: 'toTransformNode' };

    if (pass) {
      return { ...properties, pass, message: transformsNodePassMessage(actual, expected, shouldChange) };
    } else {
      return { ...properties, pass, message: transformsNodeFailMessage(actual, expected, shouldChange) };
    }
  },

  toEqualProsemirrorNode(
    this: jest.MatcherUtils,
    actual: TaggedProsemirrorNode,
    expected: TaggedProsemirrorNode,
  ) {
    const pass = this.equals(actual.toJSON(), expected.toJSON());
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toEqualProsemirrorNode')}\n\n` +
          `Expected JSON value of document to not equal:\n  ${this.utils.printExpected(expected)}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(actual)}`
      : () => {
          const diffString = this.utils.diff(expected, actual, {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toEqualProsemirrorNode')}\n\n` +
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
      name: 'toEqualProsemirrorNode',
    };
  },
};

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * A utility from jest-prosemirror which tests that a command transforms
       * the prosemirror node in the desired way.
       *
       * ```ts
       * import { removeMark } from '@remirror/core-utils';
       * import {schema, doc, p, strong} from 'jest-prosemirror';
       *
       * test('remove the mark', () => {
       *   const type = schema.marks.bold
       *   const from = doc(p(strong('<start>bold<end>')));
       *   const to = doc(p('bold'));
       *
       *   expect(removeMark({ type })).toTransformNode({ from, to });
       * });
       * ```
       *
       * This tests that mark has been removed by the provided command.
       *
       * The to property is optional and if you would like to test that the node
       * is identical after the transform you can leave it blank as a shorthand.
       */
      toTransformNode(params: CommandTransformation): R;
      toEqualProsemirrorNode(params: ProsemirrorNode): R;
    }
  }
}
