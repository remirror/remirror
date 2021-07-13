import { includes, isArray } from '@remirror/core-helpers';
import type { CustomHandler, EditorState, ProsemirrorPlugin } from '@remirror/core-types';
import {
  addSuggester,
  getSuggestPluginState,
  removeSuggester,
  suggest,
  Suggester,
  SuggestState,
} from '@remirror/pm/suggest';

import { extension, Helper, PlainExtension } from '../extension';
import type { AddCustomHandler } from '../extension/base-class';
import { helper } from './builtin-decorators';

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
 * @category Builtin Extension
 */
@extension<SuggestOptions>({ customHandlerKeys: ['suggester'] })
export class SuggestExtension extends PlainExtension<SuggestOptions> {
  get name() {
    return 'suggest' as const;
  }

  /**
   * Create the `addSuggester` method and `removeSuggester` methods to the
   * extension store.
   *
   * This can be used by extensions to conditionally add suggestion support.
   */
  onCreate(): void {
    this.store.setExtensionStore('addSuggester', (suggester) =>
      addSuggester(this.store.getState(), suggester),
    );

    this.store.setExtensionStore('removeSuggester', (suggester) =>
      removeSuggester(this.store.getState(), suggester),
    );
  }

  /**
   * Add the `prosemirror-suggest` plugin to the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const suggesters: Suggester[] = [];

    for (const extension of this.store.extensions) {
      if (this.store.managerSettings.exclude?.suggesters) {
        // Exit the loop early when the manager is set to ignore suggesters.
        break;
      }

      if (
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

    return [suggest(...suggesters)];
  }

  /**
   * Allow additional `Suggesters` to be added to the editor. This can be used
   * by `React` to create hooks.
   */
  onAddCustomHandler: AddCustomHandler<SuggestOptions> = ({ suggester }) => {
    if (!suggester || this.store.managerSettings.exclude?.suggesters) {
      return;
    }

    // Update the suggesters with the provided suggester. Returns the cleanup
    // method.
    return addSuggester(this.store.getState(), suggester);
  };

  /**
   * Get the suggest plugin state.
   *
   * This may be removed at a later time.
   *
   * @experimental
   */
  @helper()
  getSuggestState(state?: EditorState): Helper<SuggestState> {
    return getSuggestPluginState(state ?? this.store.getState());
  }

  /**
   * Get some helpful methods from the SuggestPluginState.
   */
  @helper()
  getSuggestMethods(): Helper<
    Pick<
      SuggestState,
      | 'addIgnored'
      | 'clearIgnored'
      | 'removeIgnored'
      | 'ignoreNextExit'
      | 'setMarkRemoved'
      | 'findMatchAtPosition'
      | 'findNextTextSelection'
      | 'setLastChangeFromAppend'
    >
  > {
    const {
      addIgnored,
      clearIgnored,
      removeIgnored,
      ignoreNextExit,
      setMarkRemoved,
      findMatchAtPosition,
      findNextTextSelection,
      setLastChangeFromAppend,
    } = this.getSuggestState();

    return {
      addIgnored,
      clearIgnored,
      removeIgnored,
      ignoreNextExit,
      setMarkRemoved,
      findMatchAtPosition,
      findNextTextSelection,
      setLastChangeFromAppend,
    };
  }

  /**
   * Check to see whether the provided name is the currently active
   * suggester.
   *
   * @param name - the name of the suggester to include
   */
  @helper()
  isSuggesterActive(name: string | string[]): Helper<boolean> {
    return includes(isArray(name) ? name : [name], this.getSuggestState().match?.suggester.name);
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

    interface BaseExtension {
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
