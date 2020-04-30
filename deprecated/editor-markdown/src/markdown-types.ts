import { RenderEditorProps } from '@remirror/react';

export interface MarkdownEditorProps
  extends Partial<
    Pick<
      RenderEditorProps,
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
