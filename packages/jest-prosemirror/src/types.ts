import { TaggedProsemirrorNode } from 'prosemirror-test-builder';
/**
 * Tests that a command run transform the nodes from one state to another.
 * The second state is optional if nothing has changed.
 */
export interface CommandTransformation {
  to?: TaggedProsemirrorNode;
  from: TaggedProsemirrorNode;
}
