import { ExtensionPriority } from '@remirror/core-constants';
import { entries, object } from '@remirror/core-helpers';
import { CustomHandler, KeyBindings, ProsemirrorPlugin } from '@remirror/core-types';
import {
  convertCommand,
  mergeKeyBindings,
  mergeProsemirrorKeyBindings,
} from '@remirror/core-utils';
import {
  baseKeymap,
  chainCommands as pmChainCommands,
  selectParentNode,
} from '@remirror/pm/commands';
import { undoInputRule } from '@remirror/pm/inputrules';
import { keymap } from '@remirror/pm/keymap';

import { extensionDecorator } from '../decorators';
import { PlainExtension } from '../extension';
import { AddCustomHandler } from '../extension/base-class';
import { OnSetOptionsParameter } from '../types';

export interface KeymapOptions {
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
 * This extension allows others extension to use the `createKeymaps` method.
 *
 * @remarks
 *
 * Keymaps are the way of controlling how the editor responds to a
 * keypress and different key combinations.
 *
 * Without this extension most of the shortcuts and behaviors we have come to
 * expect from text editors would not be provided.
 *
 * @builtin
 */
@extensionDecorator<KeymapOptions>({
  defaultPriority: ExtensionPriority.Low,
  defaultOptions: {
    undoInputRuleOnBackspace: true,
    selectParentNodeOnEscape: false,
    excludeBaseKeymap: false,
  },
  customHandlerKeys: ['keymap'],
})
export class KeymapExtension extends PlainExtension<KeymapOptions> {
  get name() {
    return 'keymap' as const;
  }

  /**
   * The base keybinding which will be generated from the provided properties.
   */
  private baseKeyBindings: KeyBindings = object();

  /**
   * The custom keybindings added
   */
  private extraKeyBindings: KeyBindings[] = [];

  private keymap!: ProsemirrorPlugin;

  /**
   * This adds the `createKeymap` method functionality to all extensions.
   */
  onCreate() {
    this.store.setExtensionStore('rebuildKeymap', this.rebuildKeymap);
    this.loopExtensions();
    this.store.addPlugins(this.keymap);
  }

  /**
   * Updates the stored keymap plugin on this extension.
   */
  private loopExtensions() {
    const extensionKeymaps: KeyBindings[] = [];

    for (const extension of this.store.extensions) {
      // Ignore this extension when.
      if (
        // The user doesn't want any keymaps in the editor.
        this.store.managerSettings.exclude?.keymap ||
        // The extension doesn't have the `createKeymap` method.
        !extension.createKeymap ||
        // The extension was configured to ignore the keymap.
        extension.options.exclude?.keymap
      ) {
        continue;
      }

      extensionKeymaps.push(extension.createKeymap());
    }

    const mappedCommands = mergeProsemirrorKeyBindings(extensionKeymaps);
    this.keymap = keymap(mappedCommands);
  }

  /**
   * The method for rebuilding all the extension keymaps.
   *
   * 1. Rebuild keymaps.
   * 2. Replace the old keymap plugin.
   * 3. Update the plugins used in the state (triggers an editor update).
   */
  private readonly rebuildKeymap = () => {
    const previousKeymap = this.keymap;

    this.loopExtensions();
    this.store.replacePlugin(previousKeymap, this.keymap);
    this.store.reconfigureStatePlugins();
  };

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
  protected onAddCustomHandler: AddCustomHandler<KeymapOptions> = ({ keymap }) => {
    if (!keymap) {
      return;
    }

    this.extraKeyBindings = [...this.extraKeyBindings, keymap];
    this.store.rebuildKeymap?.();

    return () => {
      this.extraKeyBindings = this.extraKeyBindings.filter((binding) => binding !== keymap);
      this.store.rebuildKeymap?.();
    };
  };

  /**
   * Handle changes in the dynamic properties.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<KeymapOptions>) {
    const { changes } = parameter;
    let shouldReconfigureBindings = false;

    if (
      changes.excludeBaseKeymap.changed ||
      changes.selectParentNodeOnEscape.changed ||
      changes.undoInputRuleOnBackspace.changed
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
        this.baseKeyBindings[key] = convertCommand(value);
      }
    }

    // Automatically remove the input rule when the option is set to true.
    if (undoInputRuleOnBackspace) {
      this.baseKeyBindings.Backspace = convertCommand(
        pmChainCommands(undoInputRule, baseKeymap.Backspace),
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

    interface ExtensionStore {
      /**
       * When called this will run through every `createKeymap` method on every
       * extension to recreate the keyboard bindings.
       *
       * @remarks
       *
       * Under the hood it updates the plugin which is used to insert the
       * keybindings into the editor. This causes the state to be updated and
       * will cause a rerender in your ui framework.
       *
       * **NOTE** - This will not update keybinding for extensions that implement
       * their own keybinding functionality (e.g. any plugin using Suggestions)
       */
      rebuildKeymap: () => void;
    }

    interface ExtensionCreatorMethods {
      /**
       * Add keymap bindings for this extension.
       *
       * @param parameter - schema parameter with type included
       */
      createKeymap?(): KeyBindings;
    }
  }
}
