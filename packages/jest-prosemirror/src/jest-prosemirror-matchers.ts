import type { TaggedProsemirrorNode } from 'prosemirror-test-builder';
import stringifyObject from 'stringify-object';
import { isEmptyObject, isString } from '@remirror/core-helpers';
import type {
  CommandFunction,
  ObjectMark,
  ProsemirrorCommandFunction,
  ProsemirrorNode as _ProsemirrorNode,
  RemirrorJSON,
} from '@remirror/core-types';

import { apply } from './jest-prosemirror-editor';
import { transformsNodeFailMessage, transformsNodePassMessage } from './jest-prosemirror-messages';
import type { CommandTransformation } from './jest-prosemirror-types';

export const prosemirrorMatchers = {
  toTransformNode(
    this: jest.MatcherUtils,
    command: ProsemirrorCommandFunction,
    { from, to }: CommandTransformation,
  ) {
    if (typeof command !== 'function') {
      return {
        message: () => `Please specify a valid command`,
        pass: false,
      };
    }

    if (!from) {
      return {
        message: () =>
          `Please specify the 'from' node which this command: ${command.name} should transform`,
        pass: false,
      };
    }

    const expected = to ? to : from;
    const shouldChange = !!to;
    const { pass, taggedDoc: actual } = apply(from, command, to);

    if (pass) {
      return {
        pass,
        message: transformsNodePassMessage(actual, expected, shouldChange),
      };
    }

    return {
      pass,
      message: transformsNodeFailMessage(actual, expected, shouldChange),
    };
  },

  toTransform(
    this: jest.MatcherUtils,
    command: CommandFunction,
    { from, to }: CommandTransformation,
  ) {
    if (typeof command !== 'function') {
      return {
        message: () => `Please specify a valid command`,
        pass: false,
      };
    }

    if (!from) {
      return {
        message: () =>
          `Please specify the 'from' node which this command: ${command.name} should transform`,
        pass: false,
      };
    }

    const expected = to ? to : from;
    const shouldChange = !!to;
    const { pass, taggedDoc: actual } = apply(
      from,
      (state, dispatch, view) => command({ state, dispatch, view, tr: state.tr }),
      to,
    );

    if (pass) {
      return { pass, message: transformsNodePassMessage(actual, expected, shouldChange) };
    }

    return { pass, message: transformsNodeFailMessage(actual, expected, shouldChange) };
  },

  toEqualProsemirrorNode(
    this: jest.MatcherUtils,
    actual: TaggedProsemirrorNode,
    expected: TaggedProsemirrorNode,
  ) {
    const actualJSON = actual.toJSON() as RemirrorJSON;
    const expectedJSON = expected.toJSON() as RemirrorJSON;
    const actualDoc = pad(jsonToProsemirrorDoc(actualJSON));
    const expectedDoc = pad(jsonToProsemirrorDoc(expectedJSON));
    const pass = this.equals(actualJSON, expectedJSON);
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toEqualProsemirrorNode')}\n\n` +
          `Expected value of document to not equal:\n  ${this.utils.printExpected(expectedDoc)}\n` +
          `Actual:\n  ${this.utils.printReceived(actualDoc)}`
      : () => {
          const diffString = this.utils.diff(expectedDoc, actualDoc, {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toEqualProsemirrorNode')}\n\n` +
            `Expected value of document to equal:\n${this.utils.printExpected(expectedDoc)}\n` +
            `Actual:\n${
              this.utils.printReceived(actualDoc)
              // .replace('"doc(', 'doc(')
              // .replace(/\)"/, ')')
            }` +
            `${diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
          );
        };

    return { pass, message };
  },

  toBeValidNode(this: jest.MatcherUtils, actual: TaggedProsemirrorNode) {
    let pass = true;
    let errorMessage = '';

    try {
      actual.check();
    } catch (error) {
      if (error instanceof RangeError) {
        pass = false;
        errorMessage = error.message;
      }
    }

    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toBeValidNode')}\n\n` +
          `Expected Prosemirror node not to conform to schema, but it was valid.`
      : () =>
          `this.utils.matcherHint('.toBeValidNode')}\n\n` +
          `Expected Prosemirror node to conform to schema, but an error was thrown.\n` +
          `Error: ${this.utils.printReceived(errorMessage)}`;

    return { pass, message };
  },
};

const renamedTypes: Record<string, string> = {
  paragraph: 'p',
  heading: 'h',
  horizontalRule: 'hr',
  hardBreak: 'br',
};

const pad = (content: string) => `\n${content}\n`;

/**
 * Make the ProseMirror doc more ready.
 *
 * ```markup
 * "doc(
 *    p('Content '),
 *    p('is bold.')
 *  )"
 *```
 */
function jsonToProsemirrorDoc(json: RemirrorJSON, indentation = ''): string {
  const nextIndentation = `${indentation}  `;

  if (json.type === 'text') {
    return `${indentation}${getMarks(json.marks, json.text || '')}`;
  }

  const type = renamedTypes[json.type] ?? json.type;
  const content: string[] = [];
  const hasAttrs = json.attrs && !isEmptyObject(json.attrs);

  if (hasAttrs) {
    content.push(stringifyObject(json.attrs, { indent: '  ', inlineCharacterLimit: 1000 }));
  }

  for (const item of json.content ?? []) {
    content.push(jsonToProsemirrorDoc(item, nextIndentation));
  }

  if (!hasAttrs && content.length === 1 && json.content?.[0]?.type === 'text') {
    return `${indentation}${type}(${jsonToProsemirrorDoc(json.content?.[0], '')})`;
  }

  const joiner = `,\n`;
  const prefix = hasAttrs ? `\n${nextIndentation}` : content.length > 0 ? '\n' : '';
  const postfix = content.length > 0 ? `\n${indentation}` : '';

  return `${indentation}${type}(${prefix}${content.join(joiner)}${postfix})`;
}

function getMarks(marks: Array<ObjectMark | string> | undefined, content: string) {
  content = `'${content}'`;

  if (!marks) {
    return content;
  }

  for (const mark of [...(marks ?? [])].reverse()) {
    if (isString(mark)) {
      content = `${mark}(${content})`;
      continue;
    }

    const hasAttrs = mark.attrs && !isEmptyObject(mark.attrs);
    const items: string[] = [content];

    if (hasAttrs) {
      items.unshift(stringifyObject(mark.attrs, { indent: '  ', inlineCharacterLimit: 1000 }));
    }

    content = `${mark.type}(${items.join(', ')})`;
  }

  return content;
}

declare global {
  namespace jest {
    interface Matchers<R, T> {
      /**
       * A utility from jest-prosemirror which tests that a command transforms
       * the prosemirror node in the desired way.
       *
       * ```ts
       * import { toggleMark } from 'prosemirror-commands';
       * import {schema, doc, p, strong} from 'jest-prosemirror';
       *
       * test('remove the mark', () => {
       *   const type = schema.marks.bold
       *   const from = doc(p(strong('<start>bold<end>')));
       *   const to = doc(p('bold'));
       *
       *   expect(toggleMark(type)).toTransformNode({ from, to });
       * });
       * ```
       *
       * This tests that mark has been removed by the provided command.
       *
       * The `to` property is optional and can be left blank to test that the
       * node is identical after the transform.
       */
      toTransformNode: (params: CommandTransformation) => R;

      /**
       * **Note** This is specific for remirror projects due to the different
       * command type signature.
       *
       * A utility from jest-prosemirror which tests that a command transforms
       * the prosemirror node in the desired way.
       *
       * ```ts
       * import { removeMark } from '@remirror/core-utils';
       * import { schema, doc, p, strong } from 'jest-prosemirror';
       *
       * test('remove the mark', () => {
       *   const type = schema.marks.bold
       *   const from = doc(p(strong('<start>bold<end>')));
       *   const to = doc(p('bold'));
       *
       *   expect(removeMark({ type })).toTransform({ from, to });
       * });
       * ```
       *
       * This tests that mark has been removed by the provided command.
       *
       * The `to` property is optional and can be left blank to test that the
       * node is identical after the transform.
       */
      toTransform: (params: CommandTransformation) => R;

      /**
       * Tests that two prosemirror documents are equal. Pass in the expected
       * document and it checks that they are the same.
       *
       * ```ts
       * import { createEditor, doc, p } from 'jest-prosemirror';
       * import { removeNodeAtPosition } from '@remirror/core-utils';
       *
       * test('remove block top level node at specified position', () => {
       *   const {
       *     state: { tr },
       *   } = createEditor(doc(p('x'), p('one')));
       *   const newTr = removeNodeAtPosition({ pos: 3, tr });
       *
       *   expect(newTr).not.toBe(tr);
       *   expect(newTr.doc).toEqualProsemirrorNode(doc(p('x')));
       * });
       * ```
       */
      toEqualProsemirrorNode: (params: _ProsemirrorNode) => R;

      /**
       * Tests that a given node conforms to the schema - the node (and it's
       * descendants) have valid content and marks.
       *
       * ```ts
       * import { createEditor, doc, p } from 'jest-prosemirror';
       * import { removeNodeAtPosition } from '@remirror/core-utils';
       *
       * test('inputRules', () => {
       *   const {
       *     add,
       *     nodes: { p, doc, blockquote },
       *   } = create();
       *
       *   add(doc(p('<cursor>')))
       *     .insertText('> I am a blockquote')
       *     .callback((content) => {
       *       expect(content.state.doc).toBeValidNode();
       *     });
       * });
       * ```
       */
      toBeValidNode: () => R;
    }
  }
}
