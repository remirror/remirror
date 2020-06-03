import classNames from 'classnames';
import { Type, useMultishift } from 'multishift';
import React, { ComponentType, useCallback, useMemo, useRef } from 'react';

import { isEmptyArray } from '@remirror/core';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExitHandlerMethod, MentionExtensionAttributes } from '@remirror/extension-mention';
import {
  SuggestChangeHandlerParameter,
  SuggestKeyBindingMap,
  SuggestKeyBindingParameter,
} from '@remirror/pm/suggest';
import { useExtension, useSetState } from '@remirror/react';

import { MatchName, MentionChangeParameter, TagData, UserData } from '../social-types';
import { indexFromArrowPress, useSocialRemirror } from '../social-utils';

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

function useMentionKeyBindings(props: MentionSuggestionProps) {
  const { setState, ignoreNextExit, index, hideSuggestions } = useMentionState();

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
    [hideSuggestions, index, props, setState],
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
    [ArrowDown, ArrowUp, hideSuggestions, ignoreNextExit, index, props, setState],
  );

  useExtension(
    EmojiExtension,
    ({ addCustomHandler }) => {
      return addCustomHandler('suggestionKeyBindings', keyBindings);
    },
    [keyBindings],
  );
}

function useMentionHandlers(props: MentionSuggestionProps) {
  const { setState, ignoreNextExit, mention, index } = useMentionState();

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

  useExtension(
    EmojiExtension,
    ({ addHandler }) => {
      const disposeChangeHandler = addHandler('onSuggestionChange', onChange);
      const disposeExitHandler = addHandler('onSuggestionExit', onExit);

      return () => {
        disposeChangeHandler();
        disposeExitHandler();
      };
    },
    [onChange, onExit],
  );
}

export const MentionSuggestions = (props: MentionSuggestionProps) => {
  const { ignoreNextExit, mention, matcher, hideSuggestions } = useMentionState();
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

  useMentionHandlers(props);
  useMentionKeyBindings(props);

  if (!matcher || hideSuggestions) {
    return null;
  }

  if (matcher === 'at') {
    return (
      <MentionDropdown
        items={props.users}
        getKey={(item) => item.username}
        Component={UserMentionItem}
        onClickFactory={onClickFactory}
      />
    );
  }

  return (
    <MentionDropdown
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
}

function MentionDropdown<Item>(props: MentionDropdownProps<Item>) {
  const { items, getKey, Component, onClickFactory } = props;
  const { index } = useMentionState();

  const { getMenuProps, getItemProps, itemHighlightedAtIndex, hoveredIndex } = useMultishift({
    highlightedIndexes: [index],
    type: Type.ControlledMenu,
    items,
    isOpen: true,
  });

  return (
    <div className='mention-suggestions-dropdown-wrapper' {...getMenuProps()} style={{}}>
      {items.map((item, ii) => {
        const isHighlighted = itemHighlightedAtIndex(index);
        const id = getKey(item);
        const isHovered = index === hoveredIndex;
        return (
          <span
            key={id}
            {...getItemProps({
              onClick: onClickFactory(id),
              item: item,
              index: ii,
              className: classNames({
                'mention-item': true,
                highlighted: isHighlighted,
                hovered: isHovered,
              }),
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

  return (
    <>
      <img className='mention-user-item-image' src={avatarUrl} alt={`Avatar for ${displayName}`} />
      <span className='mention-user-item-display-name'>{displayName}</span>
      <span className='mention-user-item-username'>{username} </span>
    </>
  );
};

interface TagMentionItemProps {
  item: TagData;
}

const TagMentionItem = (props: TagMentionItemProps) => {
  const { tag } = props.item;

  return <span className='mention-tag-item-tag'>{tag}</span>;
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
