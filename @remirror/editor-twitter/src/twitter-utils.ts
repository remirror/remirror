/**
 * Maps the items to items with an active property
 */
export const mapToActiveIndex = <GItem extends {}>(
  items: GItem[],
  activeIndex: number,
): Array<GItem & { active: boolean }> => {
  return items.map((item, index) => ({
    ...item,
    active: index === activeIndex,
  }));
};

interface CalculateNewIndexFromArrowPressParams {
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
export const calculateNewIndexFromArrowPress = ({
  direction,
  matchLength,
  prevIndex,
}: CalculateNewIndexFromArrowPressParams) =>
  direction === 'down'
    ? prevIndex + 1 > matchLength - 1
      ? 0
      : prevIndex + 1
    : prevIndex - 1 < 0
    ? matchLength - 1
    : prevIndex - 1;
