import { Extension } from '@remirror/core';
import { BaseExtensionOptions, KeyboardBindings } from '@remirror/core-types';
import { baseKeymap, chainCommands, selectParentNode } from 'prosemirror-commands';
import { undoInputRule } from 'prosemirror-inputrules';

export interface BaseKeymapExtensionOptions extends BaseExtensionOptions {
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
}

export const defaultBaseKeymapExtensionOptions: BaseKeymapExtensionOptions = {
  undoInputRuleOnBackspace: true,
  selectParentNodeOnEscape: false,
};

/**
 * Provides the expected default key mappings to the editor.
 *
 * @remarks
 *
 * Without this extension most of the shortcuts and behaviours we have come to
 * expected from text editors would not be provided.
 *
 * @builtin
 */
export class BaseKeymapExtension extends Extension<BaseKeymapExtensionOptions> {
  get name() {
    return 'baseKeymap' as const;
  }

  get defaultOptions() {
    return defaultBaseKeymapExtensionOptions;
  }

  /**
   * Injects the baseKeymap into the editor.
   */
  public keys() {
    const { selectParentNodeOnEscape, undoInputRuleOnBackspace } = this.options;
    const backspaceRule: KeyboardBindings = undoInputRuleOnBackspace
      ? { Backspace: chainCommands(undoInputRule, baseKeymap.Backspace) }
      : {};
    const escapeRule: KeyboardBindings = selectParentNodeOnEscape ? { Escape: selectParentNode } : {};

    return { ...baseKeymap, ...backspaceRule, ...escapeRule };
  }
}
