# prosemirror-suggest

> Primitives for building your prosemirror suggestion and autocomplete functionality.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/prosemirror-suggest
[npm]: https://npmjs.com/package/prosemirror-suggest
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=prosemirror-suggest
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/prosemirror-suggest
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/prosemirror-suggest/red?icon=npm

<br />

## The problem

You want to create a plugin for your prosemirror editor that responds to an activation character to create suggesters or options or actions for the user. Doing this from scratch can be difficult.

## This solution

`prosemirror-suggest` provides the suggestion primitives needed for building this functionality into your editor. You might be building user mentions, emoji search, an actions dropdown or anything that extracts a query from the editor after the activation character(s).

This implementation doesn't attempt to be magical. There's still a lot of work that goes into setting up your configuration. However, with this toolkit, you you will be building on a well-tested foundation with a structured API.

<br />

## Installation

```bash
# yarn
yarn add prosemirror-suggest prosemirror-view prosemirror-state prosemirror-keymap

# pnpm
pnpm add prosemirror-suggest prosemirror-view prosemirror-state prosemirror-keymap

# npm
npm install prosemirror-suggest prosemirror-view prosemirror-state prosemirror-keymap
```

The installation requires the installation of the peer dependencies `prosemirror-view`, `prosemirror-state` and `prosemirror-model` to avoid version clashes.

<br />

## Getting Started

This documentation will be updated soon.

`prosemirror-suggest` uses configuration objects called `Suggester`<!-- -->'s to define the behaviour of the suggesters you create. By calling the exported `suggest` method with all required `Suggester`<!-- -->'s the functionality is added to the editor in one plugin.

In the following example we're creating an emoji suggestion plugin that responds to the colon character with a query and presents a list of matching emojis based on the query typed so far.

```ts
import { schema } from 'prosemirror-schema-basic';
import { suggest, Suggester } from 'prosemirror-suggest';

const maxResults = 10;
let selectedIndex = 0;
let emojiList: string[] = [];
let showSuggestions = false;

const suggestEmojis: Suggester = {
  // By default decorations are used to highlight the currently matched
  // suggestion in the dom.
  // In this example we don't need decorations (in fact they cause problems when the
  // emoji string replaces the query text in the dom).
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

  onChange: (params) => {
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
        throw new Error('An emoji is required when calling the emoji suggesters command');
      }

      const tr = view.state.tr;
      const { from, end: to } = match.range;
      tr.insertText(emoji, from, to);
      view.dispatch(tr);
    };
  },
};

// Create the plugin with the above configuration. It also supports multiple plugins being added.
const suggestionPlugin = suggest(suggestEmojis);

// Include the plugin in the created editor state.
const state = EditorState.create({ schema, plugins: [suggestionPlugin] });
```

You can see this example brought to life in the `remirror` codebase under the `@remirror/extension-emoji` and the `@remirror/extension-mention` packages.

The following examples are available for you to try out on the [docs site](https://remirror.io/docs/showcase/social)

**Search emoji on `:` key**

The emojis are inserted as plain text. It’s up to you whether you insert the emoji as a node, mark or plaintext.

![A gif showing emoji being inserted after typing the colon (:) key. First a laughing emoji then a heart and finally the poop emoji](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/emoji.gif 'A gif showing emoji being inserted after typing the colon (:) key. First a laughing emoji then a heart and finally the poop emoji')

**Editable mention on `@` key**

Each mention is a mark that wraps the mentioned text with a spec property of `inclusive: false`

![A gif showing mentions being suggested as the user types with editing supported](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/mentions.gif 'A gif showing mentions being suggested as the user types with editing supported')

<br />

## Core API

### `suggest`

This creates a suggestion plugin with all the suggesters provided.

<b>Signature:</b>

```ts
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
(...suggesters: Suggester[]) => Plugin;
```

The priority of the suggesters is the order in which they are passed into this function.

```ts
const plugin = suggest(two, one, three);
```

In the above example `two` will be checked first, then `one` and then `three`.

Only one suggester can match at any given time. The order and specificity of the regex parameters help determines which suggester will be active.

<br />

### `Suggester`

This `Suggester` interface defines all the options required to create a suggester within your editor.

<b>Signature:</b>

```typescript
export interface Suggester<GCommand extends AnyFunction<void> = AnyFunction<void>>
```

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| `appendText` | <code>string</code> | Text to append after the mention has been added. |
| `char` | <code>string</code> | The activation character(s) to match against. |
| `ignoredClassName` | <code>string</code> | Set a class for the ignored suggester decoration. |
| `ignoredTag` | <code>string</code> | Set a tag for the ignored suggester decoration. |
| `invalidPrefixCharacters` | <code>RegExp &#124; string</code> | A regex expression used to invalidate the text directly before the match. |
| `keyBindings` | <code>SuggestKeyBindingMap&lt;GCommand&gt;</code> | An object that describes how certain key bindings should be handled. |
| `matchOffset` | <code>number</code> | Sets the characters that need to be present after the initial character match before a match is triggered. |
| `name` | <code>string</code> | A unique identifier for the suggester. |
| `noDecorations` | <code>boolean</code> | When true, decorations are not created when this mention is being edited.. |
| `startOfLine` | <code>boolean</code> | Whether to only match from the start of the line |
| `suggestClassName` | <code>string</code> | Class name to use for the decoration (while the suggester is still being written) |
| `suggestTag` | <code>string</code> | Tag for the prosemirror decoration which wraps an active match. |
| `supportedCharacters` | <code>RegExp &#124; string</code> | A regex containing all supported characters when within a suggester. |
| `validPrefixCharacters` | <code>RegExp &#124; string</code> | A regex expression used to validate the text directly before the match. |

#### Methods

| Method | Description |
| --- | --- |
| `createCommand(params)` | Create the suggested actions which are made available to the <code>onExit</code> and on<code>onChange</code> handlers. |
| `onChange(params)` | Called whenever a suggester becomes active or changes in anyway. |
| `onCharacterEntry(params)` | Called for each character entry and can be used to disable certain characters. |
| `onExit(params)` | Called when a suggester is exited with the pre-exit match value. |

The options are passed to the `suggest` method which uses them.

<br />

## Package API

### Enumerations

| Enumeration    | Description                                     |
| -------------- | ----------------------------------------------- |
| `ChangeReason` | The potential reason for changes                |
| `ExitReason`   | The potential reasons for an exit of a mention. |

### Interfaces

| Interface | Description |
| --- | --- |
| `AddIgnoredParameter` | The parameters needed for the `SuggestIgnoreParameter.addIgnored()` action method available to the suggest plugin handlers. |
| `CompareMatchParameter` | A parameter builder interface which compares the previous and next match. |
| `CreateSuggestCommandParameter` | The parameters passed into the <code>createSuggest</code> suggester property. |
| `FromToEndParameter` | A parameter builder interface describing a <code>from</code>/<code>to</code>/<code>end</code> range. |
| `KeyboardEventParameter` | A parameter builder interface describing the event which triggers the keyboard event handler. |
| `MatchValue` | The match value with the full and partial text. |
| `OnKeyDownParameter` | The parameters required by the . |
| `ReasonMatchParameter` | A parameter builder interface which adds the match property. |
| `ReasonParameter` | A parameter builder interface indicating the reason the handler was called. |
| `RemoveIgnoredParameter` | The parameters needed for the action method available to the suggest plugin handlers. |
| `SuggestCallbackParameter` |  |
| `SuggestChangeHandlerParameter` | The parameters passed to the `Suggester.onChange()` method. |
| `SuggestCharacterEntryParameter` | The parameters passed to the `Suggester.onCharacterEntry()` method. |
| `SuggestCommandParameter` | A parameter builder interface which adds the command property. |
| `Suggester` | This <code>Suggester</code> interface defines all the options required to create a suggestion within your editor. |
| `SuggesterParameter` |  |
| `SuggestExitHandlerParameter` | The parameters passed to the `Suggester.onExit()` method. |
| `SuggestIgnoreParameter` | A parameter builder interface describing the ignore methods available to the `Suggester` handlers. |
| `SuggestKeyBindingParameter` | The parameters required by the `SuggestKeyBinding` method. |
| `SuggestMarkParameter` | A special parameter needed when creating editable suggester using prosemirror <code>Marks</code>. The method should be called when removing a suggester that was identified by a prosemirror <code>Mark</code>. |
| `SuggestReasonMap` | A mapping of the handler matches with their reasons for occurring within the suggest state. |
| `SuggestStateMatch` | Describes the properties of a match which includes range and the text as well as information of the suggester that created the match. |
| `SuggestStateMatchParameter` | A parameter builder interface describing match found by the suggest plugin. |
| `SuggestStateMatchReason` |  |

### Variables

| Variable | Description |
| --- | --- |
| `createRegexFromSuggester` | Create a regex expression to evaluate matches directly from the suggester properties. |
| `DEFAULT_SUGGEST_ACTIONS` |  |
| `DEFAULT_SUGGESTER` |  |
| `escapeChar` |  |
| `getRegexPrefix` | Find regex prefix when depending on whether the mention only supports the start of a line or not |
| `getSuggestPluginState` | Get the state of the suggest plugin. |
| `isChange` | Is this a change in the current suggestion (added or deleted characters)? |
| `isChangeReason` |  |
| `isEntry` | Are we entering a new suggestion? |
| `isExit` | Are we exiting a suggestion? |
| `isExitReason` | Check that the passed in value is an ExitReason |
| `isInvalidSplitReason` | Checks that the reason was caused by a split at a point where there is no query. |
| `isJump` | Is this a jump from one suggestion to another? |
| `isJumpReason` | Checks to see if this is a jump reason. |
| `isMove` | Has the cursor moved within the current suggestion (added or deleted characters)? |
| `isRemovedReason` | Checks that the reason was caused by a deletion. |
| `isSplitReason` | Checks that the reason passed is a split reason. This typically means that we should default to a partial update / creation of the mention. |
| `isValidMatch` | True when the match is currently active (i.e. it's query has a value) |
| `regexToString` | Convert a RegExp into a string |
| `selectionOutsideMatch` | True when the current selection is outside the match. |
| `suggest` | This creates a suggestion plugin with all the suggesters provided. |

### Type Aliases

| Type Alias | Description |
| --- | --- |
| `SuggestKeyBinding` | A method for performing actions when a certain key / pattern is pressed. |
| `SuggestKeyBindingMap` | The keybindings shape for the `Suggester.keyBindings` property. |
| `SuggestReplacementType` | Determines whether to replace the full match or the partial match (up to the cursor position). |
