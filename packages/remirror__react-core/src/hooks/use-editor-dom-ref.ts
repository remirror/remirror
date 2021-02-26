import { MutableRefObject, useRef } from 'react';

import { useEditorView } from './use-editor-view';

/**
 * A hook which provides a react ref wrapper for the `view.dom`.
 */
export function useEditorDomRef(): MutableRefObject<HTMLElement> {
  return useRef(useEditorView().dom as HTMLElement);
}
