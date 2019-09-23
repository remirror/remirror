/**
 * Primitives for building your prosemirror suggestion functionality.
 *
 * ## The problem
 *
 * You want to create a plugin for your prosemirror editor that responds to an
 * activation character to create suggestions or options or actions for the
 * user. Doing this from scratch can be difficult.
 *
 * ## This solution
 *
 * `prosemirror-suggest` provides the suggestion primitives needed for building
 * this functionality into your editor. You might be building user mentions,
 * emoji search, an actions dropdown or anything that extracts a query from the
 * editor after the activation character(s).
 *
 * This implementation doesn't attempt to be magical. There's still a lot of
 * work that goes into setting up your configuration. However, with this
 * toolkit, you you will be building on a well-tested foundation with a
 * structured API.
 *
 * ## Installation
 *
 * `prosemirror-view` is a peer dependency of `prosemirror-suggest` and needs to
 * be installed as well.
 *
 * ```bash
 * yarn add prosemirror-suggest prosemirror-view
 *  ```
 *
 * ## Getting Started
 *
 * `prosemirror-suggest` uses configuration objects called `Suggester`'s to define the behaviour of
 * the suggestions you create. By calling the exported `suggest` method with all required
 * `Suggester`'s the functionality is added to the editor in one plugin.
 *
 * In the following example we're creating an emoji suggestion plugin that
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
 *   ignoreDecorations: true,
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
 *         throw new Error('An emoji is required when calling the emoji suggestions command');
 *       }
 *
 *       const tr = view.state.tr; const { from, end: to } = match.range;
 *       tr.insertText(emoji, from, to); view.dispatch(tr);
 *     };
 *   },
 * };
 *
 *  // Create the plugin with the above configuration. It also supports multiple plugins being added.
 * const suggestionPlugin = suggest(suggestEmojis);
 *
 *  // Include the plugin in the created editor state.
 * const state = EditorState.create({schema,
 *   plugins: [suggestionPlugin],
 * });
 * ```
 *
 * You can see this example brought to life in the `remirror` codebase under the
 * `@remirror/extension-emoji` and the `@remirror/extension-mention` packages.
 *
 * [GIF-EXAMPLE]
 *
 * @packageDocumentation
 */

export * from './suggest-plugin';
export * from './suggest-types';
export * from './suggest-constants';
export * from './suggest-predicates';
export * from './suggest-helpers';
