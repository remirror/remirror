import { EmojiObject, EmojiSuggestCommand } from '@remirror/extension-emoji';
import { popupMenuPositioner, useRemirrorContext } from '@remirror/react';
import { useRemirrorTheme } from '@remirror/ui';
import { Type, useMultishift } from 'multishift';
import React, { FunctionComponent } from 'react';
import { DataParams, SocialExtensions } from '../social-types';

interface EmojiSuggestionsProps extends DataParams<EmojiObject> {
  highlightedIndex: number;
  command: EmojiSuggestCommand;
}

/**
 * Render the suggestions for tagging.
 */
export const EmojiSuggestions: FunctionComponent<EmojiSuggestionsProps> = ({
  data,
  highlightedIndex,
  command,
}) => {
  const { sxx } = useRemirrorTheme();
  const { view, getPositionerProps } = useRemirrorContext<SocialExtensions>();
  const { getMenuProps, getItemProps, itemHighlightedAtIndex, hoveredIndex } = useMultishift({
    highlightedIndexes: [highlightedIndex],
    type: Type.ControlledMenu,
    items: data,
    isOpen: true,
  });
  const { top, left, ref } = getPositionerProps({
    ...popupMenuPositioner,
    positionerId: 'emojiPopupMenu',
  });
  return (
    <div
      {...getMenuProps({ ref })}
      className='remirror-dropdown-item-wrapper'
      css={sxx({
        position: 'absolute',
        width: 'max-content',
        py: 1,
        margin: '0 auto',
        borderRadius: 1,
        boxShadow: 'card',
        zIndex: '10',
        top: top + 10,
        left,
        maxHeight: '250px',
        overflowY: 'scroll',
      })}
    >
      {data.map((emoji, index) => {
        const isHighlighted = itemHighlightedAtIndex(index);
        const isHovered = index === hoveredIndex;
        return (
          <div
            key={emoji.name}
            css={sxx({
              backgroundColor: isHighlighted ? 'grey' : isHovered ? 'light' : 'background',
              p: 2,
              textOverflow: 'ellipsis',
              maxWidth: '250px',
              width: '250px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            })}
            {...getItemProps({
              className: `suggestions-item${isHighlighted ? ' active' : ''}`,
              onClick: () => {
                command(emoji);
                view.focus();
              },
              item: emoji,
              index,
            })}
          >
            <span css={sxx({ fontSize: '1.25em' })}>{emoji.char}</span>{' '}
            <span css={sxx({ color: 'darkGrey' })}>:{emoji.name}:</span>
          </div>
        );
      })}
    </div>
  );
};
