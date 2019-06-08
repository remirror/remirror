import React, { useState } from 'react';

import {
  ActiveTwitterTagData,
  ActiveTwitterUserData,
  OnQueryChangeParams,
  TwitterUI,
  TwitterUserData,
} from '@remirror/ui-twitter';
import emojiData from 'emoji-mart/data/all.json';
import startCase from 'lodash/startCase';
import take from 'lodash/take';
import { NextComponentType } from 'next';

import { RemirrorEventListener } from '@remirror/react';
import matchSorter from 'match-sorter';
import Layout from '../../components/layout';
import { fakeUsers } from '../../data/fake-users';

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

const userData: TwitterUserData[] = fakeUsers.results.map(
  (user): TwitterUserData => ({
    avatarUrl: user.picture.thumbnail,
    displayName: startCase(`${user.name.first} ${user.name.last}`),
    uid: user.login.uuid,
    username: user.login.username,
  }),
);

const TweetPage: NextComponentType = () => {
  const [mention, setMention] = useState<OnQueryChangeParams>();

  const onMentionStateChange = (params: OnQueryChangeParams) => {
    setMention(params);
  };

  const userMatches: ActiveTwitterUserData[] =
    mention && mention.name === 'at' && mention.query.length
      ? take(matchSorter(userData, mention.query, { keys: ['username', 'displayName'] }), 6).map(
          (user, index) => ({ ...user, active: index === mention.activeIndex }),
        )
      : [];

  const tagMatches: ActiveTwitterTagData[] =
    mention && mention.name === 'tag' && mention.query.length
      ? take(matchSorter(fakeTags, mention.query), 6).map((tag, index) => ({
          tag,
          active: index === mention.activeIndex,
        }))
      : [];

  const onChange: RemirrorEventListener = ({ getJSON }) => {
    console.log('initial render', getJSON());
  };

  return (
    <Layout title='Twitter UI example'>
      <TwitterUI
        initialContent={initialContent}
        onChange={onChange}
        emojiData={emojiData}
        attributes={{ 'data-test-id': 'ui-twitter' }}
        userData={userMatches}
        tagData={tagMatches}
        onMentionStateChange={onMentionStateChange}
      />
    </Layout>
  );
};

const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'dsaf ' },
        {
          type: 'emoji',
          attrs: {
            id: 'stuck_out_tongue_winking_eye',
            native: '😜',
            name: 'Face with Stuck-out Tongue and Winking Eye',
            colons: '',
            skin: '',
            'aria-label': 'Emoji: Face with Stuck-out Tongue and Winking Eye',
            title: 'Emoji: Face with Stuck-out Tongue and Winking Eye',
            class: 'remirror-editor-emoji-node',
            useNative: false,
          },
        },
        {
          type: 'emoji',
          attrs: {
            id: 'grinning',
            native: '😀',
            name: 'Grinning Face',
            colons: '',
            skin: '',
            'aria-label': 'Emoji: Grinning Face',
            title: 'Emoji: Grinning Face',
            class: 'remirror-editor-emoji-node',
            useNative: false,
          },
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is content.' },
        {
          type: 'emoji',
          attrs: {
            id: 'sweat_smile',
            native: '😅',
            name: 'Smiling Face with Open Mouth and Cold Sweat',
            colons: '',
            skin: '',
            'aria-label': 'Emoji: Smiling Face with Open Mouth and Cold Sweat',
            title: 'Emoji: Smiling Face with Open Mouth and Cold Sweat',
            class: 'remirror-editor-emoji-node',
            useNative: false,
          },
        },
        {
          type: 'emoji',
          attrs: {
            id: 'sweat_smile',
            native: '😅',
            name: 'Smiling Face with Open Mouth and Cold Sweat',
            colons: '',
            skin: '',
            'aria-label': 'Emoji: Smiling Face with Open Mouth and Cold Sweat',
            title: 'Emoji: Smiling Face with Open Mouth and Cold Sweat',
            class: 'remirror-editor-emoji-node',
            useNative: false,
          },
        },
        {
          type: 'emoji',
          attrs: {
            id: '+1',
            native: '👍🏿',
            name: 'Thumbs Up Sign',
            colons: '',
            skin: '6',
            'aria-label': 'Emoji: Thumbs Up Sign',
            title: 'Emoji: Thumbs Up Sign',
            class: 'remirror-editor-emoji-node',
            useNative: false,
          },
        },
      ],
    },
  ],
};

export default TweetPage;
