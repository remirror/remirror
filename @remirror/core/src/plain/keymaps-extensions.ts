import mapObject from 'map-obj';
import {
  baseKeymap,
  chainCommands as pmChainCommands,
  selectParentNode,
} from 'prosemirror-commands';
import { undoInputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';

import { ExtensionPriority } from '@remirror/core-constants';
import { hasOwnProperty, isFunction, object } from '@remirror/core-helpers';
import {
  KeyBindingCommandFunction,
  KeyBindings,
  ProsemirrorCommandFunction,
} from '@remirror/core-types';
import { chainKeyBindingCommands, convertCommand } from '@remirror/core-utils';

import { Extension, ExtensionFactory } from '../extension';
import {
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ManagerParameter,
  ManagerTypeParameter,
} from '../types';

interface KeymapExtensionOptions {
  /**
   * Determines whether a backspace after an input rule has been applied undoes the input rule.
   *
   * @defaultValue `true`
   */
  undoInputRuleOnBackspace?: boolean;

  /**
   * Determines whether the escape key selects the current node.
   *
   * @defaultValue `false`
   */
  selectParentNodeOnEscape?: boolean;

  /**
   * Extra key mappings to be added to the default keymap.
   *
   * @remarks
   *
   * This allows for you to add extra key mappings which will be checked before the default keymaps, if they
   * return false then the default keymaps are still checked.
   *
   * No key mappings are removed in this process.
   *
   * ```ts
   * const extension = BaseKeymapExtension.create({ keymap: {
   *   Enter({ state, dispatch }) {
   *     //... Logic
   *     return true;
   *   },
   * }});
   * ```
   */
  keymap?: KeyBindings | ((params: ManagerParameter) => KeyBindings);

  /**
   * When true will exclude the default prosemirror keymap.
   *
   * @remarks
   *
   * You might want to set this to true if you want to fully customise the
   * keyboard mappings for your editor. Otherwise it is advisable to leave it unchanged.
   *
   * @default `false`
   */
  excludeBaseKeymap?: boolean;
}

/**
 * This extension allows others extension to use the `createKeymaps` method.
 * Keymaps are the way of controlling how the editor responds to a
 * keypress and different key combinations.
 */
const KeymapExtension = ExtensionFactory.typed<KeymapExtensionOptions>().plain({
  name: 'keymap',
  defaultPriority: ExtensionPriority.Low,
  defaultSettings: {
    undoInputRuleOnBackspace: true,
    selectParentNodeOnEscape: false,
    excludeBaseKeymap: false,
    keymap: {},
  },
  /**
   * This adds the `createKeymap` method functionality to all extensions.
   */
  onInitialize: ({ getParameter, addPlugins, managerSettings }) => {
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

        extensionKeymaps.push(extension.parameter.createKeymap(getParameter(extension), extension));
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

  /**
   * Use the default keymap available via
   */
  createKeymap: (parameter, extension) => {
    const {
      selectParentNodeOnEscape,
      undoInputRuleOnBackspace,
      keymap,
      excludeBaseKeymap,
    } = extension.settings;

    let base: KeyBindings = {};
    let backspaceRule: KeyBindings = {};
    let escapeRule: KeyBindings = {};

    // Only add the base keymap if it is **NOT** excluded.
    if (!excludeBaseKeymap) {
      base = mapObject(baseKeymap, (key, value) => [key as string, convertCommand(value)]);
    }

    // Automatically remove the input rule when the option is set to true.
    if (undoInputRuleOnBackspace) {
      backspaceRule = {
        Backspace: convertCommand(pmChainCommands(undoInputRule, baseKeymap.Backspace)),
      };
    }

    // Allow escape to select the parent node when set to true.
    if (selectParentNodeOnEscape) {
      escapeRule = { Escape: convertCommand(selectParentNode) };
    }

    const mappedKeys: KeyBindings = {
      ...base,
      ...backspaceRule,
      ...escapeRule,
    };

    const keyBindings = isFunction(keymap) ? keymap(parameter) : keymap;

    for (const key in keyBindings) {
      if (!hasOwnProperty(keymap, key)) {
        continue;
      }

      const oldCmd = mappedKeys[key];
      const newCmd = keyBindings[key];

      mappedKeys[key] = oldCmd ? chainKeyBindingCommands(newCmd, oldCmd) : newCmd;
    }

    return mappedKeys;
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
        parameter: ManagerTypeParameter<ProsemirrorType>,
        extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>,
      ) => KeyBindings;
    }
  }
}

export type { KeymapExtensionOptions };
export { KeymapExtension };
