import {
  Attrs,
  CommandFunction,
  EditorSchema,
  EditorState,
  findMatches,
  FromTo,
  getPluginState,
  insertText,
  MakeRequired,
} from '@remirror/core';
import { ResolvedPos } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

/**
 * The attrs that will be added to the node.
 * ID and label are plucked and used while attributes like href and role can be assigned as desired.
 */
export interface NodeAttrs extends Attrs {
  /**
   * A unique identifier for the suggestions node
   */
  id: string;

  /**
   * The text to be placed within the suggestions node
   */
  label: string;
}

export interface SuggestionsMatcher {
  char: string;
  startOfLine: boolean;
  supportedCharacters: RegExp | string;
}

export interface SuggestionsPluginState {
  active: boolean;
  range: FromTo | null;
  query: string | null;
  text: string | null;
}

export interface SuggestionsCommandParams {
  attrs?: Attrs;
  range: FromTo | null;
  schema: EditorSchema;
}

export interface SuggestionsCallbackParams extends SuggestionsPluginState {
  view: EditorView;
  command(attrs: NodeAttrs): void;
}

export interface OnKeyDownParams {
  view: EditorView;
  event: KeyboardEvent;
  range: FromTo | null;
}

export interface SuggestionsPluginProps {
  matcher?: MakeRequired<Partial<SuggestionsMatcher>, 'char'>;
  appendText?: string | null;
  suggestionClassName?: string;
  decorationsTag: keyof HTMLElementTagNameMap;
  command(params: SuggestionsCommandParams): CommandFunction;
  onEnter?(params: SuggestionsCallbackParams): void;
  onChange?(params: SuggestionsCallbackParams): void;
  onExit?(params: SuggestionsCallbackParams): void;
  onKeyDown?(params: OnKeyDownParams): boolean;
}

export const defaultMatcher: SuggestionsMatcher = {
  char: '@',
  startOfLine: false,
  supportedCharacters: /[\w\d_]+/,
};
const defaultHandler = () => false;
const defaultSuggestionsPluginState: SuggestionsPluginState = {
  active: false,
  range: null,
  query: null,
  text: null,
};

// Create a matcher that matches when a specific character is typed. Useful for @mentions and #tags.
const triggerCharacter = (
  { char = '@', startOfLine = false, supportedCharacters = /[\w\d_]+/gi }: SuggestionsMatcher,
  $pos: ResolvedPos<EditorSchema>,
): SuggestionsPluginState | undefined => {
  // Matching expressions used for later
  const escapedChar = `\\${char}`;
  const supported =
    typeof supportedCharacters === 'string' ? supportedCharacters : supportedCharacters.source;
  // const suffix = new RegExp(`\\s${escapedChar}$`);
  const prefix = startOfLine ? '^' : '';
  const regexp = new RegExp(`${prefix}${escapedChar}${supported}`, 'gm');

  // Lookup the boundaries of the current node
  const textFrom = $pos.before();
  const textTo = $pos.end();
  const text = $pos.doc.textBetween(textFrom, textTo, '\0', '\0');

  let position: SuggestionsPluginState | undefined;
  findMatches(text, regexp).forEach(match => {
    // JavaScript doesn't have lookbehinds; this hacks a check that first character is " "
    // or the line beginning
    const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);

    if (/^[\s\0]?$/.test(matchPrefix)) {
      // The absolute position of the match in the document
      const from = match.index + $pos.start();
      const to = from + match[0].length;

      // Edge case handling; if spaces are allowed and we're directly in between
      // two triggers
      // if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
      //   match[0] += ' ';
      //   to += 1;
      // }

      // If the $position is located within the matched substring, return that range
      if (from < $pos.pos && to >= $pos.pos) {
        position = {
          ...defaultSuggestionsPluginState,
          range: {
            from,
            to,
          },
          query: match[0].slice(char.length),
          text: match[0],
        };
      }
    }
  });

  return position;
};

export const createSuggestionsPlugin = ({
  matcher: _matcher = defaultMatcher,
  appendText = null,
  command = () => defaultHandler,
  onEnter = defaultHandler,
  onChange = defaultHandler,
  onExit = defaultHandler,
  onKeyDown = defaultHandler,
  suggestionClassName,
  decorationsTag,
  key,
}: SuggestionsPluginProps & { key: PluginKey<SuggestionsPluginState, EditorSchema> }) => {
  const matcher = { ...defaultMatcher, ..._matcher } as SuggestionsMatcher;
  const plugin: Plugin = new Plugin<SuggestionsPluginState, EditorSchema>({
    key,
    view() {
      return {
        update(view, prevState: EditorState) {
          const prev = getPluginState<SuggestionsPluginState>(plugin, prevState);
          const next = getPluginState<SuggestionsPluginState>(plugin, view.state);

          // See how the state changed
          const moved =
            prev.active && next.active && prev.range && next.range && prev.range.from !== next.range.from;
          const started = !prev.active && next.active;
          const stopped = prev.active && !next.active;
          const changed = !started && !stopped && prev.query !== next.query;
          const handleStart = started || moved;
          const handleChange = changed && !moved;
          const handleExit = stopped || moved;

          // Cancel when suggestion isn't active
          if (!handleStart && !handleChange && !handleExit) {
            return;
          }

          const state = handleExit ? prev : next;

          const props: SuggestionsCallbackParams = {
            view,
            ...state,
            text: state.text,
            command: (attrs: NodeAttrs) => {
              console.log('command being called with', state.range);
              command({
                range: state.range,
                attrs,
                schema: view.state.schema,
              })(view.state, view.dispatch);
              console.log('command called with', 'success');
              if (attrs.hasOwnProperty('appendText')) {
                console.log('has own property appendText');
                if (attrs.appendText.length) {
                  console.log('appending alternative text');
                  insertText(attrs.appendText)(view.state, view.dispatch);
                }
              } else if (appendText) {
                insertText(appendText)(view.state, view.dispatch);
              }
            },
          };

          // Trigger the hooks when necessary
          if (handleExit) {
            onExit(props);
          }

          if (handleChange) {
            onChange(props);
          }

          if (handleStart) {
            onEnter(props);
          }
        },
      };
    },

    state: {
      // Initialize the plugin's internal state.
      init() {
        return defaultSuggestionsPluginState;
      },

      // Apply changes to the plugin state.
      apply(tr, prev: SuggestionsPluginState) {
        const { selection } = tr;
        let next = { ...prev };

        // We can only be suggesting if there is no selection
        if (selection.from === selection.to) {
          // Reset active state if we just left the previous suggestion range
          if (prev.range && (selection.from < prev.range.from || selection.from > prev.range.to)) {
            next.active = false;
          }

          // Try to match against where our cursor currently is
          const $position = selection.$from;
          const match = triggerCharacter(matcher, $position);

          // If we found a match, update the current state to show it
          if (match) {
            next.active = true;
            next.range = match.range;
            next.query = match.query;
            next.text = match.text;
          } else {
            next.active = false;
          }
        } else {
          next.active = false;
        }

        // Make sure to empty the range if suggestion is inactive
        if (!next.active) {
          next = defaultSuggestionsPluginState;
        }

        return next;
      },
    },

    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(view, event) {
        const { active, range, query } = getPluginState<SuggestionsPluginState>(plugin, view.state);
        if (!active || !(query && query.length)) {
          return false;
        }
        return onKeyDown({ view, event, range });
      },

      /**
       * Sets up a decoration (styling options) on the currently active decoration
       * @param editorState
       */
      decorations(editorState) {
        const { active, range, query } = getPluginState<SuggestionsPluginState>(plugin, editorState);

        if (!active || !range || !(query && query.length)) {
          return null;
        }

        return DecorationSet.create(editorState.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: decorationsTag,
            class: suggestionClassName,
          }),
        ]);
      },
    },
  });

  return plugin;
};
