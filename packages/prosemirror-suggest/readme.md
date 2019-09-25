# prosemirror-suggest

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/prosemirror-suggest.svg?)](https://bundlephobia.com/result?p=prosemirror-suggest) [![npm](https://img.shields.io/npm/dm/prosemirror-suggest.svg?&logo=npm)](https://www.npmjs.com/package/prosemirror-suggest)

## The problem

You want to create a suggestion plugin for your prosemirror editor but are unsure how to get started. The suggestions could be for mentions, emojis, responding to a keypress with a dropdown of potential actions or anything that needs to extract a query from the current editor when a matching character is entered.

## This solution

`prosemirror-suggest` provides the suggestion primitives you will need for within your editor. It doesn't try to be magical and even with this library setting up suggestions can be difficult. However, with this toolkit, you will be able to build pretty much any suggestion plugin you can think of.

## Installation

```bash
yarn add prosemirror-suggest prosemirror-view
```

## Getting Started

The configuration of `prosemirror-suggests` is based on a [`Suggester`](#suggester-interface) interface which defines the suggestion behaviour. The [`suggest`](#suggest-variable) method receives the configured suggestersand creates a suggestion plugin which can be used within your prosemirror editor.

In the following example we're creating an emoji suggestion plugin that responds to the colon character with a query and presents a list of matching emojis based on the query typed.

```ts
import { Suggester, suggest } from 'prosemirror-suggest';

const maxResults = 10;
let selectedIndex = 0;
let emojiList: string[] = [];
let showSuggestions = false;

const suggestEmojis: Suggester = {
  /**
   * By default decorations are used to highlight the currently matched suggestion in the dom.
   * In this example we don't need decorations (in fact they cause problems when the
   * emoji string replaces the query text in the dom).
   */
  noDecorations: true,
  char: ':', // The character to match against
  name: 'emoji-suggestion', // a unique name
  appendText: '', // Text to append to the created match

  // Keybindings are similar to prosemirror keymaps with a few extra niceties.
  // The key identifier can also include modifiers (e.g.) `Cmd-Space: () => false`
  // Return true to prevent any further keyboard handlers from running.
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

  // Create a  function that is passed into the change, exit and keybinding handlers.
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

## API

### suggest variable

This creates a suggestion plugin with all the suggestions provided.

<b>Signature:</b>

```ts
suggest: <GSchema extends import("prosemirror-model").Schema<string, string> = any>(...suggesters: Suggester<import("@remirror/core-types").AnyFunction<void>>[]) => Plugin<SuggestState<any>, GSchema>
```

The priority of the suggestions is the order in which they are passed into this function.

```ts
const plugin = suggest(two, one, three);
```

In the above example `two` will be checked first, then `one` and then `three`.

Only one suggestion can match at any given time. The order and specificity of the regex parameters help determines which suggestion will be active.

### Suggester interface

This `Suggester` interface provides the options object which is used within the [suggest](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggest.md) plugin creator.

#### Properties

| Property                                                                                                                                     | Type                                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [appendText](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.appendtext.md)                           | <code>string</code>                               | Text to append after the mention has been added.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| [char](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.char.md)                                       | <code>string</code>                               | The character to match against.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| [decorationsTag](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.decorationstag.md)                   | <code>keyof HTMLElementTagNameMap</code>          | Tag which wraps an active match.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| [noDecorations](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.ignoredecorations.md)                 | <code>boolean</code>                              | When true, decorations are not created when this mention is being edited..                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| [invalidPrefixCharacters](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.invalidprefixcharacters.md) | <code>RegExp &#124; string</code>                 | A regex expression used to invalidate the text directly before the match.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| [keyBindings](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.keybindings.md)                         | <code>SuggestKeyBindingMap&lt;GCommand&gt;</code> | An object that describes how certain key bindings should be handled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [matchOffset](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.matchoffset.md)                         | <code>number</code>                               | Sets the characters that need to be present after the initial character match before a match is triggered.<!-- -->For example with <code>char</code> = <code>@</code> the following is true.<!-- -->- <code>matchOffset: 0</code> matches <code>'@'</code> immediately - <code>matchOffset: 1</code> matches <code>'@a'</code> but not <code>'@'</code> - <code>matchOffset: 2</code> matches <code>'@ab'</code> but not <code>'@a'</code> or <code>'@'</code> - <code>matchOffset: 3</code> matches <code>'@abc'</code> but not <code>'@ab'</code> or <code>'@a'</code> or <code>'@'</code> - And so on... |
| [name](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.name.md)                                       | <code>string</code>                               | A unique identifier for the matching character.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| [startOfLine](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.startofline.md)                         | <code>boolean</code>                              | Whether to only match from the start of the line                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| [suggestionClassName](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.suggestionclassname.md)         | <code>string</code>                               | Class name to use for the decoration (while the plugin is still being written)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| [supportedCharacters](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.supportedcharacters.md)         | <code>RegExp &#124; string</code>                 | A regex containing all supported characters when within a suggestion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| [validPrefixCharacters](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.validprefixcharacters.md)     | <code>RegExp &#124; string</code>                 | A regex expression used to validate the text directly before the match.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

#### Methods

| Method                                                                                                                                 | Description                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [createCommand(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.createcommand.md)       | Create the suggested actions which are made available to the <code>onExit</code> and on<code>onChange</code> handlers.               |
| [getStage(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.getstage.md)                 | Check the current match and editor state to determine whether this match is being <code>new</code>ly created or <code>edit</code>ed. |
| [onChange(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.onchange.md)                 | Called whenever a suggestion becomes active or changes in anyway.                                                                    |
| [onCharacterEntry(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.oncharacterentry.md) | Called for each character entry and can be used to disable certain characters.                                                       |
| [onExit(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest.suggester.onexit.md)                     | Called when a suggestion is exited with the pre-exit match value.                                                                    |
