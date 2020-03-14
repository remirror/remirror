/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FC } from 'react';

import { EmojiObject, EmojiSuggestCommand } from '@remirror/extension-emoji';
import { useRemirrorContext } from '@remirror/react';

import {
  ActiveTagData,
  ActiveUserData,
  MatchName,
  MentionGetterParams,
  SetExitTriggeredInternallyParams,
  SocialExtensions,
} from '../social-types';
import { EmojiSuggestions } from './emoji-suggestion-component';
import { CharacterCountWrapper, EditorWrapper } from './social-base-components';
import { CharacterCountIndicator } from './social-character-count-component';
import { AtSuggestions, TagSuggestions } from './social-suggestion-components';

interface SocialEditorComponentProps extends MentionGetterParams, SetExitTriggeredInternallyParams {
  emojiList: EmojiObject[];
  hideEmojiSuggestions: boolean;
  activeEmojiIndex: number;
  emojiCommand?: EmojiSuggestCommand;
  /**
   * The current matching users.
   */
  users: ActiveUserData[];

  /**
   * The current matching tags.
   */
  tags: ActiveTagData[];

  /**
   * The currently active matcher
   */
  activeMatcher: MatchName | undefined;

  /**
   * Whether or not suggestions have been hidden by pressing the escape key
   */
  hideSuggestions: boolean;

  /**
   * Display a typing hint that limits the number of characters to this number. Defaults to 140, set to `null` to disable.
   */
  characterLimit?: number | null;
}

/**
 * This is the internal editor component which relies on being wrapped within the remirror context.
 *
 * It renders suggestions, the editor, emoji picker and more to com.
 */
export const SocialEditorComponent: FC<SocialEditorComponentProps> = ({
  users,
  tags,
  getMention,
  activeMatcher,
  setExitTriggeredInternally,
  hideSuggestions,
  activeEmojiIndex,
  emojiList,
  hideEmojiSuggestions,
  emojiCommand,
  characterLimit = 140,
}) => {
  const {
    getRootProps,
    state: { newState },
  } = useRemirrorContext<SocialExtensions>();
  const content = newState.doc.textContent;
  return (
    <div>
      <EditorWrapper data-testid='social-editor-wrapper'>
        <div {...getRootProps()} data-testid='remirror-editor' />
        {characterLimit != null ? (
          <CharacterCountWrapper>
            <CharacterCountIndicator characters={{ total: characterLimit, used: content.length }} />
          </CharacterCountWrapper>
        ) : null}
        {hideEmojiSuggestions || !emojiCommand ? null : (
          <EmojiSuggestions highlightedIndex={activeEmojiIndex} data={emojiList} command={emojiCommand} />
        )}
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
