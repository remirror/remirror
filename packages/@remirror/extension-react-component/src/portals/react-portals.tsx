import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { PortalContainer, PortalMap, RenderMethodParameter } from './portal-container';

export interface RemirrorPortalsProps {
  /**
   * Holds all the portals currently being rendered by the application.
   */
  portalContainer: PortalContainer;
}

/**
 * The component that places all the portals into the DOM.
 *
 * Portals can be created by NodeView and also the static
 * widget method on Decorations.
 */
export const RemirrorPortals = ({ portalContainer }: RemirrorPortalsProps) => {
  const [state, setState] = useState([...portalContainer.portals.entries()]);
  const firstRender = useRef(true);

  /**
   * Update the state whenever the portal is updated.
   */
  const onPortalChange = useCallback((portalMap: PortalMap) => {
    setState([...portalMap.entries()]);
  }, []);

  // Dispose of all portals
  useEffect(() => {
    // Auto disposed when the component un-mounts
    return portalContainer.on(onPortalChange);
  }, [portalContainer, onPortalChange]);

  // Force update for each render except the first.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    portalContainer.forceUpdate();
  });

  return (
    <>
      {state.map(([container, { Component, key }]) =>
        createPortal(
          <Portal container={container} Component={Component} portalContainer={portalContainer} />,
          container,
          key,
        ),
      )}
    </>
  );
};

export interface PortalProps extends RemirrorPortalsProps, RenderMethodParameter {}

/**
 * This is the component rendered by the createPortal method within the
 * RemirrorPortals component. It is responsible for cleanup when the container
 * is removed from the DOM.
 */
const Portal = (props: PortalProps) => {
  const { portalContainer, container, Component } = props;
  const name = Component.displayName;

  useEffect(() => {
    /**
     * Remove the portal container entry when this portal is unmounted.
     * Portals are unmounted when their host container is removed from the dom.
     */
    return () => {
      console.log('removing', name);
      portalContainer.remove(container);
    };
  }, [container, portalContainer, name]);

  return <Component />;
};
