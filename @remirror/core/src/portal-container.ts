import { Component } from 'react';

import NanoEvents from 'nanoevents';
import nano from 'nanoid';

export interface MountedPortal {
  children: () => JSX.Element;
  hasReactContext: boolean;
  key: string;
}

export interface NodeViewPortalComponentProps {
  nodeViewPortalContainer: NodeViewPortalContainer;
}

interface Events {
  update: PortalMap;
}

export type PortalList = ReadonlyArray<[HTMLElement, MountedPortal]>;
export type PortalMap = Map<HTMLElement, MountedPortal>;

export class NodeViewPortalContainer {
  public portals: Map<HTMLElement, MountedPortal> = new Map();
  public context!: Component<NodeViewPortalComponentProps>;
  public events = new NanoEvents<Events>();

  public on = (callback: (map: PortalMap) => void) => {
    return this.events.on('update', callback);
  };

  private update(map: PortalMap) {
    this.events.emit('update', map);
  }

  public setContext = (context: Component<NodeViewPortalComponentProps>) => {
    this.context = context;
  };

  public render(children: () => JSX.Element, container: HTMLElement, hasReactContext: boolean = false) {
    this.portals.set(container, { children, hasReactContext, key: nano() });
    this.update(this.portals);
  }

  public forceUpdate() {
    this.portals.forEach(({ children, hasReactContext }, container) => {
      if (!hasReactContext) {
        return;
      }

      // Assign the portal a new key so it is re-rendered
      this.portals.set(container, { children, hasReactContext, key: nano() });
    });
    this.update(this.portals);
  }

  public remove(container: HTMLElement) {
    this.portals.delete(container);
    this.update(this.portals);
  }
}
