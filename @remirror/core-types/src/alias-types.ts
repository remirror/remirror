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
export type EditorView<GSchema extends EditorSchema = any> = PMEditorView<GSchema>;
export type Selection<GSchema extends EditorSchema = any> = PMSelection<GSchema>;
export type DecorationSet<GSchema extends EditorSchema = any> = PMDecorationSet<GSchema>;
export type Transaction<GSchema extends EditorSchema = any> = PMTransaction<GSchema>;
export type PluginKey<GPluginState = any> = PMPluginKey<GPluginState, EditorSchema>;
export type Plugin<GPluginState = any> = PMPlugin<GPluginState, EditorSchema>;
export type Mark<GSchema extends EditorSchema = any> = PMMark<GSchema>;
export type ResolvedPos<GSchema extends EditorSchema = any> = PMResolvedPos<GSchema>;
export type InputRule<GSchema extends EditorSchema = any> = PMInputRule<GSchema>;
export type Fragment<GSchema extends EditorSchema = any> = PMFragment<GSchema>;
export type NodeView<GSchema extends EditorSchema = any> = PMNodeView<GSchema>;
export type ProsemirrorNode<GSchema extends EditorSchema = any> = PMNode<GSchema>;
export type ProsemirrorPlugin<GPluginState = any> = PMPlugin<GPluginState, EditorSchema>;
export type MarkType<GSchema extends EditorSchema = any> = PMMarkType<GSchema>;
export type NodeType<GSchema extends EditorSchema = any> = PMNodeType<GSchema>;
export type EditorState<GSchema extends EditorSchema = any> = PMEditorState<GSchema>;
export type Slice<GSchema extends EditorSchema = any> = PMSlice<GSchema>;
export type Decoration = PMDecoration;
export type Mapping = PMMapping;
