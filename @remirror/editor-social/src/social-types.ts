import { SuggestionStateMatch } from '@remirror/extension-mention';
import { ManagedRemirrorProviderProps } from '@remirror/react';
import { RemirrorTheme } from '@remirror/ui';
import { Data, EmojiSet } from 'emoji-mart';

export type OnMentionChangeParams = MentionState & {
  /**
   * The currently active matching index
   */
  activeIndex: number;
};

export interface SocialEditorProps extends Partial<ManagedRemirrorProviderProps> {
  /**
   * The message to show when the editor is empty.
   */
  placeholder?: string;

  /**
   * onUrlChange
   */
  onUrlsChange?(params: { set: Set<string>; urls: string[] }): void;

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
  onMentionChange(params?: OnMentionChangeParams): void;

  /**
   * The theme to be used for setting .
   */
  theme?: Partial<RemirrorTheme & Partial<RemirrorTheme['colors']>>;

  /**
   * The data object used for emoji.
   */
  emojiData: Data;

  /**
   * The set of emojis to use.
   */
  emojiSet: EmojiSet;
}

interface BaseMentionState {
  /**
   * The currently matched query which can be used to search and populate data.
   */
  query: string;
}

interface NameParams<GName extends string> {
  /**
   * The name of the currently active suggestion.
   * This is the name passed into the suggestionsMatcher config object.
   */
  name: GName;
}

interface AtMentionState extends BaseMentionState, NameParams<'at'> {}

interface HashMentionState extends BaseMentionState, NameParams<'tag'> {}

/**
 * The possible active suggestion names.
 */
export type MatchName = 'at' | 'tag';

export type MentionState = AtMentionState | HashMentionState;

export interface UserData {
  uid: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface TagData {
  tag: string;
}

export interface ActiveUserData extends UserData {
  active: boolean;
}

export interface ActiveTagData extends TagData {
  active: boolean;
}

/**
 * A method for retrieving the most up to date mention data.
 */
export type MentionGetter = () => SuggestionStateMatch;

export interface SetExitTriggeredInternallyParams {
  /**
   * Identifies the command as an internal exit inducing command.
   * Prevents a second onExit from being dispatched.
   */
  setExitTriggeredInternally: () => void;
}

export interface MentionGetterParams {
  /**
   * Provides access to the most recent mention data.
   */
  getMention: MentionGetter;
}

export interface DataParams<GData> {
  /**
   * A list of data items.
   */
  data: GData[];
}

export interface UserSuggestionsProps
  extends MentionGetterParams,
    DataParams<ActiveUserData>,
    SetExitTriggeredInternallyParams {}

export interface TagSuggestionsProps
  extends MentionGetterParams,
    DataParams<ActiveTagData>,
    SetExitTriggeredInternallyParams {}

export type DivProps = JSX.IntrinsicElements['div'];
export type SpanProps = JSX.IntrinsicElements['span'];
export type ImgProps = JSX.IntrinsicElements['img'];
