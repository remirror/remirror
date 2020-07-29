import { styled } from 'linaria/react';
import React, { FC } from 'react';

import { isNumber } from '@remirror/core';
import { useRemirror } from '@remirror/react';

import { SocialMentionProps } from '../hooks';
import { SocialProviderProps } from '../social-types';
import { SocialCharacterCount, SocialCharacterCountWrapper } from './social-character-count';
import { SocialEmojiComponent } from './social-editor-emoji';
import { SocialMentionComponent } from './social-editor-mentions';
import { SocialProvider } from './social-provider';

export interface SocialEditorProps extends Partial<SocialProviderProps>, SocialMentionProps {}

/**
 * A prebuilt `SocialEditor` which combines the building blocks for you to
 * create an editor with minimal lines of code.
 */
export const SocialEditor: FC<SocialEditorProps> = (props: SocialEditorProps) => {
  const { children, characterLimit = 140, tags, onMentionChange, users, ...providerProps } = props;

  return (
    <SocialProvider {...providerProps}>
      <SocialEditorWrapperComponent data-testid='remirror-editor'>
        <TextEditor />
        <SocialEmojiComponent />
        <Indicator characterLimit={characterLimit} />
        {children}
      </SocialEditorWrapperComponent>
      <SocialMentionComponent tags={tags} users={users} onMentionChange={onMentionChange} />
    </SocialProvider>
  );
};

/**
 * The editing functionality within the Social Editor context.
 */
const TextEditor = () => {
  const { getRootProps } = useRemirror();

  return <SocialEditorComponent className={'shadow-center-2'} {...getRootProps()} />;
};

interface IndicatorProps {
  characterLimit?: number | null;
}

const Indicator = ({ characterLimit }: IndicatorProps) => {
  const { getState } = useRemirror({ autoUpdate: true });
  const used = getState().doc.textContent.length;

  return isNumber(characterLimit) ? (
    <SocialCharacterCountWrapper>
      <SocialCharacterCount characters={{ maximum: characterLimit, used }} />
    </SocialCharacterCountWrapper>
  ) : null;
};

/**
 * The component into which the prosemirror editor will be injected into.
 */
export const SocialEditorComponent = styled.div`
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

export const SocialEditorWrapperComponent = styled.div`
  position: relative;
  height: 100%;
`;
