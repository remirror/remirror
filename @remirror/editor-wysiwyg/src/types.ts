import { CodeBlockExtensionOptions } from '@remirror/extension-code-block';
import { RemirrorManagerProps, RemirrorProps } from '@remirror/react-utils';
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
        | 'suppressHydrationWarning'
      >
    >,
    Pick<RemirrorManagerProps, 'placeholder'>,
    Pick<CodeBlockExtensionOptions, 'supportedLanguages' | 'defaultLanguage' | 'syntaxTheme'> {
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
}

export interface ButtonProps {
  state: ButtonState;
}
