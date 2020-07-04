import { css, cx } from 'linaria';
import { Type, useMultishift } from 'multishift';
import React from 'react';

import { usePositioner } from '@remirror/react';

import { useSocialRemirror } from '../hooks';
import { SocialEmojiState, useSocialEmoji } from '../hooks/use-social-emoji';
import {
  emojiSuggestionsDropdownWrapperStyles,
  emojiSuggestionsItemStyles,
} from '../social-styles';

const EmojiDropdown = (props: Required<SocialEmojiState>) => {
  const { index, command, list } = props;
  const { focus } = useSocialRemirror();
  const { ref, top, left } = usePositioner('popupMenu');

  const { getMenuProps, getItemProps, itemHighlightedAtIndex, hoveredIndex } = useMultishift({
    highlightedIndexes: [index],
    type: Type.ControlledMenu,
    items: list,
    isOpen: true,
  });

  return (
    <div
      {...getMenuProps({ ref })}
      className={emojiSuggestionsDropdownWrapperStyles}
      style={{
        top: top + 10,
        left,
      }}
    >
      {list.map((emoji, index) => {
        const isHighlighted = itemHighlightedAtIndex(index);
        const isHovered = index === hoveredIndex;
        return (
          <div
            key={emoji.name}
            className={cx(
              emojiSuggestionsItemStyles,
              isHighlighted && 'highlighted',
              isHovered && 'hovered',
            )}
            {...getItemProps({
              onClick: () => {
                command(emoji);
                focus();
              },
              item: emoji,
              index,
            })}
          >
            <span className={emojiSuggestionsItemChar}>{emoji.char}</span>
            <span className={emojiSuggestionsItemName}>:{emoji.name}:</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * This component renders the emoji suggestion dropdown for the user.
 */
export const SocialEmojiComponent = () => {
  const { index, list, command } = useSocialEmoji();

  if (!command) {
    return null;
  }

  return <EmojiDropdown list={list} index={index} command={command} />;
};

const emojiSuggestionsItemName = css`
  color: rgb(121, 129, 134);
`;

const emojiSuggestionsItemChar = css`
  font-size: 1.25em;
  padding-right: 5px;
`;
