import type { InputRule as PMInputRule } from '@remirror/pm/inputrules';
import type {
  Fragment as PMFragment,
  Mark as PMMark,
  MarkType as PMMarkType,
  Node as PMNode,
  NodeType as PMNodeType,
  ResolvedPos as PMResolvedPos,
  Schema as PMSchema,
  Slice as PMSlice,
} from '@remirror/pm/model';
import type {
  EditorState as PMEditorState,
  Plugin as PMPlugin,
  PluginKey as PMPluginKey,
  Selection as PMSelection,
  Transaction as PMTransaction,
} from '@remirror/pm/state';
import type { Mapping as PMMapping } from '@remirror/pm/transform';
import type {
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
export type EditorView<Schema extends EditorSchema = EditorSchema> = PMEditorView<Schema>;
export type Selection<Schema extends EditorSchema = EditorSchema> = PMSelection<Schema>;
export type DecorationSet<Schema extends EditorSchema = EditorSchema> = PMDecorationSet<Schema>;
export type Transaction<Schema extends EditorSchema = EditorSchema> = PMTransaction<Schema>;
export type PluginKey<PluginState = EditorSchema> = PMPluginKey<PluginState, EditorSchema>;

export type Mark<Schema extends EditorSchema = EditorSchema> = PMMark<Schema>;
export type ResolvedPos<Schema extends EditorSchema = EditorSchema> = PMResolvedPos<Schema>;
export type InputRule<Schema extends EditorSchema = EditorSchema> = PMInputRule<Schema>;
export type Fragment<Schema extends EditorSchema = EditorSchema> = PMFragment<Schema>;
export type NodeView<Schema extends EditorSchema = EditorSchema> = PMNodeView<Schema>;
export type ProsemirrorNode<Schema extends EditorSchema = EditorSchema> = PMNode<Schema>;
export type ProsemirrorPlugin<PluginState = any> = PMPlugin<PluginState, EditorSchema>;
export type MarkType<Schema extends EditorSchema = EditorSchema> = PMMarkType<Schema>;
export type NodeType<Schema extends EditorSchema = EditorSchema> = PMNodeType<Schema>;
export type EditorState<Schema extends EditorSchema = EditorSchema> = Readonly<
  PMEditorState<Schema>
>;
export type Slice<Schema extends EditorSchema = EditorSchema> = PMSlice<Schema>;
export type Decoration = PMDecoration;
export type Mapping = PMMapping;
