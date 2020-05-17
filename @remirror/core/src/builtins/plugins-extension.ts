import { ExtensionPriority } from '@remirror/core-constants';
import { invariant, object } from '@remirror/core-helpers';
import { And, EditorSchema, ProsemirrorPlugin } from '@remirror/core-types';
import { getPluginState } from '@remirror/core-utils';
import { Plugin, PluginKey } from '@remirror/pm/state';

import {
  AnyExtension,
  AnyExtensionConstructor,
  Extension,
  ExtensionFactory,
  GetExtensionUnion,
} from '../extension';
import { AnyPreset } from '../preset';
import {
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  GetNameUnion,
  ManagerTypeParameter,
} from '../types';

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
export const PluginsExtension = ExtensionFactory.plain({
  name: 'plugins',
  defaultPriority: ExtensionPriority.Medium,

  // Here set the plugins keys and state getters for retrieving plugin state.
  // These methods are later used.
  onCreate({ setStoreKey, setManagerMethodParameter, getStoreKey }) {
    const pluginKeys: Record<string, PluginKey> = object();
    const stateGetters: Map<
      string | AnyExtensionConstructor,
      <State = unknown>() => State
    > = object();

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
        setStoreKey('getPluginState', getStateByName);
        setManagerMethodParameter('getPluginState', getStateByName);
      },
    };
  },

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize(parameter) {
    const { getParameter, addPlugins, managerSettings, getStoreKey } = parameter;

    const extensionPlugins: ProsemirrorPlugin[] = [];

    return {
      forEachExtension: (extension) => {
        if (
          // Extension doesn't create a plugin
          !extension.parameter.createPlugin ||
          // the manager settings don't exclude plugins
          managerSettings.exclude?.plugins ||
          // The extension settings don't exclude plugins
          extension.settings.exclude.plugins
        ) {
          return;
        }

        const key: PluginKey = getStoreKey('pluginKeys')[extension.name];
        const pluginParameter = {
          ...getParameter(extension, { key }),
        };
        const plugin: Plugin = extension.parameter.createPlugin(pluginParameter);

        extensionPlugins.push(plugin);
      },

      afterExtensionLoop: () => {
        addPlugins(...extensionPlugins);
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ManagerMethodParameter<Schema extends EditorSchema = EditorSchema> {
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
      Name extends string,
      Settings extends object,
      Properties extends object,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn,
      ProsemirrorType = never
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
      createPlugin?: (
        parameter: ManagerTypeParameter<ProsemirrorType> & {
          /**
           * The plugin key which should be used when creating this plugin
           */
          key: PluginKey;

          /**
           * The extension which provides access to the settings and properties.
           */
          extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>;
        },
      ) => ProsemirrorPlugin;
    }
  }
}
