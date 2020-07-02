import { css } from 'linaria';
import React, { FC } from 'react';

import { I18nProvider, RemirrorProvider, useRemirror } from '@remirror/react';

import { useSocialManager } from '../social-editor-hooks';
import { SocialEditorProps } from '../social-editor-types';
import { CharacterCountIndicator, CharacterCountWrapper } from './social-editor-character-count';
import { EmojiSuggestions } from './social-editor-emoji';
import { MentionSuggestions } from './social-editor-mentions';

/**
 * The social editor.
 */
export const SocialEditor: FC<SocialEditorProps> = (props) => {
  const {
    children,
    i18n,
    locale,
    characterLimit,
    tagData,
    onMentionChange,
    onUrlsChange,
    userData,
    combined,
    manager,
    socialOptions,
    ...rest
  } = props;

  const socialManager = useSocialManager(manager ?? combined ?? [], socialOptions);

  return (
    <I18nProvider i18n={i18n} locale={locale}>
      <RemirrorProvider {...rest} manager={socialManager} childAsRoot={false}>
        <Editor {...props}>{children}</Editor>
      </RemirrorProvider>
    </I18nProvider>
  );
};

type EditorProps = Pick<
  SocialEditorProps,
  'characterLimit' | 'tagData' | 'onMentionChange' | 'onUrlsChange' | 'userData'
>;

/**
 * The editing functionality within the Social Editor context.
 */
const Editor: FC<EditorProps> = (props) => {
  const { children, characterLimit = 280, tagData, onMentionChange, userData } = props;

  const { getRootProps, getState } = useRemirror();
  const used = getState().doc.textContent.length;

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
      <MentionSuggestions tags={tagData} users={userData} onChange={onMentionChange} />
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
      background-color: grey;
    }
  }
`;

const socialEditorWrapperStyles = css`
  position: relative;
  height: 100%;
`;
