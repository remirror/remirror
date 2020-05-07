import { ExtensionPriority } from '@remirror/core-constants';
import { invariant, object } from '@remirror/core-helpers';
import { ProsemirrorPlugin } from '@remirror/core-types';
import { PluginKey } from '@remirror/pm';

import { AnyExtension, Extension, ExtensionFactory } from '../extension';
import { AnyPreset } from '../preset';
import {
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  GetNameUnion,
  ManagerTypeParameter,
} from '../types';

/**
 * This extension allows others extension to add the `createInputRules` method
 * for automatically transforming text when a certain regex pattern is typed.
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

  onCreate({ setStoreKey }) {
    return {
      afterExtensionLoop() {
        setStoreKey('plugins', []);
      },
    };
  },

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize(parameter) {
    const { getParameter, addPlugins, setStoreKey, managerSettings } = parameter;

    const extensionPlugins: ProsemirrorPlugin[] = [];
    const stateGetters: Record<string, <State>() => State> = object();

    const getPluginState = <State>(name: string) => {
      const stateGetter = stateGetters[name];
      invariant(stateGetter, { message: 'No plugin exists for the requested extension name.' });

      return stateGetter<State>();
    };

    return {
      forEachExtension: (extension) => {
        if (
          !extension.parameter.createPlugin ||
          managerSettings.exclude?.plugins ||
          extension.settings.exclude.plugins
        ) {
          return;
        }

        const pluginParameter = { ...getParameter(extension), key: new PluginKey(extension.name) };
        const plugin = extension.parameter.createPlugin(pluginParameter, extension);

        extensionPlugins.push(plugin);
      },

      afterExtensionLoop: () => {
        setStoreKey('getPluginState', getPluginState);
        addPlugins(...extensionPlugins);
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ManagerStore<
      ExtensionUnion extends AnyExtension,
      PresetUnion extends AnyPreset<ExtensionUnion>
    > {
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
      getPluginState: <State>(name: GetNameUnion<ExtensionUnion>) => State;
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
        parameter: ManagerTypeParameter<ProsemirrorType> & { key: PluginKey },
        extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>,
      ) => ProsemirrorPlugin;
    }
  }
}
