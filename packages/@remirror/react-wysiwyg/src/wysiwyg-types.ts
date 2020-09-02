import type { ElementType, ReactElement } from 'react';
import type { Except } from 'type-fest';

import type { AnyCombinedUnion } from '@remirror/core';
import type {
  CreateWysiwygPresetListOptions,
  WysiwygPresetCombinedUnion,
} from '@remirror/preset-wysiwyg';
import type {
  BaseReactCombinedUnion,
  CreateReactManagerOptions,
  I18nContextProps,
  RemirrorProviderProps,
} from '@remirror/react';
import type { RemirrorThemeType } from '@remirror/theme';

export type WysiwygCombinedUnion = BaseReactCombinedUnion | WysiwygPresetCombinedUnion;

export interface CreateWysiwygManagerOptions
  extends CreateReactManagerOptions,
    CreateWysiwygPresetListOptions {}

export interface WysiwygProviderProps<Combined extends AnyCombinedUnion = WysiwygCombinedUnion>
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
   * The wysiwyg options used to create the initial manager when a manager is not
   * provided.
   */
  settings?: CreateWysiwygManagerOptions;
}
