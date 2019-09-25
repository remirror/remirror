# prosemirror-suggest

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/prosemirror-suggest.svg?)](https://bundlephobia.com/result?p=prosemirror-suggest) [![npm](https://img.shields.io/npm/dm/prosemirror-suggest.svg?&logo=npm)](https://www.npmjs.com/package/prosemirror-suggest)

Primitives for building your prosemirror suggestion and autocomplete functionality.

## The problem

You want to create a plugin for your prosemirror editor that responds to an activation character to create suggestions or options or actions for the user. Doing this from scratch can be difficult.

## This solution

`prosemirror-suggest` provides the suggestion primitives needed for building this functionality into your editor. You might be building user mentions, emoji search, an actions dropdown or anything that extracts a query from the editor after the activation character(s).

This implementation doesn't attempt to be magical. There's still a lot of work that goes into setting up your configuration. However, with this toolkit, you you will be building on a well-tested foundation with a structured API.

## Installation

`prosemirror-view` is a peer dependency of `prosemirror-suggest` and needs to be installed as well.

```bash
yarn add prosemirror-suggest prosemirror-view

```

## Getting Started

`prosemirror-suggest` uses configuration objects called `Suggester`<!-- -->'s to define the behaviour of the suggestions you create. By calling the exported `suggest` method with all required `Suggester`<!-- -->'s the functionality is added to the editor in one plugin.

In the following example we're creating an emoji suggestion plugin that responds to the colon character with a query and presents a list of matching emojis based on the query typed so far.

```ts
import { Suggester, suggest } from 'prosemirror-suggest';

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

// Create the plugin with the above configuration. It also supports multiple plugins being added.
const suggestionPlugin = suggest(suggestEmojis);

// Include the plugin in the created editor state.
const state = EditorState.create({ schema, plugins: [suggestionPlugin] });
```

You can see this example brought to life in the `remirror` codebase under the `@remirror/extension-emoji` and the `@remirror/extension-mention` packages.

The following examples are available for you to try out on the [docs site](https://docs.remirror.org/showcase/social)

**Search emoji on `:` key**

The emojis are inserted as plain text. It’s up to you whether you insert the emoji as a node, mark or plaintext.

![A gif showing emoji being inserted after typing the colon (:) key. First a laughing emoji then a heart and finally the poop emoji](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/emoji.gif 'A gif showing emoji being inserted after typing the colon (:) key. First a laughing emoji then a heart and finally the poop emoji')

**Editable mention on `@` key**

Each mention is a mark that wraps the mentioned text with a spec property of `inclusive: false`

![A gif showing mentions being suggested as the user types with editing supported](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/mentions.gif 'A gif showing mentions being suggested as the user types with editing supported')

<br />

## Core API

### `suggest`

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

<br />

### `Suggester`

This `Suggester` interface defines all the options required to create a suggestion within your editor.

<b>Signature:</b>

```typescript
export interface Suggester<GCommand extends AnyFunction<void> = AnyFunction<void>>
```

#### Properties

| Property                                                                                                                                                         | Type                                              | Description                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [appendText](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.appendtext.md)                           | <code>string</code>                               | Text to append after the mention has been added.                                                           |
| [char](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.char.md)                                       | <code>string</code>                               | The activation character(s) to match against.                                                              |
| [ignoredClassName](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.ignoredclassname.md)               | <code>string</code>                               | Set a class for the ignored suggestion decoration.                                                         |
| [ignoredTag](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.ignoredtag.md)                           | <code>string</code>                               | Set a tag for the ignored suggestion decoration.                                                           |
| [invalidPrefixCharacters](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.invalidprefixcharacters.md) | <code>RegExp &#124; string</code>                 | A regex expression used to invalidate the text directly before the match.                                  |
| [keyBindings](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.keybindings.md)                         | <code>SuggestKeyBindingMap&lt;GCommand&gt;</code> | An object that describes how certain key bindings should be handled.                                       |
| [matchOffset](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.matchoffset.md)                         | <code>number</code>                               | Sets the characters that need to be present after the initial character match before a match is triggered. |
| [name](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.name.md)                                       | <code>string</code>                               | A unique identifier for the suggester.                                                                     |
| [noDecorations](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.nodecorations.md)                     | <code>boolean</code>                              | When true, decorations are not created when this mention is being edited..                                 |
| [startOfLine](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.startofline.md)                         | <code>boolean</code>                              | Whether to only match from the start of the line                                                           |
| [suggestClassName](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.suggestclassname.md)               | <code>string</code>                               | Class name to use for the decoration (while the suggestion is still being written)                         |
| [suggestTag](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.suggesttag.md)                           | <code>string</code>                               | Tag for the prosemirror decoration which wraps an active match.                                            |
| [supportedCharacters](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.supportedcharacters.md)         | <code>RegExp &#124; string</code>                 | A regex containing all supported characters when within a suggestion.                                      |
| [validPrefixCharacters](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.validprefixcharacters.md)     | <code>RegExp &#124; string</code>                 | A regex expression used to validate the text directly before the match.                                    |

#### Methods

| Method                                                                                                                                                     | Description                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [createCommand(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.createcommand.md)       | Create the suggested actions which are made available to the <code>onExit</code> and on<code>onChange</code> handlers.               |
| [getStage(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.getstage.md)                 | Check the current match and editor state to determine whether this match is being <code>new</code>ly created or <code>edit</code>ed. |
| [onChange(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.onchange.md)                 | Called whenever a suggestion becomes active or changes in anyway.                                                                    |
| [onCharacterEntry(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.oncharacterentry.md) | Called for each character entry and can be used to disable certain characters.                                                       |
| [onExit(params)](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.onexit.md)                     | Called when a suggestion is exited with the pre-exit match value.                                                                    |

The options are passed to the [suggest](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggest.md) method which uses them.

<br />

## Package API

### Enumerations

| Enumeration                                                                                                                      | Description                                     |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [ChangeReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.changereason.md) | The potential reason for changes                |
| [ExitReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.exitreason.md)     | The potential reasons for an exit of a mention. |

### Interfaces

| Interface                                                                                                                                                      | Description                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [AddIgnoredParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.addignoredparams.md)                       | The parameters needed for the [SuggestIgnoreParams.addIgnored()](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestignoreparams.addignored.md) action method available to the suggest plugin handlers. |
| [CompareMatchParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.comparematchparams.md)                   | A parameter builder interface which compares the previous and next match.                                                                                                                                                                                    |
| [CreateSuggestCommandParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.createsuggestcommandparams.md)   | The parameters passed into the <code>createSuggest</code> suggester property.                                                                                                                                                                                |
| [FromToEndParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.fromtoendparams.md)                         | A parameter builder interface describing a <code>from</code>/<code>to</code>/<code>end</code> range.                                                                                                                                                         |
| [GetStageParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.getstageparams.md)                           | The parameters passed through to the [Suggester.getStage()](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.getstage.md) method.                                                                  |
| [KeyboardEventParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.keyboardeventparams.md)                 | A parameter builder interface describing the event which triggers the keyboard event handler.                                                                                                                                                                |
| [MatchValue](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.matchvalue.md)                                   | The match value with the full and partial text.                                                                                                                                                                                                              |
| [OnKeyDownParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.onkeydownparams.md)                         | The parameters required by the .                                                                                                                                                                                                                             |
| [ReasonMatchParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.reasonmatchparams.md)                     | A parameter builder interface which adds the match property.                                                                                                                                                                                                 |
| [ReasonParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.reasonparams.md)                               | A parameter builder interface indicating the reason the handler was called.                                                                                                                                                                                  |
| [RemoveIgnoredParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.removeignoredparams.md)                 | The parameters needed for the action method available to the suggest plugin handlers.                                                                                                                                                                        |
| [StageParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.stageparams.md)                                 | A parameter builder interface describing the stage of the suggestion whether is it being edited or newly created.                                                                                                                                            |
| [SuggestCallbackParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestcallbackparams.md)             |                                                                                                                                                                                                                                                              |
| [SuggestChangeHandlerParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestchangehandlerparams.md)   | The parameters passed to the [Suggester.onChange()](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.onchange.md) method.                                                                          |
| [SuggestCharacterEntryParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestcharacterentryparams.md) | The parameters passed to the [Suggester.onCharacterEntry()](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.oncharacterentry.md) method.                                                          |
| [SuggestCommandParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestcommandparams.md)               | A parameter builder interface which adds the command property.                                                                                                                                                                                               |
| [Suggester](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.md)                                     | This <code>Suggester</code> interface defines all the options required to create a suggestion within your editor.                                                                                                                                            |
| [SuggesterParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggesterparams.md)                         |                                                                                                                                                                                                                                                              |
| [SuggestExitHandlerParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestexithandlerparams.md)       | The parameters passed to the [Suggester.onExit()](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.onexit.md) method.                                                                              |
| [SuggestIgnoreParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestignoreparams.md)                 | A parameter builder interface describing the ignore methods available to the [Suggester](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.md) handlers.                                            |
| [SuggestKeyBindingParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestkeybindingparams.md)         | The parameters required by the [SuggestKeyBinding](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestkeybinding.md) method.                                                                            |
| [SuggestMarkParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestmarkparams.md)                     | A special parameter needed when creating editable suggester using prosemirror <code>Marks</code>. The method should be called when removing a suggestion that was identified by a prosemirror <code>Mark</code>.                                             |
| [SuggestReasonMap](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestreasonmap.md)                       | A mapping of the handler matches with their reasons for occurring within the suggest state.                                                                                                                                                                  |
| [SuggestStateMatch](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggeststatematch.md)                     | Describes the properties of a match which includes range and the text as well as information of the suggester that created the match.                                                                                                                        |
| [SuggestStateMatchParams](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggeststatematchparams.md)         | A parameter builder interface describing match found by the suggest plugin.                                                                                                                                                                                  |
| [SuggestStateMatchReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggeststatematchreason.md)         |                                                                                                                                                                                                                                                              |

### Variables

| Variable                                                                                                                                                 | Description                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [createRegexFromSuggester](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.createregexfromsuggester.md) | Create a regex expression to evaluate matches directly from the suggester properties.                                                       |
| [DEFAULT_SUGGEST_ACTIONS](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.default_suggest_actions.md)   |                                                                                                                                             |
| [DEFAULT_SUGGESTER](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.default_suggester.md)               |                                                                                                                                             |
| [escapeChar](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.escapechar.md)                             |                                                                                                                                             |
| [getRegexPrefix](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.getregexprefix.md)                     | Find regex prefix when depending on whether the mention only supports the start of a line or not                                            |
| [getSuggestPluginState](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.getsuggestpluginstate.md)       | Get the state of the suggest plugin.                                                                                                        |
| [isChange](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.ischange.md)                                 | Is this a change in the current suggestion (added or deleted characters)?                                                                   |
| [isChangeReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.ischangereason.md)                     |                                                                                                                                             |
| [isEntry](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.isentry.md)                                   | Are we entering a new suggestion?                                                                                                           |
| [isExit](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.isexit.md)                                     | Are we exiting a suggestion?                                                                                                                |
| [isExitReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.isexitreason.md)                         | Check that the passed in value is an ExitReason                                                                                             |
| [isInvalidSplitReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.isinvalidsplitreason.md)         | Checks that the reason was caused by a split at a point where there is no query.                                                            |
| [isJump](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.isjump.md)                                     | Is this a jump from one suggestion to another?                                                                                              |
| [isJumpReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.isjumpreason.md)                         | Checks to see if this is a jump reason.                                                                                                     |
| [isMove](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.ismove.md)                                     | Has the cursor moved within the current suggestion (added or deleted characters)?                                                           |
| [isRemovedReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.isremovedreason.md)                   | Checks that the reason was caused by a deletion.                                                                                            |
| [isSplitReason](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.issplitreason.md)                       | Checks that the reason passed is a split reason. This typically means that we should default to a partial update / creation of the mention. |
| [isValidMatch](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.isvalidmatch.md)                         | True when the match is currently active (i.e. it's query has a value)                                                                       |
| [regexToString](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.regextostring.md)                       | Convert a RegExp into a string                                                                                                              |
| [selectionOutsideMatch](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.selectionoutsidematch.md)       | True when the current selection is outside the match.                                                                                       |
| [suggest](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggest.md)                                   | This creates a suggestion plugin with all the suggestions provided.                                                                         |

### Type Aliases

| Type Alias                                                                                                                                           | Description                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [SuggestKeyBinding](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestkeybinding.md)           | A method for performing actions when a certain key / pattern is pressed.                                                                                                                                                                                                                                                                                      |
| [SuggestKeyBindingMap](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestkeybindingmap.md)     | The keybindings shape for the [Suggester.keyBindings](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggester.keybindings.md) property.                                                                                                                                                                    |
| [SuggestReplacementType](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggestreplacementtype.md) | Determines whether to replace the full match or the partial match (up to the cursor position).                                                                                                                                                                                                                                                                |
| [SuggestStage](https://github.com/ifiokjr/remirror/blob/canary/docs/api/prosemirror-suggest/prosemirror-suggest.suggeststage.md)                     | A suggestion can have two stages. When it is <code>new</code> and when it has already been created and is now being <code>edit</code>ed.<!-- -->Separating the stages allows for greater control in how mentions are updated.<!-- -->The edit state is only applicable for editable suggestions. Most nodes and text insertions can't be edited once created. |
