import NanoEvents from 'nanoevents';
import nano from 'nanoid';
import { ReactElement } from 'react';

export interface RenderParams {
  /**
   * Renders a JSX element.
   */
  render: () => ReactElement<any>;
}

export interface MountedPortal extends RenderParams {
  key: string;
}

export interface RenderMethodParams extends RenderParams {
  /**
   * The DOM element to contain the react portal.
   */
  container: HTMLElement;
}

interface Events {
  /**
   * Trigger an update in all subscribers
   */
  update: PortalMap;
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
  public portals: Map<HTMLElement, MountedPortal> = new Map();

  /**
   * The event listener which allows consumers to subscribe to when a new portal
   * is added / deleted via the updated event.
   */
  public events = new NanoEvents<Events>();

  /**
   * Event handler for subscribing to update events from the portalContainer.
   */
  public on = (callback: (map: PortalMap) => void) => {
    return this.events.on('update', callback);
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
  public render({ render, container }: RenderMethodParams) {
    const portal = this.portals.get(container);
    const key = portal ? portal.key : nano();

    this.portals.set(container, { render, key });
    this.update();
  }

  /**
   * Force an update in all the portals by setting new keys for every portal.
   *
   * Delete all orphaned containers (deleted from the DOM). This is useful for
   * Decoration where there is no destroy method.
   */
  public forceUpdate() {
    this.portals.forEach(({ render }, container) => {
      // Assign the portal a new key so it is re-rendered
      this.portals.set(container, { render, key: nano() });
    });

    this.update();
  }

  /**
   * Deletes the portal within the container.
   */
  public remove(container: HTMLElement) {
    this.portals.delete(container);
    this.update();
  }
}
