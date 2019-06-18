import { RemirrorProps } from '@remirror/react';
import { ButtonState, MarkdownEditorTheme } from './theme';
export interface MarkdownEditorProps
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
  theme?: Partial<MarkdownEditorTheme>;
}

export interface ButtonProps {
  state: ButtonState;
}
