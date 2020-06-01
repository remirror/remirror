import { EditorView, ProsemirrorAttributes } from '@remirror/core';
import { MentionExtensionAttributes } from '@remirror/extension-mention';
import { RemirrorContextProps, useRemirror } from '@remirror/react';

import { MentionGetterParameter, SocialCombinedUnion } from './social-types';

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

interface CreateOnClickMethodFactoryParameter extends MentionGetterParameter {
  setExitTriggeredInternally: () => void;
  view: EditorView;
  command: (attrs: ProsemirrorAttributes) => void;
}

/**
 * This method helps create the onclick factory method used by both types of suggesters supported
 */
export const createOnClickMethodFactory = ({
  getMention,
  setExitTriggeredInternally,
  view,
  command,
}: CreateOnClickMethodFactoryParameter) => (id: string) => () => {
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

export const useSocialRemirror = useRemirror as () => RemirrorContextProps<SocialCombinedUnion>;
