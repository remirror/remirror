import { ExtensionPriority } from '@remirror/core-constants';
import { invariant, isArray, object } from '@remirror/core-helpers';
import { EditorSchema, ProsemirrorPlugin, Shape } from '@remirror/core-types';
import { getPluginState } from '@remirror/core-utils';
import { Plugin, PluginKey } from '@remirror/pm/state';

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
 * This extension allows others extension to add the `createPlugin` method
 * using Prosemirror Plugins.
 *
 * @remarks
 *
 * This is an example of adding custom functionality to an extension via the
 * `ExtensionParameterMethods`.
 *
 * @builtin
 */
export class PluginsExtension extends PlainExtension {
  public readonly name = 'plugins' as const;
  public readonly defaultPriority = ExtensionPriority.Medium as const;

  // Here set the plugins keys and state getters for retrieving plugin state.
  // These methods are later used.
  public onCreate: CreateLifecycleMethod = (parameter) => {
    const { setStoreKey, setExtensionStore, getStoreKey } = parameter;

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
        // Create a key for each extension
        const key = new PluginKey(extension.name);

        // Assign the plugin key to the extension name.
        pluginKeys[extension.name] = key;
        const getter = <State>() => getPluginState<State>(key, getStoreKey('view').state);

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
    const { addPlugins, managerSettings, getStoreKey } = parameter;

    const extensionPlugins: ProsemirrorPlugin[] = [];

    return {
      forEachExtension: (extension) => {
        if (
          // Extension doesn't create any plugins
          !extension.createPlugin ||
          // the manager settings don't exclude plugins
          managerSettings.exclude?.plugins ||
          // The extension settings don't exclude plugins
          extension.settings.exclude.plugins
        ) {
          return;
        }

        const key: PluginKey = getStoreKey('pluginKeys')[extension.name];
        const plugin: Plugin | Plugin[] = extension.createPlugin(key);

        extensionPlugins.push(...(isArray(plugin) ? plugin : [plugin]));
      },

      afterExtensionLoop: () => {
        addPlugins(...extensionPlugins);
      },
    };
  };
}

declare global {
  namespace Remirror {
    interface ExtensionStore<Schema extends EditorSchema = EditorSchema> {
      /**
       * Retrieve the state for a given extension name. This will throw an error
       * if the extension doesn't exist.
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

    interface ExtensionCreatorMethods<
      Settings extends Shape = object,
      Properties extends Shape = object
    > {
      /**
       * Register a prosemirror plugin for the extension.
       *
       * @remarks
       *
       * All plugins should use the ``
       *
       * @param parameter - schema parameter with the prosemirror type included
       */
      createPlugin?: (pluginKey: PluginKey) => ProsemirrorPlugin | ProsemirrorPlugin[];
    }
  }
}
