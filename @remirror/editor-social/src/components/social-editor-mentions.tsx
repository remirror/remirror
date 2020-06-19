import { cx } from 'linaria';
import { Type, useMultishift } from 'multishift';
import React, { ComponentType, useCallback, useMemo } from 'react';

import { isEmptyArray } from '@remirror/core';
import {
  MentionChangeHandlerParameter,
  MentionExitHandlerMethod,
  MentionExtension,
  MentionExtensionSuggestCommand,
  MentionKeyBinding,
  MentionKeyBindingParameter,
} from '@remirror/extension-mention';
import { PartialDispatch, useExtension, useI18n, useSetState } from '@remirror/react';

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
interface MentionState {
  matcher: 'at' | 'tag' | undefined;
  index: number;
  hideSuggestions: boolean;
  command?: MentionExtensionSuggestCommand;
}

interface UseMentionState extends MentionState {
  setState: PartialDispatch<MentionState>;
}

/**
 * This hook manages the keyboard interactions for the mention plugin.
 */
function useMentionKeyBindings(props: MentionSuggestionProps, state: UseMentionState) {
  const { setState, index, hideSuggestions } = state;

  const createArrowBinding = useCallback(
    (direction: 'up' | 'down') => {
      return (parameter: MentionKeyBindingParameter) => {
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
    [ArrowDown, ArrowUp, hideSuggestions, index, props, setState],
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
  const { setState, index } = state;

  /**
   * The is the callback for when a suggestion is changed.
   */
  const onChange = useCallback(
    (parameter: MentionChangeHandlerParameter) => {
      const { queryText, suggester, command } = parameter;
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
        command,
      });
    },
    [props, setState, index],
  );

  /**
   * Called when the none of our configured matchers match
   */
  const onExit: MentionExitHandlerMethod = useCallback(() => {
    setState({ index: 0, matcher: undefined, command: undefined });
    props.onChange();
  }, [props, setState]);

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

const initialMentionState = {
  index: 0,
  matcher: undefined,
  hideSuggestions: false,
  command: undefined,
};

export const MentionSuggestions = (props: MentionSuggestionProps) => {
  const [state, setState] = useSetState<MentionState>(initialMentionState);

  const { command, matcher, hideSuggestions, index } = state;

  useMentionHandlers(props, { ...state, setState });
  useMentionKeyBindings(props, { ...state, setState });

  if (!matcher || hideSuggestions || !command) {
    return null;
  }

  if (matcher === 'at') {
    return (
      <MentionDropdown
        activeIndex={index}
        items={props.users}
        getId={(item) => item.username}
        getLabel={(item) => `@${item.username}`}
        Component={UserMentionItem}
        command={command}
      />
    );
  }

  return (
    <MentionDropdown
      activeIndex={index}
      items={props.tags}
      getId={(item) => item.tag}
      getLabel={(item) => `#${item.tag}`}
      Component={TagMentionItem}
      command={command}
    />
  );
};

interface MentionDropdownProps<Item> {
  items: Item[];
  getId: (item: Item) => string;
  getLabel: (item: Item) => string;
  Component: ComponentType<{ item: Item }>;
  command: MentionExtensionSuggestCommand;
  activeIndex: number;
}

function MentionDropdown<Item>(props: MentionDropdownProps<Item>) {
  const { items, getId, getLabel, Component, command, activeIndex } = props;
  const { focus } = useSocialRemirror();

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
        const id = getId(item);
        const label = getLabel(item);
        const isHovered = index === hoveredIndex;
        return (
          <span
            key={id}
            {...getItemProps({
              onClick: () => {
                command({ id, label, replacementType: 'full' });
                focus();
              },
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
