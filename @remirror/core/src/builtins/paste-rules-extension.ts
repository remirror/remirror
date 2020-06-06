import { ExtensionPriority } from '@remirror/core-constants';
import { ProsemirrorPlugin } from '@remirror/core-types';

import { CreateLifecycleMethod, PlainExtension } from '../extension';

/**
 * This extension allows others extension to add the `createPasteRules` method
 * for automatically transforming pasted text which matches a certain regex
 * pattern in the dom.
 *
 * @builtin
 */
export class PasteRulesExtension extends PlainExtension {
  public static readonly defaultPriority = ExtensionPriority.High;

  get name() {
    return 'pasteRules' as const;
  }

  /**
   * Ensure that all ssr transformers are run.
   */
  public onCreate: CreateLifecycleMethod = (extensions) => {
    const pasteRules: ProsemirrorPlugin[] = [];

    for (const extension of extensions) {
      {
        if (
          // managerSettings excluded this from running
          this.store.managerSettings.exclude?.pasteRules ||
          // Method doesn't exist
          !extension.createPasteRules ||
          // Extension settings exclude it
          extension.options.exclude?.pasteRules
        ) {
          continue;
        }

        pasteRules.push(...extension.createPasteRules());
      }

      // TODO rewrite so this is all one plugin
      // this.store.addPlugins(...pasteRules);
    }
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

    interface ExtensionCreatorMethods {
      /**
       * Register paste rules for this extension.
       *
       * Paste rules are activated when text is pasted into the editor.
       *
       * TODO - The paste plugin is currently switched off.
       */
      createPasteRules?: () => ProsemirrorPlugin[];
    }
  }
}
