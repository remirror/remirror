import { Omit } from '@remirror/core';
import { EnhancedLinkOptions } from '@remirror/extension-enhanced-link';
import { ActionTaken } from '@remirror/extension-mention';
import { RemirrorProps } from '@remirror/react';
import { Data, EmojiSet } from 'emoji-mart';
import { UITwitterTheme } from './theme';

export type OnQueryChangeParams = Omit<MentionState, 'submitFactory'> & {
  activeIndex: number;
};

export interface TwitterUIProps extends EnhancedLinkOptions, Partial<RemirrorProps> {
  /**
   * The number of matches to display
   */
  userData: TwitterUserData[];
  tagData: TwitterTagData[];
  onMentionStateChange(params?: OnQueryChangeParams): void;
  theme: UITwitterTheme;
  /**
   * The data object used for emoji.
   * The shape is taken from emoji-mart.
   */
  emojiData: Data;
  emojiSet: EmojiSet;
}

interface BaseMentionState {
  query: string;
  action: ActionTaken;
}

export type SubmitFactory<GData extends {}> = (user: GData, fn?: () => void) => () => void;
interface AtMentionState extends BaseMentionState {
  name: 'at';
  submitFactory: SubmitFactory<TwitterUserData>;
}

interface HashMentionState extends BaseMentionState {
  name: 'tag';
  submitFactory: SubmitFactory<TwitterTagData>;
}

export type MentionState = AtMentionState | HashMentionState;

export type TwitterRelationship = 'following' | 'followed-by' | 'mutual' | null;

export interface TwitterUserData {
  uid: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface TwitterTagData {
  tag: string;
}

export interface ActiveTwitterUserData extends TwitterUserData {
  active: boolean;
}

export interface ActiveTwitterTagData extends TwitterTagData {
  active: boolean;
}

export interface TwitterAtSuggestionsProp {
  /**
   * A factory function called with the current user to be used as the onClick callback
   * @param attrs
   */
  submitFactory(user: TwitterUserData): () => void;

  data: ActiveTwitterUserData[];
}

export interface TwitterHashSuggestionsProp {
  /**
   * A factory function called with the current tag to be used as the onClick callback
   * @param attrs
   */
  submitFactory(data: TwitterTagData): () => void;

  data: ActiveTwitterTagData[];
}
