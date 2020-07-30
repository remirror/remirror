import { cx } from 'linaria';
import { Type, useMultishift } from 'multishift';
import React, { ComponentType, useCallback, useState } from 'react';

import { useI18n } from '@remirror/react';

import { useSocialRemirror } from '../hooks';
import { SocialMentionProps, useSocialMention } from '../hooks/use-social-mention';
import { messages } from '../social-messages';
import {
  mentionSuggestionsDropdownWrapperStyles,
  mentionSuggestionsItemStyles,
  mentionSuggestionsTagItemTagStyles,
  mentionSuggestionsUserItemDisplayNameStyles,
  mentionSuggestionsUserItemImageStyles,
  mentionSuggestionsUserItemUsernameStyles,
} from '../social-styles';
import { TagData, UserData } from '../social-types';

/**
 * The social mention component.
 *
 * It is responsible to displaying the drop down list of options when you want
 * to tag or add a user mention.
 */
export const SocialMentionComponent = (props: SocialMentionProps) => {
  const state = useSocialMention(props);
  const { focus } = useSocialRemirror();
  const { command, matcher, index, show } = state;
  const [isClicking, setIsClicking] = useState(false);

  const createClickHandler = useCallback(
    (id: string, label: string) => () => {
      if (!command) {
        return;
      }

      // Trigger the command
      command({ id, label, replacementType: 'full' });

      // Refocus the editor
      focus();
    },
    [command, focus],
  );

  const onMouseDown = useCallback(() => {
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 2000);
  }, []);

  if (!matcher || !command || !(show || isClicking)) {
    return null;
  }

  if (matcher === 'at') {
    return (
      <MentionDropdown
        onMouseDown={onMouseDown}
        activeIndex={index}
        items={props.users}
        getId={(item) => item.username}
        getLabel={(item) => `@${item.username}`}
        Component={UserMentionItem}
        createClickHandler={createClickHandler}
      />
    );
  }

  return (
    <MentionDropdown
      onMouseDown={onMouseDown}
      activeIndex={index}
      items={props.tags}
      getId={(item) => item.tag}
      getLabel={(item) => `#${item.tag}`}
      Component={TagMentionItem}
      createClickHandler={createClickHandler}
    />
  );
};

interface MentionDropdownProps<Item> {
  onMouseDown: () => void;
  items: Item[];
  getId: (item: Item) => string;
  getLabel: (item: Item) => string;
  Component: ComponentType<{ item: Item }>;
  createClickHandler: (id: string, label: string) => () => void;
  activeIndex: number;
}

function MentionDropdown<Item>(props: MentionDropdownProps<Item>) {
  const { items, getId, getLabel, Component, createClickHandler, activeIndex, onMouseDown } = props;

  const { getMenuProps, getItemProps, itemHighlightedAtIndex, hoveredIndex } = useMultishift({
    highlightedIndexes: [activeIndex],
    type: Type.ControlledMenu,
    items,
    isOpen: true,
  });

  return (
    <div className={mentionSuggestionsDropdownWrapperStyles} {...getMenuProps({ onMouseDown })}>
      {items.map((item, index) => {
        const isHighlighted = itemHighlightedAtIndex(index);
        const id = getId(item);
        const label = getLabel(item);
        const isHovered = index === hoveredIndex;
        return (
          <span
            key={id}
            {...getItemProps({
              onClick: createClickHandler(id, label),
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
