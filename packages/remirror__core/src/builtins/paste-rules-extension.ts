import { isArray } from '@remirror/core-helpers';
import type { ProsemirrorPlugin } from '@remirror/core-types';
import { PasteRule, pasteRules } from '@remirror/pm/paste-rules';

import { PlainExtension } from '../extension';

export interface PasteRulesOptions {}

/**
 * This extension allows others extension to add the `createPasteRules` method
 * for automatically transforming pasted text which matches a certain regex
 * pattern in the dom.
 *
 * @category Builtin Extension
 */
export class PasteRulesExtension extends PlainExtension {
  get name() {
    return 'pasteRules' as const;
  }

  createExternalPlugins(): ProsemirrorPlugin[] {
    return [this.generatePasteRulesPlugin()];
  }

  private generatePasteRulesPlugin() {
    const extensionPasteRules: PasteRule[] = [];

    for (const extension of this.store.extensions) {
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

      const value = extension.createPasteRules();
      const rules = isArray(value) ? value : [value];

      extensionPasteRules.push(...rules);
    }

    return pasteRules(extensionPasteRules);
  }
}

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to exclude the extension's pasteRules
       *
       * @default undefined
       */
      pasteRules?: boolean;
    }

    interface BaseExtension {
      /**
       * Register paste rules for this extension.
       *
       * Paste rules are activated when text, images, or html is pasted into the
       * editor.
       */
      createPasteRules?(): PasteRule[] | PasteRule;
    }

    interface AllExtensions {
      pasteRules: PasteRulesExtension;
    }
  }
}
