/**
 * Primitives for building your prosemirror suggestion functionality.
 *
 * ## The problem
 *
 * You want to create a suggestion plugin for your prosemirror editor but are
 * unsure how to get started. The suggestions could be for mentions, emojis,
 * responding to a keypress with a dropdown of potential actions or anything
 * that needs to extract a query from the current editor when a matching
 * character is entered.
 *
 * ## This solution
 *
 * `prosemirror-suggest` provides the suggestion primitives you will need for
 * within your editor. It doesn't try to be magical and even with this library
 * setting up suggestions can be difficult. However, with this toolkit, you will
 * be able to build pretty much any suggestion plugin you can think of.
 *
 * ## Installation
 *
 * ```bash
 * yarn add prosemirror-suggest prosemirror-view
 *  ```
 *
 * ## Getting Started
 *
 * The configuration of prosemirror suggests is based around an object which
 * defines the suggestion behaviour. This configuration is passed the
 * `suggestion` method which adds all the suggestion plugins to the editor.
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
 * @packageDocumentation
 */

export * from './suggest-plugin';
export * from './suggest-types';
export * from './suggest-constants';
