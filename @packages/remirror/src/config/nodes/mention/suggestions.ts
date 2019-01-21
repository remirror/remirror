import { curry } from 'lodash';
import { ResolvedPos } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { CommandFunction, EditorSchema, SuggestionsRange } from '../../../types';
import { insertText } from '../../commands';
import { getPluginState } from '../../utils/document-helpers';

export interface SuggestionsMatcher {
  char: string;
  allowSpaces: boolean;
  startOfLine: boolean;
}

export interface SuggestionsPluginState {
  active: boolean;
  range: SuggestionsRange | null;
  decorationId: string | null;
  query: string | null;
  text: string | null;
}

export interface SuggestionsCommandParams {
  attrs?: Record<string, string>;
  range: SuggestionsRange;
  schema: EditorSchema;
}

export interface SuggestionsCallbackParams extends SuggestionsPluginState {
  view: EditorView;
  decorationNode: Element | null;
  command: (params: Pick<SuggestionsCommandParams, 'attrs' | 'range'>) => void;
}

export interface SuggestionsPluginProps<T = any> {
  matcher?: SuggestionsMatcher;
  appendText?: string | null;
  suggestionsClassName?: string;
  command?(params: SuggestionsCommandParams): CommandFunction;
  items?: T[] | (() => T[]);
  onEnter?(params: SuggestionsCallbackParams): void;
  onChange?(params: SuggestionsCallbackParams): void;
  onExit?(params: SuggestionsCallbackParams): void;
  onKeyDown?(params: {
    view: EditorView;
    event: KeyboardEvent;
    range: SuggestionsRange | null;
  }): boolean;
}

const defaultMatcher = {
  char: '@',
  allowSpaces: false,
  startOfLine: false,
};
const defaultSuggestionsClassName = 'suggestion';
const defaultHandler = () => false;
const defaultSuggestionsPluginState: SuggestionsPluginState = {
  active: false,
  range: null,
  query: null,
  text: null,
  decorationId: null,
};

// Create a matcher that matches when a specific character is typed. Useful for @mentions and #tags.
const triggerCharacter = curry(
  (
    { char = '@', allowSpaces = false, startOfLine = false }: SuggestionsMatcher,
    $position: ResolvedPos<EditorSchema>,
  ): SuggestionsPluginState | undefined => {
    // Matching expressions used for later
    const escapedChar = `\\${char}`;
    const suffix = new RegExp(`\\s${escapedChar}$`);
    const prefix = startOfLine ? '^' : '';
    const regexp = allowSpaces
      ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, 'gm')
      : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm');

    // Lookup the boundaries of the current node
    const textFrom = $position.before();
    const textTo = $position.end();
    const text = $position.doc.textBetween(textFrom, textTo, '\0', '\0');

    let match = regexp.exec(text);
    let position: SuggestionsPluginState | undefined;
    while (match !== null) {
      // JavaScript doesn't have lookbehinds; this hacks a check that first character is " "
      // or the line beginning
      const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);

      if (/^[\s\0]?$/.test(matchPrefix)) {
        // The absolute position of the match in the document
        const from = match.index + $position.start();
        let to = from + match[0].length;

        // Edge case handling; if spaces are allowed and we're directly in between
        // two triggers
        if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
          match[0] += ' ';
          to += 1;
        }

        // If the $position is located within the matched substring, return that range
        if (from < $position.pos && to >= $position.pos) {
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

      match = regexp.exec(text);
    }

    return position;
  },
);

export const SuggestionsPlugin = ({
  matcher = defaultMatcher,
  appendText = null,
  suggestionsClassName = defaultSuggestionsClassName,
  command = () => defaultHandler,
  onEnter = defaultHandler,
  onChange = defaultHandler,
  onExit = defaultHandler,
  onKeyDown = defaultHandler,
}: SuggestionsPluginProps) => {
  const plugin: Plugin = new Plugin({
    key: new PluginKey('suggestions'),
    view() {
      return {
        update(view, prevState) {
          const prev = getPluginState<SuggestionsPluginState>(plugin, prevState);
          const next = getPluginState<SuggestionsPluginState>(plugin, view.state);

          // See how the state changed
          const moved =
            prev.active &&
            next.active &&
            prev.range &&
            next.range &&
            prev.range.from !== next.range.from;
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
          const decorationNode = document.querySelector(
            `[data-decoration-id="${state.decorationId}"]`,
          );

          const props: SuggestionsCallbackParams = {
            view,
            decorationNode,
            ...state,
            text: state.text,
            command: ({ range, attrs }: Pick<SuggestionsCommandParams, 'attrs' | 'range'>) => {
              command({
                range,
                attrs,
                schema: view.state.schema,
              })(view.state, view.dispatch);

              if (appendText) {
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

      // Apply changes to the plugin state from a view transaction.
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
          const match = triggerCharacter(matcher)($position);
          const decorationId = (Math.random() + 1).toString(36).substr(2, 5);

          // If we found a match, update the current state to show it
          if (match) {
            next.active = true;
            next.decorationId = prev.decorationId ? prev.decorationId : decorationId;
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
        const { active, range } = getPluginState<SuggestionsPluginState>(plugin, view.state);

        if (!active) {
          return false;
        }

        return onKeyDown({ view, event, range });
      },

      // Setup decorator on the currently active suggestion.
      decorations(editorState) {
        const { active, range, decorationId } = getPluginState<SuggestionsPluginState>(
          plugin,
          editorState,
        );

        if (!active || !range) {
          return null;
        }

        return DecorationSet.create(editorState.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: 'span',
            class: suggestionsClassName,
            // @ts-ignore
            'data-decoration-id': decorationId,
          }),
        ]);
      },
    },
  });

  return plugin;
};
