import { PortalContainer } from '@remirror/extension-react-component';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A hook which provides access to the portal container for rendering react
 * component directly within the editor dom.
 */
export function usePortalContainer(): PortalContainer {
  return useRemirrorContext().portalContainer;
}
