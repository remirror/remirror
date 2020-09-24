import { ErrorConstant, ExtensionPriority, ManagerPhase } from '@remirror/core-constants';
import { invariant, isEmptyArray, object } from '@remirror/core-helpers';
import type { ProsemirrorPlugin } from '@remirror/core-types';
import { EditorState, Plugin, PluginKey } from '@remirror/pm/state';

import { extensionDecorator } from '../decorators';
import { AnyExtension, AnyExtensionConstructor, PlainExtension } from '../extension';
import type { AnyCombinedUnion, InferCombinedExtensions } from '../preset';
import type { CreatePluginReturn, GetNameUnion } from '../types';

/**
 * This extension allows others extension to add the `createPlugin` method using
 * Prosemirror Plugins.
 *
 * @remarks
 *
 * This is an example of adding custom functionality to an extension via the
 * `ExtensionParameterMethods`.
 *
 * @builtin
 */
@extensionDecorator({ defaultPriority: ExtensionPriority.Highest })
export class PluginsExtension extends PlainExtension {
  get name() {
    return 'plugins' as const;
  }

  /**
   * All plugins created by other extension as well.
   */
  #plugins: ProsemirrorPlugin[] = [];

  /**
   * The plugins added via the manager (for reference only).
   */
  #managerPlugins: ProsemirrorPlugin[] = [];

  /**
   * Store the plugin keys.
   */
  private readonly pluginKeys: Record<string, PluginKey> = object();

  /**
   * Store state getters for the extension.
   */
  private readonly stateGetters = new Map<
    string | AnyExtensionConstructor,
    <State = unknown>() => State
  >();

  /**
   * This extension is responsible for adding state to the editor.
   */
  onCreate(): void {
    const { setStoreKey, setExtensionStore } = this.store;
    this.updateExtensionStore();

    // Retrieve the plugins passed in when creating the manager.
    const { plugins = [] } = this.store.managerSettings;

    // Add the plugins which were added directly to the manager.
    this.addOrReplacePlugins(plugins, this.#managerPlugins);

    for (const extension of this.store.extensions) {
      this.extractExtensionPlugins(extension);
    }

    // Store the added plugins for future usage.
    this.#managerPlugins = plugins;

    // Here set the plugins keys and state getters for retrieving plugin state.
    // These methods are later used.
    setStoreKey('pluginKeys', this.pluginKeys);
    setStoreKey('getPluginState', this.getStateByName);
    setExtensionStore('getPluginState', this.getStateByName);
  }

  /**
   * Get all the plugins from the extension.
   */
  private extractExtensionPlugins(extension: AnyExtension) {
    const isNotPluginCreator = !extension.createPlugin && !extension.createExternalPlugins;

    if (
      isNotPluginCreator ||
      // the manager settings don't exclude plugins
      this.store.managerSettings.exclude?.plugins ||
      // The extension settings don't exclude plugins
      extension.options.exclude?.plugins
    ) {
      return;
    }

    // Create the custom plugin if it exists.
    if (extension.createPlugin) {
      const key = new PluginKey(extension.name);

      // Assign the plugin key to the extension name.
      this.pluginKeys[extension.name] = key;
      const getter = this.getPluginStateCreator(key);

      extension.pluginKey = key;
      extension.constructor.prototype.getPluginState = getter;

      this.stateGetters.set(extension.name, getter);
      this.stateGetters.set(extension.constructor, getter);

      const pluginSpec = {
        ...extension.createPlugin(),
        key,
      };
      const plugin = new Plugin(pluginSpec);

      this.addOrReplacePlugins([plugin], extension.plugin ? [extension.plugin] : undefined);
      extension.plugin = plugin;
    }

    if (extension.createExternalPlugins) {
      const externalPlugins = extension.createExternalPlugins();

      this.addOrReplacePlugins(externalPlugins, extension.externalPlugins);
      extension.externalPlugins = externalPlugins;
    }
  }

  private readonly getPluginStateCreator = (key: PluginKey) => <State>(
    state?: EditorState,
  ): State => {
    return key.getState(state ?? this.store.getState());
  };

  /**
   * Add or replace a plugin.
   */
  private addOrReplacePlugins(plugins: Plugin[], previous?: Plugin[]) {
    // This is the first time plugins are being added.
    if (!previous || isEmptyArray(previous)) {
      this.#plugins = [...this.#plugins, ...plugins];
      return;
    }

    // The number of plugins and previous plugins is different.
    if (plugins.length !== previous.length) {
      // Remove previous plugins and add the new plugins to the end.
      this.#plugins = [...this.#plugins.filter((plugin) => !previous.includes(plugin)), ...plugins];
      return;
    }

    // The length of plugins is identical, therefore a replacement is possible.

    const pluginMap = new Map<Plugin, Plugin>();

    for (const [index, plugin] of Object.entries(plugins)) {
      pluginMap.set(previous[Number.parseInt(index, 10)], plugin);
    }

    this.#plugins = this.#plugins.map((plugin) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return previous.includes(plugin) ? pluginMap.get(plugin)! : plugin;
    });
  }

  // Method for retrieving the plugin state by the extension name.
  private readonly getStateByName = <State>(identifier: string | AnyExtensionConstructor) => {
    const stateGetter = this.stateGetters.get(identifier);
    invariant(stateGetter, { message: 'No plugin exists for the requested extension name.' });

    return stateGetter<State>();
  };

  /**
   * Add the plugin specific properties and methods to the manager and extension store.
   */
  private updateExtensionStore() {
    const { setStoreKey, setExtensionStore } = this.store;
    // Set the list of plugins on the manager store.
    setStoreKey('plugins', []);

    // Allow adding, replacing and removing plugins by other extensions.
    setExtensionStore('addPlugins', this.addPlugins);
    setExtensionStore('replacePlugin', this.replacePlugin);
    setExtensionStore('addOrReplacePlugins', this.addOrReplacePlugins);
    setExtensionStore('updateExtensionPlugins', this.updateExtensionPlugins);
    setExtensionStore('reconfigureStatePlugins', this.reconfigureStatePlugins);
  }

  /**
   * Adds a plugin to the list of plugins.
   */
  private readonly addPlugins = (...plugins: ProsemirrorPlugin[]) => {
    this.#plugins = [...this.#plugins, ...plugins];

    this.store.setStoreKey('plugins', this.#plugins);
  };

  /**
   * Replace a plugin in the state.
   *
   * Remember to update the state to see any changes.
   */
  private readonly replacePlugin = (
    original: ProsemirrorPlugin,
    replacement: ProsemirrorPlugin,
  ) => {
    this.#plugins = this.#plugins.map((plugin) => (plugin === original ? replacement : plugin));
    this.store.setStoreKey('plugins', this.#plugins);
  };

  /**
   * Reruns the `createPlugin` and `createExternalPlugins` methods of the
   * provided extension.
   *
   * For the update to take effect you will need to call `reconfigureStatePlugins`
   *
   * ```ts
   * // From within an extension
   * this.store.updateExtensionPlugins(this);
   * this.store.reconfigureStatePlugins();
   * ```
   */
  private readonly updateExtensionPlugins = (extension: AnyExtension) => {
    this.extractExtensionPlugins(extension);
    this.store.setStoreKey('plugins', this.#plugins);
  };

  /**
   * Applies the store plugins to the state. If any have changed then it will be updated.
   */
  private readonly reconfigureStatePlugins = () => {
    invariant(this.store.phase >= ManagerPhase.EditorView, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        '`reconfigureStatePlugins` should only be called after the view has been added to the manager.',
    });

    const { view, updateState } = this.store;
    const newState = view.state.reconfigure({ plugins: this.#plugins });

    updateState(newState);
  };
}

declare global {
  namespace Remirror {
    interface ManagerSettings {
      /**
       * Add custom plugins to the manager while creating it.
       *
       * Plugins created via the manager are given priority over all extension
       * based plugins. There's scope for adding a priority based model for
       * inserting plugins, but it seems like a sane default until that's
       * available.
       */
      plugins?: ProsemirrorPlugin[];
    }

    interface ExtensionStore {
      /**
       * Retrieve the state for any given extension name. This will throw an
       * error if the extension identified by that name doesn't implement the
       * `createPlugin` method.
       *
       * @param name - the name of the extension
       *
       * @remarks
       *
       * ```ts
       * const pluginState = getPluginState(extension.name);
       * ```
       */
      getPluginState: <State>(name: string) => State;

      /**
       * Replace a plugin in the manager store.
       *
       * Remember to also update the state with your plugin changes.
       *
       * ```ts
       * this.store.reconfigureStatePlugins();
       * ```
       */
      replacePlugin: (original: ProsemirrorPlugin, replacement: ProsemirrorPlugin) => void;

      /**
       * Applies the store plugins to the state. If any have changed then it will be updated.
       */
      reconfigureStatePlugins: () => void;

      /**
       * Use this to push custom plugins to the store which are added to the plugin
       * list after the #plugins.
       *
       * ```ts
       * this.store.addPlugins(...plugins);
       * ```
       */
      addPlugins: (...plugins: ProsemirrorPlugin[]) => void;

      /**
       * Replace the previous plugins with new plugins.
       *
       * ```ts
       * this.store.addOrReplacePlugins(this.createExternalPlugins(), this.externalPlugins);
       * ```
       */
      addOrReplacePlugins: (
        plugins: ProsemirrorPlugin[],
        previousPlugins?: ProsemirrorPlugin[],
      ) => void;

      /**
       * Reruns the `createPlugin` and `createExternalPlugins` methods of the
       * provided extension.
       *
       * For the update to take effect you will need to call `reconfigureStatePlugins`
       *
       * ```ts
       * // From within an extension
       * this.store.updateExtensionPlugins(this);
       * this.store.reconfigureStatePlugins();
       * ```
       */
      updateExtensionPlugins: (extension: AnyExtension) => void;
    }

    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * All of the plugins combined together from all sources
       */
      plugins: ProsemirrorPlugin[];

      /**
       * Retrieve the state for a given extension name. This will throw an error
       * if the extension doesn't exist.
       *
       * @param name - the name of the extension
       */
      getPluginState: <State>(name: GetNameUnion<InferCombinedExtensions<Combined>>) => State;

      /**
       * All the plugin keys available to be used by plugins.
       */
      pluginKeys: Record<string, PluginKey>;
    }

    interface ExcludeOptions {
      /**
       * Whether to exclude the extension's plugin
       *
       * @default undefined
       */
      plugins?: boolean;
    }

    interface BaseExtension {
      /**
       * The plugin key for custom plugin created by this extension. This only
       * exists when there is a valid `createPlugin` method on the extension.
       *
       * This can be used to set and retrieve metadata.
       *
       * ```ts
       * const meta = tr.getMeta(this.pluginKey);
       * ```
       */
      pluginKey: PluginKey;

      /**
       * The plugin that was created by the `createPlugin` method. This only
       * exists for extension which implement that method.
       */
      plugin: Plugin;

      /**
       * The external plugins created by the `createExternalPlugins` method.
       */
      externalPlugins: Plugin[];

      /**
       * Retrieve the state of the custom plugin for this extension. This will
       * throw an error if the extension doesn't have a valid `createPlugin`
       * method.
       *
       * @remarks
       *
       * ```ts
       * const pluginState = this.getPluginState();
       * ```
       *
       * This is only available after the initialize stage of the editor manager
       * lifecycle.
       *
       * If you would like to use it before that e.g. in the decorations prop of
       * the `createPlugin` method, you can call it with a current state which
       * will be used to retrieve the plugin state.
       */
      getPluginState: <State>(state?: EditorState) => State;
    }

    interface ExtensionCreatorMethods {
      /**
       * Create a custom plugin directly in the editor.
       *
       * @remarks
       *
       * A unique `key` is automatically applied to enable easier retrieval of
       * the plugin state.
       *
       * ```ts
       * import { CreatePluginReturn } from 'remirror/core';
       *
       * class MyExtension extends PlainExtension {
       *   get name() {
       *     return 'me' as const;
       *   }
       *
       *   createPlugin(): CreatePluginReturn {
       *     return {
       *       props: {
       *         handleKeyDown: keydownHandler({
       *           Backspace: handler,
       *           'Mod-Backspace': handler,
       *           Delete: handler,
       *           'Mod-Delete': handler,
       *           'Ctrl-h': handler,
       *           'Alt-Backspace': handler,
       *           'Ctrl-d': handler,
       *           'Ctrl-Alt-Backspace': handler,
       *           'Alt-Delete': handler,
       *           'Alt-d': handler,
       *         }),
       *         decorations: state => {
       *           const pluginState = this.getPluginState(state);
       *           pluginState.setDeleted(false);
       *           return pluginState.decorationSet;
       *         },
       *       },
       *     }
       *   }
       * }
       * ```
       */
      createPlugin?(): CreatePluginReturn;

      /**
       * Register third party plugins when this extension is placed into the
       * editor.
       *
       * @remarks
       *
       * Some plugins (like the table plugin) consume several different plugins,
       * creator method allows you to return a list of plugins you'd like to
       * support.
       */
      createExternalPlugins?(): ProsemirrorPlugin[];
    }

    interface AllExtensions {
      plugins: PluginsExtension;
    }
  }
}
