import { ExtensionPriority } from '@remirror/core-constants';
import { And } from '@remirror/core-types';
import { InputRule, inputRules } from '@remirror/pm/inputrules';

import { Extension, ExtensionFactory } from '../extension';
import { ExtensionCommandReturn, ExtensionHelperReturn, ManagerTypeParameter } from '../types';

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
export const InputRulesExtension = ExtensionFactory.plain({
  name: 'inputRules',
  defaultPriority: ExtensionPriority.High,

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize({ getParameter, addPlugins, managerSettings }) {
    const rules: InputRule[] = [];

    return {
      forEachExtension: (extension) => {
        if (
          // managerSettings excluded this from running
          managerSettings.exclude?.inputRules ||
          // Method doesn't exist
          !extension.parameter.createInputRules ||
          // Extension settings exclude it
          extension.settings.exclude.inputRules
        ) {
          return;
        }

        const parameter = getParameter(extension);
        rules.push(...extension.parameter.createInputRules(parameter));
      },

      afterExtensionLoop: () => {
        addPlugins(inputRules({ rules }));
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to use the inputRules for this particular extension.
       *
       * @defaultValue `undefined`
       */
      inputRules?: boolean;
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
       * Register input rules which are activated if the regex matches as a user is
       * typing.
       *
       * @param parameter - schema parameter with type included
       */
      createInputRules?: (
        parameter: And<
          ManagerTypeParameter<ProsemirrorType>,
          {
            /**
             * The extension which provides access to the settings and properties.
             */
            extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>;
          }
        >,
      ) => InputRule[];
    }
  }
}
