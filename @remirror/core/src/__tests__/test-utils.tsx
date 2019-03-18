import chalk from 'chalk';
import { axe } from 'jest-axe';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';

import { EditorState, NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import pm, { TaggedProsemirrorNode } from 'prosemirror-test-builder';

import { render } from 'react-testing-library';
import { isElementDOMNode, isTextDOMNode } from '../helpers';
import { bool, Cast } from '../helpers/base';
import { CommandFunction } from '../types';

const renderString = (
  node: JSX.Element,
  options?: { container: HTMLElement; baseElement?: HTMLElement },
): string => {
  const { container } = render(node, options);
  return container.innerHTML;
};

export * from 'react-testing-library';

export { axe, renderString };

function selectionFor(docNode: TaggedProsemirrorNode) {
  const aTag = docNode.tag.a;
  if (aTag != null) {
    const $aTag = docNode.resolve(aTag);
    if ($aTag.parent.inlineContent) {
      return new TextSelection($aTag, docNode.tag.b != null ? docNode.resolve(docNode.tag.b) : undefined);
    } else {
      return new NodeSelection($aTag);
    }
  }
  return Selection.atStart(docNode);
}

export function createEditorState(d: TaggedProsemirrorNode) {
  return EditorState.create({ doc: d, selection: selectionFor(d) });
}

export function apply(
  docNode: TaggedProsemirrorNode,
  command: CommandFunction,
  result?: TaggedProsemirrorNode,
): [boolean, TaggedProsemirrorNode, EditorState] {
  let state = createEditorState(docNode);
  command(state, tr => (state = state.apply(tr)), Cast({}));

  if (!pm.eq(state.doc, result || docNode)) {
    return [false, Cast<TaggedProsemirrorNode>(state.doc), state];
  }

  if (result && result.tag.a != null) {
    return [pm.eq(state.selection, selectionFor(result)), result || docNode, state];
  }
  return [true, Cast<TaggedProsemirrorNode>(state.doc), state];
}

export { pm };

export const findTextElement = (node: Node, text: string): Node | null => {
  if (isTextDOMNode(node)) {
    if (node.nodeValue === text) {
      return node;
    }
  } else if (isElementDOMNode(node)) {
    for (let ch = node.firstChild; ch; ch = ch.nextSibling as ChildNode) {
      const found = findTextElement(ch, text);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

/**
 * Tests that a command run transform the nodes from one state to another.
 * The second state is optional if nothing has changed.
 */
interface CommandTransformation {
  to?: TaggedProsemirrorNode;
  from: TaggedProsemirrorNode;
}

const passMessage = (
  actual: TaggedProsemirrorNode,
  expected: TaggedProsemirrorNode,
  shouldChange: boolean,
) => () =>
  matcherHint('.not.transformsNode') + '\n\n' + shouldChange
    ? chalk`Expected the node {bold not} to be:\n` +
      `${printExpected(expected.toString())}\n` +
      `Position: { from: ${selectionFor(expected).from}, to: ${selectionFor(expected).to} }\n\n` +
      'Received:\n' +
      `${printReceived(actual.toString())}\n` +
      `Position: { from: ${selectionFor(actual).from}, to: ${selectionFor(actual).to} }\n\n`
    : 'Expected the node to be different from:\n' +
      `${printExpected(expected.toString())}\n\n` +
      `Position: { from: ${selectionFor(expected).from} to: ${selectionFor(expected).to} }\n\n` +
      'Received:\n' +
      `${printReceived(actual.toString())}\n` +
      `Position: { from: ${selectionFor(actual).from}, to: ${selectionFor(actual).to} }\n\n`;

const failMessage = (
  actual: TaggedProsemirrorNode,
  expected: TaggedProsemirrorNode,
  shouldChange: boolean,
) => () =>
  matcherHint('.transformsNode') + '\n\n' + shouldChange
    ? 'Expected the node to be transformed to:\n' +
      `${printExpected(expected.toString())}\n` +
      `Position: { from: ${selectionFor(expected).from}, to: ${selectionFor(expected).to} }\n\n` +
      'Received:\n' +
      `${printReceived(actual.toString())}\n` +
      `Position: { from: ${selectionFor(actual).from}, to: ${selectionFor(actual).to} }\n\n`
    : 'Expected the node not to be changed from:\n' +
      `${printExpected(expected.toString())}\n` +
      `Position: { from: ${selectionFor(expected).from} to: ${selectionFor(expected).to} }\n\n` +
      'Received:\n' +
      `${printReceived(actual.toString())}\n` +
      `Position: { from: ${selectionFor(actual).from}, to: ${selectionFor(actual).to} }\n\n`;

const matcher = {
  transformsNode(command: CommandFunction, { from, to }: CommandTransformation = Cast({})) {
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
    if (pass) {
      return { pass, message: passMessage(actual, expected, shouldChange) };
    } else {
      return { pass, message: failMessage(actual, expected, shouldChange) };
    }
  },
};

expect.extend(matcher);

declare global {
  namespace jest {
    interface Matchers<R> {
      transformsNode(params: CommandTransformation): R;
    }
  }
}
