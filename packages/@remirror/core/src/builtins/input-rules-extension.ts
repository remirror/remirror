import { ExtensionPriority } from '@remirror/core-constants';
import { InputRule, inputRules } from '@remirror/pm/inputrules';
import { Plugin } from '@remirror/pm/state';

import { extensionDecorator } from '../decorators';
import { PlainExtension } from '../extension';

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
@extensionDecorator({ defaultPriority: ExtensionPriority.High })
export class InputRulesExtension extends PlainExtension {
  get name() {
    return 'inputRules' as const;
  }

  private inputRulesPlugin!: Plugin;

  /**
   * Ensure that all ssr transformers are run.
   */
  onCreate() {
    this.store.setExtensionStore('rebuildInputRules', this.rebuildInputRules);
    this.loopExtensions();

    this.store.addPlugins(this.inputRulesPlugin);
  }

  private loopExtensions() {
    const rules: InputRule[] = [];

    for (const extension of this.store.extensions) {
      if (
        // managerSettings excluded this from running
        this.store.managerSettings.exclude?.inputRules ||
        // Method doesn't exist
        !extension.createInputRules ||
        // Extension settings exclude it
        extension.options.exclude?.inputRules
      ) {
        continue;
      }

      rules.push(...extension.createInputRules());
    }

    this.inputRulesPlugin = inputRules({ rules });
  }

  /**
   * The method for rebuilding all the input rules.
   *
   * 1. Rebuild inputRules.
   * 2. Replace the old input rules plugin.
   * 3. Update the plugins used in the state (triggers an editor update).
   */
  private readonly rebuildInputRules = () => {
    const previousInputRules = this.inputRulesPlugin;

    this.loopExtensions();
    this.store.replacePlugin(previousInputRules, this.inputRulesPlugin);
    this.store.reconfigureStatePlugins();
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

    interface ExtensionStore {
      /**
       * When called this will run through every `createInputRules` method on every
       * extension to recreate input rules.
       *
       * @remarks
       *
       * Under the hood it updates the plugin which is used to insert the
       * input rules into the editor. This causes the state to be updated and
       * will cause a rerender in your ui framework.
       */
      rebuildInputRules: () => void;
    }

    interface ExtensionCreatorMethods {
      /**
       * Register input rules which are activated if the regex matches as a user is
       * typing.
       *
       * @param parameter - schema parameter with type included
       */
      createInputRules?(): InputRule[];
    }
  }
}
