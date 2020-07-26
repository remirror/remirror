import { AnyCombinedUnion, getLazyArray, isRemirrorManager, RemirrorManager } from '@remirror/core';
import { SocialPreset } from '@remirror/preset-social';
import { CreateReactManagerOptions } from '@remirror/react';

import { CreateSocialManagerOptions, SocialCombinedUnion, TagData, UserData } from './social-types';

export function mapToActiveIndex<Item extends object>(
  items: Item[],
  activeIndex: number,
): Array<Item & { active: boolean }> {
  return items.map((item, index) => ({
    ...item,
    active: index === activeIndex,
  }));
}

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
  previousIndex: number;
}
export const indexFromArrowPress = (parameter: IndexFromArrowPressParameter) => {
  const { direction, matchLength, previousIndex } = parameter;

  return direction === 'down'
    ? previousIndex + 1 > matchLength - 1
      ? 0
      : previousIndex + 1
    : previousIndex - 1 < 0
    ? matchLength - 1
    : previousIndex - 1;
};

/**
 * Create the args which should be passed to the `useManager` hook or the
 * `createReactManager` function.
 */
export function socialManagerArgs<Combined extends AnyCombinedUnion>(
  combined: Combined[] | (() => Combined[]) | RemirrorManager<Combined | SocialCombinedUnion>,
  options: CreateSocialManagerOptions = {},
): [
  RemirrorManager<Combined | SocialCombinedUnion> | (() => Array<SocialPreset | Combined>),
  CreateReactManagerOptions?,
] {
  const { social, ...rest } = options;

  if (isRemirrorManager<Combined | SocialCombinedUnion>(combined)) {
    return [combined];
  }

  return [
    () => [...getLazyArray(combined), new SocialPreset(social)],
    {
      ...rest,
      managerSettings: {
        ...rest.managerSettings,
        extraAttributes: [
          { identifiers: ['mention', 'emoji'], attributes: { role: { default: 'presentation' } } },
          { identifiers: ['mention'], attributes: { href: { default: null } } },
          ...(rest.managerSettings?.extraAttributes ?? []),
        ],
      },
    },
  ];
}

interface GetMentionLabelParameter {
  /**
   * The name of the mention.
   */
  name: string;
  /**
   * The users.
   */
  users: UserData[];

  /**
   * The index for the mention.
   */
  index: number;
  /**
   * The tags in the mention.
   */
  tags: TagData[];
}

export function getMentionLabel(parameter: GetMentionLabelParameter) {
  const { name, users, index, tags } = parameter;
  const userData = name === 'at' && users.length > index ? users[index] : null;
  const tagData = name === 'tag' && tags.length > index ? tags[index] : null;
  const id = userData ? userData.id : tagData ? tagData.id : null;
  const label = userData ? userData.username : tagData ? tagData.tag : null;
  const href = userData ? userData.href : tagData ? tagData.href : null;

  return { label, id, href };
}
