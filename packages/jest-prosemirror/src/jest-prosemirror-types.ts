import { EditorSchema } from '@remirror/core';
import { TaggedProsemirrorNode } from 'prosemirror-test-builder';
import { EditorView } from 'prosemirror-view';
/**
 * Tests that a command run transform the nodes from one state to another.
 * The second state is optional if nothing has changed.
 */
export interface CommandTransformation<GSchema extends EditorSchema = any> {
  to?: TaggedProsemirrorNode<GSchema>;
  from: TaggedProsemirrorNode<GSchema>;
}

export interface TaggedDocParams<GSchema extends EditorSchema = any> {
  /**
   * A tagged ProsemirrorNode which can hold cursor information from the passed in text.
   */
  taggedDoc: TaggedProsemirrorNode<GSchema>;
}

export interface TestEditorView<GSchema extends EditorSchema = any> extends EditorView<GSchema> {
  dispatchEvent(event: string | CustomEvent | { type: string }): void;
  domObserver: {
    flush: () => void;
  };
}

export interface TestEditorViewParams<GSchema extends EditorSchema = any> {
  /**
   * An instance of the test editor view which allows for dispatching events
   * and also containers TaggedProsemirrorNodes
   */
  view: TestEditorView<GSchema>;
}
