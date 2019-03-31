import { Extension, KeyboardBindings } from '@remirror/core';
import { baseKeymap, chainCommands, selectParentNode } from 'prosemirror-commands';
import { undoInputRule } from 'prosemirror-inputrules';

export interface BaseKeymapOptions {
  /**
   * Determines whether a backspace after an input rule has been applied undoes the input rule.
   *
   * @default true
   */
  undoInputRuleOnBackspace?: boolean;

  /**
   * Determines whether the escape key selects the current node.
   *
   * @default false
   */
  selectParentNodeOnEscape?: boolean;
}

export class BaseKeymap extends Extension<BaseKeymapOptions> {
  get name() {
    return 'baseKeymap' as const;
  }

  get defaultOptions() {
    return {
      undoInputRuleOnBackspace: true,
      selectParentNodeOnEscape: false,
    };
  }

  public keys() {
    const { selectParentNodeOnEscape, undoInputRuleOnBackspace } = this.options;
    const backspaceRule: KeyboardBindings = undoInputRuleOnBackspace
      ? { Backspace: chainCommands(undoInputRule, baseKeymap.Backspace) }
      : {};
    const escapeRule: KeyboardBindings = selectParentNodeOnEscape ? { Escape: selectParentNode } : {};

    return { ...baseKeymap, ...backspaceRule, ...escapeRule };
  }
}
