import { AnyExtension, DocExtension, TextExtension } from '@remirror/core';
import { HistoryExtension } from '@remirror/core-extensions';
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

type A<E extends AnyExtension> = E;

const B: Array<A<TextExtension | DocExtension | HistoryExtension>> = [
  new TextExtension(),
  new DocExtension(),
];
