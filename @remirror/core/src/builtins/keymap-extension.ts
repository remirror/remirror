import { ExtensionPriority } from '@remirror/core-constants';
import { hasOwnProperty, object } from '@remirror/core-helpers';
import {
  And,
  KeyBindingCommandFunction,
  KeyBindings,
  ProsemirrorCommandFunction,
} from '@remirror/core-types';
import { chainKeyBindingCommands } from '@remirror/core-utils';
import { keymap } from '@remirror/pm/keymap';

import { Extension, ExtensionFactory } from '../extension';
import { ExtensionCommandReturn, ExtensionHelperReturn, ManagerTypeParameter } from '../types';

/**
 * This extension allows others extension to use the `createKeymaps` method.
 *
 * @remarks
 *
 * Keymaps are the way of controlling how the editor responds to a
 * keypress and different key combinations.
 *
 * @builtin
 */
export const KeymapExtension = ExtensionFactory.plain({
  name: 'keymap',
  defaultPriority: ExtensionPriority.High,
  /**
   * This adds the `createKeymap` method functionality to all extensions.
   */
  onInitialize({ getParameter, addPlugins, managerSettings }) {
    const extensionKeymaps: KeyBindings[] = [];

    return {
      forEachExtension: (extension) => {
        // Ignore this extension when.
        if (
          // The user doesn't want any keymaps in the editor.
          managerSettings.exclude?.keymap ||
          // The extension doesn't have the `createKeymap` method.
          !extension.parameter.createKeymap ||
          // The extension was configured to ignore the keymap.
          extension.settings.exclude.keymap
        ) {
          return;
        }

        extensionKeymaps.push(extension.parameter.createKeymap(getParameter(extension)));
      },
      afterExtensionLoop: () => {
        const previousCommandsMap = new Map<string, KeyBindingCommandFunction[]>();
        const mappedCommands: Record<string, ProsemirrorCommandFunction> = object();

        for (const extensionKeymap of extensionKeymaps) {
          for (const key in extensionKeymap) {
            if (!hasOwnProperty(extensionKeymap, key)) {
              continue;
            }

            const previousCommands: KeyBindingCommandFunction[] =
              previousCommandsMap.get(key) ?? [];
            const commands = [...previousCommands, extensionKeymap[key]];
            const command = chainKeyBindingCommands(...commands);
            previousCommandsMap.set(key, commands);

            mappedCommands[key] = (state, dispatch, view) => {
              return command({ state, dispatch, view, next: () => false });
            };
          }
        }

        addPlugins(keymap(mappedCommands));
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to exclude the created keymap.
       *
       * @defaultValue `undefined`
       */
      keymap?: boolean;
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
       * Add keymap bindings for this extension.
       *
       * @param parameter - schema parameter with type included
       */
      createKeymap?: (
        parameter: And<
          ManagerTypeParameter<ProsemirrorType>,
          {
            /**
             * The extension which provides access to the settings and properties.
             */
            extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>;
          }
        >,
      ) => KeyBindings;
    }
  }
}
