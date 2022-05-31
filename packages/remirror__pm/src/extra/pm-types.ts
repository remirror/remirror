/* Alias Types */

export type EditorSchema = import('../model').Schema;
export type EditorView = import('../view').EditorView;
export type Selection = import('../state').Selection;
export type DecorationSet = import('../view').DecorationSet;
export type Transaction = import('../state').Transaction;
export type PluginKey<PluginState = any> = import('../state').PluginKey<PluginState>;

export type Mark = import('../model').Mark;
export type ResolvedPos = import('../model').ResolvedPos;
export type InputRule = import('../inputrules').InputRule;
export type Fragment = import('../model').Fragment;
export type NodeView = import('../view').NodeView;
export type ProsemirrorNode = import('../model').Node;
export type ProsemirrorPlugin<PluginState = any> = import('../state').Plugin<PluginState>;
export type MarkType = import('../model').MarkType;
export type NodeType = import('../model').NodeType;
export type EditorState = Readonly<import('../state').EditorState>;
export type Slice = import('../model').Slice;
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
export type NonChainableCommandFunction<Extra extends object = object> = Brand<
  CommandFunction<Extra>,
  'non-chainable'
>;

/**
 * Used to apply the Prosemirror transaction to the current {@link EditorState}.
 *
 * @template Schema - the underlying editor schema.
 */
export type DispatchFunction = (tr: Transaction) => void;

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
export type ProsemirrorCommandFunction = (
  state: EditorState,
  dispatch: DispatchFunction | undefined,
  view: EditorView | undefined,
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
export type CommandFunction<ExtraProps extends object = object> = (
  params: CommandFunctionProps & ExtraProps,
) => boolean;

/**
 * A parameter builder interface for the remirror `CommandFunction`.
 *
 * @template Schema - the underlying editor schema.
 */
export interface CommandFunctionProps {
  /**
   * The shared ProseMirror Transaction.
   */
  tr: Transaction;

  /**
   * A snapshot of the ProseMirror editor state.
   */
  state: EditorState;

  /**
   * The dispatch function which causes the command to be performed.
   *
   * @remarks
   *
   * `dispatch` can be `undefined`. When no `dispatch` callback is provided the
   * command should perform a 'dry run', determining whether the command is
   * applicable (`return true`), but not actually performing the action.
   */
  dispatch?: DispatchFunction;

  /**
   * An instance of the ProseMirror editor `view`.
   */
  view?: EditorView;
}
