import { RemirrorProps } from '@remirror/react';
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
      | 'placeholder'
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
  > {
  theme?: Partial<UIWysiwygTheme>;
}

export interface ButtonProps {
  state: ButtonState;
}
