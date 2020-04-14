import { EditorState } from 'prosemirror-state';

import { ErrorConstant } from '@remirror/core-constants';
import { entries, invariant, object } from '@remirror/core-helpers';
import { AnyFunction, DispatchFunction, EditorSchema, EditorView } from '@remirror/core-types';

import {
  AnyExtension,
  ChainedCommandRunParameter,
  ChainedFromExtensions,
  CommandsFromExtensions,
  Extension,
  ExtensionFactory,
  ExtensionFromConstructor,
} from '../extension';
import { throwIfNameNotUnique } from '../manager/manager-helpers';
import {
  AnyCommands,
  CommandMethod,
  CreateCommandsParameter,
  ExtensionCommandFunction,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
} from '../types';

interface UnchainedFactoryParameter {
  getState: () => EditorState<EditorSchema>;
  view: EditorView<EditorSchema>;
  command: ExtensionCommandFunction;
  shouldDispatch?: boolean;
}

function unchainedFactory(parameter: UnchainedFactoryParameter) {
  return (...args: unknown[]) => {
    const { shouldDispatch = true, view, command, getState } = parameter;
    let dispatch: DispatchFunction | undefined = undefined;

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
 * Create the extension commands from the passed extension.
 */
function createExtensionCommands(
  parameter: CreateCommandsParameter<never>,
  extension: AnyExtension,
) {
  return extension.parameter.createCommands?.(parameter, extension) ?? {};
}

/**
 * The names that are forbidden from being used as a command name.
 */
const forbiddenNames = new Set(['run']);

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
export const CommandsExtension = ExtensionFactory.plain({
  name: 'commands',

  onCreate(parameter) {
    return {
      beforeExtensionLoop() {
        const { setManagerMethodParameter, getStoreKey } = parameter;

        setManagerMethodParameter('commands', () => {
          const commands = getStoreKey('commands');
          invariant(commands, { code: ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE });

          return commands as any;
        });

        setManagerMethodParameter('dispatch', () => {
          const dispatch = getStoreKey('dispatch');
          invariant(dispatch, { code: ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE });

          return dispatch as any;
        });
      },
    };
  },

  onView(parameter) {
    const { getParameter } = parameter;
    const commands: AnyCommands = object();
    const unchained: Record<
      string,
      { command: AnyFunction; isEnabled: AnyFunction; name: string }
    > = object();

    const chained: Record<string, any> & ChainedCommandRunParameter = object();
    const names = new Set<string>();

    return {
      forEachExtension(extension, view) {
        if (!extension.parameter.createCommands) {
          return;
        }

        const commandParameter: CreateCommandsParameter<never> = {
          ...getParameter(extension),
          view,
          isEditable: () => view.props.editable?.(view.state) ?? false,
        };

        const { getState } = commandParameter;

        const extensionCommands = createExtensionCommands(commandParameter, extension);

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

          chained[name] = chainedFactory(command);
        }
      },
      afterExtensionLoop(view) {
        const { setStoreKey } = parameter;

        for (const [commandName, { command, isEnabled }] of entries(unchained)) {
          commands[commandName] = command as CommandMethod;
          commands[commandName].isEnabled = isEnabled;
        }

        chained.run = () => view.dispatch(view.state.tr);

        setStoreKey('dispatch', commands);
        setStoreKey('commands', chained);
      },
    };
  },

  createCommands() {
    return {};
  },
});

declare global {
  namespace Remirror {
    interface ManagerStore<ExtensionUnion extends AnyExtension = any> {
      /**
       * Single time dispatch of the commands.
       */
      dispatch: CommandsFromExtensions<ExtensionUnion>;

      /**
       * The chained commands defined within this manger.
       */
      commands: ChainedFromExtensions<ExtensionUnion>;
    }

    interface ExtensionCreatorMethods<
      Name extends string,
      Settings extends object,
      Properties extends object,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn,
      ProsemirrorType = never
    > {
      /**
       * Create and register commands for that can be called within the editor.
       *
       * These are typically used to create menu's actions and as a direct response
       * to user actions.
       *
       * @remarks
       *
       * The `createCommands` method should return an object with each key being
       * unique within the editor. To ensure that this is the case it is recommended
       * that the keys of the command are namespaced with the name of the extension.
       *
       * e.g.
       *
       * ```ts
       * class History extends Extension {
       *   name = 'history' as const;
       *
       *   commands() {
       *     return {
       *       undoHistory: COMMAND_FN,
       *       redoHistory: COMMAND_FN,
       *     }
       *   }
       * }
       * ```
       *
       * The actions available in this case would be `undoHistory` and
       * `redoHistory`. It is unlikely that any other extension would override these
       * commands.
       *
       * Another benefit of commands is that they are picked up by typescript and
       * can provide code completion for consumers of the extension.
       *
       * @param parameter - schema parameter with type included
       */
      createCommands?: (
        parameter: CreateCommandsParameter<ProsemirrorType>,
        extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>,
      ) => Commands;
    }

    interface ManagerMethodParameter<Schema extends EditorSchema = EditorSchema> {
      /**
       * A method that returns an object with all the commands available to be run.
       *
       * @remarks
       *
       * Commands are instantly run and also have an `isEnabled()` method attached
       * to them for checking if the command would day anything if run.
       *
       * This should only be called when the view has been initialized (i.e.) within
       * the `createCommands` method calls.
       *
       * ```ts
       * import { ExtensionFactory } from '@remirror/core';
       *
       * const MyExtension = ExtensionFactory.plain({
       *   name: 'myExtension',
       *   version: '1.0.0',
       *   createCommands: ({ commands }) => {
       *     // This will throw since it can only be called within the returned methods.
       *     const c = commands();
       *
       *     return {
       *       // This is good 😋
       *       haveFun() => commands().insertText('fun!');
       *     }
       *   }
       * })
       * ```
       */
      dispatch: <ExtensionUnion extends AnyExtension = AnyExtension>() => CommandsFromExtensions<
        ExtensionUnion | ExtensionFromConstructor<typeof CommandsExtension>
      >;

      /**
       * Chainable commands for composing functionality together in quaint and
       * beautiful way..
       *
       * @remarks
       *
       * This should only be called when the view has been initialized (i.e.) within
       * the `createCommands` method calls.
       *
       * ```ts
       * import { ExtensionFactory } from '@remirror/core';
       *
       * const MyExtension = ExtensionFactory.plain({
       *   name: 'myExtension',
       *   version: '1.0.0',
       *   createCommands: ({ chain }) => {
       *     // This will throw since it can only be called within the returned methods.
       *     const c = chain();
       *
       *     return {
       *       // This is good 😋
       *       haveFun() => chain().insertText('fun!').changeSelection('end').insertText('hello');
       *     }
       *   }
       * })
       * ```
       */
      commands: <ExtensionUnion extends AnyExtension = AnyExtension>() => ChainedFromExtensions<
        ExtensionUnion | ExtensionFromConstructor<typeof CommandsExtension>
      >;
    }
  }
}
