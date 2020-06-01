import React, { FC, useCallback, useMemo, useRef } from 'react';

import { isEmptyArray } from '@remirror/core';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExitHandlerMethod } from '@remirror/extension-mention';
import {
  SuggestChangeHandlerParameter,
  SuggestKeyBindingMap,
  SuggestKeyBindingParameter,
} from '@remirror/pm/suggest';
import { useExtension, useSetState } from '@remirror/react';

import { MatchName, MentionChangeParameter, TagData, UserData } from '../../social-types';
import { indexFromArrowPress } from '../../social-utils';

interface MentionsProps {
  /**
   * List of users
   */
  users: UserData[];

  /**
   * List of tags
   */
  tags: TagData[];

  /**
   * Called any time there is a change in the mention
   */
  onChange: (params?: MentionChangeParameter) => void;
}
interface MentionsState {
  matcher: 'at' | 'tag' | undefined;
  index: number;
  hideSuggestions: boolean;
}
export const Mentions: FC<MentionsProps> = (props) => {
  const [state, setState] = useSetState<MentionsState>({
    index: 0,
    matcher: undefined,
    hideSuggestions: false,
  });

  // When true, ignore the next exit to prevent double exits after a user interaction.
  const ignoreNextExit = useRef(false);

  const mention = useRef<SuggestChangeHandlerParameter>();

  const createArrowBinding = useCallback(
    (direction: 'up' | 'down') => {
      return (parameter: SuggestKeyBindingParameter) => {
        const { queryText, suggester } = parameter;
        const name = suggester.name as MatchName;
        const { index, hideSuggestions } = state;
        const { onChange, users, tags } = props;

        const matches = name === 'at' ? users : tags;

        if (hideSuggestions || isEmptyArray(matches)) {
          return false;
        }

        // pressed up arrow
        const activeIndex = indexFromArrowPress({
          direction,
          matchLength: matches.length,
          prevIndex: index,
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
    [props, setState, state],
  );

  const ArrowUp = useMemo(() => createArrowBinding('up'), [createArrowBinding]);
  const ArrowDown = useMemo(() => createArrowBinding('down'), [createArrowBinding]);

  /**
   * These are the keyBindings for mentions extension. This allows for
   * overriding
   */
  const keyBindings: SuggestKeyBindingMap = useMemo(
    () => ({
      /**
       * Handle the enter key being pressed
       */
      Enter: (parameter) => {
        const { suggester, command } = parameter;
        const { char, name } = suggester;
        const { index, hideSuggestions } = state;
        const { users, tags } = props;

        if (hideSuggestions) {
          return false;
        }

        const { label, id, href } = getMentionLabel({ name, users, index, tags });

        // Only continue if user has an active selection and label.
        if (!label || !index) {
          return false;
        }

        ignoreNextExit.current = true;

        command({
          replacementType: 'full',
          id: id ?? label,
          label: `${char}${label}`,
          role: 'presentation',
          href: href ?? `/${id ?? label}`,
        });

        return true;
      },

      /**
       * Hide the suggesters when the escape key is pressed.
       */
      Escape: ({ suggester: { name } }) => {
        const matches = name === 'at' ? props.users : props.tags;

        if (isEmptyArray(matches)) {
          return false;
        }

        setState({ hideSuggestions: true });
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
    [ArrowDown, ArrowUp, props, setState, state, ignoreNextExit],
  );

  /**
   * The is the callback for when a suggestion is changed.
   */
  const onChange = useCallback(
    (parameters: SuggestChangeHandlerParameter) => {
      const { queryText, suggester } = parameters;
      const name = suggester.name as MatchName;

      if (name) {
        const options = { name, query: queryText.full };
        props.onChange({ ...options, index: state.index });
      }

      // Reset the active index so that the dropdown is back to the top.
      setState({
        index: 0,
        matcher: name,
        hideSuggestions: false,
      });

      mention.current = parameters;
    },
    [props, setState, state.index],
  );

  /**
   * Called when the none of our configured matchers match
   */
  const onExit: MentionExitHandlerMethod = useCallback(
    (parameters) => {
      const { queryText, command } = parameters;

      // Check whether we've manually caused this exit. If not, trigger the
      // command.
      if (!ignoreNextExit.current) {
        command({
          role: 'presentation',
          href: `/${queryText.full}`,
          appendText: '',
        });
      }

      props.onChange();
      setState({ index: 0, matcher: undefined });
      mention.current = undefined;
      ignoreNextExit.current = false;
    },
    [props, setState],
  );

  useExtension(
    EmojiExtension,
    ({ addCustomHandler, addHandler }) => {
      const disposeBindings = addCustomHandler('suggestionKeyBindings', keyBindings);
      const disposeChangeHandler = addHandler('onSuggestionChange', onChange);
      const disposeExitHandler = addHandler('onSuggestionExit', onExit);

      return () => {
        disposeBindings();
        disposeChangeHandler();
        disposeExitHandler();
      };
    },
    [keyBindings, onChange, onExit],
  );

  if (!state.matcher || state.hideSuggestions) {
    return null;
  }

  if (state.matcher === 'at') {
    return <AtSuggestions data={props.users} ignoreNextExit={ignoreNextExit} mention={mention} />;
  }

  return <TagSuggestions data={props.tags} ignoreNextExit={ignoreNextExit} mention={mention} />;
};

interface GetMentionLabelParameter {
  name: string;
  users: UserData[];
  index: number;
  tags: TagData[];
}

function getMentionLabel(parameter: GetMentionLabelParameter) {
  const { name, users, index, tags } = parameter;
  const userData = name === 'at' && users.length > index ? users[index] : null;
  const tagData = name === 'tag' && tags.length > index ? tags[index] : null;

  const id = userData ? userData.id : tagData ? tagData.id : null;
  const label = userData ? userData.username : tagData ? tagData.tag : null;
  const href = userData ? userData.href : tagData ? tagData.href : null;
  return { label, id, href };
}
