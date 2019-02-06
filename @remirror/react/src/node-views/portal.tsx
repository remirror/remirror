import React, { Component } from 'react';
import { createPortal, unmountComponentAtNode, unstable_renderSubtreeIntoContainer } from 'react-dom';
import { PlainObject } from 'simplytyped';

export interface NodeViewPortalProps {
  render: (nodeViewPortalContainer: NodeViewPortalContainer) => React.ReactChild | null;
}

export interface PortalRendererState {
  portals: Map<HTMLElement, React.ReactChild>;
}

interface MountedPortal {
  children: () => React.ReactChild | null;
  hasReactContext: boolean;
}

export class NodeViewPortalContainer {
  public portals: Map<HTMLElement, MountedPortal> = new Map();
  public context: any;

  public setContext = <GContext extends Component<PlainObject>>(context: GContext) => {
    this.context = context;
  };

  public render(
    children: () => React.ReactChild | null,
    container: HTMLElement,
    hasReactContext: boolean = false,
  ) {
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

      unstable_renderSubtreeIntoContainer(
        this.context,
        portal.children() as React.ReactElement<any>,
        container,
      );
    });
  }

  public remove(container: HTMLElement) {
    this.portals.delete(container);
    unmountComponentAtNode(container);
  }
}

export class NodeViewPortal extends React.Component<NodeViewPortalProps> {
  public nodeViewPortalContainer: NodeViewPortalContainer;

  constructor(props: NodeViewPortalProps) {
    super(props);
    this.nodeViewPortalContainer = new NodeViewPortalContainer();
  }

  public render() {
    return this.props.render(this.nodeViewPortalContainer);
  }

  public componentDidUpdate() {
    this.nodeViewPortalContainer.forceUpdate();
  }
}

export interface NodeViewPortalComponentProps {
  nodeViewPortalContainer: NodeViewPortalContainer;
}

export class NodeViewPortalComponent extends React.Component<
  NodeViewPortalComponentProps,
  PortalRendererState
> {
  constructor(props: NodeViewPortalComponentProps) {
    super(props);
    props.nodeViewPortalContainer.setContext(this);
    // props.nodeViewPortalContainer.on('update', this.handleUpdate);
    this.state = { portals: new Map() };
  }

  // private handleUpdate = portals => this.setState({ portals });

  public render() {
    const { portals } = this.state;
    return (
      <>{Array.from(portals.entries()).map(([container, children]) => createPortal(children, container))}</>
    );
  }
}
