import mapObject from 'map-obj';

import {
  chainKeyBindingCommands,
  convertCommand,
  ExtensionFactory,
  ExtensionPriority,
  ExtensionStore,
  hasOwnProperty,
  isFunction,
  KeyBindings,
} from '@remirror/core';
import {
  baseKeymap,
  chainCommands as pmChainCommands,
  selectParentNode,
} from '@remirror/pm/commands';
import { undoInputRule } from '@remirror/pm/inputrules';

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
  keymap?: KeyBindings | ((params: ExtensionStore) => KeyBindings);

  /**
   * When true will exclude the default prosemirror keymap.
   *
   * @remarks
   *
   * You might want to set this to true if you want to fully customise the
   * keyboard mappings for your editor. Otherwise it is advisable to leave it
   * unchanged.
   *
   * @default `false`
   */
  excludeBaseKeymap?: boolean;
}

/**
 * Provides the expected default key mappings to the editor.
 *
 * @remarks
 *
 * Without this extension most of the shortcuts and behaviors we have come to
 * expect from text editors would not be provided.
 *
 * @builtin
 */
export const BaseKeymapExtension = ExtensionFactory.typed<KeymapExtensionOptions>().plain({
  name: 'baseKeymap',
  defaultPriority: ExtensionPriority.Low,
  defaultOptions: {
    undoInputRuleOnBackspace: true,
    selectParentNodeOnEscape: false,
    excludeBaseKeymap: false,
    keymap: {},
  },

  /**
   * Use the default keymaps available via
   */
  createKeymap(parameter, extension) {
    const {
      selectParentNodeOnEscape,
      undoInputRuleOnBackspace,
      keymap,
      excludeBaseKeymap,
    } = extension.options;

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
