import { InputRule, inputRules } from 'prosemirror-inputrules';

import { ExtensionPriority } from '@remirror/core-constants';

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
 */
const CoreInputRulesExtension = ExtensionFactory.plain({
  name: 'inputRules',
  defaultPriority: ExtensionPriority.Low,

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize: ({ getParameter, addPlugins }) => {
    const rules: InputRule[] = [];

    return {
      forEachExtension: (extension) => {
        if (!extension.parameter.createInputRules || extension.settings.exclude.inputRules) {
          return;
        }

        const parameter = getParameter(extension);
        rules.push(...extension.parameter.createInputRules(parameter, extension));
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
        parameter: ManagerTypeParameter<ProsemirrorType>,
        extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>,
      ) => InputRule[];
    }
  }
}

export { CoreInputRulesExtension };
