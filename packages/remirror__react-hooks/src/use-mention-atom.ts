import { useCallback, useMemo, useState } from 'react';
import {
  MentionAtomChangeHandler,
  MentionAtomExtension,
  MentionAtomNodeAttributes,
} from '@remirror/extension-mention-atom';
import { ChangeReason, SuggestChangeHandlerProps } from '@remirror/pm/suggest';
import { useExtension, useHelpers } from '@remirror/react-core';

import {
  MenuNavigationOptions,
  useMenuNavigation,
  UseMenuNavigationReturn,
} from './use-menu-navigation';

export interface MentionAtomState<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
> extends Pick<SuggestChangeHandlerProps, 'name' | 'query' | 'text' | 'range'> {
  /**
   * The reason for the change.
   */
  reason: ChangeReason;

  /**
   * A command that will update the current matching region with the provided
   * attributes. To see what can be accomplished please inspect the type of the attrs which should be passed through.
   */
  command: (attrs: Data) => void;
}

export interface UseMentionAtomReturn<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
> extends UseMenuNavigationReturn<Data> {
  state: MentionAtomState<Data> | null;
}

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
  props: UseMentionAtomProps<Data>,
): UseMentionAtomReturn<Data> {
  const {
    ignoreMatchesOnDismiss = true,
    items,
    direction,
    dismissKeys,
    focusOnClick,
    submitKeys,
  } = props;
  const [state, setState] = useState<MentionAtomState<Data> | null>(null);
  const helpers = useHelpers();
  const isOpen = !!state;

  const onDismiss = useCallback(() => {
    if (!state) {
      return false;
    }

    const { range, name } = state;

    if (ignoreMatchesOnDismiss) {
      // Ignore the current mention so that it doesn't show again for this
      // matching area
      helpers.getSuggestMethods().addIgnored({ from: range.from, name, specific: true });
    }

    // Remove the matches.
    setState(null);

    return true;
  }, [helpers, ignoreMatchesOnDismiss, state]);

  const onSubmit = useCallback(
    (item: Data) => {
      if (!state) {
        // When there is no state, defer to the next keybinding.
        return false;
      }

      // TODO add option to override the submission here. Return true to
      // completely override.

      // Call the command with the item (including all the provided attributes
      // which it includes).
      state.command(item);

      return true;
    },
    [state],
  );

  const menu = useMenuNavigation<Data>({
    items,
    isOpen,
    onDismiss,
    onSubmit,
    direction,
    dismissKeys,
    focusOnClick,
    submitKeys,
  });
  const { setIndex } = menu;

  /**
   * The is the callback for when a suggestion is changed.
   */
  const onChange: MentionAtomChangeHandler = useCallback(
    (props, command) => {
      const { query, range, name, exitReason, changeReason, text } = props;

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

      if (changeReason !== ChangeReason.Move) {
        setIndex(0);
      }

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
      });
    },
    [setIndex],
  );

  // Add the handlers to the `MentionExtension`
  useExtension(MentionAtomExtension, ({ addHandler }) => addHandler('onChange', onChange), [
    onChange,
  ]);

  return useMemo(() => ({ ...menu, state }), [menu, state]);
}

export interface UseMentionAtomProps<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
> extends MenuNavigationOptions {
  /**
   * The list of data from which an index can be calculated. Must include at
   * least an `id` and a `label`.
   */
  items: Data[];

  /**
   * Whether matches should be permanently ignored when the user dismisses the
   * mention suggestion.
   *
   * @default true
   */
  ignoreMatchesOnDismiss?: boolean;
}

export type { MentionAtomNodeAttributes };
