import { InputRule as PMInputRule } from 'prosemirror-inputrules';
import {
  Fragment as PMFragment,
  Mark as PMMark,
  MarkType as PMMarkType,
  Node as PMNode,
  NodeType as PMNodeType,
  ResolvedPos as PMResolvedPos,
  Schema,
  Slice as PMSlice,
} from 'prosemirror-model';
import {
  EditorState as PMEditorState,
  Plugin as PMPlugin,
  PluginKey as PMPluginKey,
  Selection as PMSelection,
  Transaction as PMTransaction,
} from 'prosemirror-state';
import { Mapping as PMMapping } from 'prosemirror-transform';
import {
  Decoration as PMDecoration,
  DecorationSet as PMDecorationSet,
  EditorView as PMEditorView,
  NodeView as PMNodeView,
} from 'prosemirror-view';

/* Alias Types */

export type EditorSchema<GNodes extends string = string, GMarks extends string = string> = Schema<
  GNodes,
  GMarks
>;
export type EditorView<GSchema extends EditorSchema = EditorSchema> = PMEditorView<GSchema>;
export type Selection<GSchema extends EditorSchema = EditorSchema> = PMSelection<GSchema>;
export type DecorationSet<GSchema extends EditorSchema = EditorSchema> = PMDecorationSet<GSchema>;
export type Transaction<GSchema extends EditorSchema = EditorSchema> = PMTransaction<GSchema>;
export type PluginKey<GPluginState = any> = PMPluginKey<GPluginState, EditorSchema>;
export type Plugin<GPluginState = any> = PMPlugin<GPluginState, EditorSchema>;
export type Mark<GSchema extends EditorSchema = EditorSchema> = PMMark<GSchema>;
export type ResolvedPos<GSchema extends EditorSchema = EditorSchema> = PMResolvedPos<GSchema>;
export type InputRule<GSchema extends EditorSchema = EditorSchema> = PMInputRule<GSchema>;
export type Fragment<GSchema extends EditorSchema = EditorSchema> = PMFragment<GSchema>;
export type NodeView<GSchema extends EditorSchema = EditorSchema> = PMNodeView<GSchema>;
export type ProsemirrorNode<GSchema extends EditorSchema = EditorSchema> = PMNode<GSchema>;
export type ProsemirrorPlugin<GPluginState = any> = PMPlugin<GPluginState, EditorSchema>;
export type MarkType<GSchema extends EditorSchema = EditorSchema> = PMMarkType<GSchema>;
export type NodeType<GSchema extends EditorSchema = EditorSchema> = PMNodeType<GSchema>;
export type EditorState<GSchema extends EditorSchema = EditorSchema> = PMEditorState<GSchema>;
export type Slice<GSchema extends EditorSchema = EditorSchema> = PMSlice<GSchema>;
export type Decoration = PMDecoration;
export type Mapping = PMMapping;
