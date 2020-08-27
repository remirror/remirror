import matchSorter from 'match-sorter';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { startCase, take } from '@remirror/core';
import type { UseMentionExitHandler } from '@remirror/react-hooks/use-mention';
import { MentionChangeParameter, SocialEditor, SocialProviderProps } from '@remirror/react-social';

import { fakeUsers } from './data/fake-users';

const fakeTags = [
  'Tags',
  'Fake',
  'Help',
  'TypingByHand',
  'DontDoThisAgain',
  'ZoroIsAwesome',
  'ThisIsATagList',
  'NeedsStylingSoon',
  'LondonHits',
  'MCM',
].map((tag) => ({
  label: `#${tag}`,
  href: `/tag/${tag}`,
  id: tag,
  tag,
}));

const userData = fakeUsers.results.map((user) => ({
  avatarUrl: user.picture.thumbnail,
  displayName: startCase(`${user.name.first} ${user.name.last}`),
  id: user.login.uuid,
  label: `@${user.login.username}`,
  username: user.login.username,
  href: `/u/${user.login.username}`,
}));

export const ExampleSocialEditor: FC<Partial<SocialProviderProps>> = (props) => {
  const [mention, setMention] = useState<MentionChangeParameter | null>(null);

  const onChange = useCallback((parameter: MentionChangeParameter | null) => {
    setMention(parameter);
  }, []);

  const onExit: UseMentionExitHandler = useCallback(({ query }, command) => {
    command({ href: `/${query.full}` });
  }, []);

  const items = useMemo(() => {
    if (mention?.name === 'at' && mention.query) {
      return (
        take(matchSorter(userData, mention.query, { keys: ['username', 'displayName'] }), 6) ?? []
      );
    }

    if (mention?.name === 'tag' && mention.query) {
      return take(matchSorter(fakeTags, mention.query), 6) ?? [];
    }

    return [];
  }, [mention]);

  return (
    <SocialEditor
      {...props}
      attributes={{ 'data-testid': 'react-social' }}
      items={items}
      onMentionChange={onChange}
      onExit={onExit}
    />
  );
};

export const SOCIAL_SHOWCASE_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'mention',
              attrs: {
                id: 'blueladybug185',
                label: '@blueladybug185',
                name: 'at',
                href: '/blueladybug185',
                role: 'presentation',
              },
            },
          ],
          text: '@blueladybug185',
        },
        {
          type: 'text',
          text: ' has proven to me most helpful!',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'autoLink',
              attrs: {
                href: 'http://Random.com',
              },
            },
          ],
          text: 'Random.com',
        },
        {
          type: 'text',
          text: ' on the other hand has not.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Emojis still make me smile 😋 🙈',
        },
        {
          type: 'text',
          text: " and I'm here for that.",
        },
      ],
    },
  ],
};

export { fakeUsers, fakeTags, userData };
