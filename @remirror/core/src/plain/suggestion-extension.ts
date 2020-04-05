import { suggest, Suggester } from 'prosemirror-suggest';

import { ExtensionPriority } from '@remirror/core-constants';
import { isArray } from '@remirror/core-helpers';

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
 */
const CoreSuggestionExtension = ExtensionFactory.plain({
  name: 'suggestion',
  defaultPriority: ExtensionPriority.Low,

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize: ({ getParameter, addPlugins, managerSettings }) => {
    const suggestions: Suggester[] = [];

    return {
      forEachExtension: (extension) => {
        if (
          // Manager settings excluded this from running
          managerSettings.exclude?.suggestions ||
          // Method doesn't exist
          !extension.parameter.createSuggestions ||
          // Extension settings exclude it from running
          extension.settings.exclude.suggestions
        ) {
          return;
        }

        const parameter = getParameter(extension);
        const suggester = extension.parameter.createSuggestions(parameter, extension);

        suggestions.push(...(isArray(suggester) ? suggester : [suggester]));
      },

      afterExtensionLoop: () => {
        addPlugins(suggest(...suggestions));
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to exclude the suggestions plugin configuration for the extension.
       *
       * @defaultValue `undefined`
       */
      suggestions?: boolean;
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
       * Create suggestions which respond to character key combinations within the
       * editor instance.
       *
       * @remarks
       *
       * Suggestions are a very powerful way of building up the editors
       * functionality. They can support `@` mentions, `#` tagging, `/` special
       * command keys which trigger an actions menu and much more.
       */
      createSuggestions?: (
        parameter: ManagerTypeParameter<ProsemirrorType>,
        extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>,
      ) => Suggester[] | Suggester;
    }
  }
}

export { CoreSuggestionExtension };
