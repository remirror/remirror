import React, { useState } from 'react';

import { ActiveTwitterUserData, OnQueryChangeParams, TwitterUI, TwitterUserData } from '@remirror/twitter-ui';
import { take } from 'lodash';

import matchSorter from 'match-sorter';
import { fakeUsers } from '../data/fake-users';

const data: TwitterUserData[] = fakeUsers.results.map(
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

  const matches: ActiveTwitterUserData[] =
    mention && mention.query.length
      ? take(matchSorter(data, mention.query || '', { keys: ['username', 'displayName'] }), 6).map(
          (user, index) => ({ ...user, active: index === mention.activeIndex }),
        )
      : [];

  return (
    <TwitterUI
      attributes={{ 'data-test-id': 'twitter-ui' }}
      data={matches}
      onMentionStateChange={onMentionStateChange}
    />
  );
};
