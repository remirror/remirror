/**
 * @module
 *
 * A hook which provides access to the portal container for rendering react
 * component directly within the editor dom.
 */

import { PortalContainer } from '@remirror/extension-react-component';

import { useRemirrorContext } from './use-remirror-context';

/**
 * Retrieve the portal container which can be used to render
 */
export function usePortalContainer(): PortalContainer {
  return useRemirrorContext().portalContainer;
}
