/* Alias Types */

export type EditorSchema<
  Nodes extends string = string,
  Marks extends string = string,
> = import('../model').Schema<Nodes, Marks>;
export type EditorView<Schema extends EditorSchema = EditorSchema> =
  import('../view').EditorView<Schema>;
export type Selection<Schema extends EditorSchema = EditorSchema> =
  import('../state').Selection<Schema>;
export type DecorationSet<Schema extends EditorSchema = EditorSchema> =
  import('../view').DecorationSet<Schema>;
export type Transaction<Schema extends EditorSchema = EditorSchema> =
  import('../state').Transaction<Schema>;
export type PluginKey<PluginState = EditorSchema> = import('../state').PluginKey<
  PluginState,
  EditorSchema
>;

export type Mark<Schema extends EditorSchema = EditorSchema> = import('../model').Mark<Schema>;
export type ResolvedPos<Schema extends EditorSchema = EditorSchema> =
  import('../model').ResolvedPos<Schema>;
export type InputRule<Schema extends EditorSchema = EditorSchema> =
  import('../inputrules').InputRule<Schema>;
export type Fragment<Schema extends EditorSchema = EditorSchema> =
  import('../model').Fragment<Schema>;
export type NodeView<Schema extends EditorSchema = EditorSchema> =
  import('../view').NodeView<Schema>;
export type ProsemirrorNode<Schema extends EditorSchema = EditorSchema> =
  import('../model').Node<Schema>;
export type ProsemirrorPlugin<PluginState = any> = import('../state').Plugin<
  PluginState,
  EditorSchema
>;
export type MarkType<Schema extends EditorSchema = EditorSchema> =
  import('../model').MarkType<Schema>;
export type NodeType<Schema extends EditorSchema = EditorSchema> =
  import('../model').NodeType<Schema>;
export type EditorState<Schema extends EditorSchema = EditorSchema> = Readonly<
  import('../state').EditorState<Schema>
>;
export type Slice<Schema extends EditorSchema = EditorSchema> = import('../model').Slice<Schema>;
export type Decoration = import('../view').Decoration;
export type Mapping = import('../transform').Mapping;

declare const _brand: unique symbol;
interface Branding<Type> {
  readonly [_brand]: Type;
}
type Brand<Type, B> = Type & Branding<B>;

/**
 * Brands a command as non chainable so that it can be excluded from the
 * inferred chainable commands.
 */
export type NonChainableCommandFunction<
  Schema extends EditorSchema = EditorSchema,
  Extra extends object = object,
> = Brand<CommandFunction<Schema, Extra>, 'non-chainable'>;

/**
 * Used to apply the Prosemirror transaction to the current {@link EditorState}.
 *
 * @template Schema - the underlying editor schema.
 */
export type DispatchFunction<Schema extends EditorSchema = EditorSchema> = (
  tr: Transaction<Schema>,
) => void;

/**
 * This is the type signature for commands within the prosemirror editor.
 *
 * @remarks
 *
 * A command function takes an editor state and optionally a dispatch function
 * that it can use to dispatch a transaction. It should return a boolean that
 * indicates whether it could perform any action.
 *
 * When no dispatch callback is passed, the command should do a 'dry run',
 * determining whether it is applicable, but not actually performing any action.
 *
 * @template Schema - the underlying editor schema.
 */
export type ProsemirrorCommandFunction<Schema extends EditorSchema = EditorSchema> = (
  state: EditorState<Schema>,
  dispatch: DispatchFunction<Schema> | undefined,
  view: EditorView<Schema> | undefined,
) => boolean;

/**
 * A command method for running commands in your editor.
 *
 * @template Schema - the underlying editor schema.
 * @template ExtraProps - extra parameters to add to the command function.
 *
 * @remarks
 *
 * This groups all the prosemirror command arguments into a single parameter.
 *
 * tldr; When `dispatch=undefined` make sure the command function is **idempotent**.
 *
 * One thing to be aware of is that when creating a command function the
 * `tr` should only be updated when the `dispatch` method is available. This is
 * because by convention calling the command function with `dispatch=undefined`
 * is used to check if the function returns `true`, an indicator that it is
 * enabled, or returns `false` to indicate it is not enabled.
 *
 * If the transaction has been updated outside of the `dispatch=true` condition
 * then running the command again will result in multiple transaction updates
 * and unpredictable behavior.
 *
 * @see {@link ProsemirrorCommandFunction}
 */
export type CommandFunction<
  Schema extends EditorSchema = EditorSchema,
  ExtraProps extends object = object,
> = (params: CommandFunctionProps<Schema> & ExtraProps) => boolean;

/**
 * A parameter builder interface for the remirror `CommandFunction`.
 *
 * @template Schema - the underlying editor schema.
 */
export interface CommandFunctionProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * The shared ProseMirror Transaction.
   */
  tr: Transaction<Schema>;

  /**
   * A snapshot of the ProseMirror editor state.
   */
  state: EditorState<Schema>;

  /**
   * The dispatch function which causes the command to be performed.
   *
   * @remarks
   *
   * `dispatch` can be `undefined`. When no `dispatch` callback is provided the
   * command should perform a 'dry run', determining whether the command is
   * applicable (`return true`), but not actually performing the action.
   */
  dispatch?: DispatchFunction<Schema>;

  /**
   * An instance of the ProseMirror editor `view`.
   */
  view?: EditorView<Schema>;
}
