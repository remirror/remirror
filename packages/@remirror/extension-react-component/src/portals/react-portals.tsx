import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { AnyCombinedUnion, EditorWrapperOutput } from 'remirror/core';

import type { MountedPortal, PortalContainer, PortalMap } from './portal-container';

export interface RemirrorPortalsProps<Combined extends AnyCombinedUnion> {
  /**
   * An array of tuples holding all the element containers for node view
   * portals.
   */
  portals: Array<[HTMLElement, MountedPortal]>;

  context: EditorWrapperOutput<Combined>;
}

/**
 * The component that places all the portals into the DOM.
 *
 * Portals can currently be created by a [[`ReactNodeView`]] and coming soon
 * both the [[`ReactMarkView`]] and [[`ReactDecoration`]].
 */
export const RemirrorPortals = <Combined extends AnyCombinedUnion>(
  props: RemirrorPortalsProps<Combined>,
): JSX.Element => {
  const { context, portals } = props;
  return (
    <EditorContext.Provider value={context}>
      {portals.map(([container, { Component, key }]) =>
        createPortal(<Component />, container, key),
      )}
    </EditorContext.Provider>
  );
};

/**
 * A hook which subscribes to updates from the portal container.
 *
 * This is should used in the `ReactEditor` component and the value should be
 * passed through to the `RemirrorPortals` component.
 */
export function usePortals(portalContainer: PortalContainer): Array<[HTMLElement, MountedPortal]> {
  const [portals, setPortals] = useState(() => [...portalContainer.portals.entries()]);

  // Dispose of all portals.
  useEffect(() => {
    // Auto disposed when the component un-mounts.
    return portalContainer.on((portalMap: PortalMap) => {
      setPortals([...portalMap.entries()]);
    });
  }, [portalContainer]);

  return portals;
}

/**
 * Get the current remirror context when using a portal.
 */
export function usePortalContext<Combined extends AnyCombinedUnion>(): EditorWrapperOutput<
  Combined
> {
  return useContext(EditorContext) as EditorWrapperOutput<Combined>;
}

/**
 * Allows elemenent inside the portals to consume the provided contenxt
 */
const EditorContext = createContext<EditorWrapperOutput<any> | null>(null);
