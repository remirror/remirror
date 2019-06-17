import { RemirrorManagerProps, RemirrorProps } from '@remirror/react-utils';
import { ButtonState, UIWysiwygTheme } from './theme';
export interface WysiwygUIProps
  extends Partial<
      Pick<
        RemirrorProps,
        | 'autoFocus'
        | 'initialContent'
        | 'attributes'
        | 'editable'
        | 'autoFocus'
        | 'onChange'
        | 'onFocus'
        | 'onBlur'
        | 'onFirstRender'
        | 'dispatchTransaction'
        | 'label'
        | 'editorStyles'
        | 'forceEnvironment'
        | 'customRootProp'
      >
    >,
    Pick<RemirrorManagerProps, 'placeholder'> {
  theme?: Partial<UIWysiwygTheme>;
}

export interface ButtonProps {
  state: ButtonState;
}
