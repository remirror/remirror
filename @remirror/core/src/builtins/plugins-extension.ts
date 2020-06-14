import { Except } from 'type-fest';

import { ErrorConstant, ExtensionPriority, ManagerPhase } from '@remirror/core-constants';
import { invariant, isEmptyArray, object } from '@remirror/core-helpers';
import { EditorSchema, ProsemirrorPlugin } from '@remirror/core-types';
import { getPluginState } from '@remirror/core-utils';
import { Plugin, PluginKey, PluginSpec } from '@remirror/pm/state';

import {
  AnyExtension,
  AnyExtensionConstructor,
  CreateLifecycleMethod,
  PlainExtension,
} from '../extension';
import { AnyCombinedUnion, InferCombinedExtensions } from '../preset';
import { GetNameUnion } from '../types';

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
export class PluginsExtension extends PlainExtension {
  static readonly defaultPriority = ExtensionPriority.Highest;

  get name() {
    return 'plugins' as const;
  }

  /**
   * All plugins created by other extension as well.
   */
  #plugins: ProsemirrorPlugin[] = [];

  private readonly pluginKeys: Record<string, PluginKey> = object();

  private readonly stateGetters = new Map<
    string | AnyExtensionConstructor,
    <State = unknown>() => State
  >();

  // Here set the plugins keys and state getters for retrieving plugin state.
  // These methods are later used.
  onCreate: CreateLifecycleMethod = (extensions) => {
    const { setStoreKey, setExtensionStore } = this.store;
    this.updateExtensionStore();

    for (const extension of extensions) {
      this.extractExtensionPlugins(extension);
    }

    setStoreKey('pluginKeys', this.pluginKeys);
    setStoreKey('getPluginState', this.getStateByName);
    setExtensionStore('getPluginState', this.getStateByName);
  };

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
      const getter = <State>() => getPluginState<State>(key, this.store.getState());

      extension.pluginKey = key;
      extension.getPluginState = getter;

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
   * Ensure that all ssr transformers are run.
   */

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

    const { view } = this.store;
    const newState = view.state.reconfigure({ plugins: this.#plugins });

    view.updateState(newState);
  };
}

/**
 * An interface for creating custom plugins in your `remirror` editor.
 */
export interface CreatePluginReturn<PluginState = any>
  extends Except<PluginSpec<PluginState, EditorSchema>, 'key'> {}

declare global {
  namespace Remirror {
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
       * @defaultValue `undefined`
       */
      plugins?: boolean;
    }

    interface BaseExtension {
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
       */
      getPluginState: <State>() => State;

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
       * import { ExtensionPluginSpec } from 'remirror/core';
       *
       * class MyExtension extends PlainExtension {
       *   get name() {
       *     return 'me' as const;
       *   }
       *
       *   createPlugin: (): ExtensionPluginSpec => ({
       *     props: {
       *       handleKeyDown: keydownHandler({
       *         Backspace: handler,
       *         'Mod-Backspace': handler,
       *         Delete: handler,
       *         'Mod-Delete': handler,
       *         'Ctrl-h': handler,
       *         'Alt-Backspace': handler,
       *         'Ctrl-d': handler,
       *         'Ctrl-Alt-Backspace': handler,
       *         'Alt-Delete': handler,
       *         'Alt-d': handler,
       *       }),
       *       decorations() {
       *         pluginState.setDeleted(false);
       *         return pluginState.decorationSet;
       *       },
       *     },
       *   })
       * }
       * ```
       *
       * @param getPluginState - a function you can call within any of the
       * `CreatePluginSpec` methods to get the latest plugin state. Don't call
       * in the outer scope of the `createPlugin` function or you will get
       * errors..
       */
      createPlugin?: () => CreatePluginReturn;

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
      createExternalPlugins?: () => ProsemirrorPlugin[];
    }
  }
}
