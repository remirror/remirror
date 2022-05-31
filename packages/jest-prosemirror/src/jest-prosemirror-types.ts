import type { ProsemirrorNode } from '@remirror/core-types';
import type { EditorView } from '@remirror/pm/view';

/**
 * Tests that a command run transform the nodes from one state to another.
 * The second state is optional if nothing has changed.
 */
export interface CommandTransformation {
  /**
   * The initial prosemirror node.
   *
   * ```ts
   * import { doc, p, strong} from 'jest-prosemirror';
   *
   * const from = doc(p('Hello ', strong('Friend')));
   * ```
   */
  from: ProsemirrorNode;

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
  to?: ProsemirrorNode;
}

export interface TaggedDocProps {
  /**
   * A tagged ProsemirrorNode which can hold cursor information from the passed in text.
   */
  taggedDoc: ProsemirrorNode;
}

export interface TestEditorView extends EditorView {
  dispatchEvent: (event: string | CustomEvent | { type: string }) => void;
  domObserver: {
    flush: () => void;
  };
}

export interface TestEditorViewProps {
  /**
   * An instance of the test editor view which allows for dispatching events
   * and also containers TaggedProsemirrorNodes
   */
  view: TestEditorView;
}

interface TaggedFlatObject {
  tag: Record<string, number>;
  flat: Array<TaggedProsemirrorNode | TaggedFlatObject>;
}

export interface TaggedProsemirrorNode extends TaggedFlatObject, ProsemirrorNode {}
