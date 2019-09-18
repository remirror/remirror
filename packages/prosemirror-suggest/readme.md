# prosemirror-suggest

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/prosemirror-suggest.svg?style=for-the-badge)](https://bundlephobia.com/result?p=prosemirror-suggest) [![npm](https://img.shields.io/npm/dm/prosemirror-suggest.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/prosemirror-suggest) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=prosemirror-suggest&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/prosemirror-suggest/package.json) [![NPM](https://img.shields.io/npm/l/prosemirror-suggest.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/prosemirror-suggest.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aprosemirror-suggest) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/prosemirror-suggest.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3Aprosemirror-suggest)

`prosemirror-suggest` allows you to use suggestion primitives within your editor. It is not magical in anyway. Setting up suggestions can be difficult. What this package hopes to provide is all the tools to do this for yourself and support simple or complex solutions.

## Installation

```bash
yarn add prosemirror-suggest prosemirror-view
```

## Getting Started

The configuration of prosemirror suggests is based around an object which defines the suggestion behaviour. This configuration is passed the `suggestion` method which adds all the suggestion plugins to the editor.

In the following example we're creating an emoji suggestion plugin that

```ts
import { Suggester, suggest } from 'prosemirror-suggest';

type CommandFn = (emoji: string, skinVariation?: number) => void;

const maxResults = 10;
let selectedIndex = 0;
let emojiList: string[] = [];
let showSuggestions = false;

const suggestEmojis: Suggester<CommandFn> = {
  /**
   * By default decorations are used to highlight the currently matched suggestion in the dom.
   * In this example we don't need decorations (in fact they cause problems when the
   * emoji string replaces the query text in the dom).
   */
  ignoreDecorations: true,
  char: ':', // The character to match against
  name: 'emoji-suggestion', // a unique name
  appendText: '', // Text to append to the created match

  // Keybindings are similar to prosemirror keymaps with a few extra niceties.
  // The key identifier can also include modifiers (e.g.) `Cmd-Space: () => false`
  // Return true to prevent any other keyboard handlers from running.
  keyBindings: {
    ArrowUp: () => {
      selectedIndex = rotateSelectionBackwards(selectedIndex, emojiList.length);
    },
    ArrowDown: () => {
      selectedIndex = rotateSelectionForwards(selectedIndex, emojiList.length);
    },
    Enter: ({ command }) => {
      if (showSuggestions) {
        command(emojiList[selectedIndex]);
      }
    },
    Esc: () => {
      showSuggestions = false;
    },
  },

  onChange: params => {
    const query = params.query.full;
    emojiList = sortEmojiMatches({ query, maxResults });
    selectedIndex = 0;
    showSuggestions = true;
  },

  onExit: () => {
    showSuggestions = false;
    emojiList = [];
    selectedIndex = 0;
  },

  // Create the function that is passed into the change, exit and keybinding handlers.
  // This is useful when these handlers are called in a different part of the app.
  createCommand: ({ match, view }) => {
    return (emoji, skinVariation) => {
      if (!emoji) {
        throw new Error('An emoji is required when calling the emoji suggestions command');
      }

      const tr = view.state.tr;
      const { from, end: to } = match.range;
      tr.insertText(emoji, from, to);
      view.dispatch(tr);
    };
  },
};

// Create the plugin with the above configuration. It supports multiple plugins being added.
const suggestionPlugin = suggest(suggestEmojis, suggestMentions);

// Later on in the codebase
const state = EditorState.create({
  schema,
  plugins: [suggestionPlugin],
});
```
