import { ErrorConstant } from '@remirror/core-constants';
import { entries, invariant, object } from '@remirror/core-helpers';
import {
  AnyFunction,
  CommandFunction,
  DispatchFunction,
  EditorSchema,
  EditorView,
  Shape,
  Transaction,
} from '@remirror/core-types';
import { EditorState } from '@remirror/pm/state';

import {
  AnyExtension,
  ChainedCommandRunParameter,
  ChainedFromExtensions,
  CommandsFromExtensions,
  CreateLifecycleMethod,
  GetExtensionUnion,
  PlainExtension,
  ViewLifecycleMethod,
} from '../extension';
import { throwIfNameNotUnique } from '../helpers';
import { AnyPreset } from '../preset';
import {
  CommandMethod,
  CreateCommandsParameter,
  ExtensionCommandFunction,
  ExtensionCommandReturn,
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
  public readonly name = 'commands' as const;

  public createDefaultSettings() {
    return {};
  }

  public createDefaultProperties() {
    return {};
  }

  public onCreate: CreateLifecycleMethod = (parameter) => {
    return {
      beforeExtensionLoop() {
        const { setManagerMethodParameter, getStoreKey } = parameter;

        setManagerMethodParameter('getCommands', () => {
          const commands = getStoreKey('commands');
          invariant(commands, { code: ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE });

          return commands as any;
        });

        setManagerMethodParameter('getChain', () => {
          const chain = getStoreKey('chain');
          invariant(chain, { code: ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE });

          return chain as any;
        });
      },
    };
  };

  public onView: ViewLifecycleMethod = (parameter) => {
    const { getParameter } = parameter;
    const commands: any = object();
    const names = new Set<string>();
    const chained: Record<string, any> & ChainedCommandRunParameter = object();
    const unchained: Record<
      string,
      { command: AnyFunction; isEnabled: AnyFunction; name: string }
    > = object();

    return {
      forEachExtension(extension) {
        if (!extension.createCommands) {
          return;
        }

        const commandParameter: CreateCommandsParameter<never> = {
          ...getParameter(extension),
          view,
          isEditable: () => view.props.editable?.(view.state) ?? false,
        };

        const { getState } = commandParameter;

        const extensionCommands = extension.createCommands();

        for (const [name, command] of entries(extensionCommands)) {
          throwIfNameNotUnique({ name, set: names, code: ErrorConstant.DUPLICATE_COMMAND_NAMES });
          invariant(!forbiddenNames.has(name), {
            code: ErrorConstant.DUPLICATE_COMMAND_NAMES,
            message: 'The command name you chose is forbidden.',
          });

          unchained[name] = {
            name: extension.name,
            command: unchainedFactory({ command, getState, view }),
            isEnabled: unchainedFactory({ command, getState, view, shouldDispatch: false }),
          };

          chained[name] = chainedFactory({ command, getState, view, chained });
        }
      },
      afterExtensionLoop(view) {
        const { setStoreKey } = parameter;

        for (const [commandName, { command, isEnabled }] of entries(unchained)) {
          commands[commandName] = command as CommandMethod;
          commands[commandName].isEnabled = isEnabled;
        }

        chained.run = () => view.dispatch(view.state.tr);

        setStoreKey('commands', commands);
        setStoreKey('chain', chained);
      },
    };
  };

  public createCommands = () => {
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
        return ({ state, dispatch }) => {
          if (dispatch) {
            transactionUpdater(state.tr);
            dispatch(state.tr);
          }

          return true;
        };
      },
    };
  };
}

interface UnchainedFactoryParameter {
  getState: () => EditorState<EditorSchema>;
  view: EditorView<EditorSchema>;
  command: ExtensionCommandFunction;
  shouldDispatch?: boolean;
}

function unchainedFactory(parameter: UnchainedFactoryParameter) {
  return (...args: unknown[]) => {
    const { shouldDispatch = true, view, command, getState } = parameter;
    let dispatch: DispatchFunction | undefined;

    if (shouldDispatch) {
      dispatch = view.dispatch;

      // TODO make this be configurable?
      view.focus();
    }

    return command(...args)({ state: getState(), dispatch, view });
  };
}

interface ChainedFactoryParameter {
  getState: () => EditorState<EditorSchema>;
  view: EditorView<EditorSchema>;
  command: ExtensionCommandFunction;

  /** All the chained commands accumulated */
  chained: Record<string, any>;
}

function chainedFactory(parameter: ChainedFactoryParameter) {
  return (...spread: unknown[]) => {
    const { getState, chained, command, view } = parameter;
    const state = getState();

    /** Dispatch should do nothing here except check transaction */
    const dispatch: DispatchFunction = (transaction) => {
      invariant(transaction === state.tr, {
        message:
          'Chaining currently only supports methods which do not clone the transaction object.',
      });
    };

    command(...spread)({ state, dispatch, view });

    return chained;
  };
}

/**
 * The names that are forbidden from being used as a command name.
 */
const forbiddenNames = new Set(['run', 'chain']);

declare global {
  namespace Remirror {
    interface ManagerStore<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
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
       * if (commands.bold.isEnabled()) {
       *   commands.bold();
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
       *   .bold()
       *   .insertText('Hello')
       *   .setSelection('start')
       *   .custom((transaction) => transaction)
       *   .run();
       * ```
       *
       * The `run()` method ends the chain.
       *
       */
      commands: CommandsFromExtensions<ExtensionUnion | GetExtensionUnion<PresetUnion>>;

      /**
       * Chainable commands for composing functionality together in quaint and
       * beautiful ways...
       *
       * @remarks
       *
       * You can use this property to create expressive and complex commands that
       * build up the transaction until it can be run.
       *
       * ```ts
       * chain.bold().insertText('Hi').setSelection('start').run();
       * ```
       */
      chain: ChainedFromExtensions<ExtensionUnion | GetExtensionUnion<PresetUnion>>;
    }

    interface ExtensionCreatorMethods<Settings extends Shape = {}, Properties extends Shape = {}> {
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
       * This pseudo property makes it easier to infer Generic types of this class.
       * @private
       */
      [`~C`]: this['createCommands'] extends AnyFunction ? ReturnType<this['createCommands']> : {};
    }

    interface ManagerMethodParameter<Schema extends EditorSchema = EditorSchema> {
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
      getChain: <ExtensionUnion extends AnyExtension = any>() => ChainedFromExtensions<
        CommandsExtension | ExtensionUnion
      >;
    }
  }
}
