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

export interface TwitterAtSuggestionsProp {
  /**
   * A factory function called with the current user to be used as the onClick callback
   * @param attrs
   */
  submitFactory(user: TwitterUserData): () => void;

  data: ActiveTwitterUserData[];
}
