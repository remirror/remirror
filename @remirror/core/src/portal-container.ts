import { Component, ReactChild, ReactElement } from 'react';
import { unmountComponentAtNode, unstable_renderSubtreeIntoContainer } from 'react-dom';

interface MountedPortal {
  children: () => ReactChild | null;
  hasReactContext: boolean;
}

export type RenderSubtreeIntoContainer = typeof unstable_renderSubtreeIntoContainer;
export type UnmountComponentAtNode = typeof unmountComponentAtNode;

export class NodeViewPortalContainer {
  public portals: Map<HTMLElement, MountedPortal> = new Map();
  public context: any;

  constructor(
    private renderSubtreeIntoContainer: RenderSubtreeIntoContainer,
    private unmountComponent: UnmountComponentAtNode,
  ) {}

  public setContext = <GContext extends Component<Record<string, any>>>(context: GContext) => {
    this.context = context;
  };
  public render(children: () => ReactChild | null, container: HTMLElement, hasReactContext: boolean = false) {
    this.portals.set(container, { children, hasReactContext });
    this.renderSubtreeIntoContainer(this.context, children() as JSX.Element, container);
  }
  // TODO: Improve this code.
  // we (unfortunately) need to re-render to pass down any updated context.
  // selectively do this for nodeviews that opt-in via `hasReactContext`
  public forceUpdate() {
    this.portals.forEach((portal, container) => {
      if (!portal.hasReactContext) {
        return;
      }
      this.renderSubtreeIntoContainer(this.context, portal.children() as ReactElement<any>, container);
    });
  }
  public remove(container: HTMLElement) {
    this.portals.delete(container);
    this.unmountComponent(container);
  }
}
