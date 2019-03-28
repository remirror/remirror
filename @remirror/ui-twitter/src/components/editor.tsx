import React, { FC } from 'react';

import { Attrs } from '@remirror/core';
import { useRemirrorContext } from '@remirror/react';
import { ActiveTwitterTagData, ActiveTwitterUserData, MentionState, TwitterUIProps } from '../types';
import { CharacterCountIndicator } from './character-count';
import { EmojiPicker, EmojiPickerProps, EmojiSmiley } from './emoji-picker';
import { CharacterCountWrapper, EmojiPickerWrapper, EmojiSmileyWrapper, RemirrorWrapper } from './styled';
import { AtSuggestions, TagSuggestions } from './suggestions';

interface TwitterEditorProps extends Pick<TwitterUIProps, 'emojiData' | 'emojiSet'> {
  mention?: MentionState;
  ignoredElements: HTMLElement[];
  onBlurEmojiPicker: () => void;
  onClickEmojiSmiley: () => void;
  emojiPickerActive: boolean;
  toggleEmojiRef: React.RefObject<HTMLElement>;
  userMatches: ActiveTwitterUserData[];
  tagMatches: ActiveTwitterTagData[];
  onSelectEmoji(method: (attrs: Attrs) => void): EmojiPickerProps['onSelection'];
}

export const TwitterEditor: FC<TwitterEditorProps> = ({
  mention,
  emojiPickerActive,
  onBlurEmojiPicker,
  emojiData,
  emojiSet,
  ignoredElements,
  onClickEmojiSmiley,
  toggleEmojiRef,
  userMatches,
  tagMatches,
  onSelectEmoji,
}) => {
  const {
    getRootProps,
    actions,
    state: { newState },
  } = useRemirrorContext();
  const content = newState.doc.textContent;
  return (
    <div>
      <RemirrorWrapper {...getRootProps()} style={{ position: 'relative' }} id='woah'>
        <CharacterCountWrapper>
          <CharacterCountIndicator characters={{ total: 140, used: content.length }} />
        </CharacterCountWrapper>
        {emojiPickerActive && (
          <EmojiPickerWrapper>
            <EmojiPicker
              onBlur={onBlurEmojiPicker}
              data={emojiData}
              set={emojiSet}
              onSelection={onSelectEmoji(actions.emoji.command)}
              ignoredElements={ignoredElements}
            />
          </EmojiPickerWrapper>
        )}
        <EmojiSmileyWrapper>
          <span
            role='button'
            aria-pressed={emojiPickerActive ? 'true' : 'false'}
            onClick={onClickEmojiSmiley}
            ref={toggleEmojiRef}
          >
            <EmojiSmiley active={emojiPickerActive} />
          </span>
        </EmojiSmileyWrapper>
      </RemirrorWrapper>
      <div>
        {!mention ? null : mention.name === 'at' ? (
          <AtSuggestions data={userMatches} submitFactory={mention.submitFactory} />
        ) : (
          <TagSuggestions data={tagMatches} submitFactory={mention.submitFactory} />
        )}
      </div>
    </div>
  );
};
