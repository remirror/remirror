import { EditorView } from '@remirror/pm';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A hook which provides access to the editor view.
 */
export function useEditorView(): EditorView {
  return useRemirrorContext().view;
}
