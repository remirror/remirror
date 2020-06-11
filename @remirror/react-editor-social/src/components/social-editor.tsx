import { css } from 'linaria';
import React, { FC, useMemo } from 'react';

import { AutoLinkExtension } from '@remirror/extension-auto-link';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExtension } from '@remirror/extension-mention';
import {
  I18nProvider,
  RemirrorProvider,
  useCreateExtension,
  useManager,
  useRemirror,
} from '@remirror/react';

import { SocialEditorProps } from '../social-editor-types';
import { CharacterCountIndicator, CharacterCountWrapper } from './social-editor-character-count';
import { EmojiSuggestions } from './social-editor-emoji';
import { MentionSuggestions } from './social-editor-mentions';

/**
 * The social editor.
 */
export const SocialEditor: FC<SocialEditorProps> = (props) => {
  const {
    extensions = [],
    presets = [],
    atMatcherOptions,
    tagMatcherOptions,
    children,
    i18n,
    locale,
  } = props;
  const mentionExtensionSettings = useMemo(
    () => ({
      matchers: [
        { name: 'at', char: '@', appendText: ' ', ...atMatcherOptions },
        { name: 'tag', char: '#', appendText: ' ', ...tagMatcherOptions },
      ],
    }),
    [atMatcherOptions, tagMatcherOptions],
  );

  const mentionExtension = useCreateExtension(MentionExtension, mentionExtensionSettings);
  const emojiExtension = useCreateExtension(
    EmojiExtension,
    useMemo(
      () => ({
        extraAttributes: { role: { default: 'presentation' } },
      }),
      [],
    ),
  );

  const autoLinkExtension = useCreateExtension(AutoLinkExtension, { defaultProtocol: 'https:' });
  const combined = useMemo(
    () => [...extensions, ...presets, mentionExtension, emojiExtension, autoLinkExtension],
    [autoLinkExtension, emojiExtension, extensions, mentionExtension, presets],
  );

  const manager = useManager(combined);

  return (
    <I18nProvider i18n={i18n} locale={locale}>
      <RemirrorProvider manager={manager} childAsRoot={false}>
        <Editor {...props}>{children}</Editor>
      </RemirrorProvider>
    </I18nProvider>
  );
};

/**
 * The editing functionality within the Social Editor context.
 */
const Editor: FC<SocialEditorProps> = (props) => {
  const { children, characterLimit = 280 } = props;

  const { getRootProps, state } = useRemirror();
  const used = state.newState.doc.textContent.length;

  return (
    <div>
      <div className={socialEditorWrapperStyles} data-testid='remirror-editor'>
        <div className={socialEditorStyles} {...getRootProps()} />
        <EmojiSuggestions />
        {characterLimit != null && (
          <CharacterCountWrapper>
            <CharacterCountIndicator characters={{ maximum: characterLimit, used }} />
          </CharacterCountWrapper>
        )}
        {children}
      </div>
      <MentionSuggestions
        tags={props.tagData}
        users={props.userData}
        onChange={props.onMentionChange}
      />
    </div>
  );
};

export const socialEditorStyles = css`
  .ProseMirror {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    box-sizing: border-box;
    position: relative;
    border-width: 1px;
    border-style: solid;
    border-color: #99cfeb;
    box-shadow: 0 0 0 1px #99cfeb;
    line-height: 1.625rem;
    border-radius: 8px;
    width: 100%;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 16px;
    max-height: calc(90vh - 124px);
    min-height: 142px;
    padding: 8px;
    padding-right: 40px;

    p {
      margin: 0px;
      letter-spacing: 0.6px;
      color: text;
    }

    a.mention {
      pointer-events: none;
      cursor: default;
    }

    a {
      text-decoration: none !important;
      color: #1da1f2;
    }

    &:focus {
      outline: none;
      box-shadow: focus;
    }

    .Prosemirror-selectednode {
      background-color: $oc-gray-1;
    }
  }
`;

const socialEditorWrapperStyles = css`
  position: relative;
  height: 100%;
`;
