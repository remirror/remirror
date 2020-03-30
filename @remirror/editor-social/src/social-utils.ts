import { Attributes, EditorView } from '@remirror/core';
import { MentionExtensionAttributes } from '@remirror/extension-mention';

import { MentionGetterParams as MentionGetterParameters } from './social-types';

/**
 * Maps the items to items with an active property
 */
export const mapToActiveIndex = <GItem extends object>(
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

interface CreateOnClickMethodFactoryParams extends MentionGetterParams {
  setExitTriggeredInternally: () => void;
  view: EditorView;
  command(attrs: Attributes): void;
}

/**
 * This method helps create the onclick factory method used by both types of suggestions supported
 */
export const createOnClickMethodFactory = ({
  getMention,
  setExitTriggeredInternally,
  view,
  command,
}: CreateOnClickMethodFactoryParams) => (id: string) => () => {
  const {
    suggester: { char, name },
    range,
  } = getMention();
  const parameters: MentionExtensionAttributes = {
    id,
    label: `${char}${id}`,
    name,
    replacementType: 'full',
    range,
    role: 'presentation',
    href: `/${id}`,
  };
  setExitTriggeredInternally(); // Prevents further `onExit` calls
  command(parameters);
  if (!view.hasFocus()) {
    view.focus();
  }
};
