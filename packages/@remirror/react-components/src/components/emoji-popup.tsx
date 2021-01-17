import { cx } from 'linaria';
import { Type, useMultishift } from 'multishift';
import React, { FC } from 'react';

import { FlatEmojiWithUrl, useEmoji } from '@remirror/react-hooks';
import { ExtensionEmoji } from '@remirror/theme';

import { FloatingWrapper } from '../floating-menu';

/**
 * Display the image for the emoji displayed via the CDN.
 */
const EmojiFromCdn = (props: FlatEmojiWithUrl): JSX.Element => {
  return (
    <img
      role='presentation'
      className={ExtensionEmoji.EMOJI_IMAGE}
      aria-label={props.annotation}
      alt={props.annotation}
      src={props.url}
    />
  );
};

/**
 * This component renders the emoji suggestion dropdown for the user.
 */
export const SocialEmojiComponent: FC = () => {
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
                  ExtensionEmoji.EMOJI_POPUP_ITEM,
                  isHighlighted && ExtensionEmoji.EMOJI_POPUP_HIGHLIGHT,
                  isHovered && ExtensionEmoji.EMOJI_POPUP_HOVERED,
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
                <span className={ExtensionEmoji.EMOJI_POPUP_CHAR}>
                  <EmojiFromCdn {...emoji} />
                </span>
                <span className={ExtensionEmoji.EMOJI_POPUP_NAME}>:{shortcode}:</span>
              </div>
            );
          })}
      </div>
    </FloatingWrapper>
  );
};
