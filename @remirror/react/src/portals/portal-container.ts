import { createNanoEvents } from 'nanoevents';
import { ReactElement } from 'react';
import { uniqueId } from '@remirror/core';

export interface RenderParameter {
  /**
   * Renders a JSX element.
   */
  render: () => ReactElement;
}

export interface MountedPortal extends RenderParameter {
  key: string;
}

export interface RenderMethodParameter extends RenderParameter {
  /**
   * The DOM element to contain the react portal.
   */
  container: HTMLElement;
}

interface Events {
  /**
   * Trigger an update in all subscribers
   */
  update: (portalMap: PortalMap) => void;
}

export type PortalList = ReadonlyArray<[HTMLElement, MountedPortal]>;
export type PortalMap = Map<HTMLElement, MountedPortal>;

/**
 * The node view portal container keeps track of all the portals which have been added by react to render
 * the node views in the editor.
 */
export class PortalContainer {
  /**
   * A map of all the active portals.
   */
  portals: Map<HTMLElement, MountedPortal> = new Map();

  /**
   * The event listener which allows consumers to subscribe to when a new portal
   * is added / deleted via the updated event.
   */
  events = createNanoEvents<Events>();

  /**
   * Event handler for subscribing to update events from the portalContainer.
   */
  on = (callback: (portalMap: PortalMap) => void) => {
    return this.events.on('update', callback);
  };

  /**
   * Subscribe to one event before automatically unbinding.
   */
  once = (callback: (portalMap: PortalMap) => void) => {
    const unbind = this.events.on('update', (portalMap) => {
      unbind();
      callback(portalMap);
    });

    return unbind;
  };

  /**
   * Trigger an update in all subscribers.
   */
  private update() {
    this.events.emit('update', this.portals);
  }

  /**
   * Responsible for registering a new portal by rendering the react element into the provided container.
   */
  render({ render, container }: RenderMethodParameter) {
    const portal = this.portals.get(container);
    const key = portal ? portal.key : uniqueId();

    this.portals.set(container, { render, key });
    this.update();
  }

  /**
   * Force an update in all the portals by setting new keys for every portal.
   *
   * Delete all orphaned containers (deleted from the DOM). This is useful for
   * Decoration where there is no destroy method.
   */
  forceUpdate() {
    this.portals.forEach(({ render }, container) => {
      // Assign the portal a new key so it is re-rendered
      this.portals.set(container, { render, key: uniqueId() });
    });

    this.update();
  }

  /**
   * Deletes the portal within the container.
   */
  remove(container: HTMLElement) {
    this.portals.delete(container);
    this.update();
  }
}
