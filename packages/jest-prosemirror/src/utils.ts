import { Cast, CommandFunction } from '@remirror/core';
import { EditorState } from 'prosemirror-state';
import { TaggedProsemirrorNode } from 'prosemirror-test-builder';
import { createEditor, pm, selectionFor, taggedDocHasSelection } from './test-helpers';

/**
 * Apply the command to the taggedDoc
 *
 * Returns a tuple matching the following structure
 * [
 *   bool => was the command successfully applied
 *   taggedDoc => the new doc as a result of the command
 *   state => The new editor state after applying the command
 * ]
 *
 * @param taggedDoc
 * @param command
 * @param [result]
 */
export function apply(
  taggedDoc: TaggedProsemirrorNode,
  command: CommandFunction,
  result?: TaggedProsemirrorNode,
): [boolean, TaggedProsemirrorNode, EditorState] {
  const { state, view } = createEditor(taggedDoc);
  let newState = state;

  command(state, tr => (newState = state.apply(tr)), view);

  if (!pm.eq(newState.doc, result || taggedDoc)) {
    return [false, Cast<TaggedProsemirrorNode>(newState.doc), newState];
  }
  if (result && taggedDocHasSelection(result)) {
    return [pm.eq(newState.selection, selectionFor(result)), result || taggedDoc, newState];
  }
  return [true, Cast<TaggedProsemirrorNode>(newState.doc), newState];
}
