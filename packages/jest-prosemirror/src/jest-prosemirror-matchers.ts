import { bool, Cast, CommandFunction, ProsemirrorNode } from '@remirror/core';
import { TaggedProsemirrorNode } from 'prosemirror-test-builder';
import { apply } from './jest-prosemirror-editor';
import { transformsNodeFailMessage, transformsNodePassMessage } from './jest-prosemirror-messages';
import { CommandTransformation } from './jest-prosemirror-types';

export const prosemirrorMatchers = {
  transformsPMNode(
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
    const properties = { actual, expected, name: 'transformsPMNode' };

    if (pass) {
      return { ...properties, pass, message: transformsNodePassMessage(actual, expected, shouldChange) };
    } else {
      return { ...properties, pass, message: transformsNodeFailMessage(actual, expected, shouldChange) };
    }
  },

  toEqualPMNode(this: jest.MatcherUtils, actual: TaggedProsemirrorNode, expected: TaggedProsemirrorNode) {
    const pass = this.equals(actual.toJSON(), expected.toJSON());
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toEqualPMNode')}\n\n` +
          `Expected JSON value of document to not equal:\n  ${this.utils.printExpected(expected)}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(actual)}`
      : () => {
          const diffString = this.utils.diff(expected, actual, {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toEqualPMNode')}\n\n` +
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
      name: 'toEqualPMNode',
    };
  },
};

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Test that the correct transformation happens
       */
      transformsPMNode(params: CommandTransformation): R;
      toEqualPMNode(params: ProsemirrorNode): R;
    }
  }
}
