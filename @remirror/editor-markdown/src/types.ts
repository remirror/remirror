import { RemirrorProps } from '@remirror/react';
import { ButtonState, MarkdownEditorTheme } from './theme';
export interface MarkdownEditorProps
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
  > {
  theme?: Partial<MarkdownEditorTheme>;
}

export interface ButtonProps {
  state: ButtonState;
}
