import { Cast, CommandFunction, isElementDOMNode, isTextDOMNode } from '@remirror/core';
import { EditorState, NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import pm, { TaggedProsemirrorNode } from 'prosemirror-test-builder';

export function selectionFor(docNode: TaggedProsemirrorNode) {
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
