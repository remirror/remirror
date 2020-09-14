import { ErrorConstant } from '@remirror/core-constants';
import { invariant } from '@remirror/core-helpers';

import type { EditorState, Transaction } from '../state';
import type {
  CommandFunction,
  EditorSchema,
  NonChainableCommandFunction,
  ProsemirrorCommandFunction,
} from './pm-types';

/**
 * Creates a fake state that can be used on ProseMirror library commands to make
 * them chainable. The provided Transaction `tr` can be a shared one.
 *
 * @param tr - the chainable transaction that should be amended.
 * @param state - the state of the editor (available via `view.state`).
 *
 * This should not be used other than for passing to `prosemirror-*` library
 * commands.
 */
export function chainableEditorState<Schema extends EditorSchema = EditorSchema>(
  tr: Transaction<Schema>,
  state: EditorState<Schema>,
): EditorState<Schema> {
  return {
    ...state,
    tr,
    schema: state.schema,
    plugins: state.plugins,
    apply: state.apply.bind(state),
    applyTransaction: state.applyTransaction.bind(state),
    reconfigure: state.reconfigure.bind(state),
    toJSON: state.toJSON.bind(state),
    get storedMarks() {
      return state.storedMarks;
    },
    get selection() {
      return state.selection;
    },
    get doc() {
      return state.doc;
    },
  };
}

/**
 * Wraps the default [[ProsemirrorCommandFunction]] and makes it compatible with
 * the default **remirror** [[CommandFunction]] call signature.
 *
 * It extracts all the public APIs of the state object and assigns the
 * chainable transaction to the `state.tr` property to support chaining.
 */
export function convertCommand<
  Schema extends EditorSchema = EditorSchema,
  Extra extends object = object
>(commandFunction: ProsemirrorCommandFunction<Schema>): CommandFunction<Schema, Extra> {
  return ({ state, dispatch, view, tr }) =>
    commandFunction(chainableEditorState(tr, state), dispatch, view);
}

/**
 * Marks a command function as non chainable. It will throw an error when
 * chaining is attempted.
 *
 * @remarks
 *
 * ```ts
 * const command = nonChainable(({ state, dispatch }) => {...});
 * ```
 */
export function nonChainable<
  Schema extends EditorSchema = EditorSchema,
  Extra extends object = object
>(commandFunction: CommandFunction<Schema, Extra>): NonChainableCommandFunction<Schema, Extra> {
  return ((parameter) => {
    invariant(parameter.dispatch === undefined || parameter.dispatch === parameter.view?.dispatch, {
      code: ErrorConstant.NON_CHAINABLE_COMMAND,
    });

    return commandFunction(parameter);
  }) as NonChainableCommandFunction<Schema, Extra>;
}

/**
 * Similar to the chainCommands from the `prosemirror-commands` library. Allows
 * multiple commands to be chained together and runs until one of them returns
 * true.
 */
export function chainCommands<
  Schema extends EditorSchema = EditorSchema,
  Extra extends object = object
>(...commands: Array<CommandFunction<Schema, Extra>>): CommandFunction<Schema, Extra> {
  return ({ state, dispatch, view, tr, ...rest }) => {
    for (const element of commands) {
      if (element({ state, dispatch, view, tr, ...(rest as Extra) })) {
        return true;
      }
    }

    return false;
  };
}
