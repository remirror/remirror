import { Except } from 'type-fest';

import { AnyCombinedUnion } from '@remirror/core';
import { SocialOptions, SocialPreset } from '@remirror/preset-social';
import {
  BaseReactCombinedUnion,
  CreateReactManagerOptions,
  I18nContextProps,
  RemirrorProviderProps,
} from '@remirror/react';

export interface MentionChangeParameter extends BaseMentionState {
  name: MatchName;
  /**
   * The currently active matching index
   */
  index: number;
}

export interface CreateSocialManagerOptions extends CreateReactManagerOptions {
  /**
   * The social preset options.
   */
  social?: SocialOptions;
}

export interface SocialEditorProps<Combined extends AnyCombinedUnion = SocialCombinedUnion>
  extends Except<
      Partial<RemirrorProviderProps<Combined>>,
      'managerSettings' | 'reactPresetOptions' | 'corePresetOptions'
    >,
    Partial<I18nContextProps> {
  /**
   * The social options used to create the initial manager when a manager is
   * not provided.
   */
  socialOptions?: CreateSocialManagerOptions;

  /**
   * Display a typing hint that limits the number of characters to this number.
   * Defaults to 140, set to `null` to disable.
   */
  characterLimit?: number | null;

  /**
   * The message to show when the editor is empty.
   */
  placeholder?: string;

  /**
   * onUrlChange
   */
  onUrlsChange?: (params: { set: Set<string>; urls: string[] }) => void;

  /**
   * List of users
   */
  userData: UserData[];

  /**
   * List of tags
   */
  tagData: TagData[];

  /**
   * Called any time there is a change in the mention
   */
  onMentionChange: (params?: MentionChangeParameter) => void;
}

interface BaseMentionState {
  /**
   * The currently matched query which can be used to search and populate data.
   */
  query: string;
}

/**
 * The possible active suggestion names.
 */
export type MatchName = 'at' | 'tag';

export interface UserData {
  id?: string;
  href?: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface TagData {
  id?: string;
  href?: string;
  tag: string;
}

/**
 * The extensions used by the social editor.
 *
 * Using this as a generic value allows for better type inference in the editor.
 */
export type SocialCombinedUnion = BaseReactCombinedUnion | SocialPreset;
