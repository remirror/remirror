import { EditorState } from '@remirror/pm/state';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A core hook which provides the latest editor state every time that it
 * updates.
 */
export function useEditorState(): EditorState {
  return useRemirrorContext({ autoUpdate: true }).getState();
}
