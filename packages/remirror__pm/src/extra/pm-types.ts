/* Alias Types */

import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export { InputRule } from 'prosemirror-inputrules';
export {
  Schema as EditorSchema,
  Fragment,
  Mark,
  MarkType,
  NodeType,
  Node as ProsemirrorNode,
  ResolvedPos,
  Slice,
} from 'prosemirror-model';
export {
  EditorState,
  PluginKey,
  Plugin as ProsemirrorPlugin,
  Selection,
  Transaction,
} from 'prosemirror-state';
export { Mapping } from 'prosemirror-transform';
export type { NodeView } from 'prosemirror-view';
export { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

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
 * @typeParam Schema - the underlying editor schema.
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
 * @typeParam Schema - the underlying editor schema.
 */
export type ProsemirrorCommandFunction = (
  state: EditorState,
  dispatch: DispatchFunction | undefined,
  view: EditorView | undefined,
) => boolean;

/**
 * A command method for running commands in your editor.
 *
 * @typeParam Schema - the underlying editor schema.
 * @typeParam ExtraProps - extra parameters to add to the command function.
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
 * @typeParam Schema - the underlying editor schema.
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
