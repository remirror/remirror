/** @jsx jsx */

import { css, Global, jsx } from '@emotion/core';
import { EditorState, take } from '@remirror/core';
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
  SocialExtensions,
} from '@remirror/editor-social';
import { CodeBlockExtension } from '@remirror/extension-code-block';
import { RemirrorStateListenerParams } from '@remirror/react';
import { userData } from '@remirror/showcase';
import matchSorter from 'match-sorter';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import bash from 'refractor/lang/bash';
import markdown from 'refractor/lang/markdown';
import tsx from 'refractor/lang/tsx';
import typescript from 'refractor/lang/typescript';
import { WebsocketProvider } from 'y-websocket';

import makeYExtensions from './y';

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

export interface ExampleRichSocialEditorProps extends Partial<SocialEditorProps> {
  collaboration?: WebsocketProvider | null;
}

export const ExampleRichSocialEditor = (inProps: ExampleRichSocialEditorProps) => {
  const { collaboration, ...props } = inProps;
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
  const supportedLanguages = useMemo(() => [...DEFAULT_LANGUAGES], []);

  /**
   * The following JSX:
   *
   * ```
   * const element = (
   *   <RemirrorExtension
   *     Constructor={Constructor}
   *     priority={priority}
   *     {...options}
   *   />
   * );
   * ```
   *
   * gets converted into something like this in RemirrorManager:
   *
   * ```
   * const prioritisedExtension = {
   *   extension: new Constructor(options),
   *   priority: priority || 2,
   * };
   * ```
   *
   * We need the final form to pass into the `extensions` prop:
   */
  const extensions = useMemo(() => {
    return [
      { extension: new ParagraphExtension(), priority: 2 },
      { extension: new BoldExtension(), priority: 2 },
      { extension: new UnderlineExtension(), priority: 2 },
      { extension: new ItalicExtension(), priority: 2 },
      { extension: new BlockquoteExtension(), priority: 2 },
      { extension: new StrikeExtension(), priority: 2 },
      { extension: new CodeExtension(), priority: 2 },
      { extension: new HardBreakExtension(), priority: 2 },
      {
        extension: new CodeBlockExtension({
          supportedLanguages,
          formatter,
          syntaxTheme,
          defaultLanguage,
        }),
        priority: 2,
      },
      { extension: new SSRHelperExtension(), priority: 2 },
      ...(collaboration
        ? makeYExtensions(collaboration).map(YExtension => ({ extension: new YExtension(), priority: 2 }))
        : []),
    ].filter(Boolean);
  }, [collaboration, defaultLanguage, formatter, supportedLanguages]);

  const [value, setValue] = useState<EditorState | null>(null);

  const handleStateChange = useCallback((params: RemirrorStateListenerParams<SocialExtensions>): void => {
    setValue(params.newState);
  }, []);

  const [showJSON, setShowJSON] = useState(
    typeof localStorage === 'object' && localStorage
      ? localStorage.getItem('showEditorDocument') === '1'
      : false,
  );

  const handleShowJSONChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const show = e.target.checked;
    setShowJSON(show);
    if (typeof localStorage === 'object' && localStorage) {
      if (show) {
        localStorage.setItem('showEditorDocument', '1');
      } else {
        localStorage.removeItem('showEditorDocument');
      }
    }
  }, []);

  const jsonValue = useMemo(() => {
    return value && showJSON ? JSON.stringify(value.toJSON(), null, 2) : '';
  }, [showJSON, value]);

  return (
    <div>
      <Global
        styles={css`
          placeholder {
            display: inline;
            border: 1px solid #ccc;
            color: #ccc;
          }
          placeholder:after {
            content: '☁';
            font-size: 200%;
            line-height: 0.1;
            font-weight: bold;
          }
          .ProseMirror img {
            max-width: 100px;
          }
          /* this is a rough fix for the first cursor position when the first paragraph is empty */
          .ProseMirror > .ProseMirror-yjs-cursor:first-child {
            margin-top: 16px;
          }
          .ProseMirror p:first-child,
          .ProseMirror h1:first-child,
          .ProseMirror h2:first-child,
          .ProseMirror h3:first-child,
          .ProseMirror h4:first-child,
          .ProseMirror h5:first-child,
          .ProseMirror h6:first-child {
            margin-top: 16px;
          }
          .ProseMirror-yjs-cursor {
            position: absolute;
            border-left: black;
            border-left-style: solid;
            border-left-width: 2px;
            border-color: orange;
            height: 1em;
            word-break: normal;
            pointer-events: none;
          }
          .ProseMirror-yjs-cursor > div {
            position: relative;
            top: -1.05em;
            font-size: 13px;
            background-color: rgb(250, 129, 0);
            font-family: serif;
            font-style: normal;
            font-weight: normal;
            line-height: normal;
            user-select: none;
            color: white;
            padding-left: 2px;
            padding-right: 2px;
          }
          #y-functions {
            position: absolute;
            top: 20px;
            right: 20px;
          }
          #y-functions > * {
            display: inline-block;
          }
        `}
      />

      <SocialEditor
        {...props}
        value={value}
        onStateChange={handleStateChange}
        attributes={{ 'data-testid': 'editor-social' }}
        userData={userMatches}
        tagData={tagMatches}
        onMentionChange={onChange}
        characterLimit={500}
        extensions={extensions}
      />
      <label>
        <input type='checkbox' checked={showJSON} onChange={handleShowJSONChange} /> Show document source as
        JSON
      </label>
      {showJSON ? (
        <pre>
          <code>{jsonValue}</code>
        </pre>
      ) : null}
    </div>
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
