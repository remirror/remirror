import { Component, ReactChild, ReactElement } from 'react';
import { unmountComponentAtNode, unstable_renderSubtreeIntoContainer } from 'react-dom';
import { PlainObject } from 'simplytyped';
interface MountedPortal {
  children: () => ReactChild | null;
  hasReactContext: boolean;
}

export class NodeViewPortalContainer {
  public portals: Map<HTMLElement, MountedPortal> = new Map();
  public context: any;
  public setContext = <GContext extends Component<PlainObject>>(context: GContext) => {
    this.context = context;
  };
  public render(children: () => ReactChild | null, container: HTMLElement, hasReactContext: boolean = false) {
    this.portals.set(container, { children, hasReactContext });
    unstable_renderSubtreeIntoContainer(this.context, children() as JSX.Element, container);
  }
  // TODO: Improve this code.
  // we (unfortunately) need to re-render to pass down any updated context.
  // selectively do this for nodeviews that opt-in via `hasReactContext`
  public forceUpdate() {
    this.portals.forEach((portal, container) => {
      if (!portal.hasReactContext) {
        return;
      }
      unstable_renderSubtreeIntoContainer(this.context, portal.children() as ReactElement<any>, container);
    });
  }
  public remove(container: HTMLElement) {
    this.portals.delete(container);
    unmountComponentAtNode(container);
  }
}
