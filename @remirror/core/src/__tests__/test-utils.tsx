import { axe } from 'jest-axe';
import { EditorState, NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import pm, { TaggedProsemirrorNode } from 'prosemirror-test-builder';

import { render } from 'react-testing-library';
import { Cast } from '../helpers';
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
      return new TextSelection(
        $aTag,
        docNode.tag.b != null ? docNode.resolve(docNode.tag.b) : undefined,
      );
    } else {
      return new NodeSelection($aTag);
    }
  }
  return Selection.atStart(docNode);
}

function createState(d: TaggedProsemirrorNode) {
  return EditorState.create({ doc: d, selection: selectionFor(d) });
}

export function apply(
  docNode: TaggedProsemirrorNode,
  command: CommandFunction,
  result?: TaggedProsemirrorNode,
): [boolean, TaggedProsemirrorNode] {
  let state = createState(docNode);
  command(state, tr => (state = state.apply(tr)));

  if (!pm.eq(state.doc, result || docNode)) {
    return [false, Cast<TaggedProsemirrorNode>(state.doc)];
  }

  if (result && result.tag.a != null) {
    return [pm.eq(state.selection, selectionFor(result)), result || docNode];
  }
  return [true, Cast<TaggedProsemirrorNode>(state.doc)];
}

export { pm };

export const findTextElement = (node: Node, text: string): Node | null => {
  if (node.nodeType === 3) {
    if (node.nodeValue === text) {
      return node;
    }
  } else if (node.nodeType === 1) {
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
        message: () =>
          `Please specify the 'from' node which this command: ${command.name} should transform`,
        pass: false,
      };
    }

    const [pass, docNode] = apply(from, command, to);
    return {
      message: () =>
        to
          ? `expected "${from.toString()}" to be transformed to "${to.toString()}"

instead it equals: "${docNode ? docNode.toString() : undefined}"`
          : `expected "${from.toString()}" not to change

instead it equals: "${docNode ? docNode.toString() : undefined}"`,
      pass,
    };
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
