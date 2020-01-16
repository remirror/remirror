/** @jsx jsx */

import { jsx } from '@emotion/core';
import { take } from '@remirror/core';
import {
  BlockquoteExtension,
  BoldExtension,
  CodeExtension,
  HardBreakExtension,
  ItalicExtension,
  ParagraphExtension,
  SSRHelperExtension,
  StrikeExtension,
  UnderlineExtension,
} from '@remirror/core-extensions';
import {
  ActiveTagData,
  ActiveUserData,
  OnMentionChangeParams,
  SocialEditor,
  SocialEditorProps,
} from '@remirror/editor-social';
import { CodeBlockExtension } from '@remirror/extension-code-block';
import { RemirrorExtension } from '@remirror/react';
import { userData } from '@remirror/showcase';
import matchSorter from 'match-sorter';
import { useState } from 'react';
import bash from 'refractor/lang/bash';
import markdown from 'refractor/lang/markdown';
import tsx from 'refractor/lang/tsx';
import typescript from 'refractor/lang/typescript';

const DEFAULT_LANGUAGES = [markdown, typescript, tsx, bash];

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

export const ExampleRichSocialEditor = (props: Partial<SocialEditorProps>) => {
  const [mention, setMention] = useState<OnMentionChangeParams>();

  const onChange = (params: OnMentionChangeParams) => {
    setMention(params);
  };

  const userMatches: ActiveUserData[] =
    mention && mention.name === 'at' && mention.query.length
      ? take(
          matchSorter(userData, mention.query, { keys: ['username', 'displayName'] }),
          6,
        ).map((user, index) => ({ ...user, active: index === mention.activeIndex }))
      : [];

  const tagMatches: ActiveTagData[] =
    mention && mention.name === 'tag' && mention.query.length
      ? take(matchSorter(fakeTags, mention.query), 6).map((tag, index) => ({
          tag,
          active: index === mention.activeIndex,
        }))
      : [];

  const syntaxTheme = 'atomDark',
    defaultLanguage = undefined,
    formatter = undefined;
  const supportedLanguages = [...DEFAULT_LANGUAGES];

  return (
    <SocialEditor
      {...props}
      attributes={{ 'data-testid': 'editor-social' }}
      userData={userMatches}
      tagData={tagMatches}
      onMentionChange={onChange}
      characterLimit={500}
      extensionElements={
        <>
          <RemirrorExtension Constructor={ParagraphExtension} />
          <RemirrorExtension Constructor={BoldExtension} />
          <RemirrorExtension Constructor={UnderlineExtension} />
          <RemirrorExtension Constructor={ItalicExtension} />
          <RemirrorExtension Constructor={BlockquoteExtension} />
          <RemirrorExtension Constructor={StrikeExtension} />
          <RemirrorExtension Constructor={CodeExtension} />
          <RemirrorExtension Constructor={HardBreakExtension} />
          <RemirrorExtension
            Constructor={CodeBlockExtension}
            supportedLanguages={supportedLanguages}
            formatter={formatter}
            syntaxTheme={syntaxTheme}
            defaultLanguage={defaultLanguage}
          />
          <RemirrorExtension Constructor={SSRHelperExtension} />
        </>
      }
    />
  );
};

export const RICH_SOCIAL_SHOWCASE_CONTENT = {
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
          text: ' has proven to me ',
        },
        {
          type: 'text',
          text: 'most',
          marks: [
            {
              type: 'italic',
            },
          ],
        },
        {
          type: 'text',
          text: ' helpful!',
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
              type: 'enhancedLink',
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
      type: 'codeBlock',
      attrs: { language: 'markdown' },
      content: [
        {
          type: 'text',
          text:
            '## Simple Code Blocks\n\n```js\nlog("with code fence support");\n```\n\n```bash\necho "fun times"\n```\n\nUse Shift-Enter or Mod-Enter to hard break out of the code block',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Emojis ',
        },
        { type: 'text', text: 'still', marks: [{ type: 'strike' }] },
        { type: 'text', text: ' make me smile 😋 🙈' },
        {
          type: 'text',
          text: " and I'm here for that.",
        },
      ],
    },
  ],
};
