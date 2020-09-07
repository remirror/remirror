import { ErrorConstant, ExtensionPriority } from '@remirror/core-constants';
import { entries, invariant, isEmptyArray, object, uniqueArray } from '@remirror/core-helpers';
import type {
  AnyFunction,
  CommandFunction,
  DispatchFunction,
  EditorSchema,
  EmptyShape,
  FromToParameter,
  PrimitiveSelection,
  ProsemirrorAttributes,
  Transaction,
  Value,
} from '@remirror/core-types';
import { getTextSelection } from '@remirror/core-utils';
import { TextSelection } from '@remirror/pm/state';
import type { EditorView } from '@remirror/pm/view';

import { extensionDecorator } from '../decorators';
import {
  AnyExtension,
  ChainedCommandRunParameter,
  ChainedFromExtensions,
  CommandsFromExtensions,
  PlainExtension,
} from '../extension';
import { throwIfNameNotUnique } from '../helpers';
import type { AnyCombinedUnion, ChainedFromCombined, CommandsFromCombined } from '../preset';
import type {
  CommandShape,
  CreatePluginReturn,
  ExtensionCommandFunction,
  ExtensionCommandReturn,
  StateUpdateLifecycleParameter,
} from '../types';

/**
 * Generate chained and unchained commands for making changes to the editor.
 *
 * @remarks
 *
 * Typically actions are used to create interactive menus. For example a menu
 * can use a command to toggle bold formatting or to undo the last action.
 *
 * @builtin
 */
@extensionDecorator({ defaultPriority: ExtensionPriority.Highest })
export class CommandsExtension extends PlainExtension {
  get name() {
    return 'commands' as const;
  }

  /**
   * The current transaction which allows for making commands chainable.
   *
   * It is shared by all the commands helpers and can even be used in the
   * [[`KeymapExtension`]].
   */
  get transaction(): Transaction {
    // Make sure we have the most up to date state.
    const state = this.store.getState();

    if (!this.#transaction) {
      // Since there is currently no transaction set, make sure to create a new
      // one. Behind the scenes `state.tr` creates a new transaction for us to
      // use.
      this.#transaction = state.tr;
    }

    // Check that the current transaction is valid.
    const isValid = this.#transaction.before.eq(state.doc);

    // Check whether the current transaction has any already applied to it.
    const hasSteps = !isEmptyArray(this.#transaction.steps);

    if (!isValid) {
      // Since the transaction is not valid we create a new one to prevent any
      // `mismatched` transaction errors.
      const tr = state.tr;

      // Now checking if any steps had been added to the previous transaction
      // and adding them to the newly created transaction.
      if (hasSteps) {
        for (const step of this.#transaction.steps) {
          tr.step(step);
        }
      }

      // Make sure to store the transaction value to the instance of this
      // extension.
      this.#transaction = tr;
    }

    return this.#transaction;
  }

  /**
   * This is the holder for the shared transaction which is shared by commands
   * in order to support chaining.
   */
  #transaction?: Transaction;

  onCreate(): void {
    const { setExtensionStore, setStoreKey } = this.store;

    // TODO remove these two.
    setExtensionStore('getCommands', this.getCommands);
    setExtensionStore('getChain', this.getChain);

    // Support forced updates.
    setExtensionStore('forceUpdate', this.forceUpdate);
    setStoreKey('getForcedUpdates', this.getForcedUpdates);

    // Enable retrieval of the current transaction.
    setExtensionStore('getTransaction', () => this.transaction);
  }

  onView(view: EditorView<EditorSchema>): void {
    const { setStoreKey, setExtensionStore } = this.store;
    const commands: Record<string, CommandShape> = object();
    const names = new Set<string>();
    const chained: Record<string, any> & ChainedCommandRunParameter = object();
    const unchained: Record<string, { command: AnyFunction; isEnabled: AnyFunction }> = object();

    for (const extension of this.store.extensions) {
      // There's no need to continue if the extension has no commands.
      if (!extension.createCommands) {
        continue;
      }

      // Gather the returned commands object from the extension.
      this.addCommands({ names, chained, unchained, commands: extension.createCommands() });
    }

    for (const [commandName, { command, isEnabled }] of entries(unchained)) {
      commands[commandName] = command as CommandShape;
      commands[commandName].isEnabled = isEnabled;
    }

    chained.run = () => view.dispatch(this.transaction);

    setStoreKey('commands', commands);
    setStoreKey('chain', chained as any);

    setExtensionStore('commands', commands as any);
    setExtensionStore('chain', chained as any);
  }

  /**
   * Update the cached transaction whenever the state is updated.
   */
  onStateUpdate({ state }: StateUpdateLifecycleParameter): void {
    this.#transaction = state.tr;
  }

  /**
   * Create the default commands available to all extensions.
   */
  createCommands() {
    return {
      /**
       * Enable custom commands to be used within the editor by users.
       *
       * This is preferred to the initial idea of setting commands on the
       * manager or even as a prop. The problem is that there's no typechecking
       * and it should be just fine to add your custom commands here to see the
       * dispatched immediately.
       */
      customDispatch(command: CommandFunction): CommandFunction {
        return command;
      },
      /**
       * Create a custom transaction.
       *
       * @param transactionUpdater - callback method for updating the
       * transaction in the editor. Since transactions are mutable there is no
       * return type.
       *
       * @remarks
       *
       * This is primarily intended for use within a chainable command chain.
       */
      customTransaction(transactionUpdater: (transaction: Transaction) => void): CommandFunction {
        return ({ tr, dispatch }) => {
          if (dispatch) {
            transactionUpdater(tr);
            dispatch(tr);
          }

          return true;
        };
      },

      /**
       * Insert text into the dom at the current location by default.
       */
      insertText(text: string, range?: Partial<FromToParameter>): CommandFunction {
        return ({ tr, dispatch }) => {
          const { from, to } = range ?? tr.selection;

          if (dispatch) {
            dispatch(tr.insertText(text, from, to));
          }

          return true;
        };
      },

      /**
       * Select the text within the provided range.
       */
      selectText: (selection: PrimitiveSelection): CommandFunction => ({ tr, dispatch }) => {
        const textSelection = getTextSelection(selection, tr.doc);

        // TODO: add some safety checks here. If the selection is out of range
        // perhaps silently fail
        dispatch?.(tr.setSelection(textSelection));

        return true;
      },

      /**
       * Delete the provided range or current selection.
       */
      delete(range?: FromToParameter): CommandFunction {
        return ({ tr, dispatch }) => {
          const { from, to } = range ?? tr.selection;

          if (dispatch) {
            dispatch(tr.delete(from, to));
          }

          return true;
        };
      },

      /**
       * Fire an empty update to trigger an update to all decorations, and state
       * that may not yet have run.
       *
       * This can be used in extensions to when certain options that affect the
       * plugin state have updated.
       */
      emptyUpdate: (): CommandFunction => {
        return ({ tr, dispatch }) => {
          if (dispatch) {
            dispatch(tr);
          }

          return true;
        };
      },

      /**
       * Force an update of the specific
       */
      forceUpdate: (...keys: UpdatableViewProps[]): CommandFunction => {
        return ({ tr, dispatch }) => {
          if (dispatch) {
            dispatch(this.forceUpdate(tr, ...keys));
          }

          return true;
        };
      },

      /**
       * Update the attributes for the node at the specified `pos` in the
       * editor.
       */
      updateNodeAttributes: <Type extends object>(
        pos: number,
        attrs: ProsemirrorAttributes<Type>,
      ): CommandFunction => {
        return ({ tr, dispatch }) => {
          if (dispatch) {
            dispatch(tr.setNodeMarkup(pos, undefined, attrs));
          }

          return true;
        };
      },

      /**
       * Fire an update to remove the current range selection. The cursor will
       * be placed at the beginning of the current range selection.
       */
      clearRangeSelection: (): CommandFunction => {
        return ({ tr, dispatch }) => {
          const { selection } = tr;

          if (selection.empty) {
            return false;
          }

          if (dispatch) {
            dispatch(tr.setSelection(TextSelection.create(tr.doc, tr.selection.from)));
          }

          return true;
        };
      },
    };
  }

  /**
   * This plugin is here only to keep track of the `forcedUpdates` meta data.
   */
  createPlugin(): CreatePluginReturn {
    return {};
  }

  /**
   * A helper for forcing through updates in the view layer. The view layer can
   * check for the meta data of the transaction with
   * `manager.store.getForcedUpdate(tr)`. If that has a value then it should use
   * the unique symbol to update the key.
   */
  private readonly forceUpdate = (tr: Transaction, ...keys: UpdatableViewProps[]): Transaction => {
    this.setMeta(tr, ...keys);
    return tr;
  };

  /**
   * Checks if the transaction has meta data which requires a forced update.
   * This can be used for updating:
   *
   * - `nodeViews`
   * - `editable` status of the editor
   * - `attributes` - for the top level node
   */
  private readonly getForcedUpdates = (tr: Transaction): ForcedUpdateMeta => {
    return this.getMeta(tr);
  };

  private getMeta(tr: Transaction): ForcedUpdateMeta {
    return tr.getMeta(this.pluginKey) ?? [];
  }

  private setMeta(tr: Transaction, ...keys: UpdatableViewProps[]) {
    const meta = this.getMeta(tr);
    tr.setMeta(this.pluginKey, uniqueArray([...meta, ...keys]));
  }

  /**
   * Add the commands fro the provided `commands` property to the `chained` and
   * `unchained` objects.
   */
  private addCommands(parameter: AddCommandsParameter) {
    const { chained, commands, names, unchained } = parameter;

    for (const [name, command] of entries(commands)) {
      // Command names must be unique so this
      throwIfNameNotUnique({ name, set: names, code: ErrorConstant.DUPLICATE_COMMAND_NAMES });

      invariant(!forbiddenNames.has(name), {
        code: ErrorConstant.DUPLICATE_COMMAND_NAMES,
        message: 'The command name you chose is forbidden.',
      });

      unchained[name] = {
        command: this.unchainedFactory({ command }),
        isEnabled: this.unchainedFactory({ command, shouldDispatch: false }),
      };

      chained[name] = this.chainedFactory({ command, chained });
    }
  }

  /**
   * Create an unchained command method.
   */
  private unchainedFactory(parameter: UnchainedFactoryParameter) {
    return (...args: unknown[]) => {
      const { shouldDispatch = true, command } = parameter;
      const { view } = this.store;
      const { state } = view;

      let dispatch: DispatchFunction | undefined;

      if (shouldDispatch) {
        dispatch = view.dispatch;
      }

      return command(...args)({ state, dispatch, view, tr: this.transaction });
    };
  }

  /**
   * Create a chained command method.
   */
  private chainedFactory(parameter: ChainedFactoryParameter) {
    return (...spread: unknown[]) => {
      const { chained, command } = parameter;
      const { view } = this.store;
      const { state } = view;

      /**
       * This function is used in place of the `view.dispatch` method which is
       * passed through to all commands.
       *
       * It is responsible for checking that the transaction which was
       * dispatched is the same as the shared transaction which makes chainable
       * commands possible.
       */
      const dispatch: DispatchFunction = (transaction) => {
        // Throw an error if the transaction being dispatched is not the same as the currently stored transaction.
        invariant(transaction === this.transaction, {
          message:
            'Chaining currently only supports `CommandFunction` methods which do not use the `state.tr` property. Instead you should use the provided `tr` property.',
        });
      };

      command(...spread)({ state, dispatch, view, tr: this.transaction });

      return chained;
    };
  }

  /**
   * Get the chainable commands.
   *
   * @deprecated
   */
  private readonly getChain = <
    ExtensionUnion extends AnyExtension = AnyExtension
  >(): ChainedFromExtensions<CommandsExtension | ExtensionUnion> => {
    const chain = this.store.getStoreKey('chain');
    invariant(chain, { code: ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE });

    return chain as ChainedFromExtensions<CommandsExtension | ExtensionUnion>;
  };

  /**
   * Get the non-chainable commands.
   *
   * @deprecated
   */
  private readonly getCommands = <
    ExtensionUnion extends AnyExtension = AnyExtension
  >(): CommandsFromExtensions<CommandsExtension | ExtensionUnion> => {
    const commands = this.store.getStoreKey('commands');
    invariant(commands, { code: ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE });

    return commands as CommandsFromExtensions<CommandsExtension | ExtensionUnion>;
  };
}

/**
 * Provides the list of Prosemirror EditorView props that should be updated/
 */
export type ForcedUpdateMeta = UpdatableViewProps[];
export type UpdatableViewProps = 'attributes' | 'editable' | 'nodeViews';

interface AddCommandsParameter {
  /** The currently amassed commands to mutate with new commands. */
  chained: Record<string, any> & ChainedCommandRunParameter;

  /**
   * The currently amassed unchained commands to mutate with new commands.
   */
  unchained: Record<string, { command: AnyFunction; isEnabled: AnyFunction }>;

  /**
   * The untransformed commands which need to be added to the extension.
   */
  commands: ExtensionCommandReturn;

  /**
   * The names of the commands amassed. This allows for a uniqueness test.
   */
  names: Set<string>;
}

interface UnchainedFactoryParameter {
  /**
   * All the commands.
   */
  command: ExtensionCommandFunction;

  /**
   * When false the dispatch is not provided (making this an `isEnabled` check).
   *
   * @default true
   */
  shouldDispatch?: boolean;
}

interface ChainedFactoryParameter {
  /**
   * All the commands.
   */
  command: ExtensionCommandFunction;

  /**
   * All the chained commands
   */
  chained: Record<string, any>;
}

/**
 * The names that are forbidden from being used as a command name.
 */
const forbiddenNames = new Set(['run', 'chain']);

declare global {
  namespace Remirror {
    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * Enables the use of custom commands created by extensions which extend
       * the functionality of your editor in an expressive way.
       *
       * @remarks
       *
       * Commands are synchronous and immediately dispatched. This means that
       * they can be used to create menu items when the functionality you need
       * is already available by the commands.
       *
       * ```ts
       * if (commands.toggleBold.isEnabled()) {
       *   commands.toggleBold();
       * }
       * ```
       */
      commands: CommandsFromCombined<Combined>;

      /**
       * Chainable commands for composing functionality together in quaint and
       * beautiful ways
       *
       * @remarks
       *
       * You can use this property to create expressive and complex commands
       * that build up the transaction until it can be run.
       *
       * The way chainable commands work is by adding multiple steps to a shared
       * transaction which is then dispatched when the `run` command is called.
       * This requires making sure that commands within your code use the `tr`
       * that is provided rather than the `state.tr` property. `state.tr`
       * creates a new transaction which is not shared by the other steps in a
       * chainable command.
       *
       * The aim is to make as many commands as possible chainable as explained
       * [here](https://github.com/remirror/remirror/issues/418#issuecomment-666922209).
       *
       * There are certain commands that can't be made chainable.
       *
       * - undo
       * - redo
       *
       * ```ts
       * chain
       *   .toggleBold()
       *   .insertText('Hi')
       *   .setSelection('all')
       *   .run();
       * ```
       *
       * The `run()` method ends the chain and dispatches the command.
       */
      chain: ChainedFromCombined<Combined>;

      /**
       * Check for a forced update in the transaction. This pulls the meta data
       * from the transaction and if it is true then it was a forced update.
       *
       * ```ts
       * const forcedUpdates = this.manager.store.getForcedUpdates(tr);
       *
       * if (forcedUpdates) {
       *   // React updates when the state is updated.
       *   setState({ key: Symbol() })
       * }
       * ```
       */
      getForcedUpdates: (tr: Transaction) => UpdatableViewProps[];
    }

    interface ExtensionCreatorMethods {
      /**
       * `ExtensionCommands`
       *
       * This pseudo property makes it easier to infer Generic types of this
       * class.
       * @private
       */
      ['~C']: this['createCommands'] extends AnyFunction
        ? ReturnType<this['createCommands']>
        : EmptyShape;

      /**
       * Create and register commands for that can be called within the editor.
       *
       * These are typically used to create menu's actions and as a direct
       * response to user actions.
       *
       * @remarks
       *
       * The `createCommands` method should return an object with each key being
       * unique within the editor. To ensure that this is the case it is
       * recommended that the keys of the command are namespaced with the name
       * of the extension.
       *
       * ```ts
       * import { ExtensionFactory } from '@remirror/core';
       *
       * const MyExtension = ExtensionFactory.plain({
       *   name: 'myExtension',
       *   version: '1.0.0',
       *   createCommands() {
       *     return {
       *       haveFun() {
       *         return ({ state, dispatch }) => {
       *           if (dispatch) {
       *             dispatch(tr.insertText(...));
       *           }
       *
       *           return true; // True return signifies that this command is enabled.
       *         }
       *       },
       *     }
       *   }
       * })
       * ```
       *
       * The actions available in this case would be `undoHistory` and
       * `redoHistory`. It is unlikely that any other extension would override
       * these commands.
       *
       * Another benefit of commands is that they are picked up by typescript
       * and can provide code completion for consumers of the extension.
       *
       * @param parameter - schema parameter with type included
       */
      createCommands?(): ExtensionCommandReturn;
    }

    interface ExtensionStore {
      /**
       * Updates the meta information of a transaction to cause that transaction
       * to force through an update.
       */
      forceUpdate: (tr: Transaction, ...keys: UpdatableViewProps[]) => Transaction;

      /**
       * Get the shared transaction for all commands in the editor.
       *
       * This transaction makes chainable commands possible.
       */
      getTransaction: () => Transaction;

      /**
       * A property containing all the available commands in the editor.
       *
       * This should only be accessed after the `onView` lifecycle method
       * otherwise it will throw an error. If you want to use it in the
       * `createCommands` function then make sure it is used within the returned
       * function scope and not in the outer scope.
       */
      commands: CommandsFromExtensions<CommandsExtension | AnyExtension>;

      /** @deprecated Use `this.store.commands` instead. */
      getCommands: <ExtensionUnion extends AnyExtension = AnyExtension>() => CommandsFromExtensions<
        CommandsExtension | ExtensionUnion
      >;

      /**
       * A method that returns an object with all the chainable commands
       * available to be run.
       *
       * @remarks
       *
       * Each chainable command mutates the states transaction so after running
       * all your commands. you should dispatch the desired transaction.
       *
       * This should only be called when the view has been initialized (i.e.)
       * within the `createCommands` method calls.
       *
       * ```ts
       * import { ExtensionFactory } from '@remirror/core';
       *
       * const MyExtension = ExtensionFactory.plain({
       *   name: 'myExtension',
       *   version: '1.0.0',
       *   createCommands: ({ commands }) => {
       *     // This will throw since it can only be called within the returned methods.
       *     const c = commands(); // ❌
       *
       *     return {
       *       // This is good 😋
       *       haveFun() {
       *         return ({ state, dispatch }) => commands().insertText('fun!'); ✅
       *       },
       *     }
       *   }
       * })
       * ```
       *
       * This should only be accessed after the `onView` lifecycle method
       * otherwise it will throw an error.
       */
      chain: ChainedFromExtensions<Value<BuiltinCommands> | AnyExtension>;

      /** @deprecated Use `this.store.chain` instead. */
      getChain: <ExtensionUnion extends AnyExtension = AnyExtension>() => ChainedFromExtensions<
        Value<BuiltinCommands> | ExtensionUnion
      >;
    }

    /**
     * This interface is used to automatically add commands to the available
     * defaults. By extending this extension in the global `Remirror` namespace
     * the key is ignored but the value is used to form the union type in the
     * `getChain` and `getCommands` methods.
     *
     * This is useful for extensions being able to reuse the work of other
     * extension.
     */
    interface BuiltinCommands {
      commands: CommandsExtension;
    }
  }
}
