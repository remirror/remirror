/**
 * @module
 *
 * A hook which provides a react ref wrapper for the `view.dom`.
 */

import { MutableRefObject, useRef } from 'react';

import { useRemirrorContext } from './use-remirror-context';

export function useEditorDomRef(): MutableRefObject<HTMLElement> {
  const { view } = useRemirrorContext();

  return useRef(view.dom as HTMLElement);
}
