import {
  AddCustomHandler,
  convertCommand,
  CustomHandler,
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  entries,
  ExtensionPriority,
  KeyBindingCommandFunction,
  KeyBindings,
  mergeKeyBindings,
  noop,
  object,
  OnSetOptionsParameter,
  PlainExtension,
  ProsemirrorCommandFunction,
} from '@remirror/core';
import {
  baseKeymap,
  chainCommands as pmChainCommands,
  selectParentNode,
} from '@remirror/pm/commands';
import { undoInputRule } from '@remirror/pm/inputrules';

export interface BaseKeymapOptions {
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
  keymap?: CustomHandler<KeyBindings>;
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
export class BaseKeymapExtension extends PlainExtension<BaseKeymapOptions> {
  static readonly defaultPriority = ExtensionPriority.Low as const;

  static readonly defaultOptions: DefaultExtensionOptions<BaseKeymapOptions> = {
    undoInputRuleOnBackspace: true,
    defaultBindingMethod: () => false,
    selectParentNodeOnEscape: false,
    excludeBaseKeymap: false,
  };

  static readonly customHandlerKeys: CustomHandlerKeyList<BaseKeymapOptions> = ['keymap'];

  get name() {
    return 'baseKeymap' as const;
  }

  /**
   * The base keybinding which will be generated from the provided properties.
   */
  private baseKeyBindings: KeyBindings = object();

  /**
   * The custom keybindings added
   */
  private extraKeyBindings: KeyBindings[] = [];

  /**
   * Create the base keymap and merge it with any custom keymaps provided by the
   * user as CustomOptions.
   */
  createKeymap = () => {
    this.createBaseKeymap();

    return this.buildKeymap();
  };

  /**
   * TODO think about the case where bindings are being disposed and then added
   * in a different position in the `extraKeyBindings` array.
   */
  protected onAddCustomHandler: AddCustomHandler<BaseKeymapOptions> = ({ keymap }) => {
    if (keymap) {
      this.extraKeyBindings = [...this.extraKeyBindings, keymap];
      this.store.rebuildKeymap?.();

      return () => {
        this.extraKeyBindings = this.extraKeyBindings.filter((binding) => binding !== keymap);
        this.store.rebuildKeymap?.();
      };
    }

    return noop;
  };

  /**
   * Handle changes in the dynamic properties.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<BaseKeymapOptions>) {
    const { changes } = parameter;
    let shouldReconfigureBindings = false;

    if (
      changes.defaultBindingMethod ||
      changes.excludeBaseKeymap ||
      changes.selectParentNodeOnEscape ||
      changes.undoInputRuleOnBackspace
    ) {
      shouldReconfigureBindings = true;
    }

    if (shouldReconfigureBindings) {
      this.store?.rebuildKeymap?.();
    }
  }

  private createBaseKeymap() {
    const { selectParentNodeOnEscape, undoInputRuleOnBackspace, excludeBaseKeymap } = this.options;

    this.baseKeyBindings = object();

    // Only add the base keymap if it is **NOT** excluded.
    if (!excludeBaseKeymap) {
      for (const [key, value] of entries(baseKeymap)) {
        this.baseKeyBindings[key] = convertCommand(value as ProsemirrorCommandFunction);
      }
    }

    // Automatically remove the input rule when the option is set to true.
    if (undoInputRuleOnBackspace) {
      this.baseKeyBindings.Backspace = convertCommand(
        pmChainCommands(undoInputRule, baseKeymap.Backspace as ProsemirrorCommandFunction),
      );
    }

    // Allow escape to select the parent node when set to true.
    if (selectParentNodeOnEscape) {
      this.baseKeyBindings.Escape = convertCommand(selectParentNode);
    }
  }

  private buildKeymap() {
    return mergeKeyBindings([...this.extraKeyBindings, this.baseKeyBindings]);
  }
}
