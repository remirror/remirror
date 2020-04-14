import { ExtensionPriority } from '@remirror/core-constants';
import { ProsemirrorPlugin } from '@remirror/core-types';

import { Extension, ExtensionFactory } from '../extension';
import { ExtensionCommandReturn, ExtensionHelperReturn, ManagerTypeParameter } from '../types';

/**
 * This extension allows others extension to add the `createPasteRules` method
 * for automatically transforming pasted text which matches a certain regex
 * pattern in the dom.
 *
 * @builtin
 */
export const PasteRulesExtension = ExtensionFactory.plain({
  name: 'pasteRules',
  defaultPriority: ExtensionPriority.High,

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize({ getParameter, addPlugins, managerSettings }) {
    const pasteRules: ProsemirrorPlugin[] = [];

    return {
      forEachExtension: (extension) => {
        if (
          // managerSettings excluded this from running
          managerSettings.exclude?.pasteRules ||
          // Method doesn't exist
          !extension.parameter.createPasteRules ||
          // Extension settings exclude it
          extension.settings.exclude.pasteRules
        ) {
          return;
        }

        const parameter = getParameter(extension);
        pasteRules.push(...extension.parameter.createPasteRules(parameter, extension));
      },

      afterExtensionLoop: () => {
        addPlugins(...pasteRules);
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to exclude the extension's pasteRules
       *
       * @defaultValue `undefined`
       */
      pasteRules?: boolean;
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
       * Register paste rules for this extension.
       *
       * Paste rules are activated when text is pasted into the editor.
       *
       * @param parameter - schema parameter with type included
       */
      createPasteRules?: (
        parameter: ManagerTypeParameter<ProsemirrorType>,
        extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>,
      ) => ProsemirrorPlugin[];
    }
  }
}
