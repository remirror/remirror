import { Attrs } from '@remirror/core';
import { useRemirror } from '@remirror/react';
import React, { FC, RefObject } from 'react';
import {
  ActiveTagData,
  ActiveUserData,
  MatchName,
  MentionGetterParams,
  SetExitTriggeredInternallyParams,
  SocialEditorProps,
} from '../social-types';
import {
  CharacterCountWrapper,
  EditorWrapper,
  EmojiPickerWrapper,
  EmojiSmileyWrapper,
} from './social-base-components';
import { CharacterCountIndicator } from './social-character-count-component';
import { EmojiPicker, EmojiPickerProps, EmojiSmiley } from './social-emoji-picker-component';
import { AtSuggestions, TagSuggestions } from './social-suggestion-components';

interface SocialEditorComponentProps
  extends Pick<SocialEditorProps, 'emojiData' | 'emojiSet'>,
    MentionGetterParams,
    SetExitTriggeredInternallyParams {
  /**
   * Elements to be ignored when clicking outside of the emoji pop.
   * When focused these elements will not cause the emoji picker to close.
   */
  ignoredElements: HTMLElement[];

  /**
   * Callback for when the emoji picker loses focus.
   */
  onBlurEmojiPicker: () => void;

  /**
   * Callback for when the smiley button is clicked.
   */
  onClickEmojiSmiley: () => void;

  /**
   * Whether the emoji picker is currently active (and should be displayed)
   */
  emojiPickerActive: boolean;

  /**
   * The ref for the toggle emoji button is passed through so that it can be used
   * in the parent component.
   */
  toggleEmojiRef: RefObject<HTMLElement>;

  /**
   * The current matching users.
   */
  users: ActiveUserData[];

  /**
   * The current matching tags.
   */
  tags: ActiveTagData[];

  /**
   * The action triggered when the emoji is selected.
   */
  onSelectEmoji(method: (attrs: Attrs) => void): EmojiPickerProps['onSelection'];

  /**
   * The currently active matcher
   */
  activeMatcher: MatchName | undefined;

  /**
   * Whether or not suggestions have been hidden by pressing the escape key
   */
  hideSuggestions: boolean;
}

/**
 * This is the internal editor component which relies on being wrapped within the remirror context.
 *
 * It renders suggestions, the editor, emoji picker and more to com.
 */
export const SocialEditorComponent: FC<SocialEditorComponentProps> = ({
  emojiPickerActive,
  onBlurEmojiPicker,
  emojiData,
  emojiSet,
  ignoredElements,
  onClickEmojiSmiley,
  toggleEmojiRef,
  users,
  tags,
  onSelectEmoji,
  getMention,
  activeMatcher,
  setExitTriggeredInternally,
  hideSuggestions,
}) => {
  const {
    getRootProps,
    actions,
    state: { newState },
  } = useRemirror();
  const content = newState.doc.textContent;
  return (
    <div>
      <EditorWrapper data-testid='social-editor-wrapper'>
        <div {...getRootProps()} data-testid='remirror-editor' />
        <CharacterCountWrapper>
          <CharacterCountIndicator characters={{ total: 140, used: content.length }} />
        </CharacterCountWrapper>
        {emojiPickerActive && (
          <EmojiPickerWrapper>
            <EmojiPicker
              onBlur={onBlurEmojiPicker}
              data={emojiData}
              set={emojiSet}
              onSelection={onSelectEmoji(actions.emoji)}
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
      </EditorWrapper>
      <div>
        {!activeMatcher || hideSuggestions ? null : activeMatcher === 'at' ? (
          <AtSuggestions
            data={users}
            getMention={getMention}
            setExitTriggeredInternally={setExitTriggeredInternally}
          />
        ) : (
          <TagSuggestions
            data={tags}
            getMention={getMention}
            setExitTriggeredInternally={setExitTriggeredInternally}
          />
        )}
      </div>
    </div>
  );
};
