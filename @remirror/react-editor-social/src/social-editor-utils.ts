import { useRemirror, UseRemirrorType } from '@remirror/react';

import { SocialCombinedUnion } from './social-editor-types';

/**
 * Maps the items to items with an active property
 */
export const mapToActiveIndex = <Item extends object>(
  items: Item[],
  activeIndex: number,
): Array<Item & { active: boolean }> => {
  return items.map((item, index) => ({
    ...item,
    active: index === activeIndex,
  }));
};

interface IndexFromArrowPressParameter {
  /**
   * Whether the arrow key was the up key or the down key
   */
  direction: 'up' | 'down';

  /**
   * The total number of matches
   */
  matchLength: number;

  /**
   * The previously matched index
   */
  prevIndex: number;
}
export const indexFromArrowPress = ({
  direction,
  matchLength,
  prevIndex,
}: IndexFromArrowPressParameter) =>
  direction === 'down'
    ? prevIndex + 1 > matchLength - 1
      ? 0
      : prevIndex + 1
    : prevIndex - 1 < 0
    ? matchLength - 1
    : prevIndex - 1;

export const useSocialRemirror = useRemirror as UseRemirrorType<SocialCombinedUnion>;
