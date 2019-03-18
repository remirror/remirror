import { bool, Cast, CommandFunction, ProsemirrorNode } from '@remirror/core';
import { transformsNodeFailMessage, transformsNodePassMessage } from './messages';
import { CommandTransformation } from './types';
import { apply } from './utils';

export const prosemirrorMatchers = {
  transformsProsemirrorNode(
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
    const properties = { actual, expected, name: 'transformsProsemirrorNode' };

    if (pass) {
      return { ...properties, pass, message: transformsNodePassMessage(actual, expected, shouldChange) };
    } else {
      return { ...properties, pass, message: transformsNodeFailMessage(actual, expected, shouldChange) };
    }
  },

  toEqualProsemirrorDocument(this: jest.MatcherUtils, actual: ProsemirrorNode, expected: ProsemirrorNode) {
    const pass = this.equals(actual.toJSON(), expected.toJSON());
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toEqualProsemirrorDocument')}\n\n` +
          `Expected JSON value of document to not equal:\n  ${this.utils.printExpected(expected)}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(actual)}`
      : () => {
          const diffString = this.utils.diff(expected, actual, {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toEqualProsemirrorDocument')}\n\n` +
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
      name: 'toEqualProsemirrorDocument',
    };
  },
};

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Test that the correct transformation happens
       */
      transformsProsemirrorNode(params: CommandTransformation): R;
      toEqualProsemirrorDocument(params: ProsemirrorNode): R;
    }
  }
}
