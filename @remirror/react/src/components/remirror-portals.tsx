import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { PortalContainer, PortalMap } from '@remirror/core';

export interface RemirrorPortalsProps {
  /**
   * Holds all the portals currently being rendered by the application.
   */
  portalContainer: PortalContainer;
}

/**
 * The component that places all the portals into the DOM.
 */
export const RemirrorPortals = ({ portalContainer }: RemirrorPortalsProps) => {
  const [state, setState] = useState(Array.from(portalContainer.portals.entries()));

  /**
   * Update the state whenever the portal is updated.
   */
  const onPortalChange = (portalMap: PortalMap) => {
    setState(Array.from(portalMap.entries()));
  };

  useEffect(() => {
    // Auto disposed when the component un-mounts
    return portalContainer.on(onPortalChange);
  }, [portalContainer]);

  return (
    <>
      {state.map(([container, { render: Component, key }]) => (
        <Fragment key={key}>{createPortal(<Component />, container)}</Fragment>
      ))}
    </>
  );
};
