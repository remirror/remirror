import { ExtensionPriority } from '@remirror/core-constants';
import { KeyBindings, ProsemirrorPlugin, Shape } from '@remirror/core-types';
import { mergeProsemirrorKeyBindings } from '@remirror/core-utils';
import { keymap } from '@remirror/pm/keymap';

import { AnyExtension, CreateLifecycleMethod, PlainExtension } from '../extension';

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
  private readonly extensions: AnyExtension[] = [];

  /**
   * This adds the `createKeymap` method functionality to all extensions.
   */
  public onCreate: CreateLifecycleMethod = (extensions) => {
    const extensionKeymaps: KeyBindings[] = [];
    this.store.setExtensionStore('rebuildKeymap', this.rebuildKeymap);

    for (const extension of extensions) {
      this.forEachExtension({ extension, extensionKeymaps });
    }

    this.afterExtensionLoop(extensionKeymaps);
    this.store.addPlugins(this.keymap);
  };

  /**
   * Mutates the extensionKeymaps list.
   */
  private forEachExtension({ extension, extensionKeymaps }: ForEachExtensionParameter) {
    // Ignore this extension when.
    if (
      // The user doesn't want any keymaps in the editor.
      this.store.managerSettings.exclude?.keymap ||
      // The extension doesn't have the `createKeymap` method.
      !extension.createKeymap ||
      // The extension was configured to ignore the keymap.
      extension.options.exclude?.keymap
    ) {
      return;
    }

    this.extensions.push(extension);
    extensionKeymaps.push(extension.createKeymap());
  }

  /**
   * Creates the keymap and stores it on this instance.
   */
  private afterExtensionLoop(extensionKeymaps: KeyBindings[]) {
    const mappedCommands = mergeProsemirrorKeyBindings(extensionKeymaps);
    this.keymap = keymap(mappedCommands);
  }

  /**
   * The method for rebuilding tll the extension keymaps.
   */
  private readonly rebuildKeymap = () => {
    const extensionKeymaps: KeyBindings[] = [];

    for (const extension of this.extensions) {
      this.forEachExtension({ extension, extensionKeymaps });
    }

    this.afterExtensionLoop(extensionKeymaps);
  };
}

interface ForEachExtensionParameter {
  extension: AnyExtension;
  extensionKeymaps: KeyBindings[];
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
       * **NOTE** - This will not update keybinding for extension that implement
       * their own keybinding functionality (e.g. any plugin using Suggestions)
       *
       * Availability: **runtime**
       */
      rebuildKeymap: () => void;
    }

    interface ExtensionCreatorMethods<
      Settings extends Shape = object,
      Properties extends Shape = object
    > {
      /**
       * Add keymap bindings for this extension.
       *
       * @param parameter - schema parameter with type included
       */
      createKeymap?: () => KeyBindings;
    }
  }
}
