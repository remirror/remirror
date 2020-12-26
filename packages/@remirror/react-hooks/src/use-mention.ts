import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

import { ExtensionPriority, KeyBindings, Replace } from '@remirror/core';
import type {
  MentionChangeHandler,
  MentionChangeHandlerCommand,
  MentionExtensionAttributes,
} from '@remirror/extension-mention';
import { MentionExtension } from '@remirror/extension-mention';
import { ChangeReason, ExitReason, SuggestChangeHandlerParameter } from '@remirror/pm/suggest';
import { useExtension, useRemirrorContext } from '@remirror/react';

import { indexFromArrowPress } from './react-hook-utils';
import { useKeymap } from './use-keymap';

export interface MentionState<Data extends MentionExtensionAttributes = MentionExtensionAttributes>
  extends Pick<SuggestChangeHandlerParameter, 'name' | 'query' | 'text' | 'range'> {
  /**
   * The name of the current matcher. When this is undefined there is no
   * active mention.
   */
  name: string;

  /**
   * The index that should be matched.
   *
   * @default 0
   */
  index: number;

  /**
   * This command when the mention is active.
   */
  command: (item: Data) => void;

  /**
   * The reason for the change.
   */
  reason: ChangeReason;
}

/**
 * The hook for managing the mention keyboard handlers.
 *
 * @param props - the props passed in to the `useMention` hook
 * @param setState - the state setter to update the state
 * @param currentIndex - the index which defaults to 0 when not provided
 */
function useMentionChangeHandler<
  Data extends MentionExtensionAttributes = MentionExtensionAttributes
>(props: UseMentionProps<Data>, setState: SetMentionState, currentIndex = 0) {
  const { onExit } = props;

  /**
   * The is the callback for when a suggestion is changed.
   */
  const onChange: MentionChangeHandler = useCallback(
    (parameter, cmd) => {
      const {
        query,
        text,
        range,
        ignoreNextExit,
        name,
        exitReason,
        changeReason,
        textAfter,
        defaultAppendTextValue,
      } = parameter;

      // Ignore the next exit since it has been triggered manually but
      // only when this is caused by a change. This is because the command
      // might be setup to automatically be created on an exit.
      if (changeReason) {
        const command: MentionChangeHandlerCommand = (attrs) => {
          // Ignore the next exit since this exit is artificially being
          // generated.
          ignoreNextExit();

          const regex = /^\s+/;

          const appendText = regex.test(textAfter) ? '' : defaultAppendTextValue;

          // Default to append text only when the textAfter the match does not
          // start with a whitespace character. However, this can be overridden
          // by the user.
          cmd({ appendText, ...attrs });

          // Reset the state, since the query has been exited.
          setState(null);
        };

        // Set the index to 0 (move to the first item in the items list) unless
        // the reason for the change was a cursor move within the same matching
        // area. In that case maintain the current index.
        const index = changeReason === ChangeReason.Move ? currentIndex : 0;

        // Update the active state after the change providing the command and
        // potentially updated index.
        setState({ reason: changeReason, index, name, query, text, range, command });

        return;
      }

      if (!exitReason || !onExit) {
        // Reset the state and do nothing when no onExit handler provided
        setState(null);
        return;
      }

      const exitCommand: MentionChangeHandlerCommand = (attrs) => {
        cmd({ appendText: '', ...attrs });
      };

      // Call the onExit handler.
      onExit({ reason: exitReason, index: currentIndex, name, query, text, range }, exitCommand);

      // Reset the state to remove the active query return.
      setState(null);
    },
    [onExit, currentIndex, setState],
  );

  // Add the handlers to the `MentionExtension`
  useExtension(MentionExtension, ({ addHandler }) => addHandler('onChange', onChange), [onChange]);
}

/**
 * This hook manages the keyboard interactions for the mention plugin.
 */
function useMentionKeyBindings(
  props: UseMentionProps,
  setState: SetMentionState,
  state: MentionState | null,
) {
  const { items, ignoreMatchesOnEscape = true } = props;
  const { helpers } = useRemirrorContext();

  const createArrowBinding = useCallback(
    (arrowKey: 'up' | 'down') => () => {
      // When there is no active state, there is nothing to do.
      if (!state) {
        return false;
      }

      const { index } = state;

      const direction = arrowKey === 'down' ? 'next' : 'previous';

      const activeIndex = indexFromArrowPress({
        direction,
        matchLength: items.length,
        previousIndex: index,
      });

      setState({ ...state, index: activeIndex });

      return true;
    },
    [items, setState, state],
  );

  const ArrowUp = useMemo(() => createArrowBinding('up'), [createArrowBinding]);
  const ArrowDown = useMemo(() => createArrowBinding('down'), [createArrowBinding]);

  /**
   * These are the keyBindings for mentions extension. This allows for
   * overriding
   */
  const bindings: KeyBindings = useMemo(
    () => ({
      /**
       * Handle the enter key being pressed
       */
      Enter: () => {
        if (!state) {
          // When there is no state, defer to the next keybinding.
          return false;
        }

        const { index, command } = state;

        const item = items[index];

        if (!item) {
          // Return since there's nothing that the enter key press can do.
          return false;
        }

        // Call the command with the item (including all the provided attributes which it includes).
        command(item);

        return true;
      },

      /**
       * Hide the suggesters when the escape key is pressed.
       */
      Escape: () => {
        if (!state) {
          return false;
        }

        const { range, name } = state;

        // TODO Revisit to see if the following is too extreme
        if (ignoreMatchesOnEscape) {
          // Ignore the current mention so that it doesn't show again for this
          // matching area
          helpers.getSuggestMethods().addIgnored({ from: range.from, name, specific: true });
        }

        // Remove the matches.
        setState(null);

        return true;
      },

      /**
       * Handle the up arrow being pressed
       */
      ArrowUp,

      /**
       * Handle the down arrow being pressed
       */
      ArrowDown,
    }),
    [ArrowUp, ArrowDown, state, items, ignoreMatchesOnEscape, setState, helpers],
  );

  // Attach the keybindings to the editor.
  useKeymap(bindings, ExtensionPriority.High);
}

type SetMentionState = Dispatch<SetStateAction<MentionState | null>>;

/**
 * A hook that provides the state for social mentions that responds to
 * keybindings and key-presses from the user.
 *
 * This is used by the `SocialMentionDropdown` component and can be used by you
 * for a customized component.
 *
 * The only prop required is the list of data in order to support keybinding and
 * properly selecting the index for you. The data must have a `label` and `id`
 * key. The label is the text that should be shown inside the mention and the
 * `id` is whatever unique identifier that can be used.
 *
 * You can also add other supported attributes which will be added to the
 * mention node, like `href` and whatever you decide.
 *
 * @param list - the list of data from which an index can be calculated. Must
 * include at least an `id` and a `label`.
 */
export function useMention<Data extends MentionExtensionAttributes = MentionExtensionAttributes>(
  props: UseMentionProps<Data>,
): MentionState | null {
  const [state, setState] = useState<MentionState | null>(null);

  useMentionChangeHandler(props, setState, state?.index);
  useMentionKeyBindings(props, setState, state);

  return state;
}

export interface UseMentionProps<
  Data extends MentionExtensionAttributes = MentionExtensionAttributes
> {
  /**
   * The list of data from which an index can be calculated. Must include at
   * least an `id` and a `label`.
   */
  items: Data[];

  /**
   * This method is called when a user induced exit happens before a mention has
   * been created. It receives the state, and gives the consumer of this hook
   * the opportunity to manually create their own mention
   *
   * Leave this undefined to ignore exits.
   *
   * To enable automatic exit handling. The following will automatically set the
   * id to be the query and the label to be the full matching text. Extra attrs
   * like `href` can be added by you to the attrs object parameter.
   *
   * ```ts
   * const mentionState = useMention({ items, onExit(_, command) => command(), });
   * ```
   */
  onExit?: UseMentionExitHandler<Data>;

  /**
   * Whether matches should be permanently ignored when the user presses escape.
   *
   * @default true
   */
  ignoreMatchesOnEscape?: boolean;
}

export type UseMentionExitHandler<
  Data extends MentionExtensionAttributes = MentionExtensionAttributes
> = (parameter: OnExitParameter<Data>, command: (attrs?: Partial<Data>) => void) => void;

type OnExitParameter<
  Data extends MentionExtensionAttributes = MentionExtensionAttributes
> = Replace<Omit<MentionState<Data>, 'command'>, { reason: ExitReason }>;
