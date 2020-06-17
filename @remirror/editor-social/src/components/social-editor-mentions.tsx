import { cx } from 'linaria';
import { Type, useMultishift } from 'multishift';
import React, { ComponentType, useCallback, useMemo, useRef } from 'react';
import useSetState from 'react-use/lib/useSetState';

import { isEmptyArray } from '@remirror/core';
import {
  MentionExitHandlerMethod,
  MentionExtension,
  MentionExtensionAttributes,
  MentionKeyBinding,
} from '@remirror/extension-mention';
import { SuggestChangeHandlerParameter, SuggestKeyBindingParameter } from '@remirror/pm/suggest';
import { useExtension, useI18n } from '@remirror/react';

import { messages } from '../social-editor-messages';
import {
  mentionSuggestionsDropdownWrapperStyles,
  mentionSuggestionsItemStyles,
  mentionSuggestionsTagItemTagStyles,
  mentionSuggestionsUserItemDisplayNameStyles,
  mentionSuggestionsUserItemImageStyles,
  mentionSuggestionsUserItemUsernameStyles,
} from '../social-editor-styles';
import { MatchName, MentionChangeParameter, TagData, UserData } from '../social-editor-types';
import { indexFromArrowPress, useSocialRemirror } from '../social-editor-utils';

interface MentionSuggestionProps {
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

type UseMentionState = ReturnType<typeof useMentionState>;

/**
 * Keep track of the state needed for mentions.
 */
function useMentionState() {
  const [state, setState] = useSetState<MentionsState>({
    index: 0,
    matcher: undefined,
    hideSuggestions: false,
  });

  const ignoreNextExit = useRef(false);
  const mention = useRef<SuggestChangeHandlerParameter>();

  return useMemo(() => ({ ...state, setState, ignoreNextExit, mention }), [state, setState]);
}

/**
 * This hook manages the keyboard interactions for the mention plugin.
 */
function useMentionKeyBindings(props: MentionSuggestionProps, state: UseMentionState) {
  const { setState, ignoreNextExit, index, hideSuggestions } = state;

  const createArrowBinding = useCallback(
    (direction: 'up' | 'down') => {
      return (parameter: SuggestKeyBindingParameter) => {
        const { queryText, suggester } = parameter;
        const name = suggester.name as MatchName;
        const { onChange, users, tags } = props;

        const matches = name === 'at' ? users : tags;

        if (hideSuggestions || isEmptyArray(matches)) {
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
    [hideSuggestions, index, props, setState],
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
        const { suggester, command } = parameter;
        const { char, name } = suggester;
        const { users, tags } = props;

        if (hideSuggestions) {
          return false;
        }

        const { label, id, href } = getMentionLabel({ name, users, index, tags });

        // Only continue if mention has an active selection and label.
        if (!label) {
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
    [ArrowDown, ArrowUp, hideSuggestions, ignoreNextExit, index, props, setState],
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
function useMentionHandlers(props: MentionSuggestionProps, state: UseMentionState) {
  const { setState, ignoreNextExit, mention, index } = state;

  /**
   * The is the callback for when a suggestion is changed.
   */
  const onChange = useCallback(
    (parameters: SuggestChangeHandlerParameter) => {
      const { queryText, suggester } = parameters;
      const name = suggester.name as MatchName;

      if (name) {
        const options = { name, query: queryText.full };
        props.onChange({ ...options, index });
      }

      // Reset the active index so that the dropdown is back to the top.
      setState({
        index: 0,
        matcher: name,
        hideSuggestions: false,
      });
      mention.current = parameters;
    },
    [props, setState, index, mention],
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
    [props, setState, mention, ignoreNextExit],
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

export const MentionSuggestions = (props: MentionSuggestionProps) => {
  const state = useMentionState();
  const { ignoreNextExit, mention, matcher, hideSuggestions, index } = state;
  const { commands, focus, view } = useSocialRemirror();

  const onClickFactory = useCallback(
    (id: string) => () => {
      if (!mention.current) {
        return;
      }

      const { suggester, range } = mention.current;
      const { char, name } = suggester;

      const parameters: MentionExtensionAttributes = {
        id,
        name,
        range,
        label: `${char}${id}`,
        replacementType: 'full',
        role: 'presentation',
        href: `/${id}`,
      };

      ignoreNextExit.current = true; // Prevents further `onExit` calls
      commands.updateMention(parameters);

      if (!view.hasFocus()) {
        focus();
      }
    },
    [commands, focus, ignoreNextExit, mention, view],
  );

  useMentionHandlers(props, state);
  useMentionKeyBindings(props, state);

  if (!matcher || hideSuggestions) {
    return null;
  }

  if (matcher === 'at') {
    return (
      <MentionDropdown
        activeIndex={index}
        items={props.users}
        getKey={(item) => item.username}
        Component={UserMentionItem}
        onClickFactory={onClickFactory}
      />
    );
  }

  return (
    <MentionDropdown
      activeIndex={index}
      items={props.tags}
      getKey={(item) => item.tag}
      Component={TagMentionItem}
      onClickFactory={onClickFactory}
    />
  );
};

interface MentionDropdownProps<Item> {
  items: Item[];
  getKey: (item: Item) => string;
  Component: ComponentType<{ item: Item }>;
  onClickFactory: (id: string) => () => void;
  activeIndex: number;
}

function MentionDropdown<Item>(props: MentionDropdownProps<Item>) {
  const { items, getKey, Component, onClickFactory, activeIndex } = props;

  const { getMenuProps, getItemProps, itemHighlightedAtIndex, hoveredIndex } = useMultishift({
    highlightedIndexes: [activeIndex],
    type: Type.ControlledMenu,
    items,
    isOpen: true,
  });

  return (
    <div className={mentionSuggestionsDropdownWrapperStyles} {...getMenuProps()} style={{}}>
      {items.map((item, index) => {
        const isHighlighted = itemHighlightedAtIndex(index);
        const id = getKey(item);
        const isHovered = index === hoveredIndex;
        return (
          <span
            key={id}
            {...getItemProps({
              onClick: onClickFactory(id),
              item: item,
              index: index,
              className: cx(
                mentionSuggestionsItemStyles,
                isHighlighted && 'highlighted',
                isHovered && 'hovered',
              ),
            })}
          >
            <Component item={item} />
          </span>
        );
      })}
    </div>
  );
}

interface UserMentionItemProps {
  item: UserData;
}

const UserMentionItem = (props: UserMentionItemProps) => {
  const { avatarUrl, displayName, username } = props.item;
  const { i18n } = useI18n();

  return (
    <>
      <img
        className={mentionSuggestionsUserItemImageStyles}
        src={avatarUrl}
        alt={i18n._(messages.userMentionAvatarAlt, { name: username })}
      />
      <span className={mentionSuggestionsUserItemDisplayNameStyles}>{displayName}</span>
      <span className={mentionSuggestionsUserItemUsernameStyles}>{username} </span>
    </>
  );
};

interface TagMentionItemProps {
  item: TagData;
}

const TagMentionItem = (props: TagMentionItemProps) => {
  const { tag } = props.item;

  return <span className={mentionSuggestionsTagItemTagStyles}>{tag}</span>;
};

interface GetMentionLabelParameter {
  /**
   * The name of the mention.
   */
  name: string;
  /**
   * The users.
   */
  users: UserData[];

  /**
   * The index for the mention.
   */
  index: number;
  /**
   * The tags in the mention.
   */
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
