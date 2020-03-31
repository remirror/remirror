import mapObject from 'map-obj';
import {
  baseKeymap,
  chainCommands as pmChainCommands,
  selectParentNode,
} from 'prosemirror-commands';
import { undoInputRule } from 'prosemirror-inputrules';

import {
  BaseExtensionSettings,
  chainKeyBindingCommands,
  convertCommand,
  Extension,
  ManagerParameter,
  hasOwnProperty,
  isFunction,
  KeyBindings,
} from '@remirror/core';

export interface BaseKeymapExtensionOptions extends BaseExtensionSettings {
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
}

export const defaultBaseKeymapExtensionOptions: BaseKeymapExtensionOptions = {
  undoInputRuleOnBackspace: true,
  selectParentNodeOnEscape: false,
  keymap: {},
};

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
export class BaseKeymapExtension extends Extension<BaseKeymapExtensionOptions> {
  /**
   * Shorthand method for creating the `BaseKeymapExtension`
   */
  public static create(options: BaseKeymapExtensionOptions) {
    return new BaseKeymapExtension(options);
  }

  get name() {
    return 'baseKeymap' as const;
  }

  get defaultOptions() {
    return defaultBaseKeymapExtensionOptions;
  }

  /**
   * Injects the baseKeymap into the editor.
   */
  public keys(parameters: ManagerParameter) {
    const { selectParentNodeOnEscape, undoInputRuleOnBackspace, keymap } = this.options;
    const backspaceRule: KeyBindings = undoInputRuleOnBackspace
      ? { Backspace: convertCommand(pmChainCommands(undoInputRule, baseKeymap.Backspace)) }
      : {};
    const escapeRule: KeyBindings = selectParentNodeOnEscape
      ? { Escape: convertCommand(selectParentNode) }
      : {};

    const mappedKeys: KeyBindings = {
      ...mapObject(baseKeymap, (key, value) => [key as string, convertCommand(value)]),
      ...backspaceRule,
      ...escapeRule,
    };

    const keyBindings = isFunction(keymap) ? keymap(parameters) : keymap;

    for (const key in keyBindings) {
      if (!hasOwnProperty(keymap, key)) {
        continue;
      }

      const oldCmd = mappedKeys[key];
      const newCmd = keyBindings[key];

      mappedKeys[key] = oldCmd ? chainKeyBindingCommands(newCmd, oldCmd) : newCmd;
    }

    return mappedKeys;
  }
}
