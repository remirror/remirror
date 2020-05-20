import { ExtensionPriority } from '@remirror/core-constants';
import { Shape } from '@remirror/core-types';
import { InputRule, inputRules } from '@remirror/pm/inputrules';

import { InitializeLifecycleMethod, PlainExtension } from '../extension';

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
export class InputRulesExtension extends PlainExtension {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public readonly name = 'inputRules' as const;
  public readonly defaultPriority = ExtensionPriority.High as const;

  /**
   * Ensure that all ssr transformers are run.
   */
  public onInitialize: InitializeLifecycleMethod = (parameter) => {
    const { addPlugins, managerSettings } = parameter;
    const rules: InputRule[] = [];

    return {
      forEachExtension: (extension) => {
        if (
          // managerSettings excluded this from running
          managerSettings.exclude?.inputRules ||
          // Method doesn't exist
          !extension.createInputRules ||
          // Extension settings exclude it
          extension.settings.exclude.inputRules
        ) {
          return;
        }

        rules.push(...extension.createInputRules());
      },

      afterExtensionLoop: () => {
        addPlugins(inputRules({ rules }));
      },
    };
  };
}

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

    interface ExtensionCreatorMethods<Settings extends Shape = {}, Properties extends Shape = {}> {
      /**
       * Register input rules which are activated if the regex matches as a user is
       * typing.
       *
       * @param parameter - schema parameter with type included
       */
      createInputRules?: () => InputRule[];
    }
  }
}
