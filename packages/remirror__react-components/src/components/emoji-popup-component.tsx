import { cx } from 'linaria';
import { Type, useMultishift } from 'multishift';
import React, { FC } from 'react';
import { useCommands } from '@remirror/react-core';
import { FlatEmojiWithUrl, useEmoji } from '@remirror/react-hooks';
import { ExtensionEmojiTheme } from '@remirror/theme';

import { FloatingWrapper } from '../floating-menu';

/**
 * Display the image for the emoji displayed via the CDN.
 */
const EmojiFromCdn = (props: FlatEmojiWithUrl): JSX.Element => {
  return (
    <img
      role='presentation'
      className={ExtensionEmojiTheme.EMOJI_IMAGE}
      aria-label={props.annotation}
      alt={props.annotation}
      src={props.url}
    />
  );
};

/**
 * This component renders the emoji suggestion dropdown for the user.
 */
export const EmojiPopupComponent: FC = () => {
  const { focus } = useCommands();
  const state = useEmoji();
  const enabled = !!state;

  const { getMenuProps, getItemProps, itemHighlightedAtIndex, hoveredIndex } = useMultishift({
    highlightedIndexes: [state?.index ?? 0],
    type: Type.ControlledMenu,
    items: state?.list ?? [],
    isOpen: true,
  });

  return (
    <FloatingWrapper positioner='nearestWord' enabled={enabled} placement='auto-end'>
      <div {...getMenuProps()}>
        {enabled &&
          (state?.list ?? []).map((emoji, index) => {
            const isHighlighted = itemHighlightedAtIndex(index);
            const isHovered = index === hoveredIndex;
            const shortcode = emoji.shortcodes?.[0] ?? emoji.annotation;

            return (
              <div
                key={emoji.emoji}
                className={cx(
                  ExtensionEmojiTheme.EMOJI_POPUP_ITEM,
                  isHighlighted && ExtensionEmojiTheme.EMOJI_POPUP_HIGHLIGHT,
                  isHovered && ExtensionEmojiTheme.EMOJI_POPUP_HOVERED,
                )}
                {...getItemProps({
                  onClick: () => {
                    state?.apply(emoji.emoji);
                    focus();
                  },
                  item: emoji,
                  index,
                })}
              >
                <span className={ExtensionEmojiTheme.EMOJI_POPUP_CHAR}>
                  <EmojiFromCdn {...emoji} />
                </span>
                <span className={ExtensionEmojiTheme.EMOJI_POPUP_NAME}>:{shortcode}:</span>
              </div>
            );
          })}
      </div>
    </FloatingWrapper>
  );
};
