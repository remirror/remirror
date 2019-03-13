import { Node as PMNode, Schema } from 'prosemirror-model';
import { EditorState as PMEditorState, Plugin as PMPlugin } from 'prosemirror-state';

/* Alias types for better readability throughout the codebase. */

export type ProsemirrorNode = PMNode<EditorSchema>;
export type ProsemirrorPlugin<GPluginState = any> = PMPlugin<GPluginState, EditorSchema>;
export type EditorSchema<GNodes extends string = string, GMarks extends string = string> = Schema<
  GNodes,
  GMarks
>;
export type EditorState<GSchema extends EditorSchema = EditorSchema> = PMEditorState<GSchema>;
export { PMNode, PMPlugin }; // These are values and should be moved from here

/**
 * Utility type for matching the name of a node to via a string or function
 */
export type NodeMatch = string | ((name: string) => boolean);
