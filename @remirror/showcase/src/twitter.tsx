import React, { useState } from 'react';

import {
  ActiveTagData,
  ActiveUserData,
  OnMentionChangeParams,
  TwitterEditor,
  UserData,
} from '@remirror/editor-twitter';
import emojiData from 'emoji-mart/data/all.json';

import { startCase, take } from '@remirror/core';
import matchSorter from 'match-sorter';
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
];

const userData: UserData[] = fakeUsers.results.map(
  (user): UserData => ({
    avatarUrl: user.picture.thumbnail,
    displayName: startCase(`${user.name.first} ${user.name.last}`),
    uid: user.login.uuid,
    username: user.login.username,
  }),
);

export const ExampleTwitterEditor = () => {
  const [mention, setMention] = useState<OnMentionChangeParams>();

  const onChange = (params: OnMentionChangeParams) => {
    setMention(params);
  };

  const userMatches: ActiveUserData[] =
    mention && mention.name === 'at' && mention.query.length
      ? take(matchSorter(userData, mention.query, { keys: ['username', 'displayName'] }), 6).map(
          (user, index) => ({ ...user, active: index === mention.activeIndex }),
        )
      : [];

  const tagMatches: ActiveTagData[] =
    mention && mention.name === 'tag' && mention.query.length
      ? take(matchSorter(fakeTags, mention.query), 6).map((tag, index) => ({
          tag,
          active: index === mention.activeIndex,
        }))
      : [];

  return (
    <TwitterEditor
      emojiData={emojiData}
      attributes={{ 'data-testid': 'editor-twitter' }}
      userData={userMatches}
      tagData={tagMatches}
      onMentionChange={onChange}
    />
  );
};
