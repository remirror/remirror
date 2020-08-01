export type { SocialCharacterCountProps, SocialEditorProps } from './components';
export {
  SocialCharacterCount,
  SocialCharacterCountWrapper,
  SocialEditor,
  SocialEditorComponent,
  SocialEditorWrapperComponent,
  SocialEmojiComponent,
  SocialMentionComponent,
  SocialProvider,
} from './components';

export type { SocialEmojiState, SocialMentionProps, SocialMentionState } from './hooks';
export { useSocialEmoji, useSocialManager, useSocialMention, useSocialRemirror } from './hooks';

export { messages } from './social-messages';

export type {
  CreateSocialManagerOptions,
  MatchName,
  MentionChangeParameter,
  SocialCombinedUnion,
  SocialProviderProps,
  TagData,
  UserData,
} from './social-types';

export {
  getMentionLabel,
  indexFromArrowPress,
  mapToActiveIndex,
  socialManagerArgs,
} from './social-utils';
