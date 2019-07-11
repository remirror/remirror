import { RemirrorManagerProps, RemirrorProps } from '@remirror/react-utils';
import { RefractorNode } from 'refractor/core';
import { ButtonState, WysiwygEditorTheme } from './theme';
export interface WysiwygEditorProps
  extends Partial<
      Pick<
        RemirrorProps,
        | 'initialContent'
        | 'attributes'
        | 'editable'
        | 'autoFocus'
        | 'onChange'
        | 'onFocus'
        | 'onBlur'
        | 'onFirstRender'
        | 'onDispatchTransaction'
        | 'label'
        | 'editorStyles'
        | 'forceEnvironment'
      >
    >,
    Pick<RemirrorManagerProps, 'placeholder'> {
  /**
   * Extend the theme with your own styles
   */
  theme?: Partial<WysiwygEditorTheme>;

  /**
   * By default the editor injects a link tag with FontAwesome into the dom. Set this to true to prevent
   * that from happening. Please note unless you provide your own link Server Side rendering will flash unstyled
   * content.
   *
   * ```tsx
   * // Add something similar to the following
   * <link rel='stylesheet' href='https://unpkg.com/@fortawesome/fontawesome-svg-core@1.2.19/styles.css' />
   * ```
   *
   * @default false
   */
  removeFontAwesomeCSS?: boolean;

  /**
   * Supported code block languages.
   *
   * Set to an empty array to remove any code highlighting of any kind.
   *
   * @default `[js, jsx, ts, tsx, html, markdown]`
   */
  languages?: RefractorNode[];
}

export interface ButtonProps {
  state: ButtonState;
}
