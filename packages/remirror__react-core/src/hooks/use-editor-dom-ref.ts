import { MutableRefObject, useRef } from 'react';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A hook which provides a react ref wrapper for the `view.dom`.
 */
export function useEditorDomRef(): MutableRefObject<HTMLElement> {
  const { view } = useRemirrorContext();

  return useRef(view.dom as HTMLElement);
}
