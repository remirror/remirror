import { ExtensionPriority } from '@remirror/core-constants';
import { ProsemirrorPlugin, Shape } from '@remirror/core-types';

import { InitializeLifecycleMethod, PlainExtension } from '../extension';

/**
 * This extension allows others extension to add the `createPasteRules` method
 * for automatically transforming pasted text which matches a certain regex
 * pattern in the dom.
 *
 * @builtin
 */
export class PasteRulesExtension extends PlainExtension {
  public readonly name = 'pasteRules' as const;
  public readonly defaultPriority = ExtensionPriority.High;

  /**
   * Ensure that all ssr transformers are run.
   */
  public onInitialize: InitializeLifecycleMethod = (parameter) => {
    const { addPlugins, managerSettings } = parameter;
    const pasteRules: ProsemirrorPlugin[] = [];

    return {
      forEachExtension: (extension) => {
        if (
          // managerSettings excluded this from running
          managerSettings.exclude?.pasteRules ||
          // Method doesn't exist
          !extension.createPasteRules ||
          // Extension settings exclude it
          extension.settings.exclude.pasteRules
        ) {
          return;
        }

        pasteRules.push(...extension.createPasteRules());
      },

      afterExtensionLoop: () => {
        addPlugins(...pasteRules);
      },
    };
  };
}

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
      Settings extends Shape = object,
      Properties extends Shape = object
    > {
      /**
       * Register paste rules for this extension.
       *
       * Paste rules are activated when text is pasted into the editor.
       *
       * @param parameter - schema parameter with type included
       */
      createPasteRules?: () => ProsemirrorPlugin[];
    }
  }
}
