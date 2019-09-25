import { EmojiObject, EmojiSuggestCommand } from '@remirror/extension-emoji';
import { useRemirrorContext } from '@remirror/react';
import React, { FC } from 'react';
import {
  ActiveTagData,
  ActiveUserData,
  MatchName,
  MentionGetterParams,
  SetExitTriggeredInternallyParams,
  SocialExtensions,
} from '../social-types';
import { CharacterCountWrapper, EditorWrapper } from './social-base-components';
import { CharacterCountIndicator } from './social-character-count-component';
import { AtSuggestions, TagSuggestions } from './social-suggestion-components';
import { EmojiSuggestions } from './emoji-suggestion-component';

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
        <CharacterCountWrapper>
          <CharacterCountIndicator characters={{ total: 140, used: content.length }} />
        </CharacterCountWrapper>
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
