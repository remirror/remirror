import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { NodeViewPortalContainer, PortalMap } from '@remirror/core';

export interface NodeViewPortalComponentProps {
  portalContainer: NodeViewPortalContainer;
}

/**
 * The component that places all the portals into the DOM.
 */
export const NodeViewPortalComponent = ({ portalContainer }: NodeViewPortalComponentProps) => {
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
      {state.map(([container, { render: renderFunction, key }]) => (
        <Fragment key={key}>{createPortal(renderFunction(), container)}</Fragment>
      ))}
    </>
  );
};
