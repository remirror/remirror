import type { TaggedProsemirrorNode } from 'prosemirror-test-builder';
import type { EditorSchema } from '@remirror/core-types';
import type { EditorView } from '@remirror/pm/view';

/**
 * Tests that a command run transform the nodes from one state to another.
 * The second state is optional if nothing has changed.
 */
export interface CommandTransformation<Schema extends EditorSchema = EditorSchema> {
  /**
   * The initial prosemirror node.
   *
   * ```ts
   * import { doc, p, strong} from 'jest-prosemirror';
   *
   * const from = doc(p('Hello ', strong('Friend')));
   * ```
   */
  from: TaggedProsemirrorNode<Schema>;

  /**
   * The output of the command transformation.
   *
   * ```ts
   * import { doc, p, strong} from 'jest-prosemirror';
   *
   * const to = doc(p(strong('Friend')));
   * ```
   *
   * This is optional and can be omitted if the transformation doesn't produce
   * any results.
   */
  to?: TaggedProsemirrorNode<Schema>;
}

export interface TaggedDocProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * A tagged ProsemirrorNode which can hold cursor information from the passed in text.
   */
  taggedDoc: TaggedProsemirrorNode<Schema>;
}

export interface TestEditorView<Schema extends EditorSchema = EditorSchema>
  extends EditorView<Schema> {
  dispatchEvent: (event: string | CustomEvent | { type: string }) => void;
  domObserver: {
    flush: () => void;
  };
}

export interface TestEditorViewProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * An instance of the test editor view which allows for dispatching events
   * and also containers TaggedProsemirrorNodes
   */
  view: TestEditorView<Schema>;
}
