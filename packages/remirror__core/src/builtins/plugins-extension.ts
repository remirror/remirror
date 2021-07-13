import { ErrorConstant, ExtensionPriority, ManagerPhase } from '@remirror/core-constants';
import { assertGet, invariant, isEmptyArray, object } from '@remirror/core-helpers';
import type { Handler, ProsemirrorPlugin } from '@remirror/core-types';
import { EditorState, Plugin, PluginKey } from '@remirror/pm/state';

import {
  AnyExtension,
  AnyExtensionConstructor,
  extension,
  GetNameUnion,
  isExtension,
  isExtensionConstructor,
  PlainExtension,
} from '../extension';
import type {
  AppendLifecycleProps,
  ApplyStateLifecycleProps,
  CreateExtensionPlugin,
} from '../types';

export interface PluginsOptions {
  /**
   * The event handler which can be used by hooks to listen to state updates
   * when they are being applied to the editor.
   */
  applyState?: Handler<(props: ApplyStateLifecycleProps) => void>;

  /**
   * The event handler which can be used by hooks to listen to intercept updates
   * to the transaction.
   */
  appendTransaction?: Handler<(props: AppendLifecycleProps) => void>;
}

/**
 * This extension allows others extension to add the `createPlugin` method using
 * Prosemirror Plugins.
 *
 * @remarks
 *
 * This is an example of adding custom functionality to an extension via the
 * `ExtensionParameterMethods`.
 *
 * @category Builtin Extension
 */
@extension<PluginsOptions>({
  defaultPriority: ExtensionPriority.Highest,
  handlerKeys: ['applyState', 'appendTransaction'],
})
export class PluginsExtension extends PlainExtension<PluginsOptions> {
  get name() {
    return 'plugins' as const;
  }

  /**
   * All plugins created by other extension as well.
   */
  private plugins: ProsemirrorPlugin[] = [];

  /**
   * The plugins added via the manager (for reference only).
   */
  private managerPlugins: ProsemirrorPlugin[] = [];

  /**
   * Called when the state is is being applied after an update.
   */
  private readonly applyStateHandlers: Array<(props: ApplyStateLifecycleProps) => void> = [];

  /**
   * Called when the state is first initialized.
   */
  private readonly initStateHandlers: Array<(state: EditorState) => void> = [];

  /**
   * Handlers for the `onAppendTransaction` lifecycle method.
   */
  private readonly appendTransactionHandlers: Array<(props: AppendLifecycleProps) => void> = [];

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
    const { setStoreKey, setExtensionStore, managerSettings, extensions } = this.store;
    this.updateExtensionStore();

    // Retrieve the plugins passed in when creating the manager.
    const { plugins = [] } = managerSettings;

    // Add the plugins which were added directly to the manager.
    this.updatePlugins(plugins, this.managerPlugins);

    for (const extension of extensions) {
      if (extension.onApplyState) {
        this.applyStateHandlers.push(extension.onApplyState.bind(extension));
      }

      if (extension.onInitState) {
        this.initStateHandlers.push(extension.onInitState.bind(extension));
      }

      if (extension.onAppendTransaction) {
        this.appendTransactionHandlers.push(extension.onAppendTransaction.bind(extension));
      }

      this.extractExtensionPlugins(extension);
    }

    // Store the added plugins for future usage.
    this.managerPlugins = plugins;

    // Add all the extracted plugins to the manager store. From the manager
    // store they are automatically added to the state for use in the editor.
    this.store.setStoreKey('plugins', this.plugins);

    // Here set the plugins keys and state getters for retrieving plugin state.
    // These methods are later used.
    setStoreKey('pluginKeys', this.pluginKeys);
    setStoreKey('getPluginState', this.getStateByName);
    setExtensionStore('getPluginState', this.getStateByName);
  }

  /**
   * Create a plugin which adds the [[`onInitState`]] and [[`onApplyState`]]
   * lifecycle methods.
   */
  createPlugin(): CreateExtensionPlugin<void> {
    return {
      appendTransaction: (transactions, previousState, state) => {
        const tr = state.tr;
        const props = { previousState, tr, transactions, state };

        for (const handler of this.appendTransactionHandlers) {
          handler(props);
        }

        this.options.appendTransaction(props);

        // Return the transaction if it has been amended in any way.
        return tr.docChanged || tr.steps.length > 0 || tr.selectionSet || tr.storedMarksSet
          ? tr
          : undefined;
      },
      state: {
        init: (_, state) => {
          for (const handler of this.initStateHandlers) {
            handler(state);
          }
        },
        apply: (tr, _, previousState, state) => {
          const props = { previousState, state, tr };

          for (const handler of this.applyStateHandlers) {
            handler(props);
          }

          this.options.applyState(props);
        },
      },
    };
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

      this.updatePlugins([plugin], extension.plugin ? [extension.plugin] : undefined);
      extension.plugin = plugin;
    }

    if (extension.createExternalPlugins) {
      const externalPlugins = extension.createExternalPlugins();

      this.updatePlugins(externalPlugins, extension.externalPlugins);
      extension.externalPlugins = externalPlugins;
    }
  }

  private readonly getPluginStateCreator =
    (key: PluginKey) =>
    <State>(state?: EditorState): State => {
      return key.getState(state ?? this.store.getState());
    };

  /**
   * Add or replace a plugin.
   */
  private updatePlugins(plugins: Plugin[], previous?: Plugin[]) {
    // This is the first time plugins are being added.
    if (!previous || isEmptyArray(previous)) {
      this.plugins = [...this.plugins, ...plugins];
      return;
    }

    // The number of plugins and previous plugins is different.
    if (plugins.length !== previous.length) {
      // Remove previous plugins and add the new plugins to the end.
      this.plugins = [...this.plugins.filter((plugin) => !previous.includes(plugin)), ...plugins];
      return;
    }

    // The length of plugins is identical, therefore a replacement is possible.

    const pluginMap = new Map<Plugin, Plugin>();

    for (const [index, plugin] of plugins.entries()) {
      pluginMap.set(assertGet(previous, index), plugin);
    }

    this.plugins = this.plugins.map((plugin) => {
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
   * Add the plugin specific properties and methods to the manager and extension
   * store.
   */
  private updateExtensionStore() {
    const { setExtensionStore } = this.store;

    // Allow adding, replacing and removing plugins by other extensions.
    setExtensionStore('updatePlugins', this.updatePlugins.bind(this));
    setExtensionStore('dispatchPluginUpdate', this.dispatchPluginUpdate.bind(this));
    setExtensionStore('updateExtensionPlugins', this.updateExtensionPlugins.bind(this));
  }

  /**
   * Reruns the `createPlugin` and `createExternalPlugins` methods of the
   * provided extension.
   *
   * ```ts
   * // From within an extension
   * this.store.updateExtensionPlugins(this);
   * ```
   */
  private updateExtensionPlugins(value: AnyExtension | AnyExtensionConstructor | string) {
    const extension = isExtension(value)
      ? value
      : isExtensionConstructor(value)
      ? this.store.manager.getExtension(value)
      : this.store.extensions.find((extension) => extension.name === value);

    invariant(extension, {
      code: ErrorConstant.INVALID_MANAGER_EXTENSION,
      message: `The extension ${value} does not exist within the editor.`,
    });

    this.extractExtensionPlugins(extension);
    this.store.setStoreKey('plugins', this.plugins);

    // Dispatch the plugin updates to the editor.
    this.dispatchPluginUpdate();
  }

  /**
   * Applies the store plugins to the state. If any have changed then it will be
   * updated.
   */
  private dispatchPluginUpdate() {
    invariant(this.store.phase >= ManagerPhase.EditorView, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        '`dispatchPluginUpdate` should only be called after the view has been added to the manager.',
    });

    const { view, updateState } = this.store;
    const newState = view.state.reconfigure({ plugins: this.plugins });

    updateState(newState);
  }
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
      getPluginState<State>(name: string): State;

      /**
       * Add the new plugins. If previous plugins are provided then also remove
       * the previous plugins.
       *
       * ```ts
       * this.store.updatePlugins(this.createExternalPlugins(), this.externalPlugins);
       * ```
       *
       * @param plugins - the plugins to add
       * @param previousPlugins - the plugins to remove
       */
      updatePlugins(plugins: ProsemirrorPlugin[], previousPlugins?: ProsemirrorPlugin[]): void;

      /**
       * Reruns the `createPlugin` and `createExternalPlugins` methods of the
       * provided extension.
       *
       * This will also automatically update the state with the newly generated
       * plugins by dispatching an update.
       *
       * ```ts
       * // From within an extension
       * this.store.updateExtensionPlugins(this);
       * this.store.dispatchPluginUpdate();
       * ```
       *
       * @param extension - the extension instance, constructor or name.
       */
      updateExtensionPlugins(extension: AnyExtension | AnyExtensionConstructor | string): void;

      /**
       * Applies the store plugins to the state. If any have changed then it
       * will be updated.
       */
      dispatchPluginUpdate(): void;
    }

    interface ManagerStore<Extension extends AnyExtension> {
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
      getPluginState: <State>(name: GetNameUnion<Extension>) => State;

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
       *
       * Please note that when using this in the decorations callback it is
       * advisable to pass in the `state` argument in case the callback is
       * called before the framework, or the view have been initialized.
       */
      getPluginState: <State>(state?: EditorState) => State;

      /**
       * Create a custom plugin directly in the editor.
       *
       * @remarks
       *
       * A unique `key` is automatically applied to enable easier retrieval of
       * the plugin state.
       *
       * ```ts
       * import { CreateExtensionPlugin } from 'remirror';
       *
       * class MyExtension extends PlainExtension {
       *   get name() {
       *     return 'me' as const;
       *   }
       *
       *   createPlugin(): CreateExtensionPlugin {
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
      createPlugin?(): CreateExtensionPlugin;

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
