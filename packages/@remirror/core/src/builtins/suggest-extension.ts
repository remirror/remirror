import { includes, isArray } from '@remirror/core-helpers';
import type { CustomHandler } from '@remirror/core-types';
import {
  addSuggester,
  getSuggestPluginState,
  removeSuggester,
  suggest,
  Suggester,
  SuggestState,
} from '@remirror/pm/suggest';

import { extensionDecorator } from '../decorators';
import { PlainExtension } from '../extension';
import type { AddCustomHandler } from '../extension/base-class';

export interface SuggestOptions {
  /**
   * The custom handler which enables adding `suggesters`.
   */
  suggester: CustomHandler<Suggester>;
}

/**
 * This extension allows others extension to add the `createSuggesters` method
 * for adding the prosemirror-suggest functionality to your editor.
 *
 * @remarks
 *
 * This is an example of adding custom functionality to an extension via the
 * `ExtensionParameterMethods`.
 *
 * @builtin
 */
@extensionDecorator<SuggestOptions>({ customHandlerKeys: ['suggester'] })
export class SuggestExtension extends PlainExtension<SuggestOptions> {
  get name() {
    return 'suggest' as const;
  }

  /**
   * Ensure that all ssr transformers are run.
   */
  onCreate(): void {
    const suggesters: Suggester[] = [];

    this.store.setExtensionStore('addSuggester', (suggester) =>
      addSuggester(this.store.getState(), suggester),
    );

    this.store.setExtensionStore('removeSuggester', (suggester) =>
      removeSuggester(this.store.getState(), suggester),
    );

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
  }

  onAddCustomHandler: AddCustomHandler<SuggestOptions> = ({ suggester }) => {
    if (!suggester) {
      return;
    }

    // Update the suggesters with the provided suggester. Returns the cleanup
    // method.
    return addSuggester(this.store.getState(), suggester);
  };

  createHelpers() {
    return {
      /**
       * Get the suggest plugin state.
       *
       * This may be removed at a later time.
       *
       * @experimental
       */
      getSuggestState: () => this.getState(),

      /**
       * Get some helpful methods from the SuggestPluginState.
       */
      getSuggestMethods: () => {
        const {
          addIgnored,
          clearIgnored,
          removeIgnored,
          ignoreNextExit,
          setMarkRemoved,
          findMatchAtPosition,
          findNextTextSelection,
        } = this.getState();

        return {
          addIgnored,
          clearIgnored,
          removeIgnored,
          ignoreNextExit,
          setMarkRemoved,
          findMatchAtPosition,
          findNextTextSelection,
        };
      },

      /**
       * Check to see whether the provided name is the currently active
       * suggester.
       *
       * @param name - the name of the suggester to include
       */
      isSuggesterActive: (name: string | string[]) => {
        return includes(isArray(name) ? name : [name], this.getState().match?.suggester.name);
      },
    };
  }

  private getState(): SuggestState {
    return getSuggestPluginState(this.store.getState());
  }
}

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to exclude the suggesters plugin configuration for the
       * extension.
       *
       * @default undefined
       */
      suggesters?: boolean;
    }

    interface ExtensionCreatorMethods {
      /**
       * Create suggesters which respond to an activation `char` or regex
       * pattern within the editor instance. The onChange handler provided is
       * called with the data around the matching text.
       *
       * @remarks
       *
       * Suggesters are a  powerful way of building up the editors
       * functionality. They can support `@` mentions, `#` tagging, `/` special
       * command keys which trigger action menus and much more.
       */
      createSuggesters?(): Suggester[] | Suggester;
    }

    interface AllExtensions {
      suggest: SuggestExtension;
    }

    interface ExtensionStore {
      /**
       * Add a suggester.
       */
      addSuggester(suggester: Suggester): void;

      /**
       * Remove a suggester.
       */
      removeSuggester(suggester: Suggester | string): void;
    }

    interface AllExtensions {
      suggest: SuggestExtension;
    }
  }
}
