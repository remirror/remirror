interface IndexFromArrowPressParameter {
  /**
   * Depending on the application the arrow key pressed could be an up or down
   * arrow and it's up to you to translate that to next and previous.
   *
   * Down should be considered next.
   */
  direction: 'next' | 'previous';

  /**
   * The total number of matches
   */
  matchLength: number;

  /**
   * The previously matched index
   */
  previousIndex: number;
}

/**
 * Get the next index from an arrow key press.
 */
export function indexFromArrowPress(parameter: IndexFromArrowPressParameter): number {
  const { direction, matchLength, previousIndex } = parameter;

  return direction === 'next'
    ? previousIndex + 1 > matchLength - 1
      ? 0
      : previousIndex + 1
    : previousIndex - 1 < 0
    ? matchLength - 1
    : previousIndex - 1;
}
