import { RemirrorProps } from '@remirror/react';
import { RemirrorTheme } from '@remirror/ui';

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
  theme?: Partial<RemirrorTheme>;
}
