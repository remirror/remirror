import type { ElementType, ReactElement } from 'react';
import type { Except } from 'type-fest';

import type { AnyCombinedUnion, GetStaticAndDynamic } from '@remirror/core';
import type { SocialOptions, SocialPreset } from '@remirror/preset-social';
import type {
  BaseReactCombinedUnion,
  CreateReactManagerOptions,
  I18nContextProps,
  RemirrorProviderProps,
} from '@remirror/react';
import type { RemirrorThemeType } from '@remirror/theme';

export interface MentionChangeParameter {
  /**
   * The currently matched query which can be used to search and populate data.
   */
  query: string;

  /**
   * The name of the matching suggester.
   */
  name: string;
  /**
   * The currently active matching index
   */
  index: number;
}

export interface CreateSocialManagerOptions extends CreateReactManagerOptions {
  /**
   * The social preset options.
   */
  social?: GetStaticAndDynamic<SocialOptions>;
}

export interface SocialProviderProps<Combined extends AnyCombinedUnion = SocialCombinedUnion>
  extends Except<Partial<RemirrorProviderProps<Combined>>, 'settings' | 'children'>,
    Partial<I18nContextProps> {
  /**
   * Unlike the remirror provider you can provide any number of children to this component.
   */
  children: ReactElement | ReactElement[];

  /**
   * Provide a theme to use for the editor. When this is provided your
   * editor will be wrapped in an extra wrapper component depending on the
   * value of the `ThemeComponent`.
   */
  theme?: RemirrorThemeType;

  /**
   * The theme component used to render the `theme`.
   *
   * @default 'div'
   */
  ThemeComponent?: ElementType;

  /**
   * The social options used to create the initial manager when a manager is not
   * provided.
   */
  settings?: CreateSocialManagerOptions;

  /**
   * Display a typing hint that limits the number of characters to this number.
   * Defaults to 140, set to `null` to disable.
   */
  characterLimit?: number | null;
}

/**
 * The extensions used by the social editor.
 *
 * Using this as a generic value allows for better type inference in the editor.
 */
export type SocialCombinedUnion = BaseReactCombinedUnion | SocialPreset;
