import { useCallback, useMemo } from 'react';

import { isEmptyArray, omit } from '@remirror/core';
import {
  MentionChangeHandlerParameter,
  MentionExitHandlerMethod,
  MentionExtension,
  MentionExtensionSuggestCommand,
  MentionKeyBinding,
  MentionKeyBindingParameter,
} from '@remirror/extension-mention';
import { useExtension, useSetState } from '@remirror/react';

import { MatchName, MentionChangeParameter, TagData, UserData } from '../social-types';
import { getMentionLabel, indexFromArrowPress } from '../social-utils';

export interface SocialMentionProps {
  /**
   * A list of users.
   */
  users: UserData[];

  /**
   * List of tags
   */
  tags: TagData[];

  /**
   * Called any time there is a change in the mention
   */
  onMentionChange: (params?: MentionChangeParameter) => void;
}

export interface SocialMentionState {
  /**
   * The name of the current matcher.
   *
   * @default undefined
   */
  matcher: 'at' | 'tag' | undefined;

  /**
   * The index that is matched.
   *
   * @default 0
   */
  index: number;

  /**
   * The command to run to create, update or remove the mention.
   *
   * @default undefined
   */
  command?: MentionExtensionSuggestCommand;
}

type UseMentionState = ReturnType<typeof useMentionState>;

/**
 * This hook manages the keyboard interactions for the mention plugin.
 */
function useMentionKeyBindings(props: SocialMentionProps, state: UseMentionState) {
  const { setState, index, command } = state;
  const shouldHideSuggestions = !command;

  const createArrowBinding = useCallback(
    (direction: 'up' | 'down') => {
      return (parameter: MentionKeyBindingParameter) => {
        const { queryText, suggester } = parameter;
        const name = suggester.name as MatchName;
        const { onMentionChange: onChange, users, tags } = props;

        const matches = name === 'at' ? users : tags;

        if (shouldHideSuggestions || isEmptyArray(matches)) {
          return false;
        }

        // pressed up arrow
        const activeIndex = indexFromArrowPress({
          direction,
          matchLength: matches.length,
          previousIndex: index,
        });

        setState({ index: activeIndex, matcher: name });
        onChange({
          name,
          query: queryText.full,
          index: activeIndex,
        });

        return true;
      };
    },
    [shouldHideSuggestions, index, props, setState],
  );

  const ArrowUp = useMemo(() => createArrowBinding('up'), [createArrowBinding]);
  const ArrowDown = useMemo(() => createArrowBinding('down'), [createArrowBinding]);

  /**
   * These are the keyBindings for mentions extension. This allows for
   * overriding
   */
  const keyBindings: MentionKeyBinding = useMemo(
    () => ({
      /**
       * Handle the enter key being pressed
       */
      Enter: (parameter) => {
        const { suggester, command, ignoreNextExit } = parameter;
        const { char, name } = suggester;
        const { users, tags } = props;

        if (shouldHideSuggestions) {
          return false;
        }

        const { label, id, href } = getMentionLabel({ name, users, index, tags });

        // Only continue if mention has an active selection and label.
        if (!label) {
          return false;
        }

        ignoreNextExit();

        command({
          replacementType: 'full',
          id: id ?? label,
          label: `${char}${label}`,
          role: 'presentation',
          href: href ?? `/${id ?? label}`,
        });

        setState({ index: 0, matcher: undefined, command: undefined });

        return true;
      },

      /**
       * Hide the suggesters when the escape key is pressed.
       */
      Escape: () => {
        setState(initialMentionState);
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
    [ArrowDown, ArrowUp, shouldHideSuggestions, index, props, setState],
  );

  useExtension(
    MentionExtension,
    ({ addCustomHandler }) => {
      return addCustomHandler('keyBindings', keyBindings);
    },
    [keyBindings],
  );
}

/**
 * The hook for managing the mention keyboard handlers.
 */
function useMentionHandlers(props: SocialMentionProps, state: UseMentionState) {
  const { setState, index } = state;

  /**
   * The is the callback for when a suggestion is changed.
   */
  const onChange = useCallback(
    (parameter: MentionChangeHandlerParameter) => {
      const { queryText, suggester, command, ignoreNextExit } = parameter;
      const name = suggester.name as MatchName;

      if (name) {
        const options = { name, query: queryText.full };
        props.onMentionChange({ ...options, index });
      }

      // Reset the active index so that the dropdown is back to the top.
      setState({
        index: 0,
        matcher: name,
        command: (parameter) => {
          setState({ index: 0, matcher: undefined, command: undefined });
          ignoreNextExit();
          command(parameter);
        },
      });
    },
    [props, setState, index],
  );

  /**
   * Called when the none of our configured matchers match
   */
  const onExit: MentionExitHandlerMethod = useCallback(
    (parameter) => {
      const { queryText, command } = parameter;

      command({
        role: 'presentation',
        href: `/${queryText.full}`,
        appendText: '',
      });

      setState({ index: 0, matcher: undefined, command: undefined });
      props.onMentionChange();
    },
    [props, setState],
  );

  // Add the handlers to the `MentionExtension`
  useExtension(
    MentionExtension,
    ({ addHandler }) => {
      const disposeChangeHandler = addHandler('onChange', onChange);
      const disposeExitHandler = addHandler('onExit', onExit);

      return () => {
        disposeChangeHandler();
        disposeExitHandler();
      };
    },
    [onChange, onExit],
  );
}

const initialMentionState: SocialMentionState = {
  index: 0,
  matcher: undefined,
  command: undefined,
};

function useMentionState() {
  const [state, setState] = useSetState<SocialMentionState>(initialMentionState);

  return useMemo(() => ({ ...state, setState }), [setState, state]);
}

/**
 * A hook that provides the state for social mentions that responds to
 * keybindings and keypresses from the user. This is used by the
 * `SocialMentionDropdown` component and can be used by you for a customised
 * component.
 */
export function useSocialMention(props: SocialMentionProps): SocialMentionState {
  const state = useMentionState();

  useMentionHandlers(props, state);
  useMentionKeyBindings(props, state);

  return omit(state, 'setState');
}
