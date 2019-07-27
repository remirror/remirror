import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { AnyExtension, NodeViewPortalContainer, PortalMap } from '@remirror/core';
import { InjectedPortalContextProps } from '@remirror/react-utils';
import { NodeViewPortalContext } from '../contexts';

export interface NodeViewPortalComponentProps<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends InjectedPortalContextProps<GExtensions> {
  portalContainer: NodeViewPortalContainer;
}

/**
 * The component that places all the portals into the DOM.
 */
export const NodeViewPortalComponent = <GExtensions extends AnyExtension[] = AnyExtension[]>({
  portalContainer,
  ...props
}: NodeViewPortalComponentProps<GExtensions>) => {
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
  }, []);

  return (
    <NodeViewPortalContext.Provider value={props as any}>
      {state.map(([container, { render: renderFunction, key }]) => (
        <Fragment key={key}>{createPortal(renderFunction(), container)}</Fragment>
      ))}
    </NodeViewPortalContext.Provider>
  );
};
