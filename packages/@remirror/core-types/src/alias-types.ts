/* Alias Types */

export type EditorSchema<
  Nodes extends string = string,
  Marks extends string = string
> = import('@remirror/pm/model').Schema<Nodes, Marks>;
export type EditorView<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/view').EditorView<Schema>;
export type Selection<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/state').Selection<Schema>;
export type DecorationSet<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/view').DecorationSet<Schema>;
export type Transaction<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/state').Transaction<Schema>;
export type PluginKey<PluginState = EditorSchema> = import('@remirror/pm/state').PluginKey<
  PluginState,
  EditorSchema
>;

export type Mark<Schema extends EditorSchema = EditorSchema> = import('@remirror/pm/model').Mark<
  Schema
>;
export type ResolvedPos<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/model').ResolvedPos<Schema>;
export type InputRule<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/inputrules').InputRule<Schema>;
export type Fragment<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/model').Fragment<Schema>;
export type NodeView<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/view').NodeView<Schema>;
export type ProsemirrorNode<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/model').Node<Schema>;
export type ProsemirrorPlugin<PluginState = any> = import('@remirror/pm/state').Plugin<
  PluginState,
  EditorSchema
>;
export type MarkType<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/model').MarkType<Schema>;
export type NodeType<
  Schema extends EditorSchema = EditorSchema
> = import('@remirror/pm/model').NodeType<Schema>;
export type EditorState<Schema extends EditorSchema = EditorSchema> = Readonly<
  import('@remirror/pm/state').EditorState<Schema>
>;
export type Slice<Schema extends EditorSchema = EditorSchema> = import('@remirror/pm/model').Slice<
  Schema
>;
export type Decoration = import('@remirror/pm/view').Decoration;
export type Mapping = import('@remirror/pm/transform').Mapping;
