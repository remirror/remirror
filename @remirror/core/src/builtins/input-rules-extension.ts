import { ExtensionPriority } from '@remirror/core-constants';
import { Shape } from '@remirror/core-types';
import { InputRule, inputRules } from '@remirror/pm/inputrules';

import { CreateLifecycleMethod, PlainExtension } from '../extension';

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
  public static readonly defaultPriority = ExtensionPriority.High;

  get name() {
    return 'inputRules' as const;
  }

  /**
   * Ensure that all ssr transformers are run.
   */
  public onCreate: CreateLifecycleMethod = (extensions) => {
    const rules: InputRule[] = [];

    for (const extension of extensions) {
      if (
        // managerSettings excluded this from running
        this.store.managerSettings.exclude?.inputRules ||
        // Method doesn't exist
        !extension.createInputRules ||
        // Extension settings exclude it
        extension.options.exclude?.inputRules
      ) {
        break;
      }

      rules.push(...extension.createInputRules());
    }

    this.store.addPlugins(inputRules({ rules }));
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

    interface ExtensionCreatorMethods<
      Settings extends Shape = object,
      Properties extends Shape = object
    > {
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
