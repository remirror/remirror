import { isArray } from '@remirror/core-helpers';
import { CustomHandler } from '@remirror/core-types';
import { addSuggester, suggest, Suggester } from '@remirror/pm/suggest';

import { extensionDecorator } from '../decorators';
import { PlainExtension } from '../extension';
import { AddCustomHandler } from '../extension/base-class';

export interface SuggesterOptions {
  /**
   * The ability to add a suggester
   */
  suggester: CustomHandler<Suggester>;
}

/**
 * This extension allows others extension to add the `createSuggestion` method
 * for adding the prosemirror-suggest functionality to your editor.
 *
 * @remarks
 *
 * This is an example of adding custom functionality to an extension via the
 * `ExtensionParameterMethods`.
 *
 * @builtin
 */
@extensionDecorator<SuggesterOptions>({ customHandlerKeys: ['suggester'] })
export class SuggesterExtension extends PlainExtension<SuggesterOptions> {
  get name() {
    return 'suggestions' as const;
  }

  /**
   * Ensure that all ssr transformers are run.
   */
  onCreate = () => {
    const suggesters: Suggester[] = [];

    for (const extension of this.store.extensions) {
      if (
        // Manager settings excluded this from running
        this.store.managerSettings.exclude?.suggesters ||
        // Method doesn't exist
        !extension.createSuggesters ||
        // Extension settings exclude it from running
        extension.options.exclude?.suggesters
      ) {
        continue;
      }

      const suggester = extension.createSuggesters();
      const suggesterList = isArray(suggester) ? suggester : [suggester];
      suggesters.push(...suggesterList);
    }

    this.store.addPlugins(suggest(...suggesters));
  };

  onAddCustomHandler: AddCustomHandler<SuggesterOptions> = ({ suggester }) => {
    if (!suggester) {
      return;
    }

    // Update the suggesters with the provided suggester. Returns the cleanup
    // method.
    return addSuggester(this.store.getState(), suggester);
  };
}

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to exclude the suggesters plugin configuration for the
       * extension.
       *
       * @defaultValue `undefined`
       */
      suggesters?: boolean;
    }

    interface ExtensionCreatorMethods {
      /**
       * Create suggesters which respond to character key combinations within
       * the editor instance.
       *
       * @remarks
       *
       * Suggesters are a  powerful way of building up the editors
       * functionality. They can support `@` mentions, `#` tagging, `/` special
       * command keys which trigger action menus and much more.
       */
      createSuggesters?(): Suggester[] | Suggester;
    }
  }
}
