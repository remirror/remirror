import { ExtensionPriority } from '@remirror/core-constants';
import { KeyBindings, ProsemirrorPlugin } from '@remirror/core-types';
import { mergeProsemirrorKeyBindings } from '@remirror/core-utils';
import { keymap } from '@remirror/pm/keymap';

import { CreateLifecycleMethod, PlainExtension } from '../extension';

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
export class KeymapExtension extends PlainExtension {
  public static readonly defaultPriority = ExtensionPriority.Low;

  get name() {
    return 'keymap' as const;
  }

  private keymap!: ProsemirrorPlugin;

  /**
   * This adds the `createKeymap` method functionality to all extensions.
   */
  public onCreate: CreateLifecycleMethod = () => {
    this.store.setExtensionStore('rebuildKeymap', this.rebuildKeymap);
    this.loopExtensions();
    this.store.addPlugins(this.keymap);
  };

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
    console.log('Internal keymaps', this.keymap);
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
      createKeymap?: () => KeyBindings;
    }
  }
}
