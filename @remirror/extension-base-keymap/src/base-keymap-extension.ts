import {
  chainKeyBindingCommands,
  convertCommand,
  DefaultExtensionSettings,
  entries,
  ExtensionPriority,
  ExtensionStore,
  isFunction,
  KeyBindingCommandFunction,
  KeyBindings,
  object,
  PlainExtension,
} from '@remirror/core';
import {
  baseKeymap,
  chainCommands as pmChainCommands,
  selectParentNode,
} from '@remirror/pm/commands';
import { undoInputRule } from '@remirror/pm/inputrules';

export interface BaseKeymapSettings {
  /**
   * Determines whether a backspace after an input rule has been applied should
   * reverse the effect of the input rule.
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
   * Extra keys that you want to support for this extension. The full binding
   * is added to the `properties`.
   *
   * This setting acts as a placeholder so the extension knows what you plan on
   * adding via `properties`.
   *
   * @defaultValue `[]`
   *
   * ```ts
   * new BaseKeymapExtension({ extraKeys: ['Ctrl-Shift-B', 'Mod-Shift-P']});
   * ```
   */
  extraKeys?: string[];

  /**
   * When a keybinding is undefined in the extension properties, this is the
   * fallback method that is used.
   *
   * @defaultValue `() => false`
   */
  defaultBindingMethod?: KeyBindingCommandFunction;

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

export interface BaseKeymapProperties {
  /**
   * The implementation for the extra keybindings added to the settings.
   *
   * @remarks
   *
   * This allows for you to add extra key mappings which will be checked before
   * the default keymaps, if they return false then the default keymaps are
   * still checked.
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
  keymap?: KeyBindings | ((parameter: ExtensionStore) => KeyBindings);
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
export class BaseKeymapExtension extends PlainExtension<BaseKeymapSettings, BaseKeymapProperties> {
  public static readonly defaultSettings: DefaultExtensionSettings<BaseKeymapSettings> = {
    undoInputRuleOnBackspace: true,
    defaultBindingMethod: () => false,
    selectParentNodeOnEscape: false,
    excludeBaseKeymap: false,
    extraKeys: [],
  };
  public static readonly defaultProperties: Required<BaseKeymapProperties> = { keymap: object() };

  public readonly name = 'baseKeymap' as const;

  public readonly defaultPriority = ExtensionPriority.Low as const;

  /**
   * Use the default keymaps available via
   */
  public createKeymap = () => {
    const { selectParentNodeOnEscape, undoInputRuleOnBackspace, excludeBaseKeymap } = this.settings;

    const keyBindings: KeyBindings = object();

    // Only add the base keymap if it is **NOT** excluded.
    if (!excludeBaseKeymap) {
      for (const [key, value] of entries(baseKeymap)) {
        keyBindings[key] = convertCommand(value);
      }
    }

    // Automatically remove the input rule when the option is set to true.
    if (undoInputRuleOnBackspace) {
      keyBindings.Backspace = convertCommand(pmChainCommands(undoInputRule, baseKeymap.Backspace));
    }

    // Allow escape to select the parent node when set to true.
    if (selectParentNodeOnEscape) {
      keyBindings.Escape = convertCommand(selectParentNode);
    }

    const extraBindings = this.buildExtraKeyBindings();

    for (const [key, newCommand] of entries(extraBindings)) {
      const oldCommand = keyBindings[key];
      keyBindings[key] = oldCommand ? chainKeyBindingCommands(newCommand, oldCommand) : newCommand;
    }

    return keyBindings;
  };

  /**
   * Dynamically create the keybindings object so that it always uses the latest
   * properties in the methods.
   */
  private buildExtraKeyBindings() {
    const keyBindings: KeyBindings = object();

    for (const key of this.settings.extraKeys) {
      keyBindings[key] = (parameter) => {
        // Get the keymap object from the properties
        const keymap = isFunction(this.properties.keymap)
          ? this.properties.keymap(this.store)
          : this.properties.keymap;

        // If the supported keys doesn't exist on the properties keymap then use
        // the default method.
        const binding: KeyBindingCommandFunction =
          keymap[key] ?? this.settings.defaultBindingMethod;

        return binding(parameter);
      };
    }

    return keyBindings;
  }
}
