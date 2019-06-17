import { RemirrorProps } from '@remirror/react';
import { ButtonState, UIMarkdownTheme } from './theme';
export interface MarkdownUIProps
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
  > {
  theme?: Partial<UIMarkdownTheme>;
}

export interface ButtonProps {
  state: ButtonState;
}
