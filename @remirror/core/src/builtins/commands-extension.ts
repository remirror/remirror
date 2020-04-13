import { EditorState } from 'prosemirror-state';

import { entries, invariant, object } from '@remirror/core-helpers';
import { AnyFunction, DispatchFunction, EditorSchema, EditorView } from '@remirror/core-types';

import {
  AnyExtension,
  ChainedCommandRunParameter,
  ChainedFromExtensions,
  CommandsFromExtensions,
  Extension,
  ExtensionFactory,
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

function createExtensionCommands(
  extension: AnyExtension,
  parameter: CreateCommandsParameter<never>,
) {
  return extension.parameter.createCommands?.(parameter, extension) ?? {};
}

/**
 * The names that are forbidden
 */
const forbiddenNames = new Set(['run']);

/**
 * Generate chained and unchained commands for making changes to the editor.
 *
 * Typically actions are used to create interactive menus. For example a menu
 * can use a command to toggle bold formatting or to undo the last action.
 */
export const CommandsExtension = ExtensionFactory.plain({
  name: 'commands',

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

        const extensionCommands = createExtensionCommands(extension, commandParameter);

        for (const [name, command] of entries(extensionCommands)) {
          throwIfNameNotUnique({ name, set: names });
          invariant(!forbiddenNames.has(name), {
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
  }
}
