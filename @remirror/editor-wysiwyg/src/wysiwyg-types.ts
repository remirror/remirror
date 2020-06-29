import { AnyCombinedUnion } from '@remirror/core';
import { WysiwygPresetCombinedUnion } from '@remirror/preset-wysiwyg';
import { BaseReactCombinedUnion, I18nContextProps, RemirrorProviderProps } from '@remirror/react';

export interface SocialEditorProps<Combined extends AnyCombinedUnion = WysiwygCombinedUnion>
  extends Partial<RemirrorProviderProps<Combined>>,
    Partial<I18nContextProps> {
  /**
   * The message to show when the editor is empty.
   */
  placeholder?: string;
}

export type WysiwygCombinedUnion = BaseReactCombinedUnion | WysiwygPresetCombinedUnion;
