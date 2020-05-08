import { suggest, Suggestion } from 'prosemirror-suggest';

import { ExtensionPriority } from '@remirror/core-constants';
import { isArray } from '@remirror/core-helpers';
import { And } from '@remirror/core-types';

import { Extension, ExtensionFactory } from '../extension';
import { ExtensionCommandReturn, ExtensionHelperReturn, ManagerTypeParameter } from '../types';

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
export const SuggestionsExtension = ExtensionFactory.plain({
  name: 'suggestions',
  defaultPriority: ExtensionPriority.High,

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize({ getParameter, addPlugins, managerSettings }) {
    const suggesters: Suggestion[] = [];

    return {
      forEachExtension: (extension) => {
        if (
          // Manager settings excluded this from running
          managerSettings.exclude?.suggesters ||
          // Method doesn't exist
          !extension.parameter.createSuggestions ||
          // Extension settings exclude it from running
          extension.settings.exclude.suggesters
        ) {
          return;
        }

        const parameter = getParameter(extension);
        const suggester = extension.parameter.createSuggestions(parameter);

        suggesters.push(...(isArray(suggester) ? suggester : [suggester]));
      },

      afterExtensionLoop: () => {
        addPlugins(suggest(...suggesters));
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to exclude the suggesters plugin configuration for the extension.
       *
       * @defaultValue `undefined`
       */
      suggesters?: boolean;
    }

    interface ExtensionCreatorMethods<
      Name extends string,
      Settings extends object,
      Properties extends object,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn,
      ProsemirrorType = never
    > {
      /**
       * Create suggesters which respond to character key combinations within the
       * editor instance.
       *
       * @remarks
       *
       * Suggestions are a very powerful way of building up the editors
       * functionality. They can support `@` mentions, `#` tagging, `/` special
       * command keys which trigger an actions menu and much more.
       */
      createSuggestions?: (
        parameter: And<
          ManagerTypeParameter<ProsemirrorType>,
          {
            /**
             * The extension which provides access to the settings and properties.
             */
            extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>;
          }
        >,
      ) => Suggestion[] | Suggestion;
    }
  }
}
