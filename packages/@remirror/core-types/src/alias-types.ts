import { InputRule as PMInputRule } from '@remirror/pm/inputrules';
import {
  Fragment as PMFragment,
  Mark as PMMark,
  MarkType as PMMarkType,
  Node as PMNode,
  NodeType as PMNodeType,
  ResolvedPos as PMResolvedPos,
  Schema as PMSchema,
  Slice as PMSlice,
} from '@remirror/pm/model';
import {
  EditorState as PMEditorState,
  Plugin as PMPlugin,
  PluginKey as PMPluginKey,
  Selection as PMSelection,
  Transaction as PMTransaction,
} from '@remirror/pm/state';
import { Mapping as PMMapping } from '@remirror/pm/transform';
import {
  Decoration as PMDecoration,
  DecorationSet as PMDecorationSet,
  EditorView as PMEditorView,
  NodeView as PMNodeView,
} from '@remirror/pm/view';

/* Alias Types */

export type EditorSchema<Nodes extends string = string, Marks extends string = string> = PMSchema<
  Nodes,
  Marks
>;
export type EditorView<Schema extends EditorSchema = any> = PMEditorView<Schema>;
export type Selection<Schema extends EditorSchema = any> = PMSelection<Schema>;
export type DecorationSet<Schema extends EditorSchema = any> = PMDecorationSet<Schema>;
export type Transaction<Schema extends EditorSchema = any> = PMTransaction<Schema>;
export type PluginKey<PluginState = any> = PMPluginKey<PluginState, EditorSchema>;
export type Plugin<PluginState = any, Schema extends EditorSchema = any> = PMPlugin<
  PluginState,
  Schema
>;
export type Mark<Schema extends EditorSchema = any> = PMMark<Schema>;
export type ResolvedPos<Schema extends EditorSchema = any> = PMResolvedPos<Schema>;
export type InputRule<Schema extends EditorSchema = any> = PMInputRule<Schema>;
export type Fragment<Schema extends EditorSchema = any> = PMFragment<Schema>;
export type NodeView<Schema extends EditorSchema = any> = PMNodeView<Schema>;
export type ProsemirrorNode<Schema extends EditorSchema = any> = PMNode<Schema>;
export type ProsemirrorPlugin<PluginState = any> = PMPlugin<PluginState, EditorSchema>;
export type MarkType<Schema extends EditorSchema = any> = PMMarkType<Schema>;
export type NodeType<Schema extends EditorSchema = any> = PMNodeType<Schema>;
export type EditorState<Schema extends EditorSchema = any> = Readonly<PMEditorState<Schema>>;
export type Slice<Schema extends EditorSchema = any> = PMSlice<Schema>;
export type Decoration = PMDecoration;
export type Mapping = PMMapping;
