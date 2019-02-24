import React, { useState } from 'react';

import {
  ActiveTwitterTagData,
  ActiveTwitterUserData,
  OnQueryChangeParams,
  TwitterUI,
  TwitterUserData,
} from '@remirror/twitter-ui';
import { take } from 'lodash';

import matchSorter from 'match-sorter';
import { fakeUsers } from '../data/fake-users';

const fakeTags = ['Tags', 'Fake', 'Help', 'TypingByHand', 'DontDoThisAgain'];

const userData: TwitterUserData[] = fakeUsers.results.map(
  (user): TwitterUserData => ({
    avatarUrl: user.picture.thumbnail,
    displayName: `${user.name.first} ${user.name.last}`,
    uid: user.login.uuid,
    username: user.login.username,
  }),
);

export const ExampleTwitterUI = () => {
  const [mention, setMention] = useState<OnQueryChangeParams>();

  const onMentionStateChange = (params: OnQueryChangeParams) => {
    console.log(params);
    setMention(params);
  };

  const userMatches: ActiveTwitterUserData[] =
    mention && mention.type === 'at' && mention.query.length
      ? take(matchSorter(userData, mention.query, { keys: ['username', 'displayName'] }), 6).map(
          (user, index) => ({ ...user, active: index === mention.activeIndex }),
        )
      : [];

  const tagMatches: ActiveTwitterTagData[] =
    mention && mention.type === 'hash' && mention.query.length
      ? take(matchSorter(fakeTags, mention.query), 6).map((tag, index) => ({
          tag,
          active: index === mention.activeIndex,
        }))
      : [];

  return (
    <TwitterUI
      attributes={{ 'data-test-id': 'twitter-ui' }}
      userData={userMatches}
      tagData={tagMatches}
      onMentionStateChange={onMentionStateChange}
    />
  );
};
