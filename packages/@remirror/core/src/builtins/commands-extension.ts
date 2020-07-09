import { ErrorConstant, ExtensionPriority } from '@remirror/core-constants';
import { entries, invariant, object, uniqueArray } from '@remirror/core-helpers';
import {
  AnyFunction,
  CommandFunction,
  DispatchFunction,
  EmptyShape,
  FromToParameter,
  ProsemirrorAttributes,
  Transaction,
} from '@remirror/core-types';

import {
  AnyExtension,
  ChainedCommandRunParameter,
  ChainedFromExtensions,
  CommandsFromExtensions,
  CreateLifecycleMethod,
  PlainExtension,
  ViewLifecycleMethod,
} from '../extension';
import { throwIfNameNotUnique } from '../helpers';
import { AnyCombinedUnion, ChainedFromCombined, CommandsFromCombined } from '../preset';
import {
  CommandShape,
  CreatePluginReturn,
  ExtensionCommandFunction,
  ExtensionCommandReturn,
  StateUpdateLifecycleMethod,
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
export class CommandsExtension extends PlainExtension {
  static readonly defaultPriority = ExtensionPriority.Highest;

  get name() {
    return 'commands' as const;
  }

  /**
   * The current transaction which allows for making commands chainable.
   */
  get transaction(): Transaction {
    const state = this.store.getState();

    if (!this.#transaction || !this.#transaction.before.eq(state.doc)) {
      this.#transaction = state.tr;
    }

    return this.#transaction;
  }

  #transaction?: Transaction;

  onCreate: CreateLifecycleMethod = () => {
    const { setExtensionStore, setStoreKey } = this.store;

    // Add the commands to the extension store
    setExtensionStore('getCommands', this.getCommands);
    setExtensionStore('getChain', this.getChain);

    // Support forced updates.
    setExtensionStore('forceUpdate', this.forceUpdate);
    setStoreKey('getForcedUpdates', this.getForcedUpdates);

    // Enable retrieval of the current transaction.
    setExtensionStore('getTransaction', () => this.transaction);
  };

  onView: ViewLifecycleMethod = (extensions, view) => {
    const commands: Record<string, CommandShape> = object();
    const names = new Set<string>();
    const chained: Record<string, any> & ChainedCommandRunParameter = object();
    const unchained: Record<
      string,
      { command: AnyFunction; isEnabled: AnyFunction; name: string }
    > = object();

    for (const extension of extensions) {
      if (!extension.createCommands) {
        continue;
      }

      const extensionCommands = extension.createCommands();

      for (const [name, command] of entries(extensionCommands)) {
        throwIfNameNotUnique({ name, set: names, code: ErrorConstant.DUPLICATE_COMMAND_NAMES });
        invariant(!forbiddenNames.has(name), {
          code: ErrorConstant.DUPLICATE_COMMAND_NAMES,
          message: 'The command name you chose is forbidden.',
        });

        unchained[name] = {
          name: extension.name,
          command: this.unchainedFactory({ command }),
          isEnabled: this.unchainedFactory({ command, shouldDispatch: false }),
        };

        chained[name] = this.chainedFactory({ command, chained });
      }
    }

    const { setStoreKey } = this.store;

    for (const [commandName, { command, isEnabled }] of entries(unchained)) {
      commands[commandName] = command as CommandShape;
      commands[commandName].isEnabled = isEnabled;
    }

    chained.run = () => view.dispatch(this.transaction);

    setStoreKey('commands', commands);
    setStoreKey('chain', chained as any);
  };

  /**
   * Update the cached transaction whenever the state is updated.
   */
  onStateUpdate: StateUpdateLifecycleMethod = ({ state }) => {
    this.#transaction = state.tr;
  };

  /**
   * Create the default commands available to all extensions.
   */
  createCommands = () => {
    return {
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
       * Insert text into the dom at the current location.
       */
      insertText(text: string): CommandFunction {
        return ({ tr, dispatch }) => {
          if (dispatch) {
            dispatch(tr.insertText(text));
          }

          return true;
        };
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
       * Update the attributes for the node at the specified `pos` in the editor.
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
    };
  };

  /**
   * This plugin is here only to keep track of the forced updates meta data.
   */
  createPlugin = (): CreatePluginReturn => {
    return {};
  };

  /**
   * A helper for forcing through updates in the view layer. The view layer can
   * check for the meta data of the transaction with `manager.store.getForcedUpdate(tr)`. If that has a value then it should use the unique symbol to update the key.
   */
  private readonly forceUpdate = (tr: Transaction, ...keys: UpdatableViewProps[]): Transaction => {
    this.setMeta(tr, ...keys);
    return tr;
  };

  /**
   * Checks if the codebase has requested for the transaction to cause a force update.
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

        // TODO make this be configurable?
        view.focus();
      }

      return command(...args)({ state, dispatch, view, tr: this.transaction });
    };
  }

  /**
   * Get the chainable commands.
   */
  private readonly getChain = <
    ExtensionUnion extends AnyExtension = AnyExtension
  >(): ChainedFromExtensions<CommandsExtension | ExtensionUnion> => {
    const chain = this.store.getStoreKey('chain');
    invariant(chain, { code: ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE });

    return chain as ChainedFromExtensions<CommandsExtension | ExtensionUnion>;
  };

  /**
   * Get the chainable commands.
   */
  private readonly getCommands = <
    ExtensionUnion extends AnyExtension = AnyExtension
  >(): CommandsFromExtensions<CommandsExtension | ExtensionUnion> => {
    const commands = this.store.getStoreKey('commands');
    invariant(commands, { code: ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE });

    return commands as CommandsFromExtensions<CommandsExtension | ExtensionUnion>;
  };

  /**
   * Create a chained command method.
   */
  private chainedFactory(parameter: ChainedFactoryParameter) {
    return (...spread: unknown[]) => {
      const { chained, command } = parameter;
      const { view } = this.store;
      const { state } = view;

      /** Dispatch should do nothing here except check transaction */
      const dispatch: DispatchFunction = (transaction) => {
        invariant(transaction === this.transaction, {
          message:
            'Chaining currently only supports `CommandFunction` methods which do not use the `state.tr` property. Instead you should use the provided `tr` property.',
        });
      };

      command(...spread)({ state, dispatch, view, tr: this.transaction });

      return chained;
    };
  }
}

/**
 * Provides the list of Prosemirror EditorView props that should be updated/
 */
export type ForcedUpdateMeta = UpdatableViewProps[];
export type UpdatableViewProps = 'attributes' | 'editable' | 'nodeViews';

interface UnchainedFactoryParameter {
  /**
   * All the commands.
   */
  command: ExtensionCommandFunction;

  /**
   * When false the dispatch is not provided (making this an `isEnabled` check).
   *
   * @defaultValue true
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
       * Enables the use of custom commands created by the extensions for
       * extending the functionality of your editor in an expressive way.
       *
       * @remarks
       *
       * There are two ways of using these commands.
       *
       * ### Single Time Usage
       *
       * The command is immediately dispatched. This can be used to create menu
       * items when the functionality you need is already available by the
       * commands.
       *
       * ```ts
       * if (commands.toggleBold.isEnabled()) {
       *   commands.toggleBold();
       * }
       * ```
       *
       * ### Chainable composition.
       *
       * The `chain` property of the commands object provides composition of
       * command through `.` (dot) chaining.
       *
       * ```ts
       * commands
       *   .chain
       *   .toggleBold()
       *   .insertText('Hello')
       *   .setSelection('start')
       *   .custom((transaction) => transaction)
       *   .run();
       * ```
       *
       * The `run()` method ends the chain and dispatches the accumulated
       * transaction.
       *
       */
      commands: CommandsFromCombined<Combined>;

      /**
       * Chainable commands for composing functionality together in quaint and
       * beautiful ways...
       *
       * @remarks
       *
       * You can use this property to create expressive and complex commands
       * that build up the transaction until it can be run.
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
       *   createCommands: () => {
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
      createCommands?: () => ExtensionCommandReturn;

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
    }

    interface ExtensionStore {
      /**
       * Updates the meta information of a transaction to cause that transaction
       * to force through an update.
       */
      forceUpdate: (tr: Transaction, ...keys: UpdatableViewProps[]) => Transaction;

      /**
       * Get the current transaction.
       *
       * This transaction makes chainable commands possible.
       */
      getTransaction: () => Transaction;

      /**
       * A method to return the editor's available commands.
       */
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
       */
      getChain: <ExtensionUnion extends AnyExtension = AnyExtension>() => ChainedFromExtensions<
        CommandsExtension | ExtensionUnion
      >;
    }
  }
}
