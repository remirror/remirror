import { ExtensionPriority, ExtensionTag } from '@remirror/core-constants';
import type { Handler, ProsemirrorPlugin } from '@remirror/core-types';
import type { ShouldSkipFunction, SkippableInputRule } from '@remirror/core-utils';
import { InputRule, inputRules } from '@remirror/pm/inputrules';

import { extension, PlainExtension } from '../extension';

export interface InputRulesOptions {
  /**
   * Handlers which can be registered to check whether an input rule should be
   * active at this time.
   *
   * The handlers are given a parameter with the current `state`, the `fullMatch`
   * and the `captureGroup` and can determine whether the input rule should
   * still be run.
   *
   * Return `true` to prevent any active input rules from being triggered.
   */
  shouldSkipInputRule?: Handler<ShouldSkipFunction>;
}

/**
 * This extension allows others extension to add the `createInputRules` method
 * for automatically transforming text when a certain regex pattern is typed.
 *
 * @remarks
 *
 * This is an example of adding custom functionality to an extension via the
 * `ExtensionParameterMethods`.
 *
 * @category Builtin Extension
 */
@extension<InputRulesOptions>({
  defaultPriority: ExtensionPriority.Default,
  handlerKeys: ['shouldSkipInputRule'],

  // Return when the value `true` is encountered.
  handlerKeyOptions: { shouldSkipInputRule: { earlyReturnValue: true } },
})
export class InputRulesExtension extends PlainExtension<InputRulesOptions> {
  get name() {
    return 'inputRules' as const;
  }

  /**
   * Add the extension store method for rebuilding all input rules.
   */
  onCreate(): void {
    this.store.setExtensionStore('rebuildInputRules', this.rebuildInputRules.bind(this));
  }

  /**
   * Add the `inputRules` plugin to the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    return [this.generateInputRulesPlugin()];
  }

  private generateInputRulesPlugin() {
    const rules: SkippableInputRule[] = [];
    const invalidMarks = this.store.markTags[ExtensionTag.ExcludeInputRules];

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

      // For each input rule returned by the extension, add a `shouldSkip`
      // property.
      for (const rule of extension.createInputRules() as SkippableInputRule[]) {
        rule.shouldSkip = this.options.shouldSkipInputRule;
        rule.invalidMarks = invalidMarks;
        rules.push(rule);
      }
    }

    return inputRules({ rules });
  }

  /**
   * The method for rebuilding all the input rules.
   *
   * 1. Rebuild inputRules.
   * 2. Replace the old input rules plugin.
   * 3. Update the plugins used in the state (triggers an editor update).
   */
  private rebuildInputRules() {
    this.store.updateExtensionPlugins(this);
  }
}

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to use the inputRules for this particular extension.
       *
       * @default undefined
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

    interface BaseExtension {
      /**
       * Register input rules which are activated if the regex matches as a user is
       * typing.
       *
       * @param parameter - schema parameter with type included
       */
      createInputRules?(): InputRule[];
    }

    interface AllExtensions {
      inputRules: InputRulesExtension;
    }
  }
}
