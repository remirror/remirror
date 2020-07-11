import { ElementType, ReactElement } from 'react';
import { Except } from 'type-fest';

import { AnyCombinedUnion } from '@remirror/core';
import {
  CreateWysiwygPresetListParameter,
  WysiwygPresetCombinedUnion,
} from '@remirror/preset-wysiwyg';
import {
  BaseReactCombinedUnion,
  CreateReactManagerOptions,
  I18nContextProps,
  RemirrorProviderProps,
} from '@remirror/react';
import { RemirrorThemeType } from '@remirror/theme';

export type WysiwygCombinedUnion = BaseReactCombinedUnion | WysiwygPresetCombinedUnion;

export interface CreateWysiwygManagerOptions
  extends CreateReactManagerOptions,
    CreateWysiwygPresetListParameter {}

export interface WysiwygProviderProps<Combined extends AnyCombinedUnion = WysiwygCombinedUnion>
  extends Except<
      Partial<RemirrorProviderProps<Combined>>,
      'managerSettings' | 'reactPresetOptions' | 'corePresetOptions' | 'children'
    >,
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
   * @defaultValue 'div'
   */
  ThemeComponent?: ElementType;

  /**
   * The wysiwyg options used to create the initial manager when a manager is not
   * provided.
   */
  wysiwygOptions?: CreateWysiwygManagerOptions;
}
