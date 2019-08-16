import { RemirrorProps } from '@remirror/react';

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
  > {}
