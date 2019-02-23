import { NodeAttrs } from '@remirror/mentions-extension';

export interface TwitterSuggestionsProps {
  /**
   * A factory function called with the current user to be used as the onClick callback
   * @param attrs
   */
  submitFactory(user: TwitterUserData): () => void;
}

export type TwitterRelationship = 'following' | 'followed-by' | 'mutual' | null;

export interface TwitterUserData {
  uid: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface TwitterTagData {}

export interface ActiveTwitterUserData extends TwitterUserData {
  active: boolean;
}

export interface TwitterAtSuggestionsProp extends TwitterSuggestionsProps {
  data: ActiveTwitterUserData[];
}
