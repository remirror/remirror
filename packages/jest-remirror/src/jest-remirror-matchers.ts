import { EditorState, isEditorState, isProsemirrorNode, ProsemirrorNode } from '@remirror/core';

import type { TaggedProsemirrorNode } from './jest-remirror-types';

export const remirrorMatchers: jest.ExpectExtendMap = {
  toContainRemirrorDocument(state: EditorState, value: TaggedProsemirrorNode) {
    const expected = value?.toJSON?.();

    if (!isProsemirrorNode(value)) {
      return {
        pass: false,
        message: () => 'The expected value should be an instance of ProsemirrorNode.',
      };
    }

    if (!isEditorState(state)) {
      return {
        pass: false,
        message: () => 'Expected the value passed in to be an EditorState',
      };
    }

    if (value.type.schema !== state.schema) {
      return {
        pass: false,
        message: () => 'Expected both values to be using the same schema.',
      };
    }

    const pass = this.equals(state.doc.content.child(0).toJSON(), expected);
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toContainRemirrorDocument')}\n\n` +
          `Expected JSON value of document to not contain:\n  ${this.utils.printExpected(
            value,
          )}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(state.doc.content.child(0))}`
      : () => {
          const diffString = this.utils.diff(value, state.doc.content.child(0), {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toContainRemirrorDocument')}\n\n` +
            `Expected JSON value of document to contain:\n${this.utils.printExpected(value)}\n` +
            `Actual JSON:\n  ${this.utils.printReceived(state.doc.content.child(0))}` +
            `${diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
          );
        };

    return {
      pass,
      message,
    };
  },

  toEqualRemirrorDocument(doc: ProsemirrorNode, value: TaggedProsemirrorNode) {
    if (!isProsemirrorNode(value) || !isProsemirrorNode(doc)) {
      return {
        pass: false,
        message: () => 'Expected both values to be instance of prosemirror-model Node.',
      };
    }

    if (value.type.schema !== doc.type.schema) {
      return {
        pass: false,
        message: () => 'Expected both values to be using the same schema.',
      };
    }

    const pass = this.equals(doc.toJSON(), value.toJSON());
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toEqualRemirrorDocument')}\n\n` +
          `Expected JSON value of document to not equal:\n  ${this.utils.printExpected(value)}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(doc)}`
      : () => {
          const diffString = this.utils.diff(value, doc, {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toEqualRemirrorDocument')}\n\n` +
            `Expected JSON value of document to equal:\n${this.utils.printExpected(value)}\n` +
            `Actual JSON:\n  ${this.utils.printReceived(doc)}` +
            `${diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
          );
        };

    return {
      pass,
      message,
    };
  },
};

declare global {
  namespace jest {
    interface Matchers<R, T> {
      /**
       * Checks that EditorState passed in has this as it's top level parent node.
       *
       * ```ts
       * expect(view.state).toContainRemirrorDocument(p(`This is SPARTA`));
       * ```
       */
      toContainRemirrorDocument: (builder: TaggedProsemirrorNode) => R;

      /**
       * Checks that two prosemirror documents are identical.
       */
      toEqualRemirrorDocument: (builder: TaggedProsemirrorNode) => R;
    }
  }
}
