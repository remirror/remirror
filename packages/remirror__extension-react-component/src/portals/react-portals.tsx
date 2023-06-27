import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import type { MountedPortal, PortalContainer } from './portal-container';

/**
 * The component that places all the portals into the DOM.
 *
 * Portals can currently be created by a [[`ReactNodeView`]] and coming soon
 * both the [[`ReactMarkView`]] and [[`ReactDecoration`]].
 */
export const RemirrorPortals = (props: RemirrorPortalsProps): JSX.Element => {
  const { portals } = props;

  return (
    <>
      {portals.map(([container, { Component, key }]) =>
        createPortal(<Component />, container, key),
      )}
    </>
  );
};

export interface RemirrorPortalsProps {
  /**
   * An array of tuples holding all the element containers for node view
   * portals.
   */
  portals: Array<[HTMLElement, MountedPortal]>;
}

/**
 * A hook which subscribes to updates from the portal container.
 *
 * This is should used in the `ReactEditor` component and the value should be
 * passed through to the `RemirrorPortals` component.
 */
export function usePortals(portalContainer: PortalContainer): Array<[HTMLElement, MountedPortal]> {
  // eslint-disable-next-line unicorn/prefer-spread
  const [portals, setPortals] = useState(() => Array.from(portalContainer.portals.entries()));

  // Dispose of all portals.
  useEffect(
    () =>
      // Auto disposed when the component un-mounts.
      portalContainer.on((portalMap) => {
        // eslint-disable-next-line unicorn/prefer-spread
        setPortals(Array.from(portalMap.entries()));
      }),
    [portalContainer],
  );

  return useMemo(() => portals, [portals]);
}
