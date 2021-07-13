import { createNanoEvents, Unsubscribe } from 'nanoevents';
import type { FunctionComponent } from 'react';
import { uniqueId } from '@remirror/core';

export interface RenderProps {
  /**
   * Renders a JSX element.
   */
  Component: FunctionComponent;
}

export interface MountedPortal extends RenderProps {
  key: string;
}

export interface SingleRenderMethodProps extends RenderProps {
  key?: undefined;

  /**
   * The DOM element to contain the react portal.
   */
  container: HTMLElement;
}

export interface SharedRenderMethodProps extends RenderProps {
  /**
   * The DOM element to contain the react portal.
   */
  container: HTMLElement;

  /**
   * Shared renders must provide a key. By setting this value, the portal will
   * be rendered as a shared parameter.
   */
  key: string;
}

type RenderMethodProps = SingleRenderMethodProps;

interface Events {
  /**
   * Trigger an update in all subscribers
   */
  update: (portals: PortalMap) => void;
}

export type PortalList = ReadonlyArray<[HTMLElement, MountedPortal]>;
export type PortalMap = Map<HTMLElement, MountedPortal>;

/**
 * The node view portal container keeps track of all the portals which have been
 * added by react to render the node views in the editor.
 */
export class PortalContainer {
  /**
   * A map of all the active portals which have a one to one relation between
   * the container and the component.
   */
  portals: PortalMap = new Map();

  /**
   * The event listener which allows consumers to subscribe to when a new portal
   * is added / deleted via the updated event.
   */
  #events = createNanoEvents<Events>();

  /**
   * Event handler for subscribing to update events from the portalContainer.
   */
  on = (callback: (portals: PortalMap) => void): Unsubscribe => {
    return this.#events.on('update', callback);
  };

  /**
   * Subscribe to one event before automatically unbinding.
   */
  once = (callback: (portals: PortalMap) => void): Unsubscribe => {
    const unbind = this.#events.on('update', (portals) => {
      unbind();
      callback(portals);
    });

    return unbind;
  };

  /**
   * Trigger an update in all subscribers.
   */
  private update() {
    this.#events.emit('update', this.portals);
  }

  /**
   * Responsible for registering a new portal by rendering the react element
   * into the provided container.
   */
  render({ Component, container }: RenderMethodProps): void {
    const portal = this.portals.get(container);
    this.portals.set(container, { Component, key: portal?.key ?? uniqueId() });

    this.update();
  }

  /**
   * Force an update in all the portals by setting new keys for every portal.
   *
   * Delete all orphaned containers (deleted from the DOM). This is useful for
   * Decoration where there is no destroy method.
   */
  forceUpdate(): void {
    for (const [container, { Component }] of this.portals) {
      this.portals.set(container, { Component, key: uniqueId() });
    }
  }

  /**
   * Deletes the portal within the container.
   */
  remove(container: HTMLElement): void {
    // Remove the portal which was being wrapped in the provided container.
    this.portals.delete(container);

    // Trigger an update
    this.update();
  }
}
