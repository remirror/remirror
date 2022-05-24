import type { CreateEditorStateProps } from 'remirror';
import type { RemirrorProps } from '@remirror/react';

export interface ReactEditorProps
  extends Pick<CreateEditorStateProps, 'stringHandler'>,
    Pick<RemirrorProps, 'initialContent' | 'editable' | 'autoFocus' | 'hooks'> {
  placeholder?: string;
}
