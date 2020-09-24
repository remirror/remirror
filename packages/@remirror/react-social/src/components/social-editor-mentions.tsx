import { cx } from 'linaria';
import { Type, useMultishift } from 'multishift';
import React, { ComponentType, FC, useCallback, useEffect, useState } from 'react';

import type { MentionExtensionAttributes } from '@remirror/extension-mention';
import { useI18n } from '@remirror/react';
import { useEditorFocus } from '@remirror/react-hooks/use-editor-focus';
import { useMention, UseMentionProps } from '@remirror/react-hooks/use-mention';

import { messages } from '../social-messages';
import {
  mentionSuggestionsDropdownWrapperStyles,
  mentionSuggestionsItemStyles,
  mentionSuggestionsTagItemTagStyles,
  mentionSuggestionsUserItemDisplayNameStyles,
  mentionSuggestionsUserItemImageStyles,
  mentionSuggestionsUserItemUsernameStyles,
} from '../social-styles';
import type { MentionChangeParameter } from '../social-types';

export interface SocialMentionComponentProps extends UseMentionProps {
  onMentionChange?: (parameter: MentionChangeParameter | null) => void;
}

/**
 * The social mention component.
 *
 * It is responsible to displaying the drop down list of options when you want
 * to tag or add a user mention.
 */
export const SocialMentionComponent: FC<SocialMentionComponentProps> = (props) => {
  const state = useMention(props);
  const [isFocused, focus] = useEditorFocus();
  const [isClicking, setIsClicking] = useState(false);
  const { onMentionChange } = props;

  const createClickHandler = useCallback(
    (id: string, label: string) => () => {
      if (!state) {
        return;
      }

      // Trigger the command
      state.command({ id, label, replacementType: 'full' });

      // Refocus the editor
      focus();
    },
    [state, focus],
  );

  const onMouseDown = useCallback(() => {
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 2000);
  }, []);

  useEffect(() => {
    if (!onMentionChange) {
      return;
    }

    if (!state) {
      onMentionChange?.(null);
      return;
    }

    onMentionChange?.({
      index: state.index,
      name: state.name,
      query: state.query.full,
      command: state.command,
    });
  }, [state, onMentionChange]);

  if (!state || !(isFocused || isClicking)) {
    return null;
  }

  if (state.name === 'at') {
    return (
      <MentionDropdown
        onMouseDown={onMouseDown}
        activeIndex={state.index}
        items={props.items as MentionUserItem[]}
        getId={(item) => item.id}
        getLabel={(item) => `@${item.username}`}
        Component={UserMentionItem}
        createClickHandler={createClickHandler}
      />
    );
  }

  return (
    <MentionDropdown
      onMouseDown={onMouseDown}
      activeIndex={state.index}
      items={props.items as MentionTagItem[]}
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

type MentionTagItem = MentionExtensionAttributes & { href?: string; tag: string };

type MentionUserItem = MentionExtensionAttributes & {
  href?: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

interface UserMentionItemProps {
  item: MentionUserItem;
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
  item: MentionTagItem;
}

const TagMentionItem = (props: TagMentionItemProps) => {
  const { tag } = props.item;

  return <span className={mentionSuggestionsTagItemTagStyles}>{tag}</span>;
};
