import { Plugin, PluginKey } from 'prosemirror-state';

import type { EditorSchema, EditorState } from '@remirror/core-types';

import { SuggestState } from './suggest-state';
import type { Suggester } from './suggest-types';

const suggestPluginKey = new PluginKey('suggest');

/**
 * Get the state of the suggest plugin.
 *
 * @param state - the editor state.
 */
export function getSuggestPluginState(state: EditorState): SuggestState {
  return suggestPluginKey.getState(state);
}

/**
 * Add a new suggester or replace it if the name already exists in the existing
 * configuration.
 *
 * Will return a function for disposing of the added suggester.
 */
export function addSuggester<Schema extends EditorSchema = any>(
  state: EditorState<Schema>,
  suggester: Suggester,
) {
  return getSuggestPluginState(state).addSuggester(suggester);
}

/**
 * Remove a suggester if it exists. Pass in the name or the full suggester
 * object.
 */
export function removeSuggester<Schema extends EditorSchema = any>(
  state: EditorState<Schema>,
  suggester: Suggester | string,
) {
  return getSuggestPluginState(state).removeSuggester(suggester);
}

/**
 * This creates a suggest plugin with all the suggesters provided.
 *
 * @remarks
 *
 * In the following example we're creating an emoji suggest plugin that
 * responds to the colon character with a query and presents a list of matching
 * emojis based on the query typed so far.
 *
 * ```ts
 * import { Suggester, suggest } from 'prosemirror-suggest';
 *
 * const maxResults = 10;
 * let selectedIndex = 0;
 * let emojiList: string[] = [];
 * let showSuggestions = false;
 *
 * const suggestEmojis: Suggester = {
 *   // By default decorations are used to highlight the currently matched
 *   // suggestion in the dom.
 *   // In this example we don't need decorations (in fact they cause problems when the
 *   // emoji string replaces the query text in the dom).
 *   noDecorations: true,
 *   char: ':', // The character to match against
 *   name: 'emoji-suggestion', // a unique name
 *   appendText: '', // Text to append to the created match
 *
 *   // Keybindings are similar to prosemirror keymaps with a few extra niceties.
 *   // The key identifier can also include modifiers (e.g.) `Cmd-Space: () => false`
 *   // Return true to prevent any further keyboard handlers from running.
 *   keyBindings: {
 *     ArrowUp: () => {
 *       selectedIndex = rotateSelectionBackwards(selectedIndex, emojiList.length);
 *     },
 *     ArrowDown: () => {
 *       selectedIndex = rotateSelectionForwards(selectedIndex, emojiList.length);
 *     },
 *     Enter: ({ command }) => {
 *       if (showSuggestions) {
 *         command(emojiList[selectedIndex]);
 *       }
 *     },
 *     Esc: () => {
 *       showSuggestions = false;
 *     },
 *   },
 *
 *   onChange: params => {
 *     const query = params.query.full;
 *     emojiList = sortEmojiMatches({ query, maxResults });
 *     selectedIndex = 0;
 *     showSuggestions = true;
 *   },
 *
 *   onExit: () => {
 *     showSuggestions = false;
 *     emojiList = [];
 *     selectedIndex = 0;
 *   },
 *
 *   // Create a  function that is passed into the change, exit and keybinding handlers.
 *   // This is useful when these handlers are called in a different part of the app.
 *   createCommand: ({ match, view }) => {
 *     return (emoji,skinVariation) => {
 *       if (!emoji) {
 *         throw new Error('An emoji is required when calling the emoji suggesters command');
 *       }
 *
 *       const tr = view.state.tr; const { from, end: to } = match.range;
 *       tr.insertText(emoji, from, to); view.dispatch(tr);
 *     };
 *   },
 * };
 *
 *  // Create the plugin with the above configuration. It also supports multiple plugins being added.
 * const suggesterPlugin = suggest(suggestEmojis);
 *
 *  // Include the plugin in the created editor state.
 * const state = EditorState.create({schema,
 *   plugins: [suggesterPlugin],
 * });
 * ```
 *
 * The priority of the suggesters is the order in which they are passed into
 * this function.
 *
 * - `const plugin = suggest(two, one, three)` - Here `two` will be checked
 *   first, then `one` and then `three`.
 *
 * Only one suggester can match at any given time. The order and specificity of
 * the regex parameters help determines which suggester will be active.
 *
 * @param suggesters - a list of suggesters in the order they should be
 * evaluated.
 */
export function suggest<Schema extends EditorSchema = any>(...suggesters: Suggester[]) {
  const pluginState = SuggestState.create(suggesters);

  return new Plugin<SuggestState, Schema>({
    key: suggestPluginKey,

    // Handle the plugin view
    view: (view) => {
      return pluginState.init(view).viewHandler();
    },

    state: {
      // Initialize the state
      init: () => {
        return pluginState;
      },

      // Apply changes to the state
      apply: (tr, _, oldState, newState) => {
        return pluginState.apply({ tr, oldState, newState });
      },
    },

    props: {
      // Call the keydown hook if suggester is active.
      handleKeyDown: (_, event) => {
        return pluginState.handleKeyDown(event);
      },

      // Defer to the pluginState handler
      handleTextInput: (_, from, to, text) => {
        return pluginState.handleTextInput({ text, from, to });
      },

      // Sets up a decoration (styling options) on the currently active
      // decoration
      decorations: (state) => {
        return pluginState.decorations(state);
      },
    },
  });
}

export type { SuggestState };
