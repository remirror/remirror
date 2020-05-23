import { Except } from 'type-fest';

import { ExtensionPriority } from '@remirror/core-constants';
import { invariant, object } from '@remirror/core-helpers';
import { EditorSchema, ProsemirrorPlugin, Shape } from '@remirror/core-types';
import { getPluginState } from '@remirror/core-utils';
import { Plugin, PluginKey, PluginSpec } from '@remirror/pm/state';

import {
  AnyExtension,
  AnyExtensionConstructor,
  CreateLifecycleMethod,
  GetExtensionUnion,
  InitializeLifecycleMethod,
  PlainExtension,
} from '../extension';
import { AnyPreset } from '../preset';
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
  get name() {
    return 'plugins' as const;
  }
  public readonly defaultPriority = ExtensionPriority.Medium as const;

  // Here set the plugins keys and state getters for retrieving plugin state.
  // These methods are later used.
  public onCreate: CreateLifecycleMethod = (parameter) => {
    const { setStoreKey, setExtensionStore, getStoreKey, managerSettings } = parameter;

    const pluginKeys: Record<string, PluginKey> = object();
    const stateGetters = new Map<string | AnyExtensionConstructor, <State = unknown>() => State>();

    // Method for retrieving the plugin state by the extension name.
    const getStateByName = <State>(identifier: string | AnyExtensionConstructor) => {
      const stateGetter = stateGetters.get(identifier);
      invariant(stateGetter, { message: 'No plugin exists for the requested extension name.' });

      return stateGetter<State>();
    };

    return {
      forEachExtension(extension) {
        // Create a key for each extension that has a `createPlugin` method.
        if (
          // The extension doesn't create a plugin and can be skipped.
          !extension.createPlugin ||
          // Or the manager settings exclude plugins
          managerSettings.exclude?.plugins ||
          // The extension settings exclude plugins
          extension.settings.exclude.plugins
        ) {
          return;
        }

        const key = new PluginKey(extension.name);

        // Assign the plugin key to the extension name.
        pluginKeys[extension.name] = key;
        const getter = <State>() => getPluginState<State>(key, getStoreKey('view').state);

        extension.pluginKey = key;
        extension.getPluginState = getter;

        stateGetters.set(extension.name, getter);
        stateGetters.set(extension.constructor, getter);
      },
      afterExtensionLoop() {
        setStoreKey('plugins', []);
        setStoreKey('pluginKeys', pluginKeys);
        setStoreKey('getPluginState', getStateByName);
        setExtensionStore('getPluginState', getStateByName);
      },
    };
  };

  /**
   * Ensure that all ssr transformers are run.
   */
  public onInitialize: InitializeLifecycleMethod = (parameter) => {
    const { addPlugins, managerSettings } = parameter;

    const extensionPlugins: ProsemirrorPlugin[] = [];

    return {
      forEachExtension: (extension) => {
        // Extension doesn't create it's own plugin or use any third party
        // plugins
        const hasNoPluginCreators = !extension.createPlugin && !extension.createExternalPlugins;

        if (
          hasNoPluginCreators ||
          // the manager settings don't exclude plugins
          managerSettings.exclude?.plugins ||
          // The extension settings don't exclude plugins
          extension.settings.exclude.plugins
        ) {
          return;
        }

        // Create the custom plugin if it exists.
        if (extension.createPlugin) {
          const pluginSpec = {
            ...extension.createPlugin(),
            key: extension.pluginKey,
          };

          extensionPlugins.push(new Plugin(pluginSpec));
        }

        // Add the external plugins if they exist
        extensionPlugins.push(...(extension.createExternalPlugins?.() ?? []));
      },

      afterExtensionLoop: () => {
        addPlugins(...extensionPlugins);
      },
    };
  };
}

/**
 * An interface for creating custom plugins in your `remirror` editor.
 */
export interface CreatePluginReturn<PluginState = any>
  extends Except<PluginSpec<PluginState, EditorSchema>, 'key'> {}

declare global {
  namespace Remirror {
    interface ExtensionStore<Schema extends EditorSchema = EditorSchema> {
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
    }

    interface ManagerStore<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
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
      getPluginState: <State>(
        name: GetNameUnion<ExtensionUnion | GetExtensionUnion<PresetUnion>>,
      ) => State;

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
    }

    interface ExtensionCreatorMethods<
      Settings extends Shape = object,
      Properties extends Shape = object
    > {
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
       *   public createPlugin: (): ExtensionPluginSpec => ({
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
