import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

import { ExtensionPriority, KeyBindings } from '@remirror/core';
import {
  MentionAtomChangeHandler,
  MentionAtomExtension,
  MentionAtomNodeAttributes,
} from '@remirror/extension-mention-atom';
import { ChangeReason, SuggestChangeHandlerParameter } from '@remirror/pm/suggest';
import { useExtension, useRemirrorContext } from '@remirror/react';

import { indexFromArrowPress } from './react-hook-utils';
import { useKeymap } from './use-keymap';

export interface MentionAtomState<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes
> extends Pick<SuggestChangeHandlerParameter, 'name' | 'query' | 'text' | 'range'> {
  /**
   * The reason for the change.
   */
  reason: ChangeReason;

  /**
   * The index that should be matched.
   *
   * @default 0
   */
  index: number;

  /**
   * A command that will update the current matching region with the provided
   * attributes. To see what can be accomplished please inspect the type of the attrs which should be passed through.
   */
  command: (attrs: Data) => void;
}

/**
 * The hook for managing the mention keyboard handlers.
 */
function useMentionHandlers<Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes>(
  setState: SetMentionAtomState<Data>,
  currentIndex = 0,
): void {
  /**
   * The is the callback for when a suggestion is changed.
   */
  const onChange: MentionAtomChangeHandler = useCallback(
    (parameter, command) => {
      const { query, range, name, exitReason, changeReason, text } = parameter;

      // By default the mention atom will not automatically create the mention
      // for you.
      if (exitReason) {
        setState(null);

        return;
      }

      // This really should never be the case.
      if (!changeReason) {
        return;
      }

      // Set the index to 0 (move to the first item in the items list) unless
      // the reason for the change was a cursor move within the same matching
      // area. In that case maintain the current index.
      const index = changeReason === ChangeReason.Move ? currentIndex : 0;

      // Reset the active index so that the dropdown is back to the top.
      setState({
        query,
        range,
        name,
        reason: changeReason,
        text,
        command: (attrs) => {
          command(attrs);
          setState(null);
        },
        index,
      });
    },
    [currentIndex, setState],
  );

  // Add the handlers to the `MentionExtension`
  useExtension(MentionAtomExtension, ({ addHandler }) => addHandler('onChange', onChange), [
    onChange,
  ]);
}

/**
 * This hook manages the keyboard interactions for the mention plugin.
 */
function useMentionAtomKeyBindings<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes
>(
  props: MentionAtomProps<Data>,
  setState: SetMentionAtomState<Data>,
  state: MentionAtomState<Data> | null,
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
    [items.length, setState, state],
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

type SetMentionAtomState<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes
> = Dispatch<SetStateAction<MentionAtomState<Data> | null>>;

/**
 * A hook that provides the state for social mention atoms that responds to
 * keybindings and key-presses from the user.
 *
 * The difference between this and the `useMention` is that `useMention` creates
 * editable mentions that can be changed over an over again. This creates atom
 * mention which are inserted into the editor as non editable nodes. Backspacing
 * into this node will delete the whole mention.
 *
 * In order to properly support keybindings you will need to provide a list of
 * data that is to be shown to the user. This allows for the user to press the
 * arrow up and arrow down key.
 *
 * You can also add other supported attributes which will be added to the
 * mention node, like `href` and whatever you decide upon.
 *
 * @param props - the props that can be passed through to the mention atom.
 */

export function useMentionAtom<Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes>(
  props: MentionAtomProps<Data>,
): MentionAtomState<Data> | null {
  const [state, setState] = useState<MentionAtomState<Data> | null>(null);

  useMentionHandlers(setState);
  useMentionAtomKeyBindings(props, setState, state);

  return state;
}

interface MentionAtomProps<Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes> {
  /**
   * The list of data from which an index can be calculated. Must include at
   * least an `id` and a `label`.
   */
  items: Data[];

  /**
   * Whether matches should be permanently ignored when the user presses the
   * `Escape` key.
   *
   * @default true
   */
  ignoreMatchesOnEscape?: boolean;
}
